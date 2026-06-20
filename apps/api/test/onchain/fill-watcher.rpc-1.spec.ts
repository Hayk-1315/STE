// apps/api/test/onchain/fill-watcher.rpc-1.spec.ts
//
// Phase RPC-1 behavior for FillWatcher: bounded catch-up (maxBlocksPerTick),
// transient-error cooldown/backoff (no cursor advance, same-block retry), boot
// self-heal, and the backward-compatible enable gates. No live RPC — the
// internal JsonRpcProvider is replaced with a stub and the logger is mocked.
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FillWatcherService } from '../../src/onchain/fill-watcher.service';
import type { ZeroExAddressesService } from '../../src/zeroex/addresses.service';
import type { ZeroExSigningService } from '../../src/zeroex/signing.service';
import type { OrderBookService } from '../../src/matching/orderbook.service';
import type { PersistenceRepository } from '../../src/matching/persistence.repository';
import type { MetricsService } from '../../src/observability/metrics.service';
import type { IntentRepository } from '../../src/sea/intent.repository';
import type { IntentEventRepository } from '../../src/sea/intent-event.repository';

const EP = '0x1234567890123456789012345678901234567890';

const RPC1_KEYS = [
  'DEV_FILL_WATCHER',
  'DEV_ONCHAIN_WATCHER',
  'FILL_WATCHER_MAX_BLOCKS_PER_TICK',
  'FILL_WATCHER_INTERVAL_MS',
  'WATCHER_RPC_BACKOFF_BASE_MS',
  'WATCHER_RPC_BACKOFF_MAX_MS',
] as const;

type ProviderStub = {
  getBlockNumber: jest.Mock;
  send: jest.Mock;
  getTransactionReceipt: jest.Mock;
};
type LogStub = {
  log: jest.Mock;
  warn: jest.Mock;
  error: jest.Mock;
  debug: jest.Mock;
};

function rateLimitError(): Error {
  return Object.assign(new Error('429 Too Many Requests'), {
    code: 'SERVER_ERROR',
    info: { responseStatus: '429 Too Many Requests' },
  });
}

function emptyBlock() {
  return { transactions: [] as unknown[] };
}

function buildWatcher(env: Record<string, string> = {}) {
  for (const k of RPC1_KEYS) delete process.env[k];
  for (const [k, v] of Object.entries(env)) process.env[k] = v;

  const addr = { resolve: jest.fn().mockReturnValue({ exchangeProxy: EP }) };
  const stub = {} as Record<string, unknown>;

  const svc = new FillWatcherService(
    addr as unknown as ZeroExAddressesService,
    stub as unknown as ZeroExSigningService,
    stub as unknown as OrderBookService,
    stub as unknown as PersistenceRepository,
    stub as unknown as MetricsService,
    { rpcUrl: 'http://placeholder' } as unknown as ConstructorParameters<
      typeof FillWatcherService
    >[5],
    stub as unknown as IntentRepository,
    stub as unknown as IntentEventRepository,
  );

  const provider: ProviderStub = {
    getBlockNumber: jest.fn(),
    send: jest.fn(),
    getTransactionReceipt: jest.fn(),
  };
  const log: LogStub = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };
  (svc as unknown as { provider: ProviderStub }).provider = provider;
  (svc as unknown as { log: LogStub }).log = log;
  // Isolate cursor I/O from other tests / leftover .cache files.
  (svc as unknown as { cursorFile: string }).cursorFile = join(
    tmpdir(),
    `ste-fill-cursor-${Math.random().toString(36).slice(2)}.json`,
  );

  return { svc, provider, log, addr };
}

function setLastScanned(svc: FillWatcherService, n: number): void {
  (svc as unknown as { lastScanned: number }).lastScanned = n;
}
function getLastScanned(svc: FillWatcherService): number {
  return (svc as unknown as { lastScanned: number }).lastScanned;
}
function runTick(svc: FillWatcherService): Promise<void> {
  return (svc as unknown as { tick: () => Promise<void> }).tick();
}
function setCooldownElapsed(svc: FillWatcherService): void {
  (svc as unknown as { cooldownUntil: number }).cooldownUntil = 0;
}

afterEach(() => {
  for (const k of RPC1_KEYS) delete process.env[k];
  jest.clearAllMocks();
});

