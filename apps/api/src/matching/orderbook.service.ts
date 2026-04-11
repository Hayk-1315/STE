// apps/api/src/matching/orderbook.service.ts
import { Injectable } from '@nestjs/common';
import { OrderSide, OrderStatus, EventType } from '@prisma/client';
import { PersistenceRepository } from './persistence.repository';
import type { LimitOrder, Signature } from '../zeroex/limit-order.types';

export type Side = 'BUY' | 'SELL';

const TAKER_FEE_BPS = Number(process.env.TAKER_FEE_BPS || '0');

type Order = {
  id: string;
  maker: string;
  side: Side;
  priceTicks: bigint;
  sizeBase: bigint;
  ts: number;
  rawOrder?: LimitOrder;
  rawSig?: Signature;
  expirySec?: number;
};

type Book = { bids: Order[]; asks: Order[] };

type RawAttached = { order: LimitOrder; signature: Signature | `0x${string}` };

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

const ZERO_ADDR = '0x0000000000000000000000000000000000000000' as const;

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
        // ← añadimos el timestamp real del nivel (placedAt del head en ese price)
        ts: new Date(o.ts).toISOString(),
      })),
      asks: b.asks.slice(0, depth).map((o) => ({
        priceTicks: o.priceTicks.toString(),
        sizeBase: o.sizeBase.toString(),
        // ← idem en asks
        ts: new Date(o.ts).toISOString(),
      })),
    };
  }

  // Debug helper for tests. Returns current in-memory ordebook state. Not optimized for performance, just for inspection.
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

  async attachRaw(
    marketIdOrSymbol: string,
    orderHash: string,
    raw: { order: LimitOrder; signature: Signature | `0x${string}` },
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
    hit.rawSig = raw.signature as Signature;

    // Guarda expiry en segundos si viene del raw
    const expNum =
      typeof (raw.order as unknown as { expiry?: unknown })?.expiry === 'number'
        ? (raw.order as unknown as { expiry: number }).expiry
        : Number((raw.order as unknown as { expiry?: unknown })?.expiry ?? 0);

    if (Number.isFinite(expNum) && expNum > 0) {
      hit.expirySec = expNum;
    }

    return true;
  }

  public hydrateLevel(
    symbol: string,
    p: {
      orderHash: string;
      maker: string;
      side: Side;
      priceTicks: bigint;
      sizeBase: bigint;
      expirySec?: number;
    },
  ): void {
    const b = this.book(symbol);
    const target = p.orderHash.toLowerCase();

    // idempotencia: elimina si ya estuviera
    b.bids = b.bids.filter((o) => o.id.toLowerCase() !== target);
    b.asks = b.asks.filter((o) => o.id.toLowerCase() !== target);

    const o: Order = {
      id: p.orderHash,
      maker: p.maker.toLowerCase(),
      side: p.side,
      priceTicks: p.priceTicks,
      sizeBase: p.sizeBase,
      ts: Date.now(),
      ...(p.expirySec && p.expirySec > 0 ? { expirySec: p.expirySec } : {}),
    };

    if (o.side === 'BUY') {
      b.bids.push(o);
      sortBids(b.bids);
    } else {
      b.asks.push(o);
      sortAsks(b.asks);
    }
  }

  async applyExternalFill(
    marketIdOrSymbol: string,
    orderHash: string,
    execBase: bigint,
    opts?: { taker?: `0x${string}`; priceTicks?: bigint },
  ): Promise<{ status: 'partial' | 'filled' | 'db_only' | 'not_found' }> {
    const ctx = await this.repo.getTradingContext(marketIdOrSymbol);
    const bookKey = ctx.symbol;
    const b = this.books.get(bookKey);

    const target = orderHash.toLowerCase();

    //const takerLower = (opts?.taker ?? ZERO_ADDR).toLowerCase();

    // 🔍 DEBUG: log de trazas para saber cuántas veces entra
    console.log(
      '[applyExternalFill]',
      'symbol=',
      bookKey,
      'orderHash=',
      target,
      'execBase=',
      execBase.toString(),
      'taker=',
      (opts?.taker ?? ZERO_ADDR).toLowerCase(),
      'hasBook=',
      !!b,
    );

    // ¿tenemos el nivel en memoria?
    const level =
      b?.bids.find((o) => o.id.toLowerCase() === target) ??
      b?.asks.find((o) => o.id.toLowerCase() === target) ??
      null;

    if (!level) {
      // DB-only (p.ej. tras reinicio y aún no rehidratado ese order)
      const rem = await this.repo.getOrderRemaining(orderHash);
      if (rem == null) return { status: 'not_found' };

      // Captura el core ANTES de cambiar estado a PARTIALLY_FILLED (listPlacedBySymbol filtra por PLACED)
      const prePlaced = await this.repo.listPlacedBySymbol(ctx.symbol);
      const core = prePlaced.find((p) => p.orderHash.toLowerCase() === target);

      const exec: bigint = execBase > rem ? rem : execBase;
      const filledAll: boolean = exec >= rem;

      await this.repo.decreaseOrderRemaining(
        orderHash,
        exec,
        (filledAll
          ? OrderStatus.FILLED
          : OrderStatus.PARTIALLY_FILLED) as OrderStatus,
      );

      // Si no se llenó por completo y tenemos los datos del order, rehidrata el LOB con el remanente
      if (!filledAll && core) {
        const newRem: bigint = rem - exec; // > 0n garantizado en esta rama
        this.hydrateLevel(ctx.symbol, {
          orderHash,
          maker: core.maker,
          side: core.side as Side, // 'BUY' | 'SELL'
          priceTicks: core.priceTicks,
          sizeBase: newRem,
        });
      }

      return { status: 'db_only' };
    }

    // memoria + DB coherentes
    const exec = execBase > level.sizeBase ? level.sizeBase : execBase;

    level.sizeBase -= exec;

    const newStatus = level.sizeBase > 0n ? 'PARTIALLY_FILLED' : 'FILLED';

    await this.repo.decreaseOrderRemaining(
      orderHash,
      exec,
      newStatus as OrderStatus,
    );

    if (level.sizeBase === 0n && b) {
      // retira del libro
      b.bids = b.bids.filter((o) => o.id.toLowerCase() !== target);
      b.asks = b.asks.filter((o) => o.id.toLowerCase() !== target);
    }

    return { status: level.sizeBase > 0n ? 'partial' : 'filled' };
  }

  /** Elimina del LOB todas las órdenes cuyo expirySec <= nowSec.
   *  Persiste como cancel en BD (si quieres distinguir, luego podemos añadir expire específico).
   */
  async sweepExpired(
    nowSec: number = Math.floor(Date.now() / 1000),
  ): Promise<number> {
    let removedCount = 0;

    for (const [bookKey, b] of this.books.entries()) {
      // separa vivos/expirados en bids
      const aliveBids: Order[] = [];
      const expiredBids: Order[] = [];
      for (const o of b.bids) {
        if (o.expirySec && o.expirySec > 0 && o.expirySec <= nowSec) {
          expiredBids.push(o);
        } else {
          aliveBids.push(o);
        }
      }
      // separa vivos/expirados en asks
      const aliveAsks: Order[] = [];
      const expiredAsks: Order[] = [];
      for (const o of b.asks) {
        if (o.expirySec && o.expirySec > 0 && o.expirySec <= nowSec) {
          expiredAsks.push(o);
        } else {
          aliveAsks.push(o);
        }
      }

      if (expiredBids.length === 0 && expiredAsks.length === 0) continue;

      // aplica
      b.bids = aliveBids;
      b.asks = aliveAsks;

      // persiste como cancelado (si tu repo tiene expireOrder podemos cambiarlo luego)
      const ctx = await this.repo.getTradingContext(bookKey);
      for (const o of [...expiredBids, ...expiredAsks]) {
        await this.repo.expireOrder(ctx.id, o.id); // ← mínimamente intrusivo
        removedCount++;
      }
    }

    return removedCount;
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
    let takerFeeTotal = 0n;

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

      // fee por fill (en takerToken). Si el rawOrder está adjunto, usa su takerTokenFeeAmount prorrateado.
      // Si no, calcula por política (TAKER_FEE_BPS) sobre el "taker side amount" del fill.
      let feePart = 0n;

      // helper local seguro
      const toBig = (v: unknown): bigint => {
        if (typeof v === 'bigint') return v;
        if (typeof v === 'number') return BigInt(v);
        if (typeof v === 'string') return BigInt(v);
        return 0n;
      };

      if (
        level.rawOrder &&
        typeof level.rawOrder.takerTokenFeeAmount !== 'undefined'
      ) {
        try {
          const makerAmt = toBig(level.rawOrder.makerAmount);
          const takerFeeFull = toBig(level.rawOrder.takerTokenFeeAmount); // fee del 100% del order
          // prorratea por exec/makerAmt
          feePart = makerAmt > 0n ? (takerFeeFull * exec) / makerAmt : 0n;
        } catch {
          feePart = 0n;
        }
      } else if (TAKER_FEE_BPS > 0) {
        // si BUY, el "taker side" son unidades de QUOTE (notionalQ)
        // si SELL, el "taker side" son unidades de BASE (exec)
        const takerSideAmt = q.side === 'BUY' ? notionalQ : exec;
        feePart = (takerSideAmt * BigInt(TAKER_FEE_BPS)) / 10000n;
      }
      takerFeeTotal += feePart; // <- (asegúrate de sumar fuera de las ramas como en tu retorno)

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
      takerFeeAmount: takerFeeTotal.toString(),
      takerTotalAmount: (takerTotalQ + takerFeeTotal).toString(),
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

  // Devuelve el payload crudo que se adjuntó con attachRaw(...)
  // Lee del mismo in-memory LOB (sin duplicar estado).
  public async getRaw(
    marketIdOrSymbol: string,
    orderHash: string,
  ): Promise<RawAttached | null> {
    // Resuelve el símbolo canónico (acepta id o symbol)
    const ctx = await this.repo.getTradingContext(marketIdOrSymbol);
    const bookKey = ctx.symbol;

    const b = this.books.get(bookKey);
    if (!b) return null;

    const target = orderHash.toLowerCase();
    const hit =
      b.bids.find((o) => o.id.toLowerCase() === target) ??
      b.asks.find((o) => o.id.toLowerCase() === target);

    if (!hit || !hit.rawOrder || !hit.rawSig) return null;

    return { order: hit.rawOrder, signature: hit.rawSig };
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
  /**
   * Clears all in-memory order books. Useful for testing to ensure a clean state between tests.
   */
  clear(): void {
    this.books.clear();
  }
}
