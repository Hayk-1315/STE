// apps/api/test/matching/orders-placement.service.spec.ts
// DB-free smoke test for the extracted OrdersPlacementService.
// Verifies that the throw codes still match what /orders and SEA fire
// expect (post_only_would_cross, market_not_found_for_tokens,
// price_tick_violation, maker_insufficient_free_balance).
import { BadRequestException } from '@nestjs/common';
import { OrdersPlacementService } from '../../src/matching/orders-placement.service';
import type { OrderBookService } from '../../src/matching/orderbook.service';
import type { PersistenceRepository } from '../../src/matching/persistence.repository';
import type { ShadowChecksService } from '../../src/observability/shadow-checks.service';
import type { MetricsService } from '../../src/observability/metrics.service';
import {
  SignatureType,
  type Bytes32,
  type LimitOrder,
  type Signature,
} from '../../src/zeroex/limit-order.types';

const OWNER = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const BASE_ADDR = '0x1111111111111111111111111111111111111111';
const QUOTE_ADDR = '0x2222222222222222222222222222222222222222';
const ZERO_ADDR = '0x0000000000000000000000000000000000000000' as const;
const ZERO32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000' as const;

const baseDecimals = 18;
const priceTickQ = 10_000n;
const minSizeB = 100_000_000_000_000n;
const minNotionalQ = 1_000_000n;
const limitPriceTicks = 295_000n;
const sizeBase = 1_000_000_000_000_000_000n;

const expectedMakerAmount =
  (limitPriceTicks * priceTickQ * sizeBase) /
  (() => {
    let r = 1n;
    for (let i = 0; i < baseDecimals; i++) r *= 10n;
    return r;
  })();

function buildBuyOrder(overrides: Partial<LimitOrder> = {}): LimitOrder {
  return {
    makerToken: QUOTE_ADDR,
    takerToken: BASE_ADDR,
    makerAmount: expectedMakerAmount,
    takerAmount: sizeBase,
    takerTokenFeeAmount: 0n,
    maker: OWNER,
    taker: ZERO_ADDR,
    sender: ZERO_ADDR,
    feeRecipient: ZERO_ADDR,
    pool: ZERO32,
    expiry: Math.floor(Date.now() / 1000) + 3600,
    salt: 12345n,
    ...overrides,
  };
}

const dummySig: Signature = {
  signatureType: SignatureType.EIP712,
  v: 27,
  r: ('0x' + 'a'.repeat(64)) as Bytes32,
  s: ('0x' + 'b'.repeat(64)) as Bytes32,
};

type RepoMock = {
  listMarketsBasic: jest.Mock;
  getTradingContext: jest.Mock;
  sumOpenBaseByMakerSymbol: jest.Mock;
  attachRawToOrder: jest.Mock;
  cancelOrder: jest.Mock;
};
type ObMock = {
  snapshot: jest.Mock;
  place: jest.Mock;
  attachRaw: jest.Mock;
  cancel: jest.Mock;
};

