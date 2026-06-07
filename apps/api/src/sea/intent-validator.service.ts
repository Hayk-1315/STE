// apps/api/src/sea/intent-validator.service.ts
// SEA v1 Phase 2: deterministic structured-intent validator.
// No monitor, no fire path, no AI. Throws BadRequestException with a
// structured `issues` array when any check fails; returns silently on success.
import { Injectable, BadRequestException } from '@nestjs/common';
import { verifyMessage } from 'ethers';
import { ZeroExSigningService } from '../zeroex/signing.service';
import {
  SignatureType,
  type Address,
  type Bytes32,
  type LimitOrder,
  type Signature,
} from '../zeroex/limit-order.types';
import {
  validateCreateIntentBodyInvariants,
  type CreateIntentBody,
} from './dto/intent.dto';
import { IntentRepository } from './intent.repository';
import { CancelPairFloorRepository } from '../onchain/cancel-pair-floor.repository';

export type ValidatorMarketContext = {
  id: string;
  symbol: string;
  baseDecimals: number;
  quoteDecimals: number;
  baseAddress: string;
  quoteAddress: string;
  minNotionalQ: bigint;
  minSizeB: bigint;
  priceTickQ: bigint;
};

export type ValidationIssue = {
  code: string;
  message?: string;
  detail?: Record<string, string>;
};

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

/**
 * Sanitize a raw 0x v4 LimitOrder JSON blob into the strongly-typed shape
 * the signing service expects. Mirrors the helper in match.controller.ts
 * (inlined here so we do not modify matching code).
 */
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

/**
 * Parse a 65-byte hex signature into the (signatureType, v, r, s) tuple
 * the 0x verify path expects. Normalizes v to 27/28. Mirrors orders.controller.
 */
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

function pow10(n: number): bigint {
  let r = 1n;
  for (let i = 0; i < n; i++) r *= 10n;
  return r;
}

/**
 * Build the deterministic canonical message that the SEA cancel signature
 * commits to. Bound to chainId so a captured signature cannot be replayed
 * across chains; bound to owner+intentId so it cannot be reused against
 * a different intent. Mirrors the CMR ownerAuth pattern.
 *
 * Phase 4.x-b: canonical wallet-lock auth message for CMR Execute.
 * One EIP-191 signature pre-tx grants the bearer executionToken; the
 * post-tx /executing call needs no further signature.
 *
 *   sea:wallet-lock|<intentId>|<owner-lower>|<chainId>|<lockNonce>|<walletLockUntilAt-iso>
 */
export function buildWalletLockOwnerAuthMessage(opts: {
  intentId: string;
  owner: string;
  chainId: number;
  lockNonce: string;
  walletLockUntilAtIso: string;
}): string {
  return [
    'sea:wallet-lock',
    opts.intentId,
    opts.owner.toLowerCase(),
    String(opts.chainId),
    opts.lockNonce,
    opts.walletLockUntilAtIso,
  ].join('|');
}

/**
 * Format: SEA-CANCEL-INTENT|v=1|chainId=<n>|owner=<lower>|intentId=<id>
 */
export function buildCancelOwnerAuthMessage(opts: {
  chainId: number;
  owner: string;
  intentId: string;
}): string {
  return [
    'SEA-CANCEL-INTENT',
    'v=1',
    `chainId=${opts.chainId}`,
    `owner=${opts.owner.toLowerCase()}`,
    `intentId=${opts.intentId}`,
  ].join('|');
}

/**
 * Build the deterministic canonical message that the CMR ownerAuth signature
 * commits to. The FE must construct the byte-identical string at sign time;
 * any drift will fail signer recovery. CMR is restricted to expiry.atUnix
 * (enforced by invariants) so the absolute expiresAtUnix is unambiguous.
 *
 * Format (single line, `|`-delimited):
 *   SEA-CMR-INTENT|v=1|chainId=<n>|owner=<lower>|marketId=<m>|side=<S>
 *     |sizeBase=<n>|tif=<T>|trigger=<TYPE>:<REF>:<TICKS>|expiresAtUnix=<n>
 */
