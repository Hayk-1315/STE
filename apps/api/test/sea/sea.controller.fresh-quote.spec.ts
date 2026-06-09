// apps/api/test/sea/sea.controller.fresh-quote.spec.ts
// DB-free coverage for the Phase 5 read-only fresh-quote endpoint. Mocks the
// repository, OrderBookService, and PersistenceRepository; verifies the state
// gates (not_found, not_ready, expired, ttl_expired, trigger_no_longer_satisfied,
// insufficient_liquidity) and the happy path. Endpoint MUST NOT mutate state.
import { SeaController } from '../../src/sea/sea.controller';
import type { IntentService } from '../../src/sea/intent.service';
import type { IntentRepository } from '../../src/sea/intent.repository';
import type { OrderBookService } from '../../src/matching/orderbook.service';
import type { PersistenceRepository } from '../../src/matching/persistence.repository';
import {
  IntentStatus,
  IntentType,
  TriggerType,
  ReferencePriceKind,
  OrderSide,
} from '@prisma/client';

type RepoMock = { findById: jest.Mock };
type ObMock = { snapshot: jest.Mock; quote: jest.Mock };
type PersistenceMock = { getTradingContext: jest.Mock };

function buildCtrl(opts?: {
  intent?: Record<string, unknown> | null;
  snap?: {
    bids?: Array<{ priceTicks: string }>;
    asks?: Array<{ priceTicks: string }>;
  };
  quote?: Partial<Awaited<ReturnType<OrderBookService['quote']>>>;
  quoteThrow?: Error;
  minNotionalQ?: bigint;
  priceTickQ?: bigint;
}) {
  const repo: RepoMock = {
    findById: jest.fn().mockResolvedValue(opts?.intent ?? null),
  };
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
            sizeBase: '1000000000000000000',
          },
        ],
        ...opts?.quote,
      });
    }),
  };
  const persistence: PersistenceMock = {
    getTradingContext: jest.fn().mockResolvedValue({
      id: 'm1',
      symbol: 'WETH-USDC',
      baseDecimals: 18,
      quoteDecimals: 6,
      baseAddress: '0xbase',
      quoteAddress: '0xquote',
      minNotionalQ: opts?.minNotionalQ ?? 0n,
      minSizeB: 0n,
      priceTickQ: opts?.priceTickQ ?? 1n,
    }),
  };
  const svc = {} as IntentService;
  const ctrl = new SeaController(
    svc,
    repo as unknown as IntentRepository,
    ob as unknown as OrderBookService,
    persistence as unknown as PersistenceRepository,
  );
  return { ctrl, repo, ob, persistence };
}

