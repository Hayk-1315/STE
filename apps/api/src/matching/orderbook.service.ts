import { Injectable } from '@nestjs/common';
import { OrderSide, OrderStatus, EventType } from '@prisma/client';
import { PersistenceRepository } from './persistence.repository';
import type { LimitOrder, Signature } from '../zeroex/limit-order.types';

export type Side = 'BUY' | 'SELL';

type Order = {
  id: string;
  maker: string;
  side: Side;
  priceTicks: bigint;
  sizeBase: bigint;
  ts: number;
  rawOrder?: LimitOrder;
  rawSig?: Signature;
};

type Book = { bids: Order[]; asks: Order[] };

// Types used by the dev inspect endpoint (no any)
export type DumpOrder = {
  id: string;
  priceTicks: string;
  sizeBase: string;
};
export type DumpBook = {
  bids: DumpOrder[];
  asks: DumpOrder[];
};

const __GLOBAL_LOB_KEY__ = '__ste_lob_books__';
// If `type Book` is already declared, use this alias
type LOBMap = Map<string, Book>;
// // (otherwise: type LOBMap = Map<string, { bids: Order[]; asks: Order[] }>;

const g = globalThis as unknown as Record<string, unknown>;
if (!(g[__GLOBAL_LOB_KEY__] instanceof Map)) {
  g[__GLOBAL_LOB_KEY__] = new Map<string, Book>();
}
const globalBooks = g[__GLOBAL_LOB_KEY__] as LOBMap;

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
  private books: LOBMap = globalBooks;
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

  dump(symbolOrId: string): DumpBook {
    const key = symbolOrId.toUpperCase(); // we store by symbol like "WETH-USDC"
    const b = this.books.get(key);
    if (!b) return { bids: [], asks: [] };

    const mapOrder = (o: Order): DumpOrder => ({
      id: o.id,
      priceTicks: o.priceTicks.toString(),
      sizeBase: o.sizeBase.toString(),
    });

    return {
      bids: b.bids.map(mapOrder),
      asks: b.asks.map(mapOrder),
    };
  }

  // Replace the whole attachRaw with:
  async attachRaw(
    marketIdOrSymbol: string,
    orderHash: string,
    raw: { order: LimitOrder; signature: Signature },
  ): Promise<boolean> {
    // Resolve canonical symbol via repository (accepts id or symbol)
    const ctx = await this.repo.getTradingContext(marketIdOrSymbol);
    const bookKey = ctx.symbol;

    const b = this.books.get(bookKey);
    if (!b) return false;

    const hit =
      b.bids.find((o) => o.id === orderHash) ??
      b.asks.find((o) => o.id === orderHash);

    if (!hit) return false;

    // Attach raw payload for 0x EP calldata building
    hit.rawOrder = raw.order;
    hit.rawSig = raw.signature;
    return true;
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
    const bookKey = rules.symbol; // LOB key = symbol

    if (p.sizeBase <= 0n) throw new Error('size_must_be_positive');
    if (p.priceTicks <= 0n) throw new Error('price_ticks_must_be_positive');
    if (p.sizeBase < rules.minSizeB) throw new Error('min_size_violation');
    const notionalQ =
      (p.priceTicks * rules.priceTickQ * p.sizeBase) /
      pow10(rules.baseDecimals);
    if (notionalQ < rules.minNotionalQ)
      throw new Error('min_notional_violation');

    // In-memory LOB keyed by symbol (bookKey)
    await this.cancel(bookKey, p.orderHash);
    const b = this.book(bookKey);

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
      marketId: rules.id,
      maker: p.maker,
      side: p.side as OrderSide,
      priceTicks: p.priceTicks,
      sizeBase: p.sizeBase,
    });

    return { orderHash: o.id, status: 'placed' as const };
  }

  // Build a taker sweep plan from top-of-book up to sizeBase.
  // Returns the fills list and the total taker-side amount.
  async quote(q: { marketIdOrSymbol: string; side: Side; sizeBase: bigint }) {
    const ctx = await this.repo.getTradingContext(q.marketIdOrSymbol);
    const bookKey = ctx.symbol;
    const b = this.book(bookKey);

    const levels = q.side === 'BUY' ? b.asks : b.bids; // taker BUY lifts asks; taker SELL hits bids
    let remaining = q.sizeBase;
    const fills: Array<{
      makerOrderHash: string;
      maker: string;
      priceTicks: string;
      sizeBase: string;
      // raw for EP (optional)
      rawOrder?: LimitOrder;
      rawSig?: Signature;
    }> = [];

    let takerTotalQ = 0n;

    for (const level of levels) {
      if (remaining <= 0n) break;
      const exec = remaining < level.sizeBase ? remaining : level.sizeBase;
      remaining -= exec;

      // Quote notional in quote units (raw) using ticks:
      // notionalQ = priceTicks * priceTickQ * sizeBase / 10^baseDecimals
      const notionalQ =
        (level.priceTicks * ctx.priceTickQ * exec) /
        10n ** BigInt(ctx.baseDecimals);
      takerTotalQ += notionalQ;

      fills.push({
        makerOrderHash: level.id,
        maker: level.maker,
        priceTicks: level.priceTicks.toString(),
        sizeBase: exec.toString(),
        rawOrder: level.rawOrder,
        rawSig: level.rawSig,
      });
    }

    return {
      marketId: ctx.id,
      symbol: ctx.symbol,
      side: q.side,
      requestedBase: q.sizeBase.toString(),
      remainingBase: remaining.toString(),
      takerToken: q.side === 'BUY' ? ctx.quoteAddress : ctx.baseAddress,
      takerAmount: takerTotalQ.toString(), // raw quote units if BUY; raw base units if SELL (see above)
      fills,
    };
  }

  async market(m: { marketId: string; side: Side; sizeBase: bigint }) {
    const ctx = await this.repo.getTradingContext(m.marketId);
    const bookKey = ctx.symbol;
    const b = this.book(bookKey);
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
        ctx.id,
        level.id,
        '0x0000000000000000000000000000000000000000',
        level.priceTicks,
        exec,
      );
      const newStatus =
        level.sizeBase > 0n ? OrderStatus.PARTIALLY_FILLED : OrderStatus.FILLED;
      await this.repo.decreaseOrderRemaining(level.id, exec, newStatus);
      await this.repo.appendEvent(
        ctx.id,
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
    const bookKey = ctx.symbol;

    const b = this.book(bookKey);
    const beforeB = b.bids.length,
      beforeA = b.asks.length;
    const target = orderHash.toLowerCase();
    b.bids = b.bids.filter((o) => o.id.toLowerCase() !== target);
    b.asks = b.asks.filter((o) => o.id.toLowerCase() !== target);
    const removed = beforeB !== b.bids.length || beforeA !== b.asks.length;

    if (removed) {
      await this.repo.cancelOrder(ctx.id, orderHash);
      return { orderHash, status: 'cancelled' as const };
    }
    return { orderHash, status: 'not_found' as const };
  }
}
