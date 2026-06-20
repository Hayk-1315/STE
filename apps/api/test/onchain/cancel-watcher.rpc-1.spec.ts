// apps/api/test/onchain/cancel-watcher.rpc-1.spec.ts
//
// Phase RPC-1 behavior for CancelWatcher: independent enable gate, transient
// cooldown/backoff (no cursor advance, same-block retry), preserved non-transient
// block_fetch_failed handling, and boot self-heal. No live RPC.
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CancelWatcherService } from '../../src/onchain/cancel-watcher.service';
import type { ZeroExAddressesService } from '../../src/zeroex/addresses.service';
import type { ZeroExSigningService } from '../../src/zeroex/signing.service';
import type { OrderBookService } from '../../src/matching/orderbook.service';
import type { PersistenceRepository } from '../../src/matching/persistence.repository';
import type { MetricsService } from '../../src/observability/metrics.service';
import type { CancelPairFloorRepository } from '../../src/onchain/cancel-pair-floor.repository';

const EP = '0x1234567890123456789012345678901234567890';

const RPC1_KEYS = [
  'DEV_CANCEL_WATCHER',
  'DEV_ONCHAIN_WATCHER',
  'CANCEL_WATCHER_MAX_BLOCKS_PER_TICK',
  'CANCEL_WATCHER_INTERVAL_MS',
  'WATCHER_RPC_BACKOFF_BASE_MS',
  'WATCHER_RPC_BACKOFF_MAX_MS',
] as const;

type ProviderStub = { getBlockNumber: jest.Mock; send: jest.Mock };
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

  const svc = new CancelWatcherService(
    addr as unknown as ZeroExAddressesService,
    stub as unknown as ZeroExSigningService,
    stub as unknown as OrderBookService,
    stub as unknown as PersistenceRepository,
    stub as unknown as MetricsService,
    stub as unknown as CancelPairFloorRepository,
    { rpcUrl: 'http://placeholder' } as unknown as ConstructorParameters<
      typeof CancelWatcherService
    >[6],
  );

  const provider: ProviderStub = { getBlockNumber: jest.fn(), send: jest.fn() };
  const log: LogStub = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };
  (svc as unknown as { provider: ProviderStub }).provider = provider;
  (svc as unknown as { log: LogStub }).log = log;
  (svc as unknown as { cursorFile: string }).cursorFile = join(
    tmpdir(),
    `ste-cancel-cursor-${Math.random().toString(36).slice(2)}.json`,
  );

  return { svc, provider, log };
}

const setLastScanned = (svc: CancelWatcherService, n: number) =>
  ((svc as unknown as { lastScanned: number }).lastScanned = n);
const getLastScanned = (svc: CancelWatcherService) =>
  (svc as unknown as { lastScanned: number }).lastScanned;
const runTick = (svc: CancelWatcherService) =>
  (svc as unknown as { tick: () => Promise<void> }).tick();
const setCooldownElapsed = (svc: CancelWatcherService) =>
  ((svc as unknown as { cooldownUntil: number }).cooldownUntil = 0);

afterEach(() => {
  for (const k of RPC1_KEYS) delete process.env[k];
  jest.clearAllMocks();
});

describe('CancelWatcher — enable gates (backward compatible)', () => {
  const enabledOf = (svc: CancelWatcherService) =>
    (svc as unknown as { enabled: boolean }).enabled;

  it('DEV_ONCHAIN_WATCHER=1 alone enables CancelWatcher (legacy default)', () => {
    const { svc } = buildWatcher({ DEV_ONCHAIN_WATCHER: '1' });
    expect(enabledOf(svc)).toBe(true);
  });

  it('DEV_CANCEL_WATCHER=0 overrides the legacy gate and disables CancelWatcher', () => {
    const { svc } = buildWatcher({
      DEV_CANCEL_WATCHER: '0',
      DEV_ONCHAIN_WATCHER: '1',
    });
    expect(enabledOf(svc)).toBe(false);
  });

  it('DEV_CANCEL_WATCHER=1 enables CancelWatcher independently of the legacy gate', () => {
    const { svc } = buildWatcher({ DEV_CANCEL_WATCHER: '1' });
    expect(enabledOf(svc)).toBe(true);
  });
});

describe('CancelWatcher — transient RPC cooldown / backoff', () => {
  it('a transient getBlockNumber error does not advance the cursor and enters cooldown', async () => {
    const { svc, provider, log } = buildWatcher();
    setLastScanned(svc, 9);
    provider.getBlockNumber.mockRejectedValue(rateLimitError());

    await runTick(svc);

    expect(getLastScanned(svc)).toBe(9);
    expect(provider.send).not.toHaveBeenCalled();
    expect(log.warn).toHaveBeenCalledWith(
      expect.stringContaining('rpc_degraded'),
    );

    await runTick(svc); // cooldown gate → no RPC call
    expect(provider.getBlockNumber).toHaveBeenCalledTimes(1);
  });

  it('a transient block-fetch error retries the SAME block after cooldown', async () => {
    const { svc, provider } = buildWatcher();
    setLastScanned(svc, 9);
    provider.getBlockNumber.mockResolvedValue(10);
    provider.send
      .mockRejectedValueOnce(rateLimitError())
      .mockResolvedValueOnce(emptyBlock());

    await runTick(svc);
    expect(getLastScanned(svc)).toBe(9);
    expect(provider.send.mock.calls[0][1][0]).toBe('0xa');

    setCooldownElapsed(svc);
    await runTick(svc);
    expect(getLastScanned(svc)).toBe(10);
    expect(provider.send.mock.calls[1][1][0]).toBe('0xa');
  });

  it('a NON-transient block-fetch error preserves block_fetch_failed (no cooldown, no advance)', async () => {
    const { svc, provider, log } = buildWatcher();
    setLastScanned(svc, 9);
    provider.getBlockNumber.mockResolvedValue(10);
    provider.send.mockRejectedValue(
      Object.assign(new Error('boom'), { code: 'BAD_DATA' }),
    );

    await runTick(svc);

    expect(getLastScanned(svc)).toBe(9);
    expect(log.warn).toHaveBeenCalledWith(
      expect.stringContaining('block_fetch_failed block=10'),
    );
    // Not a cooldown path: the cursor stays put and the next tick retries
    // without an artificial pause.
    expect((svc as unknown as { cooldownUntil: number }).cooldownUntil).toBe(0);
  });
});

describe('CancelWatcher — boot self-heal', () => {
  it('transient boot failure starts the timer in cooldown and defers cursor init', async () => {
    const { svc, provider, log } = buildWatcher({ DEV_CANCEL_WATCHER: '1' });
    provider.getBlockNumber.mockRejectedValueOnce(rateLimitError());

    await svc.onModuleInit();

    expect(log.warn).toHaveBeenCalledWith(
      expect.stringContaining('boot_degraded'),
    );
    expect(
      (svc as unknown as { needsCursorInit: boolean }).needsCursorInit,
    ).toBe(true);
    expect((svc as unknown as { timer?: unknown }).timer).toBeDefined();
    expect(getLastScanned(svc)).toBe(0);

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
    const { svc, provider, log } = buildWatcher({ DEV_CANCEL_WATCHER: '1' });
    provider.getBlockNumber.mockRejectedValueOnce(
      Object.assign(new Error('bad rpc url'), { code: 'INVALID_ARGUMENT' }),
    );

    await svc.onModuleInit();

    expect(log.error).toHaveBeenCalledWith(
      expect.stringContaining('boot_failed'),
    );
    expect((svc as unknown as { timer?: unknown }).timer).toBeUndefined();
  });
});
