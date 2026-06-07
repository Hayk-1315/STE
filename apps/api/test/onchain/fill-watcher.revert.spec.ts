// apps/api/test/onchain/fill-watcher.revert.spec.ts
//
// Phase 4.x-c Option A — global revert-ordering safety fix.
//
// All four cases instantiate FillWatcherService with mocked dependencies,
// override the internal JsonRpcProvider with a stub, feed a synthetic
// block whose only candidate has the real fillLimitOrder selector in its
// calldata, and stub `iface.decodeFunctionData` to skip ABI encoding.
// We then assert the call shape on addTrade / applyExternalFill / SEA
// reconciler methods.
import { FillWatcherService } from '../../src/onchain/fill-watcher.service';
import type { ZeroExAddressesService } from '../../src/zeroex/addresses.service';
import type { ZeroExSigningService } from '../../src/zeroex/signing.service';
import type { OrderBookService } from '../../src/matching/orderbook.service';
import type { PersistenceRepository } from '../../src/matching/persistence.repository';
import type { MetricsService } from '../../src/observability/metrics.service';
import type { IntentRepository } from '../../src/sea/intent.repository';
import type { IntentEventRepository } from '../../src/sea/intent-event.repository';
import { IntentEventType } from '@prisma/client';

const EP = '0x1234567890123456789012345678901234567890';
const MARKET_ID = 'm1';
const BASE_ADDR = '0x1111111111111111111111111111111111111111';
const QUOTE_ADDR = '0x2222222222222222222222222222222222222222';
const TAKER = '0xAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa';
const TX = '0x' + 'f'.repeat(64);
const ORDER_HASH = '0x' + 'a'.repeat(64);
const INTENT_ID = 'cmr_test';

function buildWatcher(opts: {
  receiptStatus?: 0 | 1 | null;
  receiptThrows?: boolean;
  intentMatch?: { id: string } | null;
}) {
  const order = {
    makerToken: BASE_ADDR as `0x${string}`,
    takerToken: QUOTE_ADDR as `0x${string}`,
    makerAmount: 1_000_000_000_000_000_000n,
    takerAmount: 300_000_000_000n,
    takerTokenFeeAmount: 0n,
    maker: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as `0x${string}`,
    taker: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    sender: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    feeRecipient: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    pool: ('0x' + '0'.repeat(64)) as `0x${string}`,
    expiry: 1_700_000_000n,
    salt: 42n,
  };
  const takerFill = 1_000_000_000_000_000_000n;

  const addr = {
    resolve: jest.fn().mockReturnValue({ exchangeProxy: EP }),
  };
  const signing = {
    getOrderHash: jest.fn().mockReturnValue(ORDER_HASH),
  };
  const ob = {
    applyExternalFill: jest
      .fn()
      .mockResolvedValue({ status: 'filled' as const }),
  };
  const repo = {
    addTrade: jest.fn().mockResolvedValue(undefined),
    listMarketsBasic: jest.fn().mockResolvedValue([
      {
        id: MARKET_ID,
        symbol: 'WETH-USDC',
        baseAddress: BASE_ADDR,
        quoteAddress: QUOTE_ADDR,
      },
    ]),
    getTradingContext: jest.fn().mockResolvedValue({
      id: MARKET_ID,
      symbol: 'WETH-USDC',
      baseDecimals: 18,
      priceTickQ: 1n,
      baseAddress: BASE_ADDR,
      quoteAddress: QUOTE_ADDR,
      minSizeB: 1n,
      minNotionalQ: 1n,
    }),
  };
  const metrics = { fillsTotal: { inc: jest.fn() } };
  const intentRepo = {
    findExecutingByTxHashForOwner: jest
      .fn()
      .mockResolvedValue(opts.intentMatch ?? null),
    markExecuted: jest.fn().mockResolvedValue(true),
    markFailedFromExecuting: jest.fn().mockResolvedValue(true),
  };
  const intentEvents = { append: jest.fn().mockResolvedValue(undefined) };

  const block = {
    transactions: [
      {
        to: EP,
        hash: TX,
        from: TAKER.toLowerCase(),
        input: '0xPLACEHOLDER', // overwritten below once selector is known
      },
    ],
  };
  const provider = {
    getBlockNumber: jest.fn().mockResolvedValue(10),
    send: jest.fn().mockResolvedValue(block),
    getTransactionReceipt: opts.receiptThrows
      ? jest.fn().mockRejectedValue(new Error('rpc down'))
      : jest
          .fn()
          .mockResolvedValue(
            opts.receiptStatus === undefined
              ? { status: 1 }
              : opts.receiptStatus === null
                ? null
                : { status: opts.receiptStatus },
          ),
  };

  process.env.CHAIN_ID = '84532';
  process.env.DEV_ONCHAIN_WATCHER = '0';

  const svc = new FillWatcherService(
    addr as unknown as ZeroExAddressesService,
    signing as unknown as ZeroExSigningService,
    ob as unknown as OrderBookService,
    repo as unknown as PersistenceRepository,
    metrics as unknown as MetricsService,
    { rpcUrl: 'http://placeholder' } as unknown as ConstructorParameters<
      typeof FillWatcherService
    >[5],
    intentRepo as unknown as IntentRepository,
    intentEvents as unknown as IntentEventRepository,
  );

  // Replace the constructed JsonRpcProvider with our stub so the watcher
  // never hits real RPC.
  (svc as unknown as { provider: typeof provider }).provider = provider;

  // Stitch the candidate calldata to start with the REAL fillSelector
  // computed by the constructor (so the watcher's filter passes).
  const fillSelector = (svc as unknown as { fillSelector: string })
    .fillSelector;
  block.transactions[0].input = fillSelector + 'aabbccdd';

  // Bypass ABI decode — stub iface to return [order, sig, takerFill].
  (svc as unknown as { iface: { decodeFunctionData: jest.Mock } }).iface = {
    decodeFunctionData: jest.fn().mockReturnValue([order, {}, takerFill]),
  };

  // Walk exactly one block (10) when tick() runs.
  (svc as unknown as { lastScanned: number }).lastScanned = 9;

  return {
    svc,
    addr,
    signing,
    ob,
    repo,
    metrics,
    intentRepo,
    intentEvents,
    provider,
  };
}

