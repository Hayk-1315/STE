// apps/api/test/sea/cmr-prepare.service.spec.ts
// DB-free coverage for the Phase 4 CMR readiness service. Mocks the
// repository, event repository, and OrderBookService — we only validate the
// preparation logic (trigger eval, liquidity check, atomic latch outcomes,
// debounced PROGRESS, and READ_ONLY belt-and-braces).
import { CmrPrepareService } from '../../src/sea/cmr-prepare.service';
import type { IntentRepository } from '../../src/sea/intent.repository';
import type { IntentEventRepository } from '../../src/sea/intent-event.repository';
import type { OrderBookService } from '../../src/matching/orderbook.service';
import type { PersistenceRepository } from '../../src/matching/persistence.repository';
import {
  IntentEventType,
  OrderSide,
  TriggerType,
  ReferencePriceKind,
} from '@prisma/client';

type RepoMock = {
  markReady: jest.Mock;
  setActiveCooldown: jest.Mock;
};
type EventsMock = { append: jest.Mock };
type ObMock = { snapshot: jest.Mock; quote: jest.Mock };
type PersistenceMock = { getTradingContext: jest.Mock };

function buildSvc(opts?: {
  markReadyResult?: boolean;
  setCooldownResult?: boolean;
  snap?: {
    bids?: Array<{ priceTicks: string }>;
    asks?: Array<{ priceTicks: string }>;
  };
  quote?: Partial<Awaited<ReturnType<OrderBookService['quote']>>>;
  quoteThrow?: Error;
  minNotionalQ?: bigint;
  priceTickQ?: bigint;
  baseDecimals?: number;
  getTradingContextThrow?: Error;
}) {
  const repo: RepoMock = {
    markReady: jest.fn().mockResolvedValue(opts?.markReadyResult ?? true),
    setActiveCooldown: jest
      .fn()
      .mockResolvedValue(opts?.setCooldownResult ?? true),
  };
  const events: EventsMock = { append: jest.fn().mockResolvedValue(undefined) };
  const ob: ObMock = {
    snapshot: jest.fn().mockReturnValue({
      bids: opts?.snap?.bids ?? [],
      asks: opts?.snap?.asks ?? [],
    }),
    quote: jest.fn().mockImplementation(() => {
      if (opts?.quoteThrow) return Promise.reject(opts.quoteThrow);
      return Promise.resolve({
        marketId: 'm1',
        symbol: 'WETH-USDC',
        side: 'BUY',
        requestedBase: '1000000000000000000',
        remainingBase: '0',
        takerToken: '0xquote',
        takerAmount: '300000000000',
        takerFeeAmount: '0',
        takerTotalAmount: '300000000000',
        fills: [
          {
            makerOrderHash: '0xfill1',
            maker: '0xmaker',
            priceTicks: '290000',
            sizeBase: '600000000000000000',
          },
          {
            makerOrderHash: '0xfill2',
            maker: '0xmaker2',
            priceTicks: '291000',
            sizeBase: '400000000000000000',
          },
        ],
        ...opts?.quote,
      });
    }),
  };
  const persistence: PersistenceMock = {
    getTradingContext: jest.fn().mockImplementation(() => {
      if (opts?.getTradingContextThrow) {
        return Promise.reject(opts.getTradingContextThrow);
      }
      return Promise.resolve({
        id: 'm1',
        symbol: 'WETH-USDC',
        baseDecimals: opts?.baseDecimals ?? 18,
        quoteDecimals: 6,
        baseAddress: '0xbase',
        quoteAddress: '0xquote',
        minNotionalQ: opts?.minNotionalQ ?? 0n,
        minSizeB: 0n,
        priceTickQ: opts?.priceTickQ ?? 1n,
      });
    }),
  };

  const svc = new CmrPrepareService(
    repo as unknown as IntentRepository,
    events as unknown as IntentEventRepository,
    ob as unknown as OrderBookService,
    persistence as unknown as PersistenceRepository,
  );
  return { svc, repo, events, ob, persistence };
}

