//import { OrderSide, OrderStatus } from '@prisma/client';
import type { PersistenceRepository } from '../../src/matching/persistence.repository';

type TradingContext = Awaited<
  ReturnType<PersistenceRepository['getTradingContext']>
>;

type UpsertOrderPlacedInput = Parameters<
  PersistenceRepository['upsertOrderPlaced']
>[0];

type ListPlacedBySymbolItem = Awaited<
  ReturnType<PersistenceRepository['listPlacedBySymbol']>
>[number];

export type PersistenceRepositoryMock = jest.Mocked<
  Pick<
    PersistenceRepository,
    | 'getTradingContext'
    | 'upsertOrderPlaced'
    | 'cancelOrder'
    | 'decreaseOrderRemaining'
    | 'getOrderRemaining'
    | 'listPlacedBySymbol'
  >
>;

/**
 * Creates a minimal typed mock of PersistenceRepository for matching tests.
 */
export function createPersistenceRepositoryMock(
  overrides?: Partial<TradingContext>,
): PersistenceRepositoryMock {
  const ctx: TradingContext = {
    id: 'mkt_weth_usdc',
    symbol: 'WETH-USDC',
    baseAddress: '0x1111111111111111111111111111111111111111',
    quoteAddress: '0x2222222222222222222222222222222222222222',
    baseDecimals: 18,
    quoteDecimals: 6,
    priceTickQ: 1_000n,
    minSizeB: 10_000_000_000_000_000n, // 0.01 base
    minNotionalQ: 10_000n,
    ...overrides,
  };

  const mock: PersistenceRepositoryMock = {
    getTradingContext: jest.fn<
      ReturnType<PersistenceRepository['getTradingContext']>,
      Parameters<PersistenceRepository['getTradingContext']>
    >(),
    upsertOrderPlaced: jest.fn<
      ReturnType<PersistenceRepository['upsertOrderPlaced']>,
      [UpsertOrderPlacedInput]
    >(),
    cancelOrder: jest.fn<
      ReturnType<PersistenceRepository['cancelOrder']>,
      Parameters<PersistenceRepository['cancelOrder']>
    >(),
    decreaseOrderRemaining: jest.fn<
      ReturnType<PersistenceRepository['decreaseOrderRemaining']>,
      Parameters<PersistenceRepository['decreaseOrderRemaining']>
    >(),
    getOrderRemaining: jest.fn<
      ReturnType<PersistenceRepository['getOrderRemaining']>,
      Parameters<PersistenceRepository['getOrderRemaining']>
    >(),
    listPlacedBySymbol: jest.fn<
      ReturnType<PersistenceRepository['listPlacedBySymbol']>,
      Parameters<PersistenceRepository['listPlacedBySymbol']>
    >(),
  };

  mock.getTradingContext.mockResolvedValue(ctx);
  mock.upsertOrderPlaced.mockResolvedValue(undefined);
  mock.cancelOrder.mockResolvedValue(undefined);
  mock.decreaseOrderRemaining.mockResolvedValue(undefined);
  mock.getOrderRemaining.mockResolvedValue(null);
  mock.listPlacedBySymbol.mockResolvedValue([] as ListPlacedBySymbolItem[]);

  return mock;
}
