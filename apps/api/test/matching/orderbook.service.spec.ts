import { OrderBookService } from '../../src/matching/orderbook.service';
import type { PersistenceRepository } from '../../src/matching/persistence.repository';
import {
  createPersistenceRepositoryMock,
  type PersistenceRepositoryMock,
} from '../helpers/repo.mock';

describe('OrderBookService', () => {
  let repo: PersistenceRepositoryMock;
  let service: OrderBookService;

  beforeEach(() => {
    repo = createPersistenceRepositoryMock();
    service = new OrderBookService(repo as unknown as PersistenceRepository);
    service.clear(); // Clear order book state before each test if method exists
  });

  describe('place()', () => {
    it('should place a valid buy order', async () => {
      const result = await service.place({
        marketId: 'WETH-USDC',
        orderHash: '0xorder-buy-1',
        maker: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        side: 'BUY',
        priceTicks: 2_500_000n,
        sizeBase: 100_000_000_000_000_000n, // 0.1
      });

      expect(result).toEqual({
        orderHash: '0xorder-buy-1',
        status: 'placed',
      });

      const dump = service.dump('WETH-USDC');

      expect(dump.bids).toHaveLength(1);
      expect(dump.asks).toHaveLength(0);
      expect(dump.bids[0]).toEqual({
        id: '0xorder-buy-1',
        priceTicks: '2500000',
        sizeBase: '100000000000000000',
      });

      expect(repo.upsertOrderPlaced).toHaveBeenCalledTimes(1);
    });

    it('should place a valid sell order', async () => {
      const result = await service.place({
        marketId: 'WETH-USDC',
        orderHash: '0xorder-sell-1',
        maker: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        side: 'SELL',
        priceTicks: 2_600_000n,
        sizeBase: 200_000_000_000_000_000n, // 0.2
      });

      expect(result).toEqual({
        orderHash: '0xorder-sell-1',
        status: 'placed',
      });

      const dump = service.dump('WETH-USDC');

      expect(dump.bids).toHaveLength(0);
      expect(dump.asks).toHaveLength(1);
      expect(dump.asks[0]).toEqual({
        id: '0xorder-sell-1',
        priceTicks: '2600000',
        sizeBase: '200000000000000000',
      });

      expect(repo.upsertOrderPlaced).toHaveBeenCalledTimes(1);
    });

    it('should reject invalid size', async () => {
      await expect(
        service.place({
          marketId: 'WETH-USDC',
          orderHash: '0xinvalid-size',
          maker: '0xcccccccccccccccccccccccccccccccccccccccc',
          side: 'BUY',
          priceTicks: 2_500_000n,
          sizeBase: 0n,
        }),
      ).rejects.toThrow('size_must_be_positive');
    });

    it('should reject invalid price', async () => {
      await expect(
        service.place({
          marketId: 'WETH-USDC',
          orderHash: '0xinvalid-price',
          maker: '0xdddddddddddddddddddddddddddddddddddddddd',
          side: 'SELL',
          priceTicks: 0n,
          sizeBase: 100_000_000_000_000_000n,
        }),
      ).rejects.toThrow('price_ticks_must_be_positive');
    });
  });

  describe('quote()', () => {
    it('should return correct quote against best available ask', async () => {
      await service.place({
        marketId: 'WETH-USDC',
        orderHash: '0xask-1',
        maker: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        side: 'SELL',
        priceTicks: 2_500_000n,
        sizeBase: 100_000_000_000_000_000n, // 0.1
      });

      const quote = await service.quote({
        marketIdOrSymbol: 'WETH-USDC',
        side: 'BUY',
        sizeBase: 50_000_000_000_000_000n, // 0.05
      });

      expect(quote.symbol).toBe('WETH-USDC');
      expect(quote.side).toBe('BUY');
      expect(quote.requestedBase).toBe('50000000000000000');
      expect(quote.remainingBase).toBe('0');
      expect(quote.fills).toHaveLength(1);
      expect(quote.fills[0]).toMatchObject({
        makerOrderHash: '0xask-1',
        priceTicks: '2500000',
        sizeBase: '50000000000000000',
      });
    });
  });
  it('should match best available ask first', async () => {
    await service.place({
      marketId: 'WETH-USDC',
      orderHash: '0xask-expensive',
      maker: '0x1111111111111111111111111111111111111111',
      side: 'SELL',
      priceTicks: 2_600_000n,
      sizeBase: 100_000_000_000_000_000n, // 0.1
    });

    await service.place({
      marketId: 'WETH-USDC',
      orderHash: '0xask-cheap',
      maker: '0x2222222222222222222222222222222222222222',
      side: 'SELL',
      priceTicks: 2_500_000n,
      sizeBase: 100_000_000_000_000_000n, // 0.1
    });

    const quote = await service.quote({
      marketIdOrSymbol: 'WETH-USDC',
      side: 'BUY',
      sizeBase: 50_000_000_000_000_000n, // 0.05
    });

    expect(quote.fills).toHaveLength(1);
    expect(quote.fills[0]).toMatchObject({
      makerOrderHash: '0xask-cheap',
      priceTicks: '2500000',
      sizeBase: '50000000000000000',
    });
  });

  it('should respect time priority when price is the same', async () => {
    await service.place({
      marketId: 'WETH-USDC',
      orderHash: '0xask-first',
      maker: '0x3333333333333333333333333333333333333333',
      side: 'SELL',
      priceTicks: 2_500_000n,
      sizeBase: 100_000_000_000_000_000n, // 0.1
    });

    await service.place({
      marketId: 'WETH-USDC',
      orderHash: '0xask-second',
      maker: '0x4444444444444444444444444444444444444444',
      side: 'SELL',
      priceTicks: 2_500_000n,
      sizeBase: 100_000_000_000_000_000n, // 0.1
    });

    const quote = await service.quote({
      marketIdOrSymbol: 'WETH-USDC',
      side: 'BUY',
      sizeBase: 50_000_000_000_000_000n, // 0.05
    });

    expect(quote.fills).toHaveLength(1);
    expect(quote.fills[0]).toMatchObject({
      makerOrderHash: '0xask-first',
      priceTicks: '2500000',
      sizeBase: '50000000000000000',
    });
  });

  it('should aggregate liquidity across multiple ask levels', async () => {
    await service.place({
      marketId: 'WETH-USDC',
      orderHash: '0xask-level-1',
      maker: '0x5555555555555555555555555555555555555555',
      side: 'SELL',
      priceTicks: 2_500_000n,
      sizeBase: 100_000_000_000_000_000n, // 0.1
    });

    await service.place({
      marketId: 'WETH-USDC',
      orderHash: '0xask-level-2',
      maker: '0x6666666666666666666666666666666666666666',
      side: 'SELL',
      priceTicks: 2_600_000n,
      sizeBase: 100_000_000_000_000_000n, // 0.1
    });

    const quote = await service.quote({
      marketIdOrSymbol: 'WETH-USDC',
      side: 'BUY',
      sizeBase: 150_000_000_000_000_000n, // 0.15
    });

    expect(quote.fills).toHaveLength(2);

    expect(quote.fills[0]).toMatchObject({
      makerOrderHash: '0xask-level-1',
      priceTicks: '2500000',
      sizeBase: '100000000000000000',
    });

    expect(quote.fills[1]).toMatchObject({
      makerOrderHash: '0xask-level-2',
      priceTicks: '2600000',
      sizeBase: '50000000000000000',
    });

    expect(quote.remainingBase).toBe('0');
  });

  it('should return remainingBase when liquidity is insufficient', async () => {
    await service.place({
      marketId: 'WETH-USDC',
      orderHash: '0xask-only',
      maker: '0x7777777777777777777777777777777777777777',
      side: 'SELL',
      priceTicks: 2_500_000n,
      sizeBase: 100_000_000_000_000_000n, // 0.1
    });

    const quote = await service.quote({
      marketIdOrSymbol: 'WETH-USDC',
      side: 'BUY',
      sizeBase: 200_000_000_000_000_000n, // 0.2
    });

    expect(quote.fills).toHaveLength(1);
    expect(quote.fills[0]).toMatchObject({
      makerOrderHash: '0xask-only',
      priceTicks: '2500000',
      sizeBase: '100000000000000000',
    });

    expect(quote.remainingBase).toBe('100000000000000000');
  });
  describe('applyExternalFill()', () => {
    it('should fully fill an order and remove it from the book', async () => {
      await service.place({
        marketId: 'WETH-USDC',
        orderHash: '0xask-full',
        maker: '0xaaa',
        side: 'SELL',
        priceTicks: 2_500_000n,
        sizeBase: 100_000_000_000_000_000n,
      });

      const res = await service.applyExternalFill(
        'WETH-USDC',
        '0xask-full',
        100_000_000_000_000_000n,
      );

      expect(res.status).toBe('filled');

      const dump = service.dump('WETH-USDC');
      expect(dump.asks).toHaveLength(0);
    });

    it('should partially fill an order and keep remaining size', async () => {
      await service.place({
        marketId: 'WETH-USDC',
        orderHash: '0xask-partial',
        maker: '0xbbb',
        side: 'SELL',
        priceTicks: 2_500_000n,
        sizeBase: 100_000_000_000_000_000n,
      });

      const res = await service.applyExternalFill(
        'WETH-USDC',
        '0xask-partial',
        50_000_000_000_000_000n,
      );

      expect(res.status).toBe('partial');

      const dump = service.dump('WETH-USDC');

      expect(dump.asks).toHaveLength(1);
      expect(dump.asks[0]).toEqual({
        id: '0xask-partial',
        priceTicks: '2500000',
        sizeBase: '50000000000000000',
      });
    });

    it('should remove order after cumulative full fill', async () => {
      await service.place({
        marketId: 'WETH-USDC',
        orderHash: '0xask-cumulative',
        maker: '0xccc',
        side: 'SELL',
        priceTicks: 2_500_000n,
        sizeBase: 100_000_000_000_000_000n,
      });

      await service.applyExternalFill(
        'WETH-USDC',
        '0xask-cumulative',
        30_000_000_000_000_000n,
      );

      const res = await service.applyExternalFill(
        'WETH-USDC',
        '0xask-cumulative',
        70_000_000_000_000_000n,
      );

      expect(res.status).toBe('filled');

      const dump = service.dump('WETH-USDC');
      expect(dump.asks).toHaveLength(0);
    });

    it('should ignore fills for unknown orders', async () => {
      const res = await service.applyExternalFill(
        'WETH-USDC',
        '0xunknown',
        50_000_000_000_000_000n,
      );

      expect(res.status).toBe('not_found');

      const dump = service.dump('WETH-USDC');
      expect(dump.asks).toHaveLength(0);
      expect(dump.bids).toHaveLength(0);
    });

    it('should cap overfill and remove order', async () => {
      await service.place({
        marketId: 'WETH-USDC',
        orderHash: '0xask-overfill',
        maker: '0xddd',
        side: 'SELL',
        priceTicks: 2_500_000n,
        sizeBase: 100_000_000_000_000_000n,
      });

      const res = await service.applyExternalFill(
        'WETH-USDC',
        '0xask-overfill',
        150_000_000_000_000_000n,
      );

      expect(res.status).toBe('filled');

      const dump = service.dump('WETH-USDC');
      expect(dump.asks).toHaveLength(0);
    });
  });
  describe('cancel()', () => {
    it('should remove an order from the book', async () => {
      await service.place({
        marketId: 'WETH-USDC',
        orderHash: '0xorder-cancel',
        maker: '0xaaa',
        side: 'SELL',
        priceTicks: 2_500_000n,
        sizeBase: 100_000_000_000_000_000n,
      });

      const res = await service.cancel('WETH-USDC', '0xorder-cancel');

      expect(res.status).toBe('cancelled');

      const dump = service.dump('WETH-USDC');
      expect(dump.asks).toHaveLength(0);
    });

    it('should return not_found for unknown order', async () => {
      const res = await service.cancel('WETH-USDC', '0xunknown');

      expect(res.status).toBe('not_found');

      const dump = service.dump('WETH-USDC');
      expect(dump.asks).toHaveLength(0);
      expect(dump.bids).toHaveLength(0);
    });

    it('should only cancel the targeted order', async () => {
      await service.place({
        marketId: 'WETH-USDC',
        orderHash: '0xorder-1',
        maker: '0xaaa',
        side: 'SELL',
        priceTicks: 2_500_000n,
        sizeBase: 100_000_000_000_000_000n,
      });

      await service.place({
        marketId: 'WETH-USDC',
        orderHash: '0xorder-2',
        maker: '0xbbb',
        side: 'SELL',
        priceTicks: 2_600_000n,
        sizeBase: 100_000_000_000_000_000n,
      });

      const res = await service.cancel('WETH-USDC', '0xorder-1');

      expect(res.status).toBe('cancelled');

      const dump = service.dump('WETH-USDC');

      expect(dump.asks).toHaveLength(1);
      expect(dump.asks[0].id).toBe('0xorder-2');
    });

    it('should not cancel an order after partial fill (not supported)', async () => {
      await service.place({
        marketId: 'WETH-USDC',
        orderHash: '0xorder-partial-cancel',
        maker: '0xccc',
        side: 'SELL',
        priceTicks: 2_500_000n,
        sizeBase: 100_000_000_000_000_000n,
      });

      await service.applyExternalFill(
        'WETH-USDC',
        '0xorder-partial-cancel',
        50_000_000_000_000_000n,
      );

      const res = await service.cancel('WETH-USDC', '0xorder-partial-cancel');

      expect(res.status).toBe('cancelled');

      const dump = service.dump('WETH-USDC');
      expect(dump.asks).toHaveLength(0);
    });
  });
});
