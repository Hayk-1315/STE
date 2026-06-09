// apps/api/src/sea/intent.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JsonRpcProvider } from 'ethers';
import { IntentRepository, type IntentDto } from './intent.repository';
import { IntentEventRepository } from './intent-event.repository';
import {
  computeExpiresAt,
  type CreateIntentBody,
  type WalletLockBody,
  type ExecutingBody,
} from './dto/intent.dto';
import { IntentEventType, IntentStatus, IntentType } from '@prisma/client';
import {
  IntentValidatorService,
  type ValidatorMarketContext,
} from './intent-validator.service';
import { PersistenceRepository } from '../matching/persistence.repository';
import {
  issueExecutionToken,
  issueLockNonce,
  readSecret,
  verifyExecutionToken,
  verifyLockNonce,
} from './execution-token.util';

@Injectable()
export class IntentService {
  private readonly logger = new Logger(IntentService.name);

  constructor(
    private readonly repo: IntentRepository,
    private readonly events: IntentEventRepository,
    private readonly validator: IntentValidatorService,
    private readonly persistence: PersistenceRepository,
  ) {}

  async create(body: CreateIntentBody): Promise<IntentDto> {
    // Resolve marketId first so the validator can run engine-side checks
    // against canonical trading-rule context.
    const marketId = await this.repo.resolveMarketId(
      body.structuredIntent.marketId,
    );
    if (!marketId) {
      throw new BadRequestException('market_not_found');
    }

    const expiresAt = computeExpiresAt(body.structuredIntent.expiry);
    if (expiresAt.getTime() <= Date.now() + 60_000) {
      throw new BadRequestException('expiry_too_close');
    }

    const tradingCtx = await this.persistence.getTradingContext(marketId);
    const validatorCtx: ValidatorMarketContext = {
      id: tradingCtx.id,
      symbol: tradingCtx.symbol,
      baseDecimals: tradingCtx.baseDecimals,
      quoteDecimals: tradingCtx.quoteDecimals,
      baseAddress: tradingCtx.baseAddress,
      quoteAddress: tradingCtx.quoteAddress,
      minNotionalQ: tradingCtx.minNotionalQ,
      minSizeB: tradingCtx.minSizeB,
      priceTickQ: tradingCtx.priceTickQ,
    };

    // Phase 2 validator owns invariants + engine-side deterministic checks.
    // Throws BadRequestException with structured `issues` on any violation.
    await this.validator.validateAtCreate(body, validatorCtx, expiresAt);

    const intent = await this.repo.create({
      owner: body.owner.toLowerCase(),
      marketId,
      structuredIntent: body.structuredIntent,
      preSignedOrder: body.zeroExOrder ?? null,
      preSignedSignatureHex: body.signature ?? null,
      preSignedOrderHash: body.preSignedOrderHash ?? null,
      rawText: body.rawText ?? null,
      parserMeta: body.parserMeta ?? null,
      expiresAt,
      initialStatus: IntentStatus.ACTIVE,
    });

    await this.events.append(intent.id, IntentEventType.CREATED, {
      type: body.structuredIntent.type,
      executionAuthority: body.structuredIntent.executionAuthority,
    });
    await this.events.append(intent.id, IntentEventType.ACTIVATED, {
      type: body.structuredIntent.type,
    });

    this.logger.log(
      `sea/intents created+activated id=${intent.id} type=${intent.type} owner=${intent.owner}`,
    );

    return intent;
  }

  async listByOwner(
    address: string,
    statusFilter: string | undefined,
    limit: number,
  ): Promise<IntentDto[]> {
    let statuses: IntentStatus[] | undefined;
    if (statusFilter) {
      const allowed = Object.values(IntentStatus) as readonly string[];
      const list = statusFilter
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter((s): s is IntentStatus => allowed.includes(s));
      if (list.length === 0) {
        throw new BadRequestException('invalid_status_filter');
      }
      statuses = list;
    }
    return this.repo.listByOwner(address.toLowerCase(), statuses, limit);
  }

