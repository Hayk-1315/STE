import { OrderBookService } from '../../src/matching/orderbook.service';
import type { PersistenceRepository } from '../../src/matching/persistence.repository';

describe('On-chain reconciliation (simulated watchers)', () => {
  let service: OrderBookService;

  const mockRepo: Partial<PersistenceRepository> = {
    getTradingContext: jest.fn().mockResolvedValue({
      id: '1',
      symbol: 'WETH-USDC',
      baseDecimals: 18,
      priceTickQ: 1n,
      baseAddress: '0xbase',
      quoteAddress: '0xquote',
      minSizeB: 1n,
      minNotionalQ: 1n,
    }),

    upsertOrderPlaced: jest.fn(),

    decreaseOrderRemaining: jest.fn(),

    cancelOrder: jest.fn(),

    getOrderRemaining: jest.fn().mockResolvedValue(100n),

    listPlacedBySymbol: jest.fn().mockResolvedValue([]),
  };

  beforeEach(() => {
    service = new OrderBookService(mockRepo as PersistenceRepository);
    service.clear();
    jest.clearAllMocks();
  });

  // =========================
  // 🟣 FILL (simula FillWatcher)
  // =========================

  it('should process on-chain full fill and remove order from LOB', async () => {
    await service.place({
      marketId: 'WETH-USDC',
      orderHash: '0xwatch-fill-full',
      maker: '0xmaker',
      side: 'SELL',
      priceTicks: 2500000n,
      sizeBase: 1000000000000000000n, // 1 WETH
    });

    const res = await service.applyExternalFill(
      'WETH-USDC',
      '0xwatch-fill-full',
      1000000000000000000n,
    );

    expect(res.status).toBe('filled');

    const dump = service.dump('WETH-USDC');
    expect(dump.asks).toHaveLength(0);
  });

  it('should process on-chain partial fill and keep remaining size', async () => {
    await service.place({
      marketId: 'WETH-USDC',
      orderHash: '0xwatch-fill-partial',
      maker: '0xmaker',
      side: 'SELL',
      priceTicks: 2500000n,
      sizeBase: 1000000000000000000n, // 1 WETH
    });

    const res = await service.applyExternalFill(
      'WETH-USDC',
      '0xwatch-fill-partial',
      400000000000000000n,
    );

    expect(res.status).toBe('partial');

    const dump = service.dump('WETH-USDC');
    expect(dump.asks).toHaveLength(1);
    expect(dump.asks[0].sizeBase).toBe('600000000000000000');
  });

  it('should cap overfill and remove order', async () => {
    await service.place({
      marketId: 'WETH-USDC',
      orderHash: '0xwatch-overfill',
      maker: '0xmaker',
      side: 'SELL',
      priceTicks: 2500000n,
      sizeBase: 1000000000000000000n, // 1 WETH
    });

    const res = await service.applyExternalFill(
      'WETH-USDC',
      '0xwatch-overfill',
      1500000000000000000n,
    );

    expect(res.status).toBe('filled');

    const dump = service.dump('WETH-USDC');
    expect(dump.asks).toHaveLength(0);
  });

  // =========================
  // 🔴 CANCEL (simula CancelWatcher)
  // =========================

  it('should cancel order from LOB when watcher detects cancel', async () => {
    await service.place({
      marketId: 'WETH-USDC',
      orderHash: '0xwatch-cancel',
      maker: '0xmaker',
      side: 'SELL',
      priceTicks: 2500000n,
      sizeBase: 1000000000000000000n, // 1 WETH
    });

    const res = await service.cancel('WETH-USDC', '0xwatch-cancel');

    expect(res.status).toBe('cancelled');

    const dump = service.dump('WETH-USDC');
    expect(dump.asks).toHaveLength(0);
  });

  it('should handle cancel when order is not in LOB (DB-only case)', async () => {
    const res = await service.cancel('WETH-USDC', '0xunknown');

    expect(['cancelled', 'not_found']).toContain(res.status);
  });
});