export function buildCmrOwnerAuthMessage(
  body: CreateIntentBody,
  chainId: number,
): string {
  const si = body.structuredIntent;
  if (si.type !== 'CONDITIONAL_MARKET_READY') {
    throw new Error('canonical message only defined for CMR');
  }
  if (!('atUnix' in si.expiry)) {
    throw new Error('CMR expiry must use atUnix');
  }
  const tif = si.tif ?? 'IOC';
  return [
    'SEA-CMR-INTENT',
    'v=1',
    `chainId=${chainId}`,
    `owner=${body.owner.toLowerCase()}`,
    `marketId=${si.marketId}`,
    `side=${si.side}`,
    `sizeBase=${si.sizeBase}`,
    `tif=${tif}`,
    `trigger=${si.trigger.type}:${si.trigger.reference}:${si.trigger.priceTicks}`,
    `expiresAtUnix=${si.expiry.atUnix}`,
  ].join('|');
}

const getChainIdFromEnv = (): number => {
  const raw = process.env.CHAIN_ID ?? process.env.ZEROEX_CHAIN_ID ?? '84532';
  const parsed = Number.parseInt(raw, 10);
  return !Number.isFinite(parsed) || parsed <= 0 ? 84532 : parsed;
};

const getFireGraceSecs = (): number => {
  const raw = process.env.SEA_FIRE_EXPIRY_GRACE_SECS;
  const parsed = raw ? Number.parseInt(raw, 10) : 60;
  return !Number.isFinite(parsed) || parsed < 0 ? 60 : parsed;
};

@Injectable()
export class IntentValidatorService {
  constructor(
    private readonly signing: ZeroExSigningService,
    private readonly repo: IntentRepository,
    private readonly floorRepo: CancelPairFloorRepository,
  ) {}

  /**
   * Phase 3.x-b: check whether the on-chain `cancelPair` floor for the
   * (owner, makerToken, takerToken) triple has risen above the order's
   * salt. Returns a structured issue when the floor invalidates the
   * salt, null otherwise. O(1) by composite primary key.
   */
  private async runCancelPairFloorCheck(opts: {
    owner: string;
    makerToken: string;
    takerToken: string;
    salt: bigint;
  }): Promise<ValidationIssue | null> {
    const floor = await this.floorRepo.getFloor(
      opts.owner,
      opts.makerToken,
      opts.takerToken,
    );
    if (floor === null) return null;
    if (opts.salt < floor) {
      return {
        code: 'cancel_pair_floor_above_salt',
        detail: {
          salt: opts.salt.toString(),
          floor: floor.toString(),
          makerToken: opts.makerToken,
          takerToken: opts.takerToken,
        },
      };
    }
    return null;
  }