function buildService(opts?: {
  topOfBook?: {
    bids?: Array<{ priceTicks: string }>;
    asks?: Array<{ priceTicks: string }>;
  };
  market?: {
    id: string;
    symbol: string;
    baseAddress: string;
    quoteAddress: string;
  } | null;
  makerBalance?: bigint;
  shadowOk?: boolean;
}) {
  const market =
    opts?.market === undefined
      ? {
          id: 'm1',
          symbol: 'WETH-USDC',
          baseAddress: BASE_ADDR,
          quoteAddress: QUOTE_ADDR,
        }
      : opts.market;

  const repo: RepoMock = {
    listMarketsBasic: jest
      .fn()
      .mockResolvedValue(market === null ? [] : [market]),
    getTradingContext: jest.fn().mockResolvedValue({
      id: 'm1',
      symbol: 'WETH-USDC',
      baseDecimals,
      quoteDecimals: 6,
      minNotionalQ,
      minSizeB,
      priceTickQ,
      baseAddress: BASE_ADDR,
      quoteAddress: QUOTE_ADDR,
    }),
    sumOpenBaseByMakerSymbol: jest.fn().mockResolvedValue(0n),
    attachRawToOrder: jest.fn().mockResolvedValue(undefined),
    cancelOrder: jest.fn().mockResolvedValue(undefined),
  };

  const ob: ObMock = {
    snapshot: jest.fn().mockReturnValue({
      bids: opts?.topOfBook?.bids ?? [],
      asks: opts?.topOfBook?.asks ?? [],
    }),
    place: jest.fn().mockResolvedValue({ status: 'placed' }),
    // `attachRaw` returns `true` on success; the placement service now
    // treats `false` as a raw-persistence failure that triggers rollback.
    attachRaw: jest.fn().mockResolvedValue(true),
    cancel: jest.fn().mockResolvedValue({ status: 'cancelled' }),
  };

  const shadowChecks = {
    checkMakerFunds: jest
      .fn()
      .mockResolvedValue({ ok: opts?.shadowOk ?? true, warnings: [] }),
    isBlocking: false,
  };

  const metrics = {
    ordersPlaced: { inc: jest.fn() },
  };

  // RPC guard is skipped when RPC_URL is unset; the spec relies on this so it
  // doesn't try to call a real provider. (See OrdersPlacementService line ~155.)
  delete process.env.RPC_URL;
  delete process.env.RPC_URL_READONLY;
  // Taker-fee policy guard must stay dormant for these DB-free placement tests.
  // @prisma/client (imported transitively) auto-loads apps/api/.env, which sets
  // FEE_RECIPIENT / TAKER_FEE_BPS; clear them so the guard does not reject the
  // ZERO-recipient test orders. Same ambient-env neutralization as RPC_URL above.
  delete process.env.FEE_RECIPIENT;
  delete process.env.TAKER_FEE_RECIPIENT;
  delete process.env.TAKER_FEE_BPS;

  const svc = new OrdersPlacementService(
    ob as unknown as OrderBookService,
    repo as unknown as PersistenceRepository,
    shadowChecks as unknown as ShadowChecksService,
    metrics as unknown as MetricsService,
  );
  return { svc, ob, repo, shadowChecks, metrics };
}

