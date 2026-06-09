// apps/api/src/sea/cmr-prepare.service.ts
//
// Phase 4 Conditional Market Ready prepare path. Called by IntentMonitorService
// for each ACTIVE CMR intent whose cooldown has elapsed. Performs:
//   1. read-only re-check (READ_ONLY / PROFILE=mainnet are master-gated upstream
//      but defended here too).
//   2. trigger evaluation against current top-of-book (BEST_ASK / BEST_BID).
//   3. read-only liquidity check via OrderBookService.quote() — NO mutation,
//      NO maker order reservation, NO settlement, NO /match/apply.
//   4. on full-fill capacity → atomic ACTIVE→READY with a thin informational
//      preparedQuote snapshot + IntentEvent('READY').
//   5. on insufficient liquidity → debounced IntentEvent('PROGRESS').
//
// preparedQuote is an *informational readiness snapshot*, not an execution
// plan. It MUST NOT contain txData/txList/raw maker orders/raw signatures —
// the frontend (Phase 5) will request a fresh /match/quote at wallet-confirm
// time. No maker orders are reserved during READY.
import { Injectable, Logger } from '@nestjs/common';
import {
  IntentEventType,
  OrderSide,
  TriggerType,
  ReferencePriceKind,
  Prisma,
} from '@prisma/client';
import { OrderBookService } from '../matching/orderbook.service';
import { PersistenceRepository } from '../matching/persistence.repository';
import { IntentRepository } from './intent.repository';
import { IntentEventRepository } from './intent-event.repository';
import { computeQuoteNotionalQ } from './notional.util';

const DEFAULT_TTL_SECS = 60;
const TTL_MIN = 5;
const TTL_MAX = 300;
const DEFAULT_PROGRESS_DEBOUNCE_SECS = 60;
const DEBOUNCE_MIN = 5;
const DEBOUNCE_MAX = 600;

export type CmrCandidate = {
  id: string;
  owner: string;
  marketId: string;
  marketSymbol: string;
  side: OrderSide;
  sizeBase: bigint;
  triggerType: TriggerType;
  triggerReference: ReferencePriceKind;
  triggerPriceTicks: bigint;
  expiresAt: Date;
};

type QuoteResult = Awaited<ReturnType<OrderBookService['quote']>>;

@Injectable()
export class CmrPrepareService {
  private readonly log = new Logger('CmrPrepare');

  constructor(
    private readonly repo: IntentRepository,
    private readonly events: IntentEventRepository,
    private readonly ob: OrderBookService,
    private readonly persistence: PersistenceRepository,
  ) {}

  /** Resolved readiness TTL in seconds; stamped into the persisted snapshot. */
  resolveTtlSec(): number {
    const raw = Number(process.env.SEA_CMR_READY_TTL_SECS ?? '');
    if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_TTL_SECS;
    return Math.min(TTL_MAX, Math.max(TTL_MIN, Math.floor(raw)));
  }

  /** Debounce window (seconds) for repeated insufficient_liquidity PROGRESS. */
  resolveProgressDebounceSec(): number {
    const raw = Number(process.env.SEA_CMR_PROGRESS_DEBOUNCE_SECS ?? '');
    if (!Number.isFinite(raw) || raw <= 0)
      return DEFAULT_PROGRESS_DEBOUNCE_SECS;
    return Math.min(DEBOUNCE_MAX, Math.max(DEBOUNCE_MIN, Math.floor(raw)));
  }

