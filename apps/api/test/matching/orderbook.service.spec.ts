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

  describe('quote() with limitPriceTicks (marketable-limit cap)', () => {
    it('BUY: truncates the sweep when the next ask is above the limit', async () => {
      await service.place({
        marketId: 'WETH-USDC',
        orderHash: '0xask-cheap',
        maker: '0x8888888888888888888888888888888888888888',
        side: 'SELL',
        priceTicks: 2_500_000n,
        sizeBase: 100_000_000_000_000_000n, // 0.1
      });
      await service.place({
        marketId: 'WETH-USDC',
        orderHash: '0xask-expensive',
        maker: '0x9999999999999999999999999999999999999999',
        side: 'SELL',
        priceTicks: 2_600_000n,
        sizeBase: 100_000_000_000_000_000n, // 0.1
      });

      const quote = await service.quote({
        marketIdOrSymbol: 'WETH-USDC',
        side: 'BUY',
        sizeBase: 200_000_000_000_000_000n, // wants 0.2
        limitPriceTicks: 2_500_000n, // refuses anything above 2.5M
      });

      expect(quote.fills).toHaveLength(1);
      expect(quote.fills[0]).toMatchObject({
        makerOrderHash: '0xask-cheap',
        priceTicks: '2500000',
        sizeBase: '100000000000000000',
      });
      // Expect 0.1 unfillable inside the user's limit.
      expect(quote.remainingBase).toBe('100000000000000000');
    });

    it('SELL: truncates the sweep when the next bid is below the limit', async () => {
      await service.place({
        marketId: 'WETH-USDC',
        orderHash: '0xbid-high',
        maker: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1',
        side: 'BUY',
        priceTicks: 2_600_000n,
        sizeBase: 100_000_000_000_000_000n, // 0.1
      });
      await service.place({
        marketId: 'WETH-USDC',
        orderHash: '0xbid-low',
        maker: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa2',
        side: 'BUY',
        priceTicks: 2_500_000n,
        sizeBase: 100_000_000_000_000_000n, // 0.1
      });

      const quote = await service.quote({
        marketIdOrSymbol: 'WETH-USDC',
        side: 'SELL',
        sizeBase: 200_000_000_000_000_000n, // wants 0.2
        limitPriceTicks: 2_600_000n, // refuses anything below 2.6M
      });

      expect(quote.fills).toHaveLength(1);
      expect(quote.fills[0]).toMatchObject({
        makerOrderHash: '0xbid-high',
        priceTicks: '2600000',
        sizeBase: '100000000000000000',
      });
      expect(quote.remainingBase).toBe('100000000000000000');
    });

    it('BUY: includes a level priced exactly at the limit', async () => {
      await service.place({
        marketId: 'WETH-USDC',
        orderHash: '0xask-at-limit',
        maker: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa3',
        side: 'SELL',
        priceTicks: 2_500_000n,
        sizeBase: 100_000_000_000_000_000n,
      });

      const quote = await service.quote({
        marketIdOrSymbol: 'WETH-USDC',
        side: 'BUY',
        sizeBase: 100_000_000_000_000_000n,
        limitPriceTicks: 2_500_000n,
      });

      expect(quote.fills).toHaveLength(1);
      expect(quote.remainingBase).toBe('0');
    });

    // Regression for QA-reported bug: BUY limit at the lower ask must consume
    // that level and stop before the adjacent ask one tick higher. The matcher
    // logic was always correct — the failure mode was the frontend dropping
    // the cap before /match/quote saw it — but this exact case is pinned here
    // so the matcher can never silently regress on adjacent levels.
    it('BUY at limit=lower ask: consumes lower ask, stops before adjacent higher ask', async () => {
      await service.place({
        marketId: 'WETH-USDC',
        orderHash: '0xask-100',
        maker: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa5',
        side: 'SELL',
        priceTicks: 2_500_000n, // "100"
        sizeBase: 40_000_000_000_000_000n, // 0.04
      });
      await service.place({
        marketId: 'WETH-USDC',
        orderHash: '0xask-101',
        maker: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa6',
        side: 'SELL',
        priceTicks: 2_500_001n, // "101" — one tick above
        sizeBase: 10_000_000_000_000_000n, // 0.01
      });

      const quote = await service.quote({
        marketIdOrSymbol: 'WETH-USDC',
        side: 'BUY',
        sizeBase: 250_000_000_000_000_000n, // 0.25 requested
        limitPriceTicks: 2_500_000n,
      });

      expect(quote.fills).toHaveLength(1);
      expect(quote.fills[0]).toMatchObject({
        makerOrderHash: '0xask-100',
        priceTicks: '2500000',
        sizeBase: '40000000000000000', // 0.04
      });
      // 0.25 requested − 0.04 fillable = 0.21 unfilled (must NOT touch 2_500_001)
      expect(quote.remainingBase).toBe('210000000000000000');
    });

    it('BUY: returns no fills when the limit is below every ask', async () => {
      await service.place({
        marketId: 'WETH-USDC',
        orderHash: '0xask-too-pricey',
        maker: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa4',
        side: 'SELL',
        priceTicks: 2_500_000n,
        sizeBase: 100_000_000_000_000_000n,
      });

      const quote = await service.quote({
        marketIdOrSymbol: 'WETH-USDC',
        side: 'BUY',
        sizeBase: 100_000_000_000_000_000n,
        limitPriceTicks: 2_400_000n,
      });

      expect(quote.fills).toHaveLength(0);
      expect(quote.remainingBase).toBe('100000000000000000');
    });
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
  describe('attachRaw() — Phase 5 P0 follow-up: in-memory raw must stay JSON-safe', () => {
    // Reproduces the SEA CL fire path: the LimitOrder forwarded to attachRaw
    // has `bigint` primitives in makerAmount / takerAmount / takerTokenFeeAmount
    // / salt (because IntentFireService.sanitizeOrder coerces with toBig).
    // Before the fix, those bigints were stored as-is and then echoed into the
    // /match/quote response via plan.fills[i].rawOrder, where JSON.stringify
    // would throw `Do not know how to serialize a BigInt`.
    const buildSeaShapeOrder = () => ({
      makerToken: '0xbase',
      takerToken: '0xquote',
      makerAmount: 1_000_000_000_000_000_000n, // bigint primitive
      takerAmount: 300_000_000_000n, // bigint primitive
      takerTokenFeeAmount: 0n, // bigint primitive
      maker: '0xmaker',
      taker: '0x0000000000000000000000000000000000000000',
      sender: '0x0000000000000000000000000000000000000000',
      feeRecipient: '0x0000000000000000000000000000000000000000',
      pool: '0x' + '0'.repeat(64),
      expiry: Math.floor(Date.now() / 1000) + 3600,
      salt: 12345n, // bigint primitive
    });
    const dummySig = {
      signatureType: 2,
      v: 27,
      r: '0x' + 'a'.repeat(64),
      s: '0x' + 'b'.repeat(64),
    };

    it('normalizes bigint amounts so JSON.stringify(quote.fills) succeeds', async () => {
      await service.place({
        marketId: 'WETH-USDC',
        orderHash: '0xsea-placed',
        maker: '0xsea',
        side: 'SELL',
        priceTicks: 2_500_000n,
        sizeBase: 100_000_000_000_000_000n,
      });

      // Drive the SEA CL fire shape (bigint primitives) into attachRaw.
      const attached = await service.attachRaw(
        'WETH-USDC',
        '0xsea-placed',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { order: buildSeaShapeOrder() as any, signature: dummySig as any },
      );
      expect(attached).toBe(true);

      const quote = await service.quote({
        marketIdOrSymbol: 'WETH-USDC',
        side: 'BUY',
        sizeBase: 50_000_000_000_000_000n,
      });
      expect(quote.fills).toHaveLength(1);

      // Smoke test: JSON.stringify must not throw on the fill payload.
      expect(() => JSON.stringify(quote.fills)).not.toThrow();

      // And the persisted raw amounts MUST be decimal strings now, not bigints.
      const raw = quote.fills[0].rawOrder as unknown as Record<string, unknown>;
      expect(typeof raw.makerAmount).toBe('string');
      expect(typeof raw.takerAmount).toBe('string');
      expect(typeof raw.takerTokenFeeAmount).toBe('string');
      expect(typeof raw.salt).toBe('string');
      expect(raw.makerAmount).toBe('1000000000000000000');
      expect(raw.takerAmount).toBe('300000000000');
      expect(raw.salt).toBe('12345');
    });

    it('is a no-op for the normal /orders shape (string amounts stay strings)', async () => {
      await service.place({
        marketId: 'WETH-USDC',
        orderHash: '0xnormal-placed',
        maker: '0xmaker2',
        side: 'SELL',
        priceTicks: 2_500_000n,
        sizeBase: 100_000_000_000_000_000n,
      });

      const wireOrder = {
        ...buildSeaShapeOrder(),
        makerAmount: '1000000000000000000',
        takerAmount: '300000000000',
        takerTokenFeeAmount: '0',
        salt: '12345',
      };
      await service.attachRaw(
        'WETH-USDC',
        '0xnormal-placed',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { order: wireOrder as any, signature: dummySig as any },
      );

      const quote = await service.quote({
        marketIdOrSymbol: 'WETH-USDC',
        side: 'BUY',
        sizeBase: 50_000_000_000_000_000n,
      });
      const raw = quote.fills[0].rawOrder as unknown as Record<string, unknown>;
      expect(raw.makerAmount).toBe('1000000000000000000');
      expect(raw.takerAmount).toBe('300000000000');
      expect(raw.salt).toBe('12345');
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
