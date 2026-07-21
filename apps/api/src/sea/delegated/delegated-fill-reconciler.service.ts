// apps/api/src/sea/delegated/delegated-fill-reconciler.service.ts
//
// Phase 3b post-fill reconciliation for DELEGATED CMR execution.
//
// Why this exists: a delegated fill is a userOp — its top-level transaction goes
// to the ERC-4337 EntryPoint, not directly to the 0x Exchange Proxy with
// `fillLimitOrder` calldata. FillWatcher only reconciles DIRECT EP calls
// (`to === exchangeProxy` + fillLimitOrder selector), so it NEVER sees a
// delegated fill and therefore never updates the maker order / Recent Trades /
// My Orders for it. The manual `Execute now` path is reconciled by FillWatcher;
// the delegated executor must reconcile its own confirmed fills.
//
// This service is ADDITIVE: it only CALLS existing public methods that the
// manual path already uses —
//   - PersistenceRepository.addTrade        (Recent Trades + WS emitTrade)
//   - OrderBookService.applyExternalFill    (LOB + Order.remainingBase + maker WS)
// It does NOT touch fill-watcher.service.ts, the matching engine, or 0x builders.
//
// Exactly-once guarantee (no double-count with FillWatcher or on retry):
//   1. FillWatcher structurally cannot process a delegated fill (wrong `to`).
//   2. The executor invokes this ONLY when the race-safe EXECUTING -> EXECUTED
//      transition (`markExecuted`) actually happened — that update succeeds for
//      exactly one caller, so reconciliation runs once per fill.
//   3. Belt-and-braces: we skip if a Trade already exists for this
//      (txHash, marketId, taker), keyed by the on-chain userOp tx hash.
import { Injectable, Logger } from '@nestjs/common';
import { OrderBookService } from '../../matching/orderbook.service';
import { PersistenceRepository } from '../../matching/persistence.repository';

export interface DelegatedFillReconcileInput {
  /** Market UUID (Intent.marketId). */
  marketId: string;
  /** Maker order that was filled. */
  orderHash: string;
  /** Base amount filled (single-fill full-size == intent.sizeBase). */
  execBase: bigint;
  /** The 0x taker = the Nexus Smart Account address. */
  taker: string;
  /** Fill price in market ticks (quote per 1 base). */
  priceTicks: bigint;
  /** Confirmed on-chain userOp transaction hash. */
  txHash: string;
}

export interface DelegatedFillReconcileResult {
  reconciled: boolean;
  reason?: string;
  status?: 'partial' | 'filled' | 'db_only' | 'not_found';
}

@Injectable()
export class DelegatedFillReconcilerService {
  private readonly log = new Logger('DelegatedFillReconciler');

  constructor(
    private readonly persistence: PersistenceRepository,
    private readonly ob: OrderBookService,
  ) {}

  /**
   * Reconcile ONE confirmed delegated fill into product state, exactly as a
   * manual fill would be. Callers must invoke this only after the intent has
   * been transitioned EXECUTING -> EXECUTED (the one-time gate). Idempotent by
   * (txHash, marketId, taker). Returns a result; the caller decides logging —
   * but this method never throws so it can never break the executor tick.
   */
  async reconcileConfirmedFill(
    input: DelegatedFillReconcileInput,
  ): Promise<DelegatedFillReconcileResult> {
    const { marketId, orderHash, execBase, taker, priceTicks, txHash } = input;
    try {
      if (execBase <= 0n) {
        return { reconciled: false, reason: 'nonpositive_execBase' };
      }

      // Belt-and-braces idempotency: if a Trade already exists for this exact
      // on-chain tx + market + taker, reconciliation already ran — do nothing.
      const existing = await this.persistence.findTradeByTxHashForIntent({
        txHash,
        marketId,
        owner: taker,
      });
      if (existing) {
        return { reconciled: false, reason: 'already_reconciled' };
      }

      // 1) Recent Trades (+ WS emitTrade), carrying the userOp tx hash.
      await this.persistence.addTrade(
        marketId,
        orderHash,
        taker.toLowerCase(),
        priceTicks,
        execBase,
        txHash,
      );

      // 2) Maker-side: decrement the resting order's remaining in the LOB + DB
      //    and emit the maker fill/partial_fill event (My Orders + orderbook).
      const res = await this.ob.applyExternalFill(
        marketId,
        orderHash,
        execBase,
        {
          taker: taker.toLowerCase() as `0x${string}`,
          priceTicks,
        },
      );

      this.log.log(
        `delegated fill reconciled → ${res.status} order=${orderHash} sizeBase=${execBase.toString()} tx=${txHash}`,
      );
      return { reconciled: true, status: res.status };
    } catch (e) {
      // Never bubble out of the executor tick: the intent is already EXECUTED
      // and the fill is on-chain; a reconciliation hiccup must not crash the
      // worker. Surface it for investigation instead.
      this.log.warn(
        `delegated fill reconcile error order=${orderHash} tx=${txHash}: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      return { reconciled: false, reason: 'reconcile_error' };
    }
  }
}
