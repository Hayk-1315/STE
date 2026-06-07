// apps/api/src/matching/orders-placement.service.ts
//
// Shared placement core. Both POST /orders (apps/api/src/public/orders.controller.ts)
// and SEA Phase 3 Conditional Limit fire (apps/api/src/sea/intent-fire.service.ts)
// route through this service so postOnly behavior, balance guard, shadow check,
// fee policy, attachRaw, and metrics stay in one place.
//
// This is a verbatim extraction of OrdersController.place lines 204-373 — pure
// code-move, no logic edits. Throw codes are unchanged so existing /orders
// callers see byte-identical behavior; SEA fire catches BadRequestException
// and maps `e.message` to its `failureReason` taxonomy.
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Contract, JsonRpcProvider } from 'ethers';
import type { LimitOrder, Signature } from '../zeroex/limit-order.types';
import { OrderBookService, type Side } from './orderbook.service';
import { PersistenceRepository } from './persistence.repository';
import { ShadowChecksService } from '../observability/shadow-checks.service';
import { MetricsService } from '../observability/metrics.service';
import { signatureToTuple } from './raw-order.util';

const FEE_BPS = Number(process.env.TAKER_FEE_BPS || '0');
// Canonical taker-fee recipient is FEE_RECIPIENT (used by zeroex.config.ts and set
// in every profile). TAKER_FEE_RECIPIENT kept as an optional override. Without this
// fallback the recipient-match check below stays dormant, so the configured fee
// recipient is never enforced.
const FEE_RECIPIENT = (
  process.env.TAKER_FEE_RECIPIENT ||
  process.env.FEE_RECIPIENT ||
  ''
).toLowerCase();

const pow10 = (n: number): bigint => {
  let r = 1n;
  for (let i = 0; i < n; i++) r *= 10n;
  return r;
};

const toLower = (s: string): string => s.trim().toLowerCase();

export type PlaceInput = {
  /** Already EIP-712-verified (or DEV_SKIP_SIGS bypassed) by the caller. */
  order: LimitOrder;
  signature: Signature;
  /** Pre-computed by the caller (controller computes via signing.getOrderHash). */
  orderHash: string;
  /** Already lowercased; matches recovered signer / declared owner. */
  makerExpected: string;
  /** Passive-only flag. SEA Phase 3 fire always sets this true. */
  postOnly: boolean;
  /** Optional log/metric tag. Default: 'orders'. */
  source?: 'orders' | 'sea';
};

export type PlaceResult = {
  ok: true;
  orderHash: string;
  status: string;
};

@Injectable()
export class OrdersPlacementService {
  private readonly log = new Logger('OrdersPlacement');

  constructor(
    private readonly ob: OrderBookService,
    private readonly repo: PersistenceRepository,
    private readonly shadowChecks: ShadowChecksService,
    private readonly metrics: MetricsService,
  ) {}