  async findById(id: string): Promise<IntentDto | null> {
    return this.repo.findById(id);
  }

  async cancel(id: string, signature: string): Promise<IntentDto> {
    const intent = await this.repo.findById(id);
    if (!intent) throw new NotFoundException('intent_not_found');

    // Phase 2.1: signature is the sole proof of ownership. The recovered
    // signer must equal `intent.owner`; otherwise throws 400 with structured
    // `cancel_auth_failed`. Honors DEV_SKIP_SIGS=1.
    this.validator.verifyCancelAuth({
      intentId: intent.id,
      intentOwner: intent.owner,
      signature,
    });

    // Cancellable states are DRAFT, ACTIVE, and READY. CMR READY is included
    // (Phase 5) so the user can cancel a "ready to execute" intent before
    // clicking Execute — nothing is on-chain at that point. Atomic compound-
    // where transitionStatus races safely against the monitor's rearmFromReady
    // and markExpiredFromReady (exactly one wins). TRIGGERED (CL mid-fire)
    // and EXECUTING (reserved for Phase 4.x) remain non-cancellable. Terminal
    // states (PLACED, EXECUTED, CANCELLED, EXPIRED, FAILED, REJECTED) are
    // explicitly NOT cancellable — the caller receives a 409. PLACED CL must
    // be cancelled via the normal /orders cancel flow (the SEA endpoint does
    // not touch on-chain orders).
    const cancellable: IntentStatus[] = [
      IntentStatus.DRAFT,
      IntentStatus.ACTIVE,
      IntentStatus.READY,
    ];
    if (!cancellable.includes(intent.status)) {
      throw new ConflictException(`cannot_cancel_status:${intent.status}`);
    }
    const updated = await this.repo.transitionStatus(
      id,
      intent.status,
      IntentStatus.CANCELLED,
      { failureReason: 'user_cancel' },
    );
    if (!updated) {
      throw new ConflictException('status_changed_concurrently');
    }
    await this.events.append(id, IntentEventType.CANCELLED, {
      reason: 'user_cancel',
    });
    return updated;
  }

  /* ------------------------------------------------------------------ */
  /* Phase 4.x-b: CMR execution-lifecycle orchestrators                  */
  /* ------------------------------------------------------------------ */

