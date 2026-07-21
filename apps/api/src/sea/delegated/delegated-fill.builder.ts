// apps/api/src/sea/delegated/delegated-fill.builder.ts
//
// Builds a FRESH single-fill plan for a delegated CMR intent by REUSING the
// existing services read-only (no modification to any of them):
//   - OrderBookService.quote            (fresh, guarded by triggerPriceTicks)
//   - PersistenceRepository             (context + raw order/sig hydration)
//   - ZeroExTxBuildersService.buildFillLimitOrder  (existing 0x calldata builder)
// Mirrors the single-fill branch of `match.controller` so delegated execution
// uses the exact same 0x fill semantics as the manual path. Produces the STE
// fresh-quote (authoritative economic guard input) + the expected receipt facts
// the provider must verify.
import { Injectable, Logger } from '@nestjs/common';
import { OrderBookService, type Side } from '../../matching/orderbook.service';
import { PersistenceRepository } from '../../matching/persistence.repository';
import { ZeroExTxBuildersService } from '../../zeroex/tx-builders.service';
import type { LimitOrder } from '../../zeroex/limit-order.types';
import type { DelegatedFreshQuote } from './delegated.types';

const ZERO_ADDR = '0x0000000000000000000000000000000000000000' as const;
const ZERO_POOL =
  '0x0000000000000000000000000000000000000000000000000000000000000000' as const;

function toBig(v: unknown): bigint {
  if (typeof v === 'bigint') return v;
  if (typeof v === 'number') return BigInt(v);
  if (typeof v === 'string') return BigInt(v);
  return 0n;
}
function toNum(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'bigint') return Number(v);
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}
function toAddr(v: unknown): `0x${string}` {
  return typeof v === 'string' && v.startsWith('0x') && v.length === 42
    ? (v as `0x${string}`)
    : ZERO_ADDR;
}
function toBytes32(v: unknown): `0x${string}` {
  return typeof v === 'string' && v.startsWith('0x') && v.length === 66
    ? (v as `0x${string}`)
    : ZERO_POOL;
}
/** Same shape as match.controller's local sanitizeOrder (kept local, read-only). */
function sanitizeOrder(raw: unknown): LimitOrder {
  const r = raw as Record<string, unknown>;
  return {
    makerToken: toAddr(r?.makerToken),
    takerToken: toAddr(r?.takerToken),
    makerAmount: toBig(r?.makerAmount),
    takerAmount: toBig(r?.takerAmount),
    takerTokenFeeAmount: toBig(r?.takerTokenFeeAmount),
    maker: toAddr(r?.maker),
    taker: toAddr(r?.taker),
    sender: toAddr(r?.sender),
    feeRecipient: toAddr(r?.feeRecipient),
    pool: toBytes32(r?.pool),
    expiry: toNum(r?.expiry),
    salt: toBig(r?.salt),
  };
}

export interface DelegatedIntentInput {
  marketId: string;
  side: Side;
  sizeBase: bigint;
  triggerPriceTicks: bigint;
}

export interface FreshFillResult {
  ok: boolean;
  reason?: string;
  target?: string; // 0x EP
  calldata?: string; // fillLimitOrder calldata
  freshQuote?: DelegatedFreshQuote;
  expected?: {
    orderHash: string;
    taker: string;
    takerToken: string;
    takerFillAmount: bigint;
    /** Actual proportional 0x taker fee for this fill (receipt upper bound). */
    takerFeeAmount: bigint;
    /**
     * Base amount filled against the maker order (== intent.sizeBase for the
     * enforced single-fill/full-size case). Used by post-fill reconciliation to
     * decrement the maker order's remaining and record the Recent-Trades row.
     */
    execBase: bigint;
    /**
     * Fill price in market ticks (quote per 1 base), derived from the matched
     * maker order — same formula FillWatcher uses. Recorded on the Trade row so
     * delegated fills appear in Recent Trades identically to manual fills.
     */
    priceTicks: bigint;
  };
}

@Injectable()
export class DelegatedFillBuilder {
  private readonly log = new Logger('DelegatedFillBuilder');

  constructor(
    private readonly ob: OrderBookService,
    private readonly persistence: PersistenceRepository,
    private readonly txb: ZeroExTxBuildersService,
  ) {}