  /**
   * Evaluate one ACTIVE CMR intent. Caller (monitor) is responsible for
   * env-gating and cooldown filtering at the repo layer; this method only
   * defends READ_ONLY / mainnet as a belt-and-braces guard and silently
   * no-ops on lost-race latches.
   */
  async evaluateAndPrepare(intent: CmrCandidate): Promise<void> {
    if (process.env.READ_ONLY === 'true') {
      this.log.debug(`prepare skipped (READ_ONLY=true): id=${intent.id}`);
      return;
    }
    if (process.env.PROFILE === 'mainnet') {
      this.log.debug(`prepare skipped (PROFILE=mainnet): id=${intent.id}`);
      return;
    }

    // 1. Trigger evaluation. Same convention as Phase 3: BUY references
    //    BEST_ASK, SELL references BEST_BID (MID is rejected at create time).
    //    The natural-combination restriction (BUY+PRICE_BELOW, SELL+
    //    PRICE_ABOVE) is enforced at validateAtCreate; we still defend here.
    const refTicks = this.readReferenceTicks(
      intent.marketSymbol,
      intent.triggerReference,
    );
    if (refTicks === null) return; // empty book on the relevant side

    if (
      !this.triggerSatisfied(
        intent.triggerType,
        refTicks,
        intent.triggerPriceTicks,
      )
    ) {
      return;
    }

    // 2. Read-only liquidity preview, guarded by the trigger price across
    //    the full book depth. Without this guard a deep level whose price
    //    is worse than the trigger would silently inflate the simulated
    //    fill and let intents reach READY when only the top level satisfies
    //    the user's price constraint. With the guard:
    //      BUY  → asks > triggerPriceTicks are skipped (quote stops there)
    //      SELL → bids < triggerPriceTicks are skipped
    //    so READY (remainingBase === 0n) implies the full requested size
    //    is fillable AT OR BETTER than the trigger price. State is not
    //    mutated.
    let quote: QuoteResult;
    try {
      quote = await this.ob.quote({
        marketIdOrSymbol: intent.marketSymbol,
        side: intent.side as 'BUY' | 'SELL',
        sizeBase: intent.sizeBase,
        limitPriceTicks: intent.triggerPriceTicks,
      });
    } catch (e) {
      // A failed read-only quote (e.g. market not loaded post-restart) should
      // not crash the tick. Log and let the next tick try again.
      this.log.warn(
        `quote error id=${intent.id} symbol=${intent.marketSymbol}: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      return;
    }

    const remainingBase = BigInt(quote.remainingBase);
    if (remainingBase > 0n) {
      // 3a. Insufficient liquidity branch. Debounced via cooldownUntilAt so
      //     consecutive ticks don't spam IntentEvent rows. Stay ACTIVE.
      const debounceSec = this.resolveProgressDebounceSec();
      const cooldownUntilAt = new Date(Date.now() + debounceSec * 1000);
      const stamped = await this.repo.setActiveCooldown(
        intent.id,
        cooldownUntilAt,
      );
      if (stamped) {
        await this.events.append(intent.id, IntentEventType.PROGRESS, {
          reason: 'insufficient_liquidity',
          requestedBase: quote.requestedBase,
          remainingBase: quote.remainingBase,
          debounceSec,
        });
      }
      return;
    }

    // 3b. Phase 5 Part B.3: min-notional consistency with POST /match/quote.
    //     The matcher's /match/quote now rejects executed quotes whose
    //     notionalQ < ctx.minNotionalQ. CMR must not transition to READY for
    //     an intent that would then fail at execute time. Use the same exact
    //     bigint formula the matcher uses; share `computeQuoteNotionalQ`
    //     with the SeaController fresh-quote gate so any future tweak lands
    //     in both places.
    let ctxForNotional: Awaited<
      ReturnType<typeof this.persistence.getTradingContext>
    >;
    try {
      ctxForNotional = await this.persistence.getTradingContext(
        intent.marketId,
      );
    } catch (e) {
      // Trading context unavailable — defensive log + retry next tick rather
      // than mark READY on incomplete data.
      this.log.warn(
        `getTradingContext error id=${intent.id} marketId=${intent.marketId}: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      return;
    }
    const notionalQ = computeQuoteNotionalQ(
      quote.fills,
      ctxForNotional.priceTickQ,
      ctxForNotional.baseDecimals,
    );
    if (notionalQ < ctxForNotional.minNotionalQ) {
      // Debounced PROGRESS, same pattern as insufficient_liquidity. Stay
      // ACTIVE; the next tick will re-evaluate once the cooldown elapses.
      // No mutation beyond cooldownUntilAt; no wallet/execution path involved.
      const debounceSec = this.resolveProgressDebounceSec();
      const cooldownUntilAt = new Date(Date.now() + debounceSec * 1000);
      const stamped = await this.repo.setActiveCooldown(
        intent.id,
        cooldownUntilAt,
      );
      if (stamped) {
        await this.events.append(intent.id, IntentEventType.PROGRESS, {
          reason: 'notional_below_min_notional',
          notionalQ: notionalQ.toString(),
          minNotionalQ: ctxForNotional.minNotionalQ.toString(),
          debounceSec,
        });
      }
      return;
    }

    // 3b-bis. CMR v1 executes a SINGLE market-fill tx. A within-trigger
    //   aggregate fill that spans more than one maker order (fills.length > 1)
    //   is not executable on the v1 path — the FE refuses split/multi-tx with
    //   `multi_tx_not_supported`. Marking such an intent READY would advertise
    //   an execution that then fails, so require a single fill here. Same
    //   debounced-PROGRESS pattern as the branches above; stay ACTIVE and do
    //   NOT create any wallet-lock / execution-readiness state.
    if (quote.fills.length !== 1) {
      const debounceSec = this.resolveProgressDebounceSec();
      const cooldownUntilAt = new Date(Date.now() + debounceSec * 1000);
      const stamped = await this.repo.setActiveCooldown(
        intent.id,
        cooldownUntilAt,
      );
      if (stamped) {
        await this.events.append(intent.id, IntentEventType.PROGRESS, {
          reason: 'requires_single_fill',
          fills: quote.fills.length,
          debounceSec,
        });
      }
      return;
    }

    // 3c. Full-fill capacity AND notional ≥ min AND single-fill executable.
    //     Build the informational snapshot and atomically transition
    //     ACTIVE → READY.
    const preparedAt = new Date();
    const ttlSec = this.resolveTtlSec();
    const snapshot = buildPreparedQuoteSnapshot(quote, preparedAt, ttlSec);

    const latched = await this.repo.markReady(intent.id, snapshot, preparedAt);
    if (!latched) {
      // Race: cancel / expiry / another tick won. Silent.
      this.log.debug(`markReady lost race: id=${intent.id}`);
      return;
    }

    await this.events.append(intent.id, IntentEventType.READY, {
      preparedQuote: snapshot,
      preparedAtUnix: Math.floor(preparedAt.getTime() / 1000),
      ttlSec,
    });
    this.log.log(
      `intent ready: id=${intent.id} symbol=${intent.marketSymbol} ttlSec=${ttlSec}`,
    );
  }

  private readReferenceTicks(
    symbol: string,
    reference: ReferencePriceKind,
  ): bigint | null {
    const snap = this.ob.snapshot(symbol, 1);
    if (reference === ReferencePriceKind.BEST_ASK) {
      const ask = snap.asks[0]?.priceTicks;
      return ask ? BigInt(ask) : null;
    }
    if (reference === ReferencePriceKind.BEST_BID) {
      const bid = snap.bids[0]?.priceTicks;
      return bid ? BigInt(bid) : null;
    }
    return null;
  }

  private triggerSatisfied(
    type: TriggerType,
    refTicks: bigint,
    threshold: bigint,
  ): boolean {
    if (type === TriggerType.PRICE_BELOW) return refTicks <= threshold;
    if (type === TriggerType.PRICE_ABOVE) return refTicks >= threshold;
    return false;
  }
}

/**
 * Build the informational readiness snapshot persisted to `Intent.preparedQuote`.
 * Excludes `rawOrder`/`rawSig` from `quote.fills` so the snapshot cannot be
 * mistaken for an executable plan. Derives avg/top price summary from fills.
 */
function buildPreparedQuoteSnapshot(
  quote: QuoteResult,
  preparedAt: Date,
  ttlSec: number,
): Prisma.InputJsonObject {
  const fillsBase = quote.fills.reduce(
    (acc, f) => acc + BigInt(f.sizeBase),
    0n,
  );
  const fillsNotional = quote.fills.reduce(
    (acc, f) => acc + BigInt(f.priceTicks) * BigInt(f.sizeBase),
    0n,
  );
  const avgPriceTicks =
    fillsBase > 0n ? (fillsNotional / fillsBase).toString() : '0';
  const topLevelPriceTicks = quote.fills[0]?.priceTicks ?? '0';

  return {
    marketId: quote.marketId,
    symbol: quote.symbol,
    side: quote.side,
    requestedBase: quote.requestedBase,
    remainingBase: quote.remainingBase, // "0" when this snapshot reaches READY
    takerToken: quote.takerToken,
    takerAmount: quote.takerAmount,
    takerFeeAmount: quote.takerFeeAmount,
    takerTotalAmount: quote.takerTotalAmount,
    levelCount: quote.fills.length,
    topLevelPriceTicks,
    avgPriceTicks,
    snapshotBlock: null,
    preparedAtUnix: Math.floor(preparedAt.getTime() / 1000),
    ttlSec,
  };
}