  /**
   * POST /sea/intents/:id/wallet-lock orchestrator.
   *
   *   1. Reload + status/expiry/ttl guards.
   *   2. lockNonce HMAC verify.
   *   3. Server-side walletLockUntilAt clamped to intent.expiresAt.
   *   4. Idempotency: a still-live lock with the same nonce returns the
   *      deterministic same executionToken (Blocker 1 — does not depend
   *      on `now` differing by > 5 s).
   *   5. EIP-191 signature verify against `buildWalletLockOwnerAuthMessage`.
   *   6. Atomic compound-where UPDATE.
   *   7. Issue + return token.
   */
  async lockWallet(
    id: string,
    body: WalletLockBody,
  ): Promise<{ walletLockUntilAt: string; executionToken: string }> {
    const intent = await this.repo.findById(id);
    if (!intent) throw new NotFoundException('intent_not_found');

    // (1a) Status guard.
    if (intent.status !== IntentStatus.READY) {
      throw new ConflictException(`cannot_lock_status:${intent.status}`);
    }
    // (1b) CMR-only — CL never reaches READY in the current state machine,
    //      so defense-in-depth.
    if (intent.type !== IntentType.CONDITIONAL_MARKET_READY) {
      throw new ConflictException(`cannot_lock_status:${intent.status}`);
    }
    const now = Date.now();
    const expiresAtMs = new Date(intent.expiresAt).getTime();
    if (now >= expiresAtMs) {
      throw new ConflictException('intent_expired');
    }
    if (!intent.preparedQuoteAt) {
      throw new ConflictException('not_ready_no_snapshot');
    }
    const preparedAtMs = new Date(intent.preparedQuoteAt).getTime();
    const ttlSec = readTtlSecFromSnapshot(intent.preparedQuote);
    if (now > preparedAtMs + ttlSec * 1000) {
      throw new ConflictException('ready_ttl_expired');
    }

    // (2) lockNonce HMAC verify.
    const chainId = getChainIdFromEnvLocal();
    const lockNonceSecret = requireSecret('SEA_LOCK_NONCE_SECRET');
    const lockNonceOk = verifyLockNonce(
      lockNonceSecret,
      body.ownerAuth.lockNonce,
      {
        intentId: intent.id,
        owner: intent.owner,
        preparedQuoteAt: new Date(intent.preparedQuoteAt),
        chainId,
      },
    );
    if (!lockNonceOk) {
      throw new BadRequestException('lock_nonce_mismatch');
    }

    // (3) Validate the FE-supplied walletLockUntilAt. This value is the one
    //     GET /fresh-quote proposed and the user signed (EIP-191); it is the
    //     single source of truth. We do NOT recompute `now + lockSec` and
    //     require an exact match: the old design compared two independent
    //     `now + lockSec` mints and rejected the human review+sign delay
    //     (> 5s) as wallet_lock_until_mismatch. Instead we bounds-check the
    //     supplied value and NEVER silently clamp it — an out-of-range value
    //     is rejected so the stored value, the signed value, and the
    //     executionToken-bound value all stay identical.
    //       • finite,
    //       • strictly in the future (lock not already expired),
    //       • <= intent.expiresAt (hard ceiling — Blocker 1),
    //       • <= now + (lockSec + grace) so a client cannot reserve the
    //         intent for an absurd window. `grace` only absorbs clock/network
    //         jitter; the legitimate proposal is always <= now + lockSec
    //         because it was minted at or before `now`.
    const lockSecs = getWalletLockSecs();
    const suppliedMs = Date.parse(body.ownerAuth.walletLockUntilAt);
    const maxFutureMs = now + (lockSecs + WALLET_LOCK_SKEW_GRACE_SEC) * 1000;
    if (
      !Number.isFinite(suppliedMs) ||
      suppliedMs <= now ||
      suppliedMs > expiresAtMs ||
      suppliedMs > maxFutureMs
    ) {
      throw new BadRequestException('wallet_lock_until_mismatch');
    }
    const walletLockUntilAt_accepted = new Date(suppliedMs);

    // (4) A live wallet lock is immutable for its window. If the row is
    //     already locked and that window is still open:
    //       • same supplied lock-until ISO  → idempotent success: return the
    //         deterministic same token, no signature re-verify, no re-lock.
    //       • different supplied lock-until ISO → reject. A second value —
    //         even one that is in-bounds and validly signed — must NOT
    //         replace, extend, or re-issue a token against a live lock. This
    //         runs BEFORE the signature verify and BEFORE lockWalletFromReady,
    //         so nothing is updated and no new token is minted.
    const executionSecret = requireSecret('SEA_EXECUTION_TOKEN_SECRET');
    if (
      intent.walletLockUntilAt &&
      new Date(intent.walletLockUntilAt).getTime() > now
    ) {
      const storedIso = new Date(intent.walletLockUntilAt).toISOString();
      if (body.ownerAuth.walletLockUntilAt !== storedIso) {
        throw new BadRequestException('wallet_lock_until_mismatch');
      }
      const existingToken = issueExecutionToken(executionSecret, {
        intentId: intent.id,
        owner: intent.owner,
        chainId,
        walletLockUntilAt: new Date(intent.walletLockUntilAt),
        lockNonce: body.ownerAuth.lockNonce,
      });
      return {
        walletLockUntilAt: storedIso,
        executionToken: existingToken,
      };
    }

    // (5) Verify the EIP-191 signature against the SUPPLIED value — the exact
    //     ISO the FE signed — not a server recompute. A signature over any
    //     other value recovers a different signer and throws
    //     wallet_lock_auth_failed.
    this.validator.verifyWalletLockAuth({
      intentId: intent.id,
      intentOwner: intent.owner,
      chainId,
      lockNonce: body.ownerAuth.lockNonce,
      walletLockUntilAtIso: body.ownerAuth.walletLockUntilAt,
      signature: body.ownerAuth.signature,
    });

    // (6) Atomic compound-where UPDATE — store the accepted supplied value.
    const ok = await this.repo.lockWalletFromReady(
      intent.id,
      new Date(intent.preparedQuoteAt),
      walletLockUntilAt_accepted,
    );
    if (!ok) {
      throw new ConflictException('status_changed_concurrently');
    }

    // (7) Issue executionToken bound to the SAME accepted lock-until value.
    const token = issueExecutionToken(executionSecret, {
      intentId: intent.id,
      owner: intent.owner,
      chainId,
      walletLockUntilAt: walletLockUntilAt_accepted,
      lockNonce: body.ownerAuth.lockNonce,
    });

    this.logger.log(
      `sea/wallet-lock id=${intent.id} owner=${intent.owner} ` +
        `until=${walletLockUntilAt_accepted.toISOString()}`,
    );

    return {
      walletLockUntilAt: walletLockUntilAt_accepted.toISOString(),
      executionToken: token,
    };
  }