describe('FillWatcher — enable gates (backward compatible)', () => {
  const enabledOf = (svc: FillWatcherService) =>
    (svc as unknown as { enabled: boolean }).enabled;

  it('DEV_ONCHAIN_WATCHER=1 alone enables FillWatcher (legacy default)', () => {
    const { svc } = buildWatcher({ DEV_ONCHAIN_WATCHER: '1' });
    expect(enabledOf(svc)).toBe(true);
  });

  it('DEV_FILL_WATCHER=0 overrides the legacy gate and disables FillWatcher', () => {
    const { svc } = buildWatcher({
      DEV_FILL_WATCHER: '0',
      DEV_ONCHAIN_WATCHER: '1',
    });
    expect(enabledOf(svc)).toBe(false);
  });

  it('DEV_FILL_WATCHER=1 enables FillWatcher independently of the legacy gate', () => {
    const { svc } = buildWatcher({ DEV_FILL_WATCHER: '1' });
    expect(enabledOf(svc)).toBe(true);
  });
});

describe('FillWatcher — maxBlocksPerTick bounded catch-up', () => {
  it('processes at most N blocks, persists cursor to target, logs catch_up', async () => {
    const { svc, provider, log } = buildWatcher({
      FILL_WATCHER_MAX_BLOCKS_PER_TICK: '5',
    });
    setLastScanned(svc, 0);
    provider.getBlockNumber.mockResolvedValue(100);
    provider.send.mockResolvedValue(emptyBlock());

    await runTick(svc);

    expect(provider.send).toHaveBeenCalledTimes(5); // blocks 1..5 only
    expect(getLastScanned(svc)).toBe(5);
    expect(log.log).toHaveBeenCalledWith(
      expect.stringContaining('catch_up cursor=5 latest=100 remaining=95'),
    );
  });
});

describe('FillWatcher — transient RPC cooldown / backoff', () => {
  it('a transient getBlockNumber error does not advance the cursor and enters cooldown', async () => {
    const { svc, provider, log } = buildWatcher();
    setLastScanned(svc, 9);
    provider.getBlockNumber.mockRejectedValue(rateLimitError());

    await runTick(svc);

    expect(getLastScanned(svc)).toBe(9); // not advanced
    expect(provider.send).not.toHaveBeenCalled();
    expect(log.warn).toHaveBeenCalledWith(
      expect.stringContaining('rpc_degraded'),
    );

    // While in cooldown, the next tick makes no RPC call (no hammering).
    await runTick(svc);
    expect(provider.getBlockNumber).toHaveBeenCalledTimes(1);
  });

  it('a transient block-fetch error does not advance the cursor; same block is retried after cooldown', async () => {
    const { svc, provider } = buildWatcher();
    setLastScanned(svc, 9);
    provider.getBlockNumber.mockResolvedValue(10);
    provider.send
      .mockRejectedValueOnce(rateLimitError())
      .mockResolvedValueOnce(emptyBlock());

    await runTick(svc);
    expect(getLastScanned(svc)).toBe(9); // not advanced on transient failure
    expect(provider.send).toHaveBeenCalledTimes(1);
    expect(provider.send.mock.calls[0][1][0]).toBe('0xa'); // block 10

    // After cooldown elapses, the SAME block (10 = 0xa) is fetched again.
    setCooldownElapsed(svc);
    await runTick(svc);
    expect(getLastScanned(svc)).toBe(10);
    expect(provider.send).toHaveBeenCalledTimes(2);
    expect(provider.send.mock.calls[1][1][0]).toBe('0xa');
  });

  it('mid-range transient failure keeps the cursor before the failed block; range retried from start (no skip)', async () => {
    const { svc, provider } = buildWatcher({
      FILL_WATCHER_MAX_BLOCKS_PER_TICK: '100',
    });
    setLastScanned(svc, 100);
    provider.getBlockNumber.mockResolvedValue(1000); // target = min(1000, 100+100) = 200
    // Blocks 101..149 succeed; block 150 (0x96) fails transiently.
    provider.send.mockImplementation((...args: unknown[]) => {
      const params = args[1] as [string, boolean];
      return params[0] === '0x96'
        ? Promise.reject(rateLimitError())
        : Promise.resolve(emptyBlock());
    });

    await runTick(svc);

    // Cursor MUST stay at 100 (not 149/150) and a cooldown MUST be set.
    expect(getLastScanned(svc)).toBe(100);
    expect(
      (svc as unknown as { cooldownUntil: number }).cooldownUntil,
    ).toBeGreaterThan(0);
    // Fetched 101..150 this tick (50 calls), failing on the last (block 150 = 0x96).
    expect(provider.send).toHaveBeenCalledTimes(50);
    expect(provider.send.mock.calls[49][1][0]).toBe('0x96');

    // After cooldown, the range is retried FROM 101 (no skip) and completes to 200.
    setCooldownElapsed(svc);
    provider.send.mockReset();
    provider.send.mockResolvedValue(emptyBlock());
    provider.getBlockNumber.mockResolvedValue(1000);
    await runTick(svc);

    expect(provider.send.mock.calls[0][1][0]).toBe('0x65'); // block 101 — retried from start
    expect(getLastScanned(svc)).toBe(200);
  });

  it('resets the backoff after a successful tick (next degradation starts at base)', async () => {
    const { svc, provider, log } = buildWatcher({
      WATCHER_RPC_BACKOFF_BASE_MS: '15000',
      WATCHER_RPC_BACKOFF_MAX_MS: '120000',
    });
    setLastScanned(svc, 9);
    const cooldownMs = () => {
      const calls = log.warn.mock.calls
        .map((c) => String(c[0]))
        .filter((m) => m.includes('rpc_degraded'));
      const m = /cooldown=(\d+)ms/.exec(calls[calls.length - 1] ?? '');
      return m ? Number(m[1]) : -1;
    };

    // 1st transient → base delay.
    provider.getBlockNumber.mockRejectedValueOnce(rateLimitError());
    await runTick(svc);
    expect(cooldownMs()).toBe(15000);

    // Successful tick resets the backoff.
    setCooldownElapsed(svc);
    provider.getBlockNumber.mockResolvedValueOnce(9); // no new blocks
    await runTick(svc);

    // Next transient → base again (would be 30000 if not reset).
    setCooldownElapsed(svc);
    provider.getBlockNumber.mockRejectedValueOnce(rateLimitError());
    await runTick(svc);
    expect(cooldownMs()).toBe(15000);
  });

  it('a non-transient error propagates (surfaced via the timer .catch as before)', async () => {
    const { svc, provider } = buildWatcher();
    setLastScanned(svc, 9);
    provider.getBlockNumber.mockRejectedValue(
      Object.assign(new Error('bad config'), { code: 'INVALID_ARGUMENT' }),
    );
    await expect(runTick(svc)).rejects.toThrow('bad config');
    expect(getLastScanned(svc)).toBe(9);
  });
});

