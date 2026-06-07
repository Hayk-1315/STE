// apps/api/test/sea/intent-monitor.service.spec.ts
// DB-free coverage for IntentMonitorService — opt-in gating + per-tick
// dispatch for both CL (Phase 3) and CMR (Phase 4) branches. All
// downstream services are mocked so we only test monitor wiring.
import { IntentMonitorService } from '../../src/sea/intent-monitor.service';
import type { IntentRepository } from '../../src/sea/intent.repository';
import type { OrderBookService } from '../../src/matching/orderbook.service';
import type { IntentFireService } from '../../src/sea/intent-fire.service';
import type { CmrPrepareService } from '../../src/sea/cmr-prepare.service';
import type { IntentEventRepository } from '../../src/sea/intent-event.repository';
import {
  IntentType,
  IntentStatus,
  IntentEventType,
  TriggerType,
  ReferencePriceKind,
  OrderSide,
} from '@prisma/client';

type RepoMock = {
  findActiveCLIntents: jest.Mock;
  findActiveCMRIntents: jest.Mock;
  findReadyCMRIntents: jest.Mock;
  rearmFromReady: jest.Mock;
  markExpiredFromReady: jest.Mock;
};
type ObMock = { snapshot: jest.Mock };
type FireMock = { fire: jest.Mock };
type CmrMock = { evaluateAndPrepare: jest.Mock };
type EventsMock = { append: jest.Mock };

function buildMonitor(opts?: {
  intents?: ReturnType<typeof buildIntentRow>[];
  cmrActive?: ReturnType<typeof buildCmrActiveRow>[];
  cmrReady?: ReturnType<typeof buildCmrReadyRow>[];
  topOfBook?: {
    bids?: Array<{ priceTicks: string }>;
    asks?: Array<{ priceTicks: string }>;
  };
  fireImpl?: jest.Mock;
  cmrPrepareImpl?: jest.Mock;
  rearmResult?: boolean;
  markExpiredResult?: boolean;
}) {
  const repo: RepoMock = {
    findActiveCLIntents: jest.fn().mockResolvedValue(opts?.intents ?? []),
    findActiveCMRIntents: jest.fn().mockResolvedValue(opts?.cmrActive ?? []),
    findReadyCMRIntents: jest.fn().mockResolvedValue(opts?.cmrReady ?? []),
    rearmFromReady: jest.fn().mockResolvedValue(opts?.rearmResult ?? true),
    markExpiredFromReady: jest
      .fn()
      .mockResolvedValue(opts?.markExpiredResult ?? true),
  };
  const ob: ObMock = {
    snapshot: jest.fn().mockReturnValue({
      bids: opts?.topOfBook?.bids ?? [],
      asks: opts?.topOfBook?.asks ?? [],
    }),
  };
  const fire: FireMock = {
    fire: opts?.fireImpl ?? jest.fn().mockResolvedValue(undefined),
  };
  const cmr: CmrMock = {
    evaluateAndPrepare:
      opts?.cmrPrepareImpl ?? jest.fn().mockResolvedValue(undefined),
  };
  const events: EventsMock = { append: jest.fn().mockResolvedValue(undefined) };

  const monitor = new IntentMonitorService(
    repo as unknown as IntentRepository,
    ob as unknown as OrderBookService,
    fire as unknown as IntentFireService,
    cmr as unknown as CmrPrepareService,
    events as unknown as IntentEventRepository,
  );
  return { monitor, repo, ob, fire, cmr, events };
}

function buildCmrActiveRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cmr_active',
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

function buildCmrReadyRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cmr_ready',
    owner: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    marketId: 'm1',
    preparedQuote: { ttlSec: 60 } as Record<string, unknown>,
    preparedQuoteAt: new Date(Date.now() - 5_000),
    // Phase 4.x-b: walletLock guard input. Default null so existing tests
    // are byte-identical; tests opt-in by overriding.
    walletLockUntilAt: null as Date | null,
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
    ...overrides,
  };
}

function buildIntentRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cl_intent_xyz',
    owner: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    marketId: 'm1',
    marketSymbol: 'WETH-USDC',
    type: IntentType.CONDITIONAL_LIMIT,
    status: IntentStatus.ACTIVE,
    side: 'BUY' as const,
    sizeBase: 1_000_000_000_000_000_000n,
    limitPriceTicks: 295_000n,
    triggerType: TriggerType.PRICE_BELOW,
    triggerReference: ReferencePriceKind.BEST_ASK,
    triggerPriceTicks: 300_000n,
    preSignedOrder: { foo: 'bar' },
    preSignedSignature: Buffer.from('aa', 'hex'),
    preSignedOrderHash:
      '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
    ...overrides,
  };
}