  /**
   * POST /sea/intents/:id/executing orchestrator.
   *
   * Bearer-token only. No signature field on the body (DTO `.strict()`
   * already rejects), and no signature verification here.
   *
   *   1. Reload + status guard.
   *   2. Idempotency on (status, linkedTxHash).
   *   3. executionToken HMAC verify (constant-time).
   *   4. walletLockUntilAt > now.
   *   5. Fast-path A — Trade already exists for THIS intent (txHash + market
   *      + owner all match). `READY → EXECUTED` (skipping EXECUTING).
   *   6. Fast-path B — receipt status === 0 at marker time. `READY → FAILED`.
   *   7. Normal path — `READY → EXECUTING`.
   */
  async markExecuting(id: string, body: ExecutingBody): Promise<IntentDto> {
    const intent = await this.repo.findById(id);
    if (!intent) throw new NotFoundException('intent_not_found');

    const txHashLower = body.txHash.toLowerCase();
    const now = Date.now();

    // (2) Idempotency.
    const TERM_STATES: IntentStatus[] = [
      IntentStatus.EXECUTING,
      IntentStatus.EXECUTED,
      IntentStatus.FAILED,
    ];
    if (TERM_STATES.includes(intent.status)) {
      if (
        intent.linkedTxHash &&
        intent.linkedTxHash.toLowerCase() === txHashLower
      ) {
        return intent;
      }
      throw new ConflictException('executing_tx_hash_conflict');
    }
    if (intent.status !== IntentStatus.READY) {
      throw new ConflictException(
        `cannot_mark_executing_status:${intent.status}`,
      );
    }

    // (3) executionToken verify against current row state.
    const chainId = getChainIdFromEnvLocal();
    const lockNonceSecret = requireSecret('SEA_LOCK_NONCE_SECRET');
    const executionSecret = requireSecret('SEA_EXECUTION_TOKEN_SECRET');

    if (!intent.walletLockUntilAt) {
      throw new ConflictException('wallet_lock_expired');
    }
    if (!intent.preparedQuoteAt) {
      // Lock cleared by re-arm.
      throw new ConflictException('wallet_lock_expired');
    }
    const lockUntilDate = new Date(intent.walletLockUntilAt);
    // (4) lock-window guard, with a small marker grace. A fill the user
    //     confirmed slightly after walletLockUntilAt (wallet-modal dwell)
    //     should still be recorded so the intent does not diverge from
    //     on-chain reality. We accept the marker up to
    //     CMR_EXECUTING_MARK_GRACE_SEC past the lock; nothing else is relaxed —
    //     walletLockUntilAt is NOT extended, no new token is issued, and the
    //     token must still verify against the row's CURRENT preparedQuoteAt
    //     below (so a re-armed row's stale token is rejected). Beyond the grace
    //     it stays wallet_lock_expired.
    if (now > lockUntilDate.getTime() + CMR_EXECUTING_MARK_GRACE_SEC * 1000) {
      throw new ConflictException('wallet_lock_expired');
    }

    // Re-derive the lockNonce from the row's CURRENT preparedQuoteAt and
    // re-derive the token. Constant-time compare via verifyExecutionToken.
    const lockNonce = issueLockNonce(lockNonceSecret, {
      intentId: intent.id,
      owner: intent.owner,
      preparedQuoteAt: new Date(intent.preparedQuoteAt),
      chainId,
    });
    const tokenOk = verifyExecutionToken(executionSecret, body.executionToken, {
      intentId: intent.id,
      owner: intent.owner,
      chainId,
      walletLockUntilAt: lockUntilDate,
      lockNonce,
    });
    if (!tokenOk) {
      throw new UnauthorizedException('invalid_execution_token');
    }

    // (5) Fast-path A — Trade already exists (ownership-bound DB lookup,
    //     Blocker 4). A foreign-market or wrong-taker txHash returns null.
    const trade = await this.persistence.findTradeByTxHashForIntent({
      txHash: txHashLower,
      marketId: intent.marketId,
      owner: intent.owner,
    });
    if (trade) {
      const ok = await this.repo.markExecutedFromReady(intent.id, txHashLower);
      if (ok) {
        await this.events.append(intent.id, IntentEventType.EXECUTING, {
          txHash: txHashLower,
        });
        await this.events.append(intent.id, IntentEventType.EXECUTED, {
          txHash: txHashLower,
          orderHash: trade.makerOrderHash,
          sizeBase: trade.sizeBase,
          viaLateMarker: true,
        });
        this.logger.log(
          `sea/executing fast-path A id=${intent.id} txHash=${txHashLower}`,
        );
        return (await this.repo.findById(intent.id))!;
      }
      // Lost the compound-where race; re-read and fall through to idempotency.
      const reloaded = await this.repo.findById(intent.id);
      if (
        reloaded &&
        reloaded.linkedTxHash &&
        reloaded.linkedTxHash.toLowerCase() === txHashLower
      ) {
        return reloaded;
      }
      throw new ConflictException('status_changed_concurrently');
    }

    // (6) Fast-path B — receipt revert pre-check.
    const reverted = await this.checkReceiptReverted(txHashLower);
    if (reverted === 'reverted') {
      const ok = await this.repo.markFailedFromReady(
        intent.id,
        txHashLower,
        'tx_reverted_at_marker',
      );
      if (ok) {
        await this.events.append(intent.id, IntentEventType.FAILED, {
          reason: 'tx_reverted_at_marker',
          txHash: txHashLower,
        });
        this.logger.log(
          `sea/executing fast-path B (reverted) id=${intent.id} txHash=${txHashLower}`,
        );
        return (await this.repo.findById(intent.id))!;
      }
      throw new ConflictException('status_changed_concurrently');
    }

    // (7) Normal path.
    const ok = await this.repo.markExecuting(intent.id, txHashLower);
    if (!ok) {
      // Lost-race: re-read and surface idempotent answer or 409.
      const reloaded = await this.repo.findById(intent.id);
      if (
        reloaded &&
        reloaded.linkedTxHash &&
        reloaded.linkedTxHash.toLowerCase() === txHashLower &&
        TERM_STATES.includes(reloaded.status)
      ) {
        return reloaded;
      }
      throw new ConflictException('status_changed_concurrently');
    }
    await this.events.append(intent.id, IntentEventType.EXECUTING, {
      txHash: txHashLower,
    });
    this.logger.log(
      `sea/executing normal path id=${intent.id} txHash=${txHashLower}`,
    );
    return (await this.repo.findById(intent.id))!;
  }