describe('FillWatcher — boot self-heal', () => {
  it('transient boot failure starts the timer in cooldown and defers cursor init', async () => {
    const { svc, provider, log } = buildWatcher({ DEV_FILL_WATCHER: '1' });
    provider.getBlockNumber.mockRejectedValueOnce(rateLimitError());

    await svc.onModuleInit();

    expect(log.warn).toHaveBeenCalledWith(
      expect.stringContaining('boot_degraded'),
    );
    expect(
      (svc as unknown as { needsCursorInit: boolean }).needsCursorInit,
    ).toBe(true);
    expect((svc as unknown as { timer?: unknown }).timer).toBeDefined();
    expect(getLastScanned(svc)).toBe(0); // cursor NOT initialized while degraded

    // First successful tick initializes the cursor (fresh near head) and proceeds.
    provider.getBlockNumber.mockResolvedValue(1000);
    provider.send.mockResolvedValue(emptyBlock());
    setCooldownElapsed(svc);
    await runTick(svc);

    expect(
      (svc as unknown as { needsCursorInit: boolean }).needsCursorInit,
    ).toBe(false);
    expect(log.log).toHaveBeenCalledWith(expect.stringContaining('started'));
    expect(getLastScanned(svc)).toBe(1000);

    svc.onModuleDestroy();
  });

  it('non-transient boot failure preserves the old boot_failed + no-timer behavior', async () => {
    const { svc, provider, log } = buildWatcher({ DEV_FILL_WATCHER: '1' });
    provider.getBlockNumber.mockRejectedValueOnce(
      Object.assign(new Error('bad rpc url'), { code: 'INVALID_ARGUMENT' }),
    );

    await svc.onModuleInit();

    expect(log.error).toHaveBeenCalledWith(
      expect.stringContaining('boot_failed'),
    );
    expect((svc as unknown as { timer?: unknown }).timer).toBeUndefined();
    expect(
      (svc as unknown as { needsCursorInit: boolean }).needsCursorInit,
    ).toBe(false);
  });
});
