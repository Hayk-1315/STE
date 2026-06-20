// apps/api/test/onchain/placement-balance-guard.rpc.spec.ts
//
// Phase RPC-1: the maker balance guard in OrdersPlacementService must degrade to
// a warn-skip on a TRANSIENT RPC error (429 / quota / timeout) instead of 500-ing
// placement, while a NON-transient error (ABI/config) still propagates. `ethers`
// is mocked so the guard's balanceOf can be made to throw deterministically — no
// live RPC. (Lives under test/onchain/ because it exercises the shared RPC-1
// transient classifier on the placement path.)

const mockBalanceOf = jest.fn();
jest.mock('ethers', () => ({
  JsonRpcProvider: jest.fn().mockImplementation(() => ({})),
  Contract: jest.fn().mockImplementation(() => ({
    // Lazy reference so the test can configure mockBalanceOf after import.
    balanceOf: (...args: unknown[]) => mockBalanceOf(...args),
  })),
}));

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
const ZERO32 = ('0x' + '0'.repeat(64)) as const;

const baseDecimals = 18;
const priceTickQ = 10_000n;
const minSizeB = 100_000_000_000_000n;
const minNotionalQ = 1_000_000n;
const limitPriceTicks = 295_000n;
const sizeBase = 1_000_000_000_000_000_000n;
const pow10 = (n: number): bigint => {
  let r = 1n;
  for (let i = 0; i < n; i++) r *= 10n;
  return r;
};
const expectedMakerAmount =
  (limitPriceTicks * priceTickQ * sizeBase) / pow10(baseDecimals);

const dummySig: Signature = {
  signatureType: SignatureType.EIP712,
  v: 27,
  r: ('0x' + 'a'.repeat(64)) as Bytes32,
  s: ('0x' + 'b'.repeat(64)) as Bytes32,
};

function buildBuyOrder(): LimitOrder {
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
  };
}

function buildService() {
  const repo = {
    listMarketsBasic: jest.fn().mockResolvedValue([
      {
        id: 'm1',
        symbol: 'WETH-USDC',
        baseAddress: BASE_ADDR,
        quoteAddress: QUOTE_ADDR,
      },
    ]),
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
  const ob = {
    snapshot: jest.fn().mockReturnValue({ bids: [], asks: [] }),
    place: jest.fn().mockResolvedValue({ status: 'placed' }),
    attachRaw: jest.fn().mockResolvedValue(true),
    cancel: jest.fn().mockResolvedValue({ status: 'cancelled' }),
  };
  const shadowChecks = {
    checkMakerFunds: jest.fn().mockResolvedValue({ ok: true, warnings: [] }),
    isBlocking: false,
  };
  const metrics = { ordersPlaced: { inc: jest.fn() } };

  // Guard must RUN → provide an RPC URL. Neutralize taker-fee env (loaded
  // transitively from apps/api/.env via @prisma/client) so the ZERO-recipient
  // test order is not rejected by the fee policy.
  process.env.RPC_URL_READONLY = 'http://placeholder';
  delete process.env.FEE_RECIPIENT;
  delete process.env.TAKER_FEE_RECIPIENT;
  delete process.env.TAKER_FEE_BPS;

  const svc = new OrdersPlacementService(
    ob as unknown as OrderBookService,
    repo as unknown as PersistenceRepository,
    shadowChecks as unknown as ShadowChecksService,
    metrics as unknown as MetricsService,
  );
  return { svc, ob, repo };
}

afterEach(() => {
  delete process.env.RPC_URL_READONLY;
  jest.clearAllMocks();
});

describe('OrdersPlacementService — maker balance guard RPC resilience', () => {
  const placeArgs = {
    order: buildBuyOrder(),
    signature: dummySig,
    orderHash: ('0x' + 'c'.repeat(64)) as string,
    makerExpected: OWNER,
    postOnly: true,
  };

  it('skips the guard (warn) and places when balanceOf hits a transient RPC error', async () => {
    const { svc, ob } = buildService();
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockBalanceOf.mockRejectedValue(
      Object.assign(new Error('429 Too Many Requests'), {
        code: 'SERVER_ERROR',
      }),
    );

    const result = await svc.place({ ...placeArgs });

    expect(result.ok).toBe(true);
    expect(ob.place).toHaveBeenCalledTimes(1); // placement proceeded
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('balance guard skipped: transient RPC error'),
    );
    warnSpy.mockRestore();
  });

  it('propagates a NON-transient balanceOf error (ABI/config bug stays visible)', async () => {
    const { svc, ob } = buildService();
    mockBalanceOf.mockRejectedValue(
      Object.assign(new Error('could not decode result data'), {
        code: 'BAD_DATA',
      }),
    );

    await expect(svc.place({ ...placeArgs })).rejects.toThrow(
      'could not decode result data',
    );
    expect(ob.place).not.toHaveBeenCalled();
  });

  it('still rejects maker_insufficient_free_balance when the balance reads low', async () => {
    const { svc, ob } = buildService();
    mockBalanceOf.mockResolvedValue(0n); // read succeeds, but balance < need

    await expect(svc.place({ ...placeArgs })).rejects.toMatchObject({
      message: 'maker_insufficient_free_balance',
    });
    expect(ob.place).not.toHaveBeenCalled();
  });
});
