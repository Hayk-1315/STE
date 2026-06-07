// apps/api/src/sea/intent-fire.service.ts
//
// Phase 3 Conditional Limit fire path. Called by IntentMonitorService for
// each ACTIVE CL intent whose trigger is satisfied. Performs:
//   1. read-only re-check (defense in depth)
//   2. atomic ACTIVE→TRIGGERED latch
//   3. fire-time validator (full integrity + state re-check)
//   4. shared placement (postOnly: true)  ← passive-only crossing handled here
//   5. on success → markPlaced + IntentEvent('PLACED')
//   6. on rejection → transition TRIGGERED→FAILED with mapped reason
//
// would-cross is signaled by `OrdersPlacementService.place` throwing
// BadRequestException('post_only_would_cross'); the fire service maps that to
// failureReason 'would_cross_at_fire' and emits IntentEvent('FAILED', {...,
// suggestion: 'use_conditional_market_ready'}). Terminal — no taker fallback.
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { IntentEventType, IntentStatus } from '@prisma/client';
import { IntentRepository } from './intent.repository';
import { IntentEventRepository } from './intent-event.repository';
import { IntentValidatorService } from './intent-validator.service';
import { OrdersPlacementService } from '../matching/orders-placement.service';
import { PersistenceRepository } from '../matching/persistence.repository';
import { ZeroExSigningService } from '../zeroex/signing.service';
import {
  SignatureType,
  type Address,
  type Bytes32,
  type LimitOrder,
  type Signature,
} from '../zeroex/limit-order.types';

const ZERO_ADDR = '0x0000000000000000000000000000000000000000' as const;
const ZERO_BYTES32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000' as const;

const isAddress = (v: unknown): v is Address =>
  typeof v === 'string' && /^0x[a-fA-F0-9]{40}$/.test(v);
const isBytes32 = (v: unknown): v is Bytes32 =>
  typeof v === 'string' && /^0x[a-fA-F0-9]{64}$/.test(v);

const toAddr = (v: unknown): Address =>
  isAddress(v) ? (v.toLowerCase() as Address) : ZERO_ADDR;
const toBytes32 = (v: unknown): Bytes32 =>
  isBytes32(v) ? (v.toLowerCase() as Bytes32) : ZERO_BYTES32;
const toBig = (v: unknown): bigint => {
  if (typeof v === 'bigint') return v;
  if (typeof v === 'number') return BigInt(v);
  if (typeof v === 'string') {
    try {
      return BigInt(v);
    } catch {
      return 0n;
    }
  }
  return 0n;
};
const toNum = (v: unknown): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'bigint') return Number(v);
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

function sanitizeOrder(raw: unknown): LimitOrder {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    makerToken: toAddr(r.makerToken),
    takerToken: toAddr(r.takerToken),
    makerAmount: toBig(r.makerAmount),
    takerAmount: toBig(r.takerAmount),
    takerTokenFeeAmount: toBig(r.takerTokenFeeAmount),
    maker: toAddr(r.maker),
    taker: toAddr(r.taker),
    sender: toAddr(r.sender),
    feeRecipient: toAddr(r.feeRecipient),
    pool: toBytes32(r.pool),
    expiry: toNum(r.expiry),
    salt: toBig(r.salt),
  };
}

function bytesToHex(b: Uint8Array): `0x${string}` {
  let out = '0x';
  for (let i = 0; i < b.length; i++) out += b[i].toString(16).padStart(2, '0');
  return out as `0x${string}`;
}

function parseSigHexToTuple(sigHex: string): Signature | null {
  const hex = sigHex.startsWith('0x') ? sigHex.slice(2) : sigHex;
  if (hex.length !== 130) return null;
  const r = `0x${hex.slice(0, 64)}`;
  const s = `0x${hex.slice(64, 128)}`;
  let v = parseInt(hex.slice(128, 130), 16);
  if (v === 0 || v === 1) v += 27;
  return {
    signatureType: SignatureType.EIP712,
    v,
    r: r as Bytes32,
    s: s as Bytes32,
  };
}

const getChainIdFromEnv = (): number => {
  const raw = process.env.CHAIN_ID ?? process.env.ZEROEX_CHAIN_ID ?? '84532';
  const parsed = Number.parseInt(raw, 10);
  return !Number.isFinite(parsed) || parsed <= 0 ? 84532 : parsed;
};

export type FireableIntent = {
  id: string;
  owner: string;
  marketId: string;
  marketSymbol: string;
  side: 'BUY' | 'SELL';
  sizeBase: bigint;
  limitPriceTicks: bigint;
  preSignedOrder: unknown;
  preSignedSignature: Buffer | null;
  preSignedOrderHash: string | null;
  expiresAt: Date;
};

@Injectable()
export class IntentFireService {
  private readonly log = new Logger('IntentFire');

  constructor(
    private readonly repo: IntentRepository,
    private readonly events: IntentEventRepository,
    private readonly validator: IntentValidatorService,
    private readonly placement: OrdersPlacementService,
    private readonly persistence: PersistenceRepository,
    private readonly signing: ZeroExSigningService,
  ) {}

