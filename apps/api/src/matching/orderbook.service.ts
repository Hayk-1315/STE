import { Injectable } from '@nestjs/common';
import { OrderSide, OrderStatus, EventType } from '@prisma/client';
import { PersistenceRepository } from './persistence.repository';

export type Side = 'BUY' | 'SELL';

type Order = {
  id: string;
  maker: string;
  side: Side;
  priceTicks: bigint;
  sizeBase: bigint;
  ts: number;
};

type Book = { bids: Order[]; asks: Order[] };

function sortBids(bids: Order[]) {
  bids.sort((a, b) =>
    a.priceTicks === b.priceTicks
      ? a.ts - b.ts
      : Number(b.priceTicks - a.priceTicks),
  );
}
function sortAsks(asks: Order[]) {
  asks.sort((a, b) =>
    a.priceTicks === b.priceTicks
      ? a.ts - b.ts
      : Number(a.priceTicks - b.priceTicks),
  );
}
const pow10 = (n: number) => {
  let r = 1n;
  for (let i = 0; i < n; i++) r *= 10n;
  return r;
};

@Injectable()
export class OrderBookService {
  private books = new Map<string, Book>(); // CANONICAL marketId -> book
  constructor(private readonly repo: PersistenceRepository) {}

  listMarkets(): string[] {
    return [...this.books.keys()];
  }
  private book(marketId: string): Book {
    if (!this.books.has(marketId))
      this.books.set(marketId, { bids: [], asks: [] });
    return this.books.get(marketId)!;
  }
  snapshot(marketId: string, depth = 10) {
    const b = this.books.get(marketId);
    if (!b) return { bids: [], asks: [] };
    return {
      bids: b.bids.slice(0, depth).map((o) => ({
        priceTicks: o.priceTicks.toString(),
        sizeBase: o.sizeBase.toString(),
      })),
      asks: b.asks.slice(0, depth).map((o) => ({
        priceTicks: o.priceTicks.toString(),
        sizeBase: o.sizeBase.toString(),
      })),
    };
  }

  async place(p: {
    marketId: string;
    orderHash: string;
    maker: string;
    side: Side;
    priceTicks: bigint;
    sizeBase: bigint;
  }) {
    // Resuelve reglas e ID CANÓNICO (acepta id o symbol)
    const rules = await this.repo.getTradingContext(p.marketId);
    const marketId = rules.id;

    if (p.sizeBase <= 0n) throw new Error('size_must_be_positive');
    if (p.priceTicks <= 0n) throw new Error('price_ticks_must_be_positive');
    if (p.sizeBase < rules.minSizeB) throw new Error('min_size_violation');
    const notionalQ =
      (p.priceTicks * rules.priceTickQ * p.sizeBase) /
      pow10(rules.baseDecimals);
    if (notionalQ < rules.minNotionalQ)
      throw new Error('min_notional_violation');

    // LOB en memoria por ID canónico
    const b = this.book(marketId);
    await this.cancel(marketId, p.orderHash); // idempotencia en el libro
    const o: Order = {
      id: p.orderHash,
      maker: p.maker.toLowerCase(),
      side: p.side,
      priceTicks: p.priceTicks,
      sizeBase: p.sizeBase,
      ts: Date.now(),
    };
    if (o.side === 'BUY') {
      b.bids.push(o);
      sortBids(b.bids);
    } else {
      b.asks.push(o);
      sortAsks(b.asks);
    }

    // Persistencia usando ID canónico
    await this.repo.upsertOrderPlaced({
      orderHash: p.orderHash,
      marketId,
      maker: p.maker,
      side: p.side as OrderSide,
      priceTicks: p.priceTicks,
      sizeBase: p.sizeBase,
    });

    return { orderHash: o.id, status: 'placed' as const };
  }

  async market(m: { marketId: string; side: Side; sizeBase: bigint }) {
    const ctx = await this.repo.getTradingContext(m.marketId);
    const marketId = ctx.id;

    const b = this.book(marketId);
    let remaining = m.sizeBase;
    const fills: Array<{
      makerOrderHash: string;
      priceTicks: string;
      sizeBase: string;
    }> = [];

    while (remaining > 0n) {
      const level = m.side === 'BUY' ? b.asks[0] : b.bids[0];
      if (!level) break;

      const exec = remaining < level.sizeBase ? remaining : level.sizeBase;
      remaining -= exec;
      level.sizeBase -= exec;

      await this.repo.addTrade(
        marketId,
        level.id,
        '0x0000000000000000000000000000000000000000',
        level.priceTicks,
        exec,
      );
      const newStatus =
        level.sizeBase > 0n ? OrderStatus.PARTIALLY_FILLED : OrderStatus.FILLED;
      await this.repo.decreaseOrderRemaining(level.id, exec, newStatus);
      await this.repo.appendEvent(
        marketId,
        level.id,
        newStatus === OrderStatus.FILLED
          ? EventType.FILLED
          : EventType.PARTIAL_FILL,
        { sizeBase: exec.toString(), priceTicks: level.priceTicks.toString() },
      );

      fills.push({
        makerOrderHash: level.id,
        priceTicks: level.priceTicks.toString(),
        sizeBase: exec.toString(),
      });

      if (level.sizeBase === 0n) {
        if (m.side === 'BUY') b.asks.shift();
        else b.bids.shift();
      }
    }

    return { remainingBase: remaining.toString(), fills };
  }

  async cancel(marketIdKey: string, orderHash: string) {
    const ctx = await this.repo.getTradingContext(marketIdKey);
    const marketId = ctx.id;

    const b = this.book(marketId);
    const beforeB = b.bids.length,
      beforeA = b.asks.length;
    b.bids = b.bids.filter((o) => o.id !== orderHash);
    b.asks = b.asks.filter((o) => o.id !== orderHash);
    const removed = beforeB !== b.bids.length || beforeA !== b.asks.length;

    if (removed) {
      await this.repo.cancelOrder(marketId, orderHash);
      return { orderHash, status: 'cancelled' as const };
    }
    return { orderHash, status: 'not_found' as const };
  }
}