  /**
   * Place a verified, hashed 0x LimitOrder into the LOB and persistence.
   * Throws BadRequestException with a stable string code on any rejection;
   * see `OrdersController.place` and `IntentFireService.fire` for the
   * code → caller-semantic mappings.
   */
  async place(input: PlaceInput): Promise<PlaceResult> {
    const { order, signature, orderHash, makerExpected, postOnly } = input;

    // Phase 5 P0 fix: pre-validate the signature shape BEFORE any LOB/DB
    // mutation. This catches malformed/tuple-shaped signatures up front with
    // a clean 400 — no rollback needed. The result is also re-used at
    // attachRawToOrder time below.
    if (!signatureToTuple(signature)) {
      throw new BadRequestException('invalid_signature_for_persistence');
    }

    /** Validación mínima de política de taker fee (si está configurada) */
    if (FEE_BPS > 0 || FEE_RECIPIENT) {
      const feeRecipient = toLower((order.feeRecipient as string) || '');
      const takerAmt = BigInt(order.takerAmount ?? '0');
      const gotFee = BigInt(order.takerTokenFeeAmount ?? '0');
      const expectedMinFee =
        FEE_BPS > 0 ? (takerAmt * BigInt(FEE_BPS)) / 10000n : 0n;

      if (FEE_RECIPIENT && feeRecipient !== FEE_RECIPIENT) {
        throw new BadRequestException('invalid_fee_recipient');
      }
      if (FEE_BPS > 0 && gotFee < expectedMinFee) {
        throw new BadRequestException('taker_fee_too_low_for_policy');
      }
    }

    // 2) Resolve market by token pair (makerToken/takerToken)
    const makerToken = toLower(order.makerToken);
    const takerToken = toLower(order.takerToken);

    const markets = await this.repo.listMarketsBasic();
    const market = markets.find((m) => {
      const base = toLower(m.baseAddress);
      const quote = toLower(m.quoteAddress);
      return (
        (base === makerToken && quote === takerToken) ||
        (base === takerToken && quote === makerToken)
      );
    });

    if (!market) {
      throw new BadRequestException('market_not_found_for_tokens');
    }

    const ctx = await this.repo.getTradingContext(market.id);

    // 3) Derive side, sizeBase, priceTicks from maker/taker amounts
    const makerAmt = BigInt(order.makerAmount);
    const takerAmt = BigInt(order.takerAmount);

    let side: Side;
    let sizeBase: bigint;
    let priceTicks: bigint;

    const baseAddr = ctx.baseAddress;
    const quoteAddr = ctx.quoteAddress;

    const isMakerBase = baseAddr === makerToken && quoteAddr === takerToken;

    if (isMakerBase) {
      side = 'SELL';
      sizeBase = makerAmt;
      const num = takerAmt * pow10(ctx.baseDecimals);
      const den = makerAmt * ctx.priceTickQ;
      priceTicks = num / den;
      if (num % den !== 0n) {
        throw new BadRequestException('price_tick_violation');
      }
    } else {
      side = 'BUY';
      sizeBase = takerAmt;
      const num = makerAmt * pow10(ctx.baseDecimals);
      const den = takerAmt * ctx.priceTickQ;
      priceTicks = num / den;
      if (num % den !== 0n) {
        throw new BadRequestException('price_tick_violation');
      }
    }

    // --- Maker free-balance guard ---
    const openBase = await this.repo.sumOpenBaseByMakerSymbol(
      makerExpected,
      market.symbol,
    );

    const rpc = process.env.RPC_URL_READONLY ?? process.env.RPC_URL;
    if (!rpc) {
      console.warn(
        '[orders] balance guard skipped: missing RPC_URL(_READONLY)',
      );
    } else {
      const provider = new JsonRpcProvider(rpc);
      const erc20 = new Contract(
        ctx.baseAddress,
        ['function balanceOf(address) view returns (uint256)'],
        provider,
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const onchain: bigint = await erc20.balanceOf(makerExpected);

      if (openBase + sizeBase > onchain) {
        throw new BadRequestException('maker_insufficient_free_balance');
      }
    }

    // Shadow check de balance/allowance del maker
    const shadow = await this.shadowChecks.checkMakerFunds({
      makerToken: order.makerToken,
      makerAmount: order.makerAmount,
      maker: order.maker,
    });

    if (!shadow.ok && this.shadowChecks.isBlocking) {
      throw new BadRequestException(
        `shadow_check_failed: ${shadow.warnings.join(' | ')}`,
      );
    }

    // postOnly crossing check (SEA passive-only is implemented via this same path)
    const snap = this.ob.snapshot(market.symbol, 1);
    const bestBid = snap.bids[0]?.priceTicks
      ? BigInt(snap.bids[0].priceTicks)
      : null;
    const bestAsk = snap.asks[0]?.priceTicks
      ? BigInt(snap.asks[0].priceTicks)
      : null;

    const wouldCross =
      side === 'BUY'
        ? bestAsk !== null && priceTicks >= bestAsk
        : bestBid !== null && priceTicks <= bestBid;

    if (postOnly && wouldCross) {
      throw new BadRequestException('post_only_would_cross');
    }

    // 4) Place into in-memory book keyed by symbol
    const res = await this.ob.place({
      marketId: market.symbol,
      orderHash,
      maker: makerExpected,
      side,
      priceTicks,
      sizeBase,
    });
    // Phase 5 P0 fix (rollback-boundary tightening): raw persistence is
    // load-bearing. Both `ob.attachRaw` and `repo.attachRawToOrder` are
    // inside the same try/catch so any failure between `ob.place` and a
    // fully-durable raw triggers rollback. Failure modes covered:
    //   - `ob.attachRaw` throws (e.g., transient getTradingContext
    //     rejection between ob.place creating the level and attachRaw
    //     trying to find it).
    //   - `ob.attachRaw` returns false (LOB level missing post-place — a
    //     latent race that was previously silent-ignored).
    //   - `repo.attachRawToOrder` throws (signature normalisation fails or
    //     Prisma DB write fails).
    // Rollback in all cases: cancel the LOB entry AND mark the DB row
    // CANCELLED (both idempotent, used identically by CancelWatcher), then
    // propagate `InternalServerErrorException('raw_persistence_failed: ...')`.
    try {
      const attached = await this.ob.attachRaw(market.symbol, orderHash, {
        order,
        signature,
      });
      if (!attached) {
        throw new Error(
          `ob.attachRaw returned false for ${orderHash} (LOB level not found)`,
        );
      }
      await this.repo.attachRawToOrder({ orderHash, order, signature });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      this.log.error(
        `raw persistence failed for ${orderHash}; rolling back placement: ${message}`,
      );
      try {
        await this.ob.cancel(market.symbol, orderHash);
      } catch (cancelErr) {
        this.log.warn(
          `rollback ob.cancel failed for ${orderHash}: ${
            cancelErr instanceof Error ? cancelErr.message : String(cancelErr)
          }`,
        );
      }
      try {
        await this.repo.cancelOrder(market.id, orderHash);
      } catch (cancelErr) {
        this.log.warn(
          `rollback repo.cancelOrder failed for ${orderHash}: ${
            cancelErr instanceof Error ? cancelErr.message : String(cancelErr)
          }`,
        );
      }
      throw new InternalServerErrorException(
        `raw_persistence_failed: ${message}`,
      );
    }

    if (this.metrics && typeof this.metrics.ordersPlaced?.inc === 'function') {
      this.metrics.ordersPlaced.inc();
    }
    return { ok: true, orderHash, status: res.status };
  }
}