  /**
   * Phase 2 deterministic validator. Throws BadRequestException with a
   * structured issues array when any check fails. Returns silently on success.
   *
   * Honors `DEV_SKIP_SIGS=1` to mirror OrdersController.place(): in that
   * mode, signature verification, orderHash recovery, and signer-match are
   * bypassed; everything else still runs.
   */
  async validateAtCreate(
    body: CreateIntentBody,
    ctx: ValidatorMarketContext,
    expiresAt: Date,
  ): Promise<void> {
    const issues: ValidationIssue[] = [];
    const si = body.structuredIntent;

    // (1) Re-run Phase 1 invariants. Single source of truth: the validator.
    for (const v of validateCreateIntentBodyInvariants(body)) {
      issues.push({
        code: 'invariant_violation',
        message: v.message,
        detail: { path: v.path },
      });
    }

    // (2) Common: minSize.
    const sizeBase = BigInt(si.sizeBase);
    if (sizeBase < ctx.minSizeB) {
      issues.push({
        code: 'min_size_violation',
        detail: {
          sizeBase: sizeBase.toString(),
          minSizeB: ctx.minSizeB.toString(),
        },
      });
    }

    // (3) CMR-only: ownerAuth EIP-191 personal_sign verification.
    // CMR has no pre-signed 0x order, so this is the sole proof that
    // body.owner authorized the intent. Honors DEV_SKIP_SIGS=1.
    if (si.type === 'CONDITIONAL_MARKET_READY') {
      const devSkip = process.env.DEV_SKIP_SIGS === '1';
      if (!devSkip) {
        if (!body.ownerAuth?.signature) {
          // Already covered by invariants above; defensive duplicate.
          issues.push({
            code: 'invalid_owner_auth',
            message: 'missing ownerAuth.signature',
          });
        } else if ('atUnix' in si.expiry) {
          try {
            const chainId = getChainIdFromEnv();
            const message = buildCmrOwnerAuthMessage(body, chainId);
            const recovered = verifyMessage(message, body.ownerAuth.signature);
            if (recovered.toLowerCase() !== body.owner.toLowerCase()) {
              issues.push({
                code: 'owner_auth_signer_mismatch',
                detail: {
                  recovered: recovered.toLowerCase(),
                  owner: body.owner.toLowerCase(),
                },
              });
            }
          } catch {
            issues.push({
              code: 'invalid_owner_auth',
              message: 'failed to recover signer from ownerAuth.signature',
            });
          }
        }
        // If `'atUnix' in si.expiry` is false, the invariants step has already
        // recorded a violation. We skip ownerAuth verification rather than
        // attempt to build a non-deterministic canonical message.
      }

      // (3.cmr) Phase 4 CMR-v1 natural-trigger restriction. Only two
      // combinations are supported because they use the trigger price both
      // as the firing threshold AND as the per-fill execution price guard
      // when the prepare service walks the book:
      //   • BUY  + PRICE_BELOW + BEST_ASK  ("buy when ask drops to/below X")
      //   • SELL + PRICE_ABOVE + BEST_BID  ("sell when bid rises to/above X")
      // Other combinations (BUY+PRICE_ABOVE, SELL+PRICE_BELOW, or BUY using
      // BEST_BID etc.) would need a separate maxExecutionPrice / slippage
      // model, which is out of scope for v1. CL is unaffected.
      const isNaturalBuy =
        si.side === 'BUY' &&
        si.trigger.type === 'PRICE_BELOW' &&
        si.trigger.reference === 'BEST_ASK';
      const isNaturalSell =
        si.side === 'SELL' &&
        si.trigger.type === 'PRICE_ABOVE' &&
        si.trigger.reference === 'BEST_BID';
      if (!isNaturalBuy && !isNaturalSell) {
        issues.push({
          code: 'cmr_trigger_unsupported',
          detail: {
            side: si.side,
            triggerType: si.trigger.type,
            triggerReference: si.trigger.reference,
            allowed: 'BUY+PRICE_BELOW+BEST_ASK | SELL+PRICE_ABOVE+BEST_BID',
          },
        });
      }
    }

    // (4) CL-only deterministic checks.
    if (si.type === 'CONDITIONAL_LIMIT') {
      const limitTicks = BigInt(si.limitPriceTicks);

      // (3a) Notional ≥ minNotionalQ.
      // notional (quote atomic) = limitTicks * priceTickQ * sizeBase / 10^baseDecimals
      // → require limitTicks * priceTickQ * sizeBase ≥ minNotionalQ * 10^baseDecimals
      const lhs = limitTicks * ctx.priceTickQ * sizeBase;
      const rhs = ctx.minNotionalQ * pow10(ctx.baseDecimals);
      if (lhs < rhs) {
        issues.push({
          code: 'min_notional_violation',
          detail: {
            notionalAtomic: (lhs / pow10(ctx.baseDecimals)).toString(),
            minNotionalQ: ctx.minNotionalQ.toString(),
          },
        });
      }

      // (3b) Sanitize raw 0x order.
      const order = sanitizeOrder(body.zeroExOrder);

      const devSkip = process.env.DEV_SKIP_SIGS === '1';
      const chainId = getChainIdFromEnv();
      let computedHash: string | null = null;

      if (!devSkip) {
        // (3c) Signature verification.
        if (!body.signature) {
          // Already covered by invariants; included here for defense in depth
          // in case invariants are bypassed by future call sites.
          issues.push({
            code: 'invalid_signature',
            message: 'missing signature',
          });
        } else {
          const sig = parseSigHexToTuple(body.signature);
          if (!sig) {
            issues.push({
              code: 'invalid_signature',
              message: 'malformed signature hex',
            });
          } else {
            const result = this.signing.verifySignature(chainId, order, sig);
            if (!result.valid || !result.recovered) {
              issues.push({ code: 'invalid_signature' });
            } else if (
              result.recovered.toLowerCase() !== body.owner.toLowerCase()
            ) {
              issues.push({
                code: 'signer_mismatch',
                detail: {
                  recovered: result.recovered.toLowerCase(),
                  owner: body.owner.toLowerCase(),
                },
              });
            }
          }
        }

        // (3d) Compute orderHash and cross-check declared preSignedOrderHash.
        try {
          computedHash = this.signing.getOrderHash(chainId, order);
        } catch {
          issues.push({ code: 'order_hash_compute_failed' });
        }
        if (
          computedHash &&
          body.preSignedOrderHash &&
          body.preSignedOrderHash.toLowerCase() !== computedHash.toLowerCase()
        ) {
          issues.push({
            code: 'order_hash_mismatch',
            detail: {
              declared: body.preSignedOrderHash.toLowerCase(),
              computed: computedHash.toLowerCase(),
            },
          });
        }
      }

      // (3e) Order maker matches owner.
      if (order.maker.toLowerCase() !== body.owner.toLowerCase()) {
        issues.push({
          code: 'order_maker_mismatch',
          detail: {
            orderMaker: order.maker.toLowerCase(),
            owner: body.owner.toLowerCase(),
          },
        });
      }

      // (3f) Token pair vs side.
      const baseAddr = ctx.baseAddress.toLowerCase();
      const quoteAddr = ctx.quoteAddress.toLowerCase();
      const expectedMaker = si.side === 'SELL' ? baseAddr : quoteAddr;
      const expectedTaker = si.side === 'SELL' ? quoteAddr : baseAddr;
      if (
        order.makerToken.toLowerCase() !== expectedMaker ||
        order.takerToken.toLowerCase() !== expectedTaker
      ) {
        issues.push({
          code: 'token_pair_mismatch',
          detail: {
            side: si.side,
            makerToken: order.makerToken.toLowerCase(),
            takerToken: order.takerToken.toLowerCase(),
            expectedMaker,
            expectedTaker,
          },
        });
      }

      // (3g) Cross-check: derive (sizeBase, priceTicks) from raw amounts.
      // Same formulas as OrdersController.place; exact bigint equality required.
      const makerAmt = order.makerAmount;
      const takerAmt = order.takerAmount;
      const baseDec = ctx.baseDecimals;

      let derivedSize: bigint | null = null;
      let derivedTicks: bigint | null = null;

      if (si.side === 'SELL') {
        // SELL: maker pays base, receives quote.
        derivedSize = makerAmt;
        const num = takerAmt * pow10(baseDec);
        const den = makerAmt * ctx.priceTickQ;
        if (den === 0n) {
          issues.push({ code: 'price_compute_failed' });
        } else if (num % den !== 0n) {
          issues.push({ code: 'price_tick_violation' });
        } else {
          derivedTicks = num / den;
        }
      } else {
        // BUY: maker pays quote, receives base.
        derivedSize = takerAmt;
        const num = makerAmt * pow10(baseDec);
        const den = takerAmt * ctx.priceTickQ;
        if (den === 0n) {
          issues.push({ code: 'price_compute_failed' });
        } else if (num % den !== 0n) {
          issues.push({ code: 'price_tick_violation' });
        } else {
          derivedTicks = num / den;
        }
      }

      if (derivedSize !== null && derivedSize !== sizeBase) {
        issues.push({
          code: 'size_mismatch',
          detail: {
            derived: derivedSize.toString(),
            declared: sizeBase.toString(),
          },
        });
      }
      if (derivedTicks !== null && derivedTicks !== limitTicks) {
        issues.push({
          code: 'price_mismatch',
          detail: {
            derived: derivedTicks.toString(),
            declared: limitTicks.toString(),
          },
        });
      }

      // (3h) 0x order expiry vs intent expiry + grace.
      const grace = getFireGraceSecs();
      if (order.expiry * 1000 < expiresAt.getTime() + grace * 1000) {
        issues.push({
          code: 'zeroex_order_expiry_too_close',
          detail: {
            zeroExExpiryUnix: order.expiry.toString(),
            intentExpiresAt: expiresAt.toISOString(),
            graceSecs: grace.toString(),
          },
        });
      }

      // (3i) Order existence (idempotency). Use the freshly-computed hash if
      // available, otherwise fall back to the declared one (the mismatch case
      // is already flagged above).
      const hashForLookup =
        computedHash ??
        (body.preSignedOrderHash
          ? body.preSignedOrderHash.toLowerCase()
          : null);
      if (hashForLookup) {
        const exists = await this.repo.orderHashExists(hashForLookup);
        if (exists) {
          issues.push({
            code: 'order_already_exists',
            detail: { orderHash: hashForLookup },
          });
        }

        // (3j) Duplicate non-terminal Intent referencing the same hash.
        // Terminal-state intents (CANCELLED/EXPIRED/FAILED/REJECTED/PLACED/
        // EXECUTED) are intentionally excluded so that legitimate retries
        // after a prior cancel/expiry remain possible.
        const dup = await this.repo.findActiveByPreSignedHash(hashForLookup);
        if (dup) {
          issues.push({
            code: 'duplicate_active_intent',
            detail: { intentId: dup.id, orderHash: hashForLookup },
          });
        }
      }

      // (3k) cancelPair floor check: reject if the on-chain `cancelPair`
      // floor for (owner, makerToken, takerToken) has risen above this
      // order's salt. Phase 3.x-b. Honors monotonic GREATEST(...) writes
      // from CancelWatcherService, so re-orgs are a no-op here.
      const floorIssue = await this.runCancelPairFloorCheck({
        owner: body.owner,
        makerToken: order.makerToken,
        takerToken: order.takerToken,
        salt: order.salt,
      });
      if (floorIssue) issues.push(floorIssue);
    }

    if (issues.length > 0) {
      throw new BadRequestException({
        message: 'validation_failed',
        issues,
      });
    }
  }