  /**
   * Build a fresh single-fill plan for the delegated intent. Enforces the same
   * single-fill / full-size gates the manual CMR path uses. Returns `ok:false`
   * (never throws) so the executor can leave the intent READY (manual fallback).
   */
  async buildFreshFill(
    intent: DelegatedIntentInput,
    accountAddress: string,
  ): Promise<FreshFillResult> {
    try {
      const ctx = await this.persistence.getTradingContext(intent.marketId);
      const plan = await this.ob.quote({
        marketIdOrSymbol: intent.marketId,
        side: intent.side,
        sizeBase: intent.sizeBase,
        limitPriceTicks: intent.triggerPriceTicks,
      });

      const fills = Array.isArray(plan.fills) ? plan.fills : [];
      const availableBase = fills.reduce((a, f) => a + toBig(f.sizeBase), 0n);
      const remainingBaseB =
        intent.sizeBase > availableBase ? intent.sizeBase - availableBase : 0n;

      if (fills.length !== 1) {
        return { ok: false, reason: 'requires_single_fill' };
      }
      if (remainingBaseB !== 0n) {
        return { ok: false, reason: 'not_full_size' };
      }

      const f = fills[0] as {
        makerOrderHash: string;
        sizeBase: string | bigint;
        rawOrder?: unknown;
        rawSig?: unknown;
      };
      if (!f.rawOrder || !f.rawSig) {
        try {
          const row = await this.persistence.findRawOrderByHash(
            f.makerOrderHash,
          );
          if (row.zeroExOrder && row.signature) {
            f.rawOrder = row.zeroExOrder;
            f.rawSig = row.signature;
          }
        } catch (e) {
          this.log.warn(
            `raw hydration failed for ${f.makerOrderHash}: ${(e as Error).message}`,
          );
        }
      }
      if (!f.rawOrder || !f.rawSig) {
        return { ok: false, reason: 'missing_raw' };
      }

      const order = sanitizeOrder(f.rawOrder);
      const fillBase = toBig(f.sizeBase);
      const takerFillAmount =
        intent.side === 'BUY'
          ? (fillBase * order.takerAmount) /
            (order.makerAmount === 0n ? 1n : order.makerAmount)
          : fillBase;
      // 0x fillLimitOrder fee is proportional to takerTokenFillAmount/takerAmount.
      const feeAmount =
        order.takerAmount === 0n
          ? 0n
          : (order.takerTokenFeeAmount * takerFillAmount) / order.takerAmount;
      const takerToken =
        intent.side === 'BUY' ? ctx.quoteAddress : ctx.baseAddress;

      // Fill price in ticks (quote per 1 base), derived from the matched maker
      // order — mirrors FillWatcher's price math so a delegated fill records the
      // same Recent-Trades price a manual fill would. Guarded against a zero
      // amount (a valid resting order never has one).
      const pow10Base = 10n ** BigInt(ctx.baseDecimals);
      const makerSellsBase =
        order.makerToken.toLowerCase() === ctx.baseAddress.toLowerCase();
      const priceTicks =
        order.makerAmount === 0n || order.takerAmount === 0n
          ? 0n
          : makerSellsBase
            ? (order.takerAmount * pow10Base) /
              (order.makerAmount * ctx.priceTickQ)
            : (order.makerAmount * pow10Base) /
              (order.takerAmount * ctx.priceTickQ);

      const tx = this.txb.buildFillLimitOrder(
        order,
        f.rawSig as `0x${string}`,
        takerFillAmount,
      );

      const freshQuote: DelegatedFreshQuote = {
        marketId: intent.marketId,
        side: intent.side,
        fillsCount: 1,
        remainingBaseB,
        takerToken,
        takerFillAmountQ: takerFillAmount,
        takerTotalAmountQ: takerFillAmount + feeAmount,
      };

      return {
        ok: true,
        target: tx.to,
        calldata: tx.data,
        freshQuote,
        expected: {
          orderHash: f.makerOrderHash,
          taker: accountAddress,
          takerToken,
          takerFillAmount,
          takerFeeAmount: feeAmount,
          execBase: fillBase,
          priceTicks,
        },
      };
    } catch (e) {
      this.log.warn(`buildFreshFill error: ${(e as Error).message}`);
      return { ok: false, reason: 'build_error' };
    }
  }
}