function buildCandidate(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cmr_xyz',
    owner: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    marketId: 'm1',
    marketSymbol: 'WETH-USDC',
    side: OrderSide.BUY,
    sizeBase: 1_000_000_000_000_000_000n,
    triggerType: TriggerType.PRICE_BELOW,
    triggerReference: ReferencePriceKind.BEST_ASK,
    triggerPriceTicks: 300_000n,
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
    ...overrides,
  };
}

describe('CmrPrepareService.evaluateAndPrepare', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.READ_ONLY;
    delete process.env.PROFILE;
    delete process.env.SEA_CMR_READY_TTL_SECS;
    delete process.env.SEA_CMR_PROGRESS_DEBOUNCE_SECS;
  });
  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('trigger not satisfied → no state change and no event', async () => {
    const { svc, repo, events, ob } = buildSvc({
      snap: { asks: [{ priceTicks: '350000' }] }, // 350000 > trigger 300000
    });
    await svc.evaluateAndPrepare(buildCandidate());
    expect(ob.quote).not.toHaveBeenCalled();
    expect(repo.markReady).not.toHaveBeenCalled();
    expect(repo.setActiveCooldown).not.toHaveBeenCalled();
    expect(events.append).not.toHaveBeenCalled();
  });

  it('trigger satisfied + full single-fill liquidity → atomic markReady + READY event with informational snapshot', async () => {
    const { svc, repo, events, ob } = buildSvc({
      snap: { asks: [{ priceTicks: '290000' }] }, // 290000 ≤ trigger 300000
      // CMR v1 requires a SINGLE fill to reach READY.
      quote: {
        fills: [
          {
            makerOrderHash: '0xfill1',
            maker: '0xmaker',
            priceTicks: '290000',
            sizeBase: '1000000000000000000',
          },
        ],
      },
    });
    await svc.evaluateAndPrepare(buildCandidate());
    // Price guard: quote MUST be called with limitPriceTicks=triggerPriceTicks.
    expect(ob.quote).toHaveBeenCalledTimes(1);
    expect(ob.quote.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        marketIdOrSymbol: 'WETH-USDC',
        side: 'BUY',
        sizeBase: 1_000_000_000_000_000_000n,
        limitPriceTicks: 300_000n,
      }),
    );

    expect(repo.markReady).toHaveBeenCalledTimes(1);
    const [, snapshot] = repo.markReady.mock.calls[0] as [
      string,
      Record<string, unknown>,
      Date,
    ];
    // Snapshot must NOT contain rawOrder / rawSig / fills (informational only).
    expect(snapshot.symbol).toBe('WETH-USDC');
    expect(snapshot.remainingBase).toBe('0');
    expect(snapshot.levelCount).toBe(1);
    expect(snapshot.topLevelPriceTicks).toBe('290000');
    expect(snapshot.ttlSec).toBe(60);
    expect('fills' in snapshot).toBe(false);
    expect('rawOrder' in snapshot).toBe(false);
    expect('rawSig' in snapshot).toBe(false);
    expect(events.append).toHaveBeenCalledWith(
      'cmr_xyz',
      IntentEventType.READY,
      expect.objectContaining({ ttlSec: 60 }),
    );
  });

  it('within-trigger aggregate fill that is split (fills.length > 1) → stays ACTIVE with PROGRESS requires_single_fill, not READY', async () => {
    // Default mock quote returns remainingBase '0' with TWO fills — the
    // user-reported book (e.g. 0.1@19 + 0.1@20 under a ≤20 trigger). CMR v1
    // executes a single tx, so this must NOT reach READY.
    const { svc, repo, events } = buildSvc({
      snap: { asks: [{ priceTicks: '290000' }] }, // trigger satisfied
      // minNotionalQ defaults to 0n → notional passes; we reach the new gate.
    });
    await svc.evaluateAndPrepare(buildCandidate());
    expect(repo.markReady).not.toHaveBeenCalled();
    expect(repo.setActiveCooldown).toHaveBeenCalledTimes(1);
    expect(events.append).toHaveBeenCalledWith(
      'cmr_xyz',
      IntentEventType.PROGRESS,
      expect.objectContaining({ reason: 'requires_single_fill', fills: 2 }),
    );
    const readyCalls = events.append.mock.calls.filter(
      (c: unknown[]) => c[1] === IntentEventType.READY,
    );
    expect(readyCalls.length).toBe(0);
  });

  it('price guard prevents READY when deeper levels are worse than the trigger (only top level fillable)', async () => {
    // Scenario from the user-reported gap: top ask 99 fills 0.1 WETH, next
    // ask 105 is above the trigger and would otherwise inflate the fill.
    // With the price guard, OrderBookService.quote returns remainingBase > 0
    // because only the guarded prefix of the book is walked. We must stay
    // ACTIVE and emit PROGRESS, not READY.
    const { svc, repo, events, ob } = buildSvc({
      snap: { asks: [{ priceTicks: '99' }] },
      quote: {
        requestedBase: '500000000000000000', // 0.5 WETH requested
        remainingBase: '400000000000000000', // only 0.1 WETH fillable under guard
        fills: [
          {
            makerOrderHash: '0xtop',
            maker: '0xmaker',
            priceTicks: '99',
            sizeBase: '100000000000000000',
          },
        ],
      },
    });
    await svc.evaluateAndPrepare(
      buildCandidate({
        sizeBase: 500_000_000_000_000_000n,
        triggerPriceTicks: 100n,
      }),
    );
    expect(ob.quote.mock.calls[0][0]).toEqual(
      expect.objectContaining({ limitPriceTicks: 100n }),
    );
    expect(repo.markReady).not.toHaveBeenCalled();
    expect(repo.setActiveCooldown).toHaveBeenCalledTimes(1);
    expect(events.append).toHaveBeenCalledWith(
      'cmr_xyz',
      IntentEventType.PROGRESS,
      expect.objectContaining({
        reason: 'insufficient_liquidity',
        remainingBase: '400000000000000000',
      }),
    );
  });

  it('trigger satisfied + insufficient liquidity → stays ACTIVE with debounced PROGRESS event', async () => {
    const { svc, repo, events } = buildSvc({
      snap: { asks: [{ priceTicks: '290000' }] },
      quote: { remainingBase: '500000000000000000' },
    });
    await svc.evaluateAndPrepare(buildCandidate());
    expect(repo.markReady).not.toHaveBeenCalled();
    expect(repo.setActiveCooldown).toHaveBeenCalledTimes(1);
    expect(events.append).toHaveBeenCalledWith(
      'cmr_xyz',
      IntentEventType.PROGRESS,
      expect.objectContaining({
        reason: 'insufficient_liquidity',
        remainingBase: '500000000000000000',
      }),
    );
  });

  it('insufficient liquidity but cooldown stamp loses race → no duplicate PROGRESS event', async () => {
    const { svc, repo, events } = buildSvc({
      snap: { asks: [{ priceTicks: '290000' }] },
      quote: { remainingBase: '500000000000000000' },
      setCooldownResult: false,
    });
    await svc.evaluateAndPrepare(buildCandidate());
    expect(repo.setActiveCooldown).toHaveBeenCalledTimes(1);
    expect(events.append).not.toHaveBeenCalled();
  });

  it('READ_ONLY=true → silent no-op (no ob calls, no repo calls, no events)', async () => {
    process.env.READ_ONLY = 'true';
    const { svc, repo, events, ob } = buildSvc({
      snap: { asks: [{ priceTicks: '290000' }] },
    });
    await svc.evaluateAndPrepare(buildCandidate());
    expect(ob.snapshot).not.toHaveBeenCalled();
    expect(ob.quote).not.toHaveBeenCalled();
    expect(repo.markReady).not.toHaveBeenCalled();
    expect(events.append).not.toHaveBeenCalled();
  });

  it('markReady lost race → silent abort, no READY event', async () => {
    const { svc, repo, events } = buildSvc({
      snap: { asks: [{ priceTicks: '290000' }] },
      markReadyResult: false,
      quote: {
        fills: [
          {
            makerOrderHash: '0xfill1',
            maker: '0xmaker',
            priceTicks: '290000',
            sizeBase: '1000000000000000000',
          },
        ],
      },
    });
    await svc.evaluateAndPrepare(buildCandidate());
    expect(repo.markReady).toHaveBeenCalledTimes(1);
    expect(events.append).not.toHaveBeenCalled();
  });

  it('quote throws → caught, no state change, no event', async () => {
    const { svc, repo, events } = buildSvc({
      snap: { asks: [{ priceTicks: '290000' }] },
      quoteThrow: new Error('market not loaded'),
    });
    await svc.evaluateAndPrepare(buildCandidate());
    expect(repo.markReady).not.toHaveBeenCalled();
    expect(repo.setActiveCooldown).not.toHaveBeenCalled();
    expect(events.append).not.toHaveBeenCalled();
  });

  it('SELL natural combo (PRICE_ABOVE + BEST_BID) reads BEST_BID and guards quote with triggerPriceTicks', async () => {
    const { svc, repo, ob } = buildSvc({
      snap: { bids: [{ priceTicks: '305000' }] }, // 305000 ≥ trigger 300000
      quote: {
        side: 'SELL',
        fills: [
          {
            makerOrderHash: '0xfill1',
            maker: '0xmaker',
            priceTicks: '305000',
            sizeBase: '1000000000000000000',
          },
        ],
      },
    });
    await svc.evaluateAndPrepare(
      buildCandidate({
        side: OrderSide.SELL,
        triggerType: TriggerType.PRICE_ABOVE,
        triggerReference: ReferencePriceKind.BEST_BID,
      }),
    );
    expect(ob.quote).toHaveBeenCalledTimes(1);
    expect(ob.quote.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        side: 'SELL',
        limitPriceTicks: 300_000n,
      }),
    );
    expect(repo.markReady).toHaveBeenCalledTimes(1);
  });

  // --- Phase 5 Part B.3: min-notional consistency with /match/quote ---

  it('full liquidity but notional below market.minNotionalQ → stays ACTIVE with PROGRESS notional_below_min_notional', async () => {
    // Default fills compute to notionalQ ≈ 290_400 (290000*0.6 + 291000*0.4)
    // with priceTickQ=1, baseDecimals=18. Set minNotionalQ above that.
    const { svc, repo, events, persistence } = buildSvc({
      snap: { asks: [{ priceTicks: '290000' }] },
      minNotionalQ: 1_000_000_000n,
      priceTickQ: 1n,
      baseDecimals: 18,
    });
    await svc.evaluateAndPrepare(buildCandidate());
    expect(persistence.getTradingContext).toHaveBeenCalledTimes(1);
    expect(repo.markReady).not.toHaveBeenCalled();
    expect(repo.setActiveCooldown).toHaveBeenCalledTimes(1);
    expect(events.append).toHaveBeenCalledWith(
      'cmr_xyz',
      IntentEventType.PROGRESS,
      expect.objectContaining({
        reason: 'notional_below_min_notional',
        notionalQ: expect.any(String),
        minNotionalQ: '1000000000',
      }),
    );
    // No READY event emitted.
    const readyCalls = events.append.mock.calls.filter(
      (c: unknown[]) => c[1] === IntentEventType.READY,
    );
    expect(readyCalls.length).toBe(0);
  });

  it('notional at-or-above min → READY transitions normally', async () => {
    // Same default fills (≈290_400 notional) with minNotionalQ comfortably below.
    const { svc, repo, events } = buildSvc({
      snap: { asks: [{ priceTicks: '290000' }] },
      minNotionalQ: 1n,
      quote: {
        fills: [
          {
            makerOrderHash: '0xfill1',
            maker: '0xmaker',
            priceTicks: '290000',
            sizeBase: '1000000000000000000',
          },
        ],
      },
    });
    await svc.evaluateAndPrepare(buildCandidate());
    expect(repo.markReady).toHaveBeenCalledTimes(1);
    expect(events.append).toHaveBeenCalledWith(
      'cmr_xyz',
      IntentEventType.READY,
      expect.objectContaining({ ttlSec: 60 }),
    );
  });

  it('getTradingContext fails → no READY, no PROGRESS (defensive retry on next tick)', async () => {
    const { svc, repo, events } = buildSvc({
      snap: { asks: [{ priceTicks: '290000' }] },
      getTradingContextThrow: new Error('context unavailable'),
    });
    await svc.evaluateAndPrepare(buildCandidate());
    expect(repo.markReady).not.toHaveBeenCalled();
    expect(repo.setActiveCooldown).not.toHaveBeenCalled();
    expect(events.append).not.toHaveBeenCalled();
  });
});