  /**
   * Fire a single CL intent. Idempotent: the atomic ACTIVE→TRIGGERED latch
   * (via repo.transitionStatus) ensures only one fire per intent per
   * lifecycle. Errors are caught per-intent so the monitor can keep going.
   */
  async fire(intent: FireableIntent): Promise<void> {
    // Step 1: read-only re-check.
    if (process.env.READ_ONLY === 'true') {
      this.log.debug(`fire skipped (read-only): id=${intent.id}`);
      return;
    }
    if (process.env.PROFILE === 'mainnet') {
      this.log.debug(`fire skipped (PROFILE=mainnet): id=${intent.id}`);
      return;
    }

    // Step 2: atomic latch.
    const latched = await this.repo.transitionStatus(
      intent.id,
      IntentStatus.ACTIVE,
      IntentStatus.TRIGGERED,
    );
    if (!latched) {
      // Race: another tick fired this, or the user cancelled, or it expired.
      this.log.debug(`fire silent abort (latch lost): id=${intent.id}`);
      return;
    }

    // Step 3: fire-time validator. Throws BadRequestException with
    // structured `issues` on any integrity / state failure.
    const ctx = await this.persistence.getTradingContext(intent.marketId);
    const validatorCtx = {
      id: ctx.id,
      symbol: ctx.symbol,
      baseDecimals: ctx.baseDecimals,
      quoteDecimals: ctx.quoteDecimals,
      baseAddress: ctx.baseAddress,
      quoteAddress: ctx.quoteAddress,
      minNotionalQ: ctx.minNotionalQ,
      minSizeB: ctx.minSizeB,
      priceTickQ: ctx.priceTickQ,
    };

    const sigHex = intent.preSignedSignature
      ? bytesToHex(intent.preSignedSignature)
      : '';
    const declaredHash = intent.preSignedOrderHash ?? '';

    try {
      await this.validator.validateAtFire({
        intentId: intent.id,
        owner: intent.owner,
        side: intent.side,
        sizeBase: intent.sizeBase,
        limitPriceTicks: intent.limitPriceTicks,
        preSignedOrder: intent.preSignedOrder,
        preSignedSignatureHex: sigHex,
        preSignedOrderHash: declaredHash,
        intentExpiresAt: intent.expiresAt,
        ctx: validatorCtx,
      });
    } catch (e) {
      const code = this.firstIssueCode(e) ?? 'fire_validation_failed';
      await this.failIntent(intent.id, code, this.errPayload(e));
      return;
    }

    // Step 4: build placement input. Reconstruct the Signature tuple so the
    // placement service can attachRaw the real on-chain bytes.
    const order = sanitizeOrder(intent.preSignedOrder);
    const sigTuple = parseSigHexToTuple(sigHex);
    if (!sigTuple) {
      // Should be unreachable after validateAtFire passed in non-skip mode,
      // but defend against DEV_SKIP_SIGS=1 + missing signature combo.
      await this.failIntent(intent.id, 'invalid_signature');
      return;
    }

    // Recompute orderHash deterministically from the (verified) order. Even
    // under DEV_SKIP_SIGS, we prefer the EIP-712 hash so downstream tooling
    // sees the canonical value; fall back to the declared hash on error.
    let orderHash: string;
    try {
      orderHash = this.signing.getOrderHash(getChainIdFromEnv(), order);
    } catch {
      orderHash = declaredHash;
    }

    // Step 5: shared placement with postOnly: true.
    try {
      const placed = await this.placement.place({
        order,
        signature: sigTuple,
        orderHash,
        makerExpected: intent.owner.toLowerCase(),
        postOnly: true,
        source: 'sea',
      });

      // Step 6: TRIGGERED → PLACED with linkedOrderHash.
      const ok = await this.repo.markPlaced(intent.id, placed.orderHash);
      if (!ok) {
        // Race: something else moved the row out of TRIGGERED. The placement
        // already happened, so we record this rather than fail.
        this.log.warn(
          `markPlaced lost race: id=${intent.id} orderHash=${placed.orderHash}`,
        );
      }
      await this.events.append(intent.id, IntentEventType.PLACED, {
        linkedOrderHash: placed.orderHash,
        orderbookStatus: placed.status,
      });
      this.log.log(
        `intent placed: id=${intent.id} orderHash=${placed.orderHash} symbol=${intent.marketSymbol}`,
      );
    } catch (e) {
      // Map placement errors to intent failure reasons.
      if (e instanceof BadRequestException) {
        const msg = e.message;
        if (msg === 'post_only_would_cross') {
          // Passive-only terminal failure with the documented suggestion.
          await this.failIntent(intent.id, 'would_cross_at_fire', {
            side: intent.side,
            limitPriceTicks: intent.limitPriceTicks.toString(),
            suggestion: 'use_conditional_market_ready',
          });
          return;
        }
        await this.failIntent(intent.id, `placement_rejected:${msg}`);
        return;
      }
      // Non-HTTP placement error → generic placement_rejected.
      const msg = e instanceof Error ? e.message : String(e);
      await this.failIntent(intent.id, `placement_rejected:${msg}`);
    }
  }

  private async failIntent(
    id: string,
    failureReason: string,
    eventPayload?: Record<string, unknown>,
  ): Promise<void> {
    await this.repo.transitionStatus(
      id,
      IntentStatus.TRIGGERED,
      IntentStatus.FAILED,
      { failureReason },
    );
    await this.events.append(id, IntentEventType.FAILED, {
      reason: failureReason,
      ...(eventPayload ?? {}),
    });
    this.log.log(`intent failed: id=${id} reason=${failureReason}`);
  }

  private firstIssueCode(e: unknown): string | null {
    if (e instanceof BadRequestException) {
      const resp = e.getResponse() as { issues?: Array<{ code?: string }> };
      const first = resp?.issues?.[0]?.code;
      if (typeof first === 'string') return first;
    }
    return null;
  }

  private errPayload(e: unknown): Record<string, unknown> {
    if (e instanceof BadRequestException) {
      const resp = e.getResponse() as { issues?: unknown };
      return { issues: resp?.issues };
    }
    return { error: e instanceof Error ? e.message : String(e) };
  }
}