describe('IntentMonitorService', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.READ_ONLY;
    delete process.env.PROFILE;
    process.env.SEA_MONITOR_ENABLED = '1';
  });
  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  describe('boot gating (onApplicationBootstrap)', () => {
    it('does not start the timer when SEA_MONITOR_ENABLED is unset', async () => {
      delete process.env.SEA_MONITOR_ENABLED;
      const { monitor, repo } = buildMonitor();
      await monitor.onApplicationBootstrap();
      // Allow potential pending microtasks; query the repo to confirm no tick.
      await Promise.resolve();
      expect(repo.findActiveCLIntents).not.toHaveBeenCalled();
      monitor.onModuleDestroy();
    });

    it('does not start the timer when READ_ONLY=true', async () => {
      process.env.READ_ONLY = 'true';
      const { monitor, repo } = buildMonitor();
      await monitor.onApplicationBootstrap();
      expect(repo.findActiveCLIntents).not.toHaveBeenCalled();
      monitor.onModuleDestroy();
    });

    it('does not start the timer when PROFILE=mainnet', async () => {
      process.env.PROFILE = 'mainnet';
      const { monitor, repo } = buildMonitor();
      await monitor.onApplicationBootstrap();
      expect(repo.findActiveCLIntents).not.toHaveBeenCalled();
      monitor.onModuleDestroy();
    });
  });

  describe('tick dispatch', () => {
    it('PRICE_BELOW + BEST_ASK satisfied → fires once for that intent', async () => {
      const { monitor, fire } = buildMonitor({
        intents: [buildIntentRow()],
        // bestAsk = 290000 ≤ trigger 300000 → fires.
        topOfBook: { asks: [{ priceTicks: '290000' }] },
      });
      await monitor.tick();
      expect(fire.fire).toHaveBeenCalledTimes(1);
    });

    it('trigger NOT satisfied → does not fire', async () => {
      const { monitor, fire } = buildMonitor({
        intents: [buildIntentRow()],
        // bestAsk = 350000 > 300000 → does not fire (PRICE_BELOW).
        topOfBook: { asks: [{ priceTicks: '350000' }] },
      });
      await monitor.tick();
      expect(fire.fire).not.toHaveBeenCalled();
    });

    it('one intent throws → other intents in the same tick still get dispatched', async () => {
      const fireImpl = jest
        .fn()
        .mockImplementationOnce(() => Promise.reject(new Error('boom')))
        .mockResolvedValue(undefined);
      const { monitor } = buildMonitor({
        intents: [
          buildIntentRow({ id: 'first' }),
          buildIntentRow({ id: 'second' }),
        ],
        topOfBook: { asks: [{ priceTicks: '290000' }] },
        fireImpl,
      });
      await monitor.tick();
      expect(fireImpl).toHaveBeenCalledTimes(2);
      expect((fireImpl.mock.calls[0][0] as { id: string }).id).toBe('first');
      expect((fireImpl.mock.calls[1][0] as { id: string }).id).toBe('second');
    });

    it('empty book on the relevant side → skips silently', async () => {
      const { monitor, fire } = buildMonitor({
        intents: [buildIntentRow()],
        topOfBook: {}, // no bids, no asks
      });
      await monitor.tick();
      expect(fire.fire).not.toHaveBeenCalled();
    });
  });

  describe('CMR branch (Phase 4)', () => {
    it('SEA_CMR_PREPARE_ENABLED unset → CMR finders are not even called', async () => {
      delete process.env.SEA_CMR_PREPARE_ENABLED;
      const { monitor, repo } = buildMonitor({
        cmrActive: [buildCmrActiveRow()],
        cmrReady: [buildCmrReadyRow()],
      });
      await monitor.tick();
      expect(repo.findActiveCMRIntents).not.toHaveBeenCalled();
      expect(repo.findReadyCMRIntents).not.toHaveBeenCalled();
    });

    it('SEA_MONITOR_ENABLED=0 forces CMR off even if SEA_CMR_PREPARE_ENABLED=1', async () => {
      delete process.env.SEA_MONITOR_ENABLED;
      process.env.SEA_CMR_PREPARE_ENABLED = '1';
      const { monitor, repo } = buildMonitor({
        cmrActive: [buildCmrActiveRow()],
      });
      await monitor.tick();
      expect(repo.findActiveCMRIntents).not.toHaveBeenCalled();
    });

    it('both gates on → tick fans out ACTIVE CMR intents to CmrPrepareService.evaluateAndPrepare', async () => {
      process.env.SEA_CMR_PREPARE_ENABLED = '1';
      const { monitor, cmr } = buildMonitor({
        cmrActive: [
          buildCmrActiveRow({ id: 'a1' }),
          buildCmrActiveRow({ id: 'a2' }),
        ],
      });
      await monitor.tick();
      expect(cmr.evaluateAndPrepare).toHaveBeenCalledTimes(2);
      expect(
        (cmr.evaluateAndPrepare.mock.calls[0][0] as { id: string }).id,
      ).toBe('a1');
      expect(
        (cmr.evaluateAndPrepare.mock.calls[1][0] as { id: string }).id,
      ).toBe('a2');
    });

    it('one CMR intent throws in prepare → other intents in the same tick still get evaluated', async () => {
      process.env.SEA_CMR_PREPARE_ENABLED = '1';
      const cmrPrepareImpl = jest
        .fn()
        .mockImplementationOnce(() => Promise.reject(new Error('boom')))
        .mockResolvedValue(undefined);
      const { monitor } = buildMonitor({
        cmrActive: [
          buildCmrActiveRow({ id: 'a1' }),
          buildCmrActiveRow({ id: 'a2' }),
        ],
        cmrPrepareImpl,
      });
      await monitor.tick();
      expect(cmrPrepareImpl).toHaveBeenCalledTimes(2);
    });

    it('READY past TTL within expiresAt → rearmFromReady + PROGRESS event', async () => {
      process.env.SEA_CMR_PREPARE_ENABLED = '1';
      const { monitor, repo, events } = buildMonitor({
        cmrReady: [
          buildCmrReadyRow({
            id: 'r1',
            preparedQuote: { ttlSec: 5 },
            preparedQuoteAt: new Date(Date.now() - 60_000),
          }),
        ],
      });
      await monitor.tick();
      expect(repo.rearmFromReady).toHaveBeenCalledTimes(1);
      expect(repo.markExpiredFromReady).not.toHaveBeenCalled();
      expect(events.append).toHaveBeenCalledWith(
        'r1',
        IntentEventType.PROGRESS,
        expect.objectContaining({
          from: 'READY',
          to: 'ACTIVE',
          reason: 'ready_ttl_expired',
        }),
      );
    });

    it('READY past intent.expiresAt → markExpiredFromReady + EXPIRED event (no re-arm)', async () => {
      process.env.SEA_CMR_PREPARE_ENABLED = '1';
      const { monitor, repo, events } = buildMonitor({
        cmrReady: [
          buildCmrReadyRow({
            id: 'r2',
            preparedQuote: { ttlSec: 60 },
            preparedQuoteAt: new Date(Date.now() - 1_000),
            expiresAt: new Date(Date.now() - 500),
          }),
        ],
      });
      await monitor.tick();
      expect(repo.markExpiredFromReady).toHaveBeenCalledTimes(1);
      expect(repo.rearmFromReady).not.toHaveBeenCalled();
      expect(events.append).toHaveBeenCalledWith(
        'r2',
        IntentEventType.EXPIRED,
        expect.objectContaining({ from: 'READY', reason: 'past_expiresAt' }),
      );
    });

    it('READY still within TTL → no-op (waiting for user to confirm)', async () => {
      process.env.SEA_CMR_PREPARE_ENABLED = '1';
      const { monitor, repo, events } = buildMonitor({
        cmrReady: [
          buildCmrReadyRow({
            id: 'r3',
            preparedQuote: { ttlSec: 60 },
            preparedQuoteAt: new Date(Date.now() - 1_000),
          }),
        ],
      });
      await monitor.tick();
      expect(repo.rearmFromReady).not.toHaveBeenCalled();
      expect(repo.markExpiredFromReady).not.toHaveBeenCalled();
      expect(events.append).not.toHaveBeenCalled();
    });

    // Phase 4.x-b: walletLock guard.
    it('walletLock active blocks READY → ACTIVE re-arm even when TTL has expired (Blocker 1)', async () => {
      process.env.SEA_CMR_PREPARE_ENABLED = '1';
      const { monitor, repo, events } = buildMonitor({
        cmrReady: [
          buildCmrReadyRow({
            id: 'r_locked',
            preparedQuote: { ttlSec: 60 },
            preparedQuoteAt: new Date(Date.now() - 5 * 60 * 1000),
            walletLockUntilAt: new Date(Date.now() + 60_000),
          }),
        ],
      });
      await monitor.tick();
      expect(repo.rearmFromReady).not.toHaveBeenCalled();
      expect(repo.markExpiredFromReady).not.toHaveBeenCalled();
      expect(events.append).not.toHaveBeenCalled();
    });

    it('walletLock does NOT shield from hard expiry — READY → EXPIRED still fires (Blocker 1)', async () => {
      process.env.SEA_CMR_PREPARE_ENABLED = '1';
      const { monitor, repo } = buildMonitor({
        cmrReady: [
          buildCmrReadyRow({
            id: 'r_hard',
            preparedQuote: { ttlSec: 60 },
            preparedQuoteAt: new Date(Date.now() - 5_000),
            walletLockUntilAt: new Date(Date.now() + 60_000),
            expiresAt: new Date(Date.now() - 1_000),
          }),
        ],
      });
      await monitor.tick();
      expect(repo.markExpiredFromReady).toHaveBeenCalledTimes(1);
      expect(repo.rearmFromReady).not.toHaveBeenCalled();
    });

    it('walletLock expired → re-arm proceeds normally when TTL has also passed', async () => {
      process.env.SEA_CMR_PREPARE_ENABLED = '1';
      const { monitor, repo } = buildMonitor({
        cmrReady: [
          buildCmrReadyRow({
            id: 'r_unlock',
            preparedQuote: { ttlSec: 60 },
            preparedQuoteAt: new Date(Date.now() - 5 * 60 * 1000),
            walletLockUntilAt: new Date(Date.now() - 1_000),
          }),
        ],
      });
      await monitor.tick();
      expect(repo.rearmFromReady).toHaveBeenCalledTimes(1);
    });
  });
});