  /**
   * Phase 3 fire-time validator. Re-runs the full CL integrity block plus
   * the drift-prone state checks at trigger fire time. Cost is one EIP-712
   * recover per fire — negligible. Honors DEV_SKIP_SIGS=1.
   *
   * The crossing check is intentionally NOT here: it depends on live LOB
   * top-of-book and is performed by `OrdersPlacementService.place` via the
   * `postOnly: true` flag (which throws `post_only_would_cross` on cross).
   *
   * Throws BadRequestException({ message: 'fire_validation_failed', issues })
   * on any failure.
   */
  async validateAtFire(input: {
    intentId: string;
    owner: string;
    side: 'BUY' | 'SELL';
    sizeBase: bigint;
    limitPriceTicks: bigint;
    preSignedOrder: unknown;
    preSignedSignatureHex: string;
    preSignedOrderHash: string;
    intentExpiresAt: Date;
    ctx: ValidatorMarketContext;
  }): Promise<void> {
    const issues: ValidationIssue[] = [];
    const ctx = input.ctx;

    // (1) Common: minSize against current market rules.
    if (input.sizeBase < ctx.minSizeB) {
      issues.push({
        code: 'min_size_violation',
        detail: {
          sizeBase: input.sizeBase.toString(),
          minSizeB: ctx.minSizeB.toString(),
        },
      });
    }

    // (2) Notional against current market rules.
    const lhs = input.limitPriceTicks * ctx.priceTickQ * input.sizeBase;
    const rhs = ctx.minNotionalQ * pow10(ctx.baseDecimals);
    if (lhs < rhs) {
      issues.push({
        code: 'min_notional_violation',
        detail: {
          notionalAtomic: (lhs / pow10(ctx.baseDecimals)).toString(),
          minNotionalQ: ctx.minNotionalQ.toString(),
        },
      });
    }

    // (3) Sanitize raw 0x order from stored Json.
    const order = sanitizeOrder(input.preSignedOrder);

    const devSkip = process.env.DEV_SKIP_SIGS === '1';
    const chainId = getChainIdFromEnv();
    let computedHash: string | null = null;

    if (!devSkip) {
      // (4) Re-verify EIP-712 signature. Defends against any tamper of
      //     stored preSignedOrder/preSignedSignature between create and fire.
      const sig = parseSigHexToTuple(input.preSignedSignatureHex);
      if (!sig) {
        issues.push({
          code: 'invalid_signature',
          message: 'malformed signature hex',
        });
      } else {
        const result = this.signing.verifySignature(chainId, order, sig);
        if (!result.valid || !result.recovered) {
          issues.push({ code: 'invalid_signature' });
        } else if (
          result.recovered.toLowerCase() !== input.owner.toLowerCase()
        ) {
          issues.push({
            code: 'signer_mismatch',
            detail: {
              recovered: result.recovered.toLowerCase(),
              owner: input.owner.toLowerCase(),
            },
          });
        }
      }

      // (5) Recompute orderHash and confirm it matches the stored declared hash.
      try {
        computedHash = this.signing.getOrderHash(chainId, order);
      } catch {
        issues.push({ code: 'order_hash_compute_failed' });
      }
      if (
        computedHash &&
        input.preSignedOrderHash.toLowerCase() !== computedHash.toLowerCase()
      ) {
        issues.push({
          code: 'order_hash_mismatch',
          detail: {
            declared: input.preSignedOrderHash.toLowerCase(),
            computed: computedHash.toLowerCase(),
          },
        });
      }
    }

    // (6) Order maker matches owner.
    if (order.maker.toLowerCase() !== input.owner.toLowerCase()) {
      issues.push({
        code: 'order_maker_mismatch',
        detail: {
          orderMaker: order.maker.toLowerCase(),
          owner: input.owner.toLowerCase(),
        },
      });
    }

    // (7) Token pair vs side under current market context.
    const baseAddr = ctx.baseAddress.toLowerCase();
    const quoteAddr = ctx.quoteAddress.toLowerCase();
    const expectedMaker = input.side === 'SELL' ? baseAddr : quoteAddr;
    const expectedTaker = input.side === 'SELL' ? quoteAddr : baseAddr;
    if (
      order.makerToken.toLowerCase() !== expectedMaker ||
      order.takerToken.toLowerCase() !== expectedTaker
    ) {
      issues.push({
        code: 'token_pair_mismatch',
        detail: {
          side: input.side,
          makerToken: order.makerToken.toLowerCase(),
          takerToken: order.takerToken.toLowerCase(),
          expectedMaker,
          expectedTaker,
        },
      });
    }

    // (8) Cross-check (sizeBase, priceTicks) derived from raw amounts.
    const makerAmt = order.makerAmount;
    const takerAmt = order.takerAmount;
    const baseDec = ctx.baseDecimals;
    let derivedSize: bigint | null = null;
    let derivedTicks: bigint | null = null;
    if (input.side === 'SELL') {
      derivedSize = makerAmt;
      const num = takerAmt * pow10(baseDec);
      const den = makerAmt * ctx.priceTickQ;
      if (den === 0n) {
        issues.push({ code: 'price_compute_failed' });
      } else if (num % den !== 0n) {
        issues.push({ code: 'price_tick_violation' });
      } else {
        derivedTicks = num / den;
      }
    } else {
      derivedSize = takerAmt;
      const num = makerAmt * pow10(baseDec);
      const den = takerAmt * ctx.priceTickQ;
      if (den === 0n) {
        issues.push({ code: 'price_compute_failed' });
      } else if (num % den !== 0n) {
        issues.push({ code: 'price_tick_violation' });
      } else {
        derivedTicks = num / den;
      }
    }
    if (derivedSize !== null && derivedSize !== input.sizeBase) {
      issues.push({
        code: 'size_mismatch',
        detail: {
          derived: derivedSize.toString(),
          declared: input.sizeBase.toString(),
        },
      });
    }
    if (derivedTicks !== null && derivedTicks !== input.limitPriceTicks) {
      issues.push({
        code: 'price_mismatch',
        detail: {
          derived: derivedTicks.toString(),
          declared: input.limitPriceTicks.toString(),
        },
      });
    }

    // (9) 0x order expiry vs intent expiry + grace.
    const grace = getFireGraceSecs();
    if (order.expiry * 1000 < input.intentExpiresAt.getTime() + grace * 1000) {
      issues.push({
        code: 'zeroex_order_expiry_too_close',
        detail: {
          zeroExExpiryUnix: order.expiry.toString(),
          intentExpiresAt: input.intentExpiresAt.toISOString(),
          graceSecs: grace.toString(),
        },
      });
    }

    // (10) Order existence (idempotency).
    const hashForLookup =
      computedHash ?? input.preSignedOrderHash.toLowerCase();
    const exists = await this.repo.orderHashExists(hashForLookup);
    if (exists) {
      issues.push({
        code: 'order_already_exists',
        detail: { orderHash: hashForLookup },
      });
    }

    // (11) cancelPair floor check (Phase 3.x-b). Defends against the maker
    // having invalidated the order's salt on-chain between create and fire.
    const floorIssue = await this.runCancelPairFloorCheck({
      owner: input.owner,
      makerToken: order.makerToken,
      takerToken: order.takerToken,
      salt: order.salt,
    });
    if (floorIssue) issues.push(floorIssue);

    if (issues.length > 0) {
      throw new BadRequestException({
        message: 'fire_validation_failed',
        issues,
      });
    }
  }