  /**
   * Bounded-timeout receipt check. Returns:
   *   - 'reverted' when receipt exists AND status === 0,
   *   - 'pending_or_unknown' for any other case (receipt null, RPC error,
   *     timeout, status !== 0).
   * The marker is fail-open on RPC issues: a `pending_or_unknown` answer
   * falls through to the normal `READY → EXECUTING` path.
   */
  private async checkReceiptReverted(
    txHash: string,
  ): Promise<'reverted' | 'pending_or_unknown'> {
    const rpc = process.env.RPC_URL_READONLY ?? process.env.RPC_URL ?? '';
    if (!rpc) return 'pending_or_unknown';
    try {
      const provider = new JsonRpcProvider(rpc);
      const receiptP = provider.getTransactionReceipt(txHash);
      const timeoutP = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 500),
      );
      const r = await Promise.race([receiptP, timeoutP]);
      if (!r) return 'pending_or_unknown';
      // ethers v6 receipt has `.status` (number | null). 0 = reverted.
      if ((r as { status?: number | null }).status === 0) return 'reverted';
      return 'pending_or_unknown';
    } catch {
      return 'pending_or_unknown';
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Module-local helpers                                                       */
/* -------------------------------------------------------------------------- */

function getChainIdFromEnvLocal(): number {
  const raw = process.env.CHAIN_ID ?? process.env.ZEROEX_CHAIN_ID ?? '84532';
  const parsed = Number.parseInt(raw, 10);
  return !Number.isFinite(parsed) || parsed <= 0 ? 84532 : parsed;
}

function getWalletLockSecs(): number {
  const raw = Number(process.env.SEA_WALLET_LOCK_SEC ?? '');
  if (!Number.isFinite(raw) || raw < 30) return 300;
  return Math.min(Math.floor(raw), 3600);
}

/**
 * Small tolerance (seconds) added to the maximum accepted wallet-lock window
 * when bounds-checking the FE-supplied, owner-signed walletLockUntilAt in
 * `lockWallet`. This is NOT a skew-equality comparison against a recompute —
 * it only absorbs clock/network jitter at the upper bound. The legitimate
 * server-proposed value is always <= now + SEA_WALLET_LOCK_SEC because it was
 * minted at or before `now`.
 */
const WALLET_LOCK_SKEW_GRACE_SEC = 10;

/**
 * Marker grace (seconds) for POST /sea/intents/:id/executing. A fill the user
 * confirmed slightly AFTER walletLockUntilAt (e.g. they dwelled in the wallet
 * modal) is still recorded READY→EXECUTING within this window, so the intent
 * does not diverge from on-chain reality. It does NOT extend the lock, issue a
 * new token, or relax token verification — the executionToken must still match
 * the row's CURRENT preparedQuoteAt, so a re-armed row's stale token is
 * rejected. Shared with IntentMonitorService's re-arm guard so the monitor does
 * not steal the row during the grace. Beyond it the marker is
 * `wallet_lock_expired`. Module-local constant by design (no env knob).
 */
export const CMR_EXECUTING_MARK_GRACE_SEC = 45;

/**
 * Mirror of `readSecret` from execution-token.util.ts but throws when the
 * secret is missing in a non-dev profile. Keeps the orchestrator's
 * intent clear: "if I'm here, I must have a real secret."
 */
function requireSecret(key: string): string {
  const v = readSecret(key);
  if (!v) {
    throw new Error(
      `SEA execution-lifecycle requires ${key} in non-dev profiles`,
    );
  }
  return v;
}

function readTtlSecFromSnapshot(snapshot: unknown): number {
  if (!snapshot || typeof snapshot !== 'object') return 60;
  const raw = (snapshot as { ttlSec?: unknown }).ttlSec;
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
    return Math.min(300, Math.max(5, Math.floor(raw)));
  }
  return 60;
}