describe('OrdersPlacementService.place', () => {
  it('places successfully with empty book', async () => {
    const { svc, ob } = buildService();
    const result = await svc.place({
      order: buildBuyOrder(),
      signature: dummySig,
      orderHash: '0x' + 'c'.repeat(64),
      makerExpected: OWNER,
      postOnly: true,
    });
    expect(result.ok).toBe(true);
    expect(ob.place).toHaveBeenCalledTimes(1);
    expect(ob.attachRaw).toHaveBeenCalledTimes(1);
  });

  it('throws post_only_would_cross when BUY limit ≥ bestAsk and postOnly is true', async () => {
    const { svc, ob } = buildService({
      topOfBook: {
        // bestAsk = 290000 (lower than our limit 295000) → BUY at 295000 crosses.
        asks: [{ priceTicks: '290000' }],
      },
    });
    await expect(
      svc.place({
        order: buildBuyOrder(),
        signature: dummySig,
        orderHash: '0x' + 'c'.repeat(64),
        makerExpected: OWNER,
        postOnly: true,
      }),
    ).rejects.toMatchObject({
      message: 'post_only_would_cross',
    });
    expect(ob.place).not.toHaveBeenCalled();
  });

  it('throws market_not_found_for_tokens when no matching market', async () => {
    const { svc } = buildService({ market: null });
    await expect(
      svc.place({
        order: buildBuyOrder(),
        signature: dummySig,
        orderHash: '0x' + 'c'.repeat(64),
        makerExpected: OWNER,
        postOnly: true,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws price_tick_violation when amounts do not divide evenly by priceTickQ', async () => {
    const { svc } = buildService();
    // Tweak makerAmount slightly so num % den !== 0 in the BUY derivation.
    const order = buildBuyOrder({ makerAmount: expectedMakerAmount + 1n });
    await expect(
      svc.place({
        order,
        signature: dummySig,
        orderHash: '0x' + 'c'.repeat(64),
        makerExpected: OWNER,
        postOnly: true,
      }),
    ).rejects.toMatchObject({ message: 'price_tick_violation' });
  });

  it('does NOT throw post_only_would_cross when postOnly is false even if it would cross', async () => {
    const { svc, ob } = buildService({
      topOfBook: { asks: [{ priceTicks: '290000' }] },
    });
    const result = await svc.place({
      order: buildBuyOrder(),
      signature: dummySig,
      orderHash: '0x' + 'c'.repeat(64),
      makerExpected: OWNER,
      postOnly: false,
    });
    expect(result.ok).toBe(true);
    expect(ob.place).toHaveBeenCalledTimes(1);
  });

  // --- Phase 5 P0 fix: load-bearing raw persistence ---

  it('forwards tuple signature to attachRawToOrder (no local hex conversion)', async () => {
    const { svc, repo } = buildService();
    await svc.place({
      order: buildBuyOrder(),
      signature: dummySig,
      orderHash: '0x' + 'c'.repeat(64),
      makerExpected: OWNER,
      postOnly: true,
    });
    expect(repo.attachRawToOrder).toHaveBeenCalledTimes(1);
    const arg = repo.attachRawToOrder.mock.calls[0][0] as {
      signature: unknown;
    };
    // Placement passes the tuple through; the repo handles 66-byte packing.
    expect(arg.signature).toBe(dummySig);
  });

  it('rejects with invalid_signature_for_persistence BEFORE any LOB write', async () => {
    const { svc, ob, repo } = buildService();
    await expect(
      svc.place({
        order: buildBuyOrder(),
        signature: 'not-a-signature' as unknown as Signature,
        orderHash: '0x' + 'c'.repeat(64),
        makerExpected: OWNER,
        postOnly: true,
      }),
    ).rejects.toThrow(/invalid_signature_for_persistence/);
    // No mutation must have occurred — no LOB place, no attachRaw, no DB write.
    expect(ob.place).not.toHaveBeenCalled();
    expect(ob.attachRaw).not.toHaveBeenCalled();
    expect(repo.attachRawToOrder).not.toHaveBeenCalled();
  });

  it('rolls back LOB + DB and throws 500 when attachRawToOrder fails after place', async () => {
    const { svc, ob, repo } = buildService();
    repo.attachRawToOrder.mockRejectedValueOnce(
      new Error('prisma write failed'),
    );

    await expect(
      svc.place({
        order: buildBuyOrder(),
        signature: dummySig,
        orderHash: '0x' + 'c'.repeat(64),
        makerExpected: OWNER,
        postOnly: true,
      }),
    ).rejects.toThrow(/raw_persistence_failed/);

    // LOB place did happen (state was visible to takers between place and attach).
    expect(ob.place).toHaveBeenCalledTimes(1);
    // Rollback removes from LOB and marks DB CANCELLED.
    expect(ob.cancel).toHaveBeenCalledTimes(1);
    expect(repo.cancelOrder).toHaveBeenCalledTimes(1);
    expect(ob.cancel.mock.calls[0][1]).toBe('0x' + 'c'.repeat(64));
    expect(repo.cancelOrder.mock.calls[0][1]).toBe('0x' + 'c'.repeat(64));
  });

  it('rolls back LOB + DB and throws 500 when ob.attachRaw throws', async () => {
    const { svc, ob, repo } = buildService();
    ob.attachRaw.mockRejectedValueOnce(
      new Error('transient getTradingContext failure'),
    );

    await expect(
      svc.place({
        order: buildBuyOrder(),
        signature: dummySig,
        orderHash: '0x' + 'c'.repeat(64),
        makerExpected: OWNER,
        postOnly: true,
      }),
    ).rejects.toThrow(/raw_persistence_failed/);

    // ob.place did happen (state was visible to takers).
    expect(ob.place).toHaveBeenCalledTimes(1);
    // repo.attachRawToOrder is never reached when ob.attachRaw fails first.
    expect(repo.attachRawToOrder).not.toHaveBeenCalled();
    // Rollback removes from LOB and marks DB CANCELLED.
    expect(ob.cancel).toHaveBeenCalledTimes(1);
    expect(repo.cancelOrder).toHaveBeenCalledTimes(1);
  });

  it('rolls back LOB + DB and throws 500 when ob.attachRaw returns false (LOB level missing)', async () => {
    const { svc, ob, repo } = buildService();
    ob.attachRaw.mockResolvedValueOnce(false);

    await expect(
      svc.place({
        order: buildBuyOrder(),
        signature: dummySig,
        orderHash: '0x' + 'c'.repeat(64),
        makerExpected: OWNER,
        postOnly: true,
      }),
    ).rejects.toThrow(/raw_persistence_failed/);

    expect(ob.place).toHaveBeenCalledTimes(1);
    // `false` is treated as a raw-persistence failure — repo never touched.
    expect(repo.attachRawToOrder).not.toHaveBeenCalled();
    expect(ob.cancel).toHaveBeenCalledTimes(1);
    expect(repo.cancelOrder).toHaveBeenCalledTimes(1);
  });
});