  /**
   * Phase 2.1 cancel authorization. Recovers the signer from an EIP-191
   * personal_sign over `buildCancelOwnerAuthMessage(...)` and asserts
   * `recovered === intent.owner`. Throws BadRequestException on failure.
   * Honors `DEV_SKIP_SIGS=1` (mirrors OrdersController.cancel).
   *
   * Lifecycle/state checks (e.g. "is this intent still cancellable?")
   * remain in IntentService — this method is signature-only.
   */
  verifyCancelAuth(opts: {
    intentId: string;
    intentOwner: string;
    signature: string;
  }): void {
    if (process.env.DEV_SKIP_SIGS === '1') return;

    const chainId = getChainIdFromEnv();
    const message = buildCancelOwnerAuthMessage({
      chainId,
      owner: opts.intentOwner,
      intentId: opts.intentId,
    });

    let recovered: string;
    try {
      recovered = verifyMessage(message, opts.signature);
    } catch {
      throw new BadRequestException({
        message: 'cancel_auth_failed',
        issues: [
          {
            code: 'invalid_owner_auth',
            message: 'failed to recover signer from signature',
          },
        ],
      });
    }

    if (recovered.toLowerCase() !== opts.intentOwner.toLowerCase()) {
      throw new BadRequestException({
        message: 'cancel_auth_failed',
        issues: [
          {
            code: 'owner_auth_signer_mismatch',
            detail: {
              recovered: recovered.toLowerCase(),
              owner: opts.intentOwner.toLowerCase(),
            },
          },
        ],
      });
    }
  }