function buildReadyIntent(overrides: Record<string, unknown> = {}) {
  const preparedAt = new Date(Date.now() - 1_000); // 1s ago, well within 60s TTL
  return {
    id: 'cmr_xyz',
    owner: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    marketId: 'm1',
    type: IntentType.CONDITIONAL_MARKET_READY,
    status: IntentStatus.READY,
    side: OrderSide.BUY,
    sizeBase: '1000000000000000000',
    limitPriceTicks: null,
    tif: 'IOC',
    triggerType: TriggerType.PRICE_BELOW,
    triggerReference: ReferencePriceKind.BEST_ASK,
    triggerPriceTicks: '300000',
    executionAuthority: 'USER_CONFIRMATION_REQUIRED',
    preSignedOrderHash: null,
    linkedOrderHash: null,
    preparedQuote: { ttlSec: 60 },
    preparedQuoteAt: preparedAt.toISOString(),
    cooldownUntilAt: null,
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    failureReason: null,
    rawText: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('SeaController.freshQuote', () => {
  it('intent_not_found when repo returns null', async () => {
    const { ctrl } = buildCtrl({ intent: null });
    const res = await ctrl.freshQuote('missing');
    expect(res).toEqual({ ok: false, reason: 'intent_not_found' });
  });

  it('intent_not_ready when status is ACTIVE', async () => {
    const { ctrl } = buildCtrl({
      intent: buildReadyIntent({ status: IntentStatus.ACTIVE }),
    });
    const res = await ctrl.freshQuote('cmr_xyz');
    expect(res).toEqual({ ok: false, reason: 'intent_not_ready:ACTIVE' });
  });

  it('intent_expired when expiresAt is in the past', async () => {
    const { ctrl } = buildCtrl({
      intent: buildReadyIntent({
        expiresAt: new Date(Date.now() - 1000).toISOString(),
      }),
    });
    const res = await ctrl.freshQuote('cmr_xyz');
    expect(res).toEqual({ ok: false, reason: 'intent_expired' });
  });

  it('ready_ttl_expired when preparedQuoteAt + ttlSec is in the past (no state mutation)', async () => {
    const { ctrl, repo, ob } = buildCtrl({
      intent: buildReadyIntent({
        preparedQuoteAt: new Date(Date.now() - 120_000).toISOString(),
        preparedQuote: { ttlSec: 60 },
      }),
    });
    const res = await ctrl.freshQuote('cmr_xyz');
    expect(res).toEqual({ ok: false, reason: 'ready_ttl_expired' });
    // No quote call should have been made.
    expect(ob.quote).not.toHaveBeenCalled();
    // findById was called once for the read; no other repo methods exist on the mock.
    expect(repo.findById).toHaveBeenCalledTimes(1);
  });

  it('trigger_no_longer_satisfied when bestAsk has moved above the trigger', async () => {
    const { ctrl } = buildCtrl({
      intent: buildReadyIntent(),
      // bestAsk 350000 > trigger 300000 → PRICE_BELOW fails
      snap: { asks: [{ priceTicks: '350000' }] },
    });
    const res = await ctrl.freshQuote('cmr_xyz');
    expect(res).toEqual({ ok: false, reason: 'trigger_no_longer_satisfied' });
  });

  it('trigger_no_longer_satisfied when the relevant side of the book is empty', async () => {
    const { ctrl } = buildCtrl({
      intent: buildReadyIntent(),
      snap: { asks: [] },
    });
    const res = await ctrl.freshQuote('cmr_xyz');
    expect(res).toEqual({ ok: false, reason: 'trigger_no_longer_satisfied' });
  });

  it('insufficient_liquidity when guarded quote returns remainingBase > 0', async () => {
    const { ctrl } = buildCtrl({
      intent: buildReadyIntent(),
      snap: { asks: [{ priceTicks: '290000' }] },
      quote: { remainingBase: '500000000000000000' },
    });
    const res = await ctrl.freshQuote('cmr_xyz');
    expect(res).toEqual({ ok: false, reason: 'insufficient_liquidity' });
  });

  it('happy path: trigger satisfied + full liquidity → ok:true with intent + preview', async () => {
    const { ctrl, ob } = buildCtrl({
      intent: buildReadyIntent(),
      snap: { asks: [{ priceTicks: '290000' }] },
    });
    const res = await ctrl.freshQuote('cmr_xyz');
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.intent.id).toBe('cmr_xyz');
    expect(res.preview.symbol).toBe('WETH-USDC');
    expect(res.preview.remainingBase).toBe('0');
    expect(res.preview.triggerPriceTicks).toBe('300000');
    // Guard MUST be passed to ob.quote.
    expect(ob.quote.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        side: 'BUY',
        sizeBase: 1_000_000_000_000_000_000n,
        limitPriceTicks: 300_000n,
      }),
    );
  });

  it('requires_single_fill when the guarded quote spans more than one fill (defense-in-depth for drift)', async () => {
    // An already-READY row whose book drifted into a split between prepare and
    // this pre-execute re-check. CMR v1 cannot execute a multi-fill, so the
    // wallet must not open.
    const { ctrl } = buildCtrl({
      intent: buildReadyIntent(),
      snap: { asks: [{ priceTicks: '290000' }] },
      quote: {
        remainingBase: '0',
        fills: [
          {
            makerOrderHash: '0xfill1',
            maker: '0xm1',
            priceTicks: '290000',
            sizeBase: '500000000000000000',
          },
          {
            makerOrderHash: '0xfill2',
            maker: '0xm2',
            priceTicks: '295000',
            sizeBase: '500000000000000000',
          },
        ],
      },
    });
    const res = await ctrl.freshQuote('cmr_xyz');
    expect(res).toEqual({ ok: false, reason: 'requires_single_fill' });
  });

  // --- Phase 5 Part B.3: min-notional gate ---

  it('notional_below_min_notional when fills total below ctx.minNotionalQ (no state mutation)', async () => {
    // Default fill: priceTicks=290000, sizeBase=1e18, priceTickQ=1, baseDecimals=18
    // → notionalQ = 290000 * 1 * 1e18 / 1e18 = 290000.
    // Set minNotionalQ above that to trigger the gate.
    const { ctrl, repo } = buildCtrl({
      intent: buildReadyIntent(),
      snap: { asks: [{ priceTicks: '290000' }] },
      minNotionalQ: 1_000_000_000n,
      priceTickQ: 1n,
    });
    const res = await ctrl.freshQuote('cmr_xyz');
    expect(res).toEqual({ ok: false, reason: 'notional_below_min_notional' });
    // findById is the only repo touch — no transitions, no mutation.
    expect(repo.findById).toHaveBeenCalledTimes(1);
  });

  it('happy path still passes when notional equals ctx.minNotionalQ (boundary)', async () => {
    // notionalQ = 290000; set minNotionalQ exactly equal to it.
    const { ctrl } = buildCtrl({
      intent: buildReadyIntent(),
      snap: { asks: [{ priceTicks: '290000' }] },
      minNotionalQ: 290_000n,
      priceTickQ: 1n,
    });
    const res = await ctrl.freshQuote('cmr_xyz');
    expect(res.ok).toBe(true);
  });
});