async function runTick(svc: FillWatcherService): Promise<void> {
  // `tick` is private; call via cast for test purposes only.
  await (svc as unknown as { tick: () => Promise<void> }).tick();
}

describe('FillWatcher revert ordering (Option A — global safety)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('FW-R1: receipt.status === 0 + matching CMR intent → no addTrade, no applyExternalFill, marks FAILED(tx_reverted)', async () => {
    const { svc, repo, ob, intentRepo, intentEvents, provider } = buildWatcher({
      receiptStatus: 0,
      intentMatch: { id: INTENT_ID },
    });

    await runTick(svc);

    expect(provider.getTransactionReceipt).toHaveBeenCalledWith(TX);
    // Maker-side mutation MUST be skipped.
    expect(repo.addTrade).not.toHaveBeenCalled();
    expect(ob.applyExternalFill).not.toHaveBeenCalled();
    // SEA reconciler: matching EXECUTING intent → FAILED('tx_reverted').
    expect(intentRepo.findExecutingByTxHashForOwner).toHaveBeenCalledWith({
      txHash: TX.toLowerCase(),
      marketId: MARKET_ID,
      owner: TAKER.toLowerCase(),
    });
    expect(intentRepo.markFailedFromExecuting).toHaveBeenCalledWith(
      INTENT_ID,
      TX.toLowerCase(),
      'tx_reverted',
    );
    expect(intentEvents.append).toHaveBeenCalledWith(
      INTENT_ID,
      IntentEventType.FAILED,
      expect.objectContaining({
        reason: 'tx_reverted',
        txHash: TX.toLowerCase(),
      }),
    );
    expect(intentRepo.markExecuted).not.toHaveBeenCalled();
  });

  it('FW-R2: receipt.status === 0 + NO matching CMR intent (Option A legacy coverage) → no addTrade, no applyExternalFill, no SEA mutation', async () => {
    const { svc, repo, ob, intentRepo, intentEvents } = buildWatcher({
      receiptStatus: 0,
      intentMatch: null,
    });

    await runTick(svc);

    // The global safety property: even legacy non-CMR reverts must not
    // corrupt maker-side state.
    expect(repo.addTrade).not.toHaveBeenCalled();
    expect(ob.applyExternalFill).not.toHaveBeenCalled();
    expect(intentRepo.findExecutingByTxHashForOwner).toHaveBeenCalledTimes(1);
    expect(intentRepo.markFailedFromExecuting).not.toHaveBeenCalled();
    expect(intentRepo.markExecuted).not.toHaveBeenCalled();
    expect(intentEvents.append).not.toHaveBeenCalled();
  });

  it('FW-R3: receipt.status === 1 + matching CMR intent → addTrade + applyExternalFill + markExecuted', async () => {
    const { svc, repo, ob, intentRepo, intentEvents } = buildWatcher({
      receiptStatus: 1,
      intentMatch: { id: INTENT_ID },
    });

    await runTick(svc);

    expect(repo.addTrade).toHaveBeenCalledTimes(1);
    expect(ob.applyExternalFill).toHaveBeenCalledTimes(1);
    expect(intentRepo.markExecuted).toHaveBeenCalledWith(
      INTENT_ID,
      TX.toLowerCase(),
    );
    expect(intentEvents.append).toHaveBeenCalledWith(
      INTENT_ID,
      IntentEventType.EXECUTED,
      expect.objectContaining({ txHash: TX.toLowerCase() }),
    );
    expect(intentRepo.markFailedFromExecuting).not.toHaveBeenCalled();
  });

  it('FW-R4: receipt fetch throws (RPC error) → fall-through to legacy path (fail-open)', async () => {
    const { svc, repo, ob, intentRepo } = buildWatcher({
      receiptThrows: true,
      intentMatch: null,
    });

    await runTick(svc);

    // Fail-open: when we cannot prove revert, the watcher behaves as it
    // did before Phase 4.x. addTrade + applyExternalFill still run.
    expect(repo.addTrade).toHaveBeenCalledTimes(1);
    expect(ob.applyExternalFill).toHaveBeenCalledTimes(1);
    // No CMR match in this case, so the success-path SEA reconciler
    // looks up the intent and finds nothing.
    expect(intentRepo.findExecutingByTxHashForOwner).toHaveBeenCalledTimes(1);
    expect(intentRepo.markExecuted).not.toHaveBeenCalled();
    expect(intentRepo.markFailedFromExecuting).not.toHaveBeenCalled();
  });
});