  /**
   * Phase 4.x-b wallet-lock authorization. Recovers the signer from an
   * EIP-191 personal_sign over `buildWalletLockOwnerAuthMessage(...)` and
   * asserts `recovered === intent.owner`. Throws BadRequestException with
   * the `wallet_lock_auth_failed` shape on failure. Honors DEV_SKIP_SIGS=1.
   */
  verifyWalletLockAuth(opts: {
    intentId: string;
    intentOwner: string;
    chainId: number;
    lockNonce: string;
    walletLockUntilAtIso: string;
    signature: string;
  }): void {
    if (process.env.DEV_SKIP_SIGS === '1') return;

    const message = buildWalletLockOwnerAuthMessage({
      intentId: opts.intentId,
      owner: opts.intentOwner,
      chainId: opts.chainId,
      lockNonce: opts.lockNonce,
      walletLockUntilAtIso: opts.walletLockUntilAtIso,
    });

    let recovered: string;
    try {
      recovered = verifyMessage(message, opts.signature);
    } catch {
      throw new BadRequestException({
        message: 'wallet_lock_auth_failed',
        issues: [
          {
            code: 'invalid_owner_auth',
            message: 'failed to recover signer from signature',
          },
        ],
      });
    }

    if (recovered.toLowerCase() !== opts.intentOwner.toLowerCase()) {
      throw new BadRequestException({
        message: 'wallet_lock_auth_failed',
        issues: [
          {
            code: 'owner_auth_signer_mismatch',
            detail: {
              recovered: recovered.toLowerCase(),
              owner: opts.intentOwner.toLowerCase(),
            },
          },
        ],
      });
    }
  }
}
