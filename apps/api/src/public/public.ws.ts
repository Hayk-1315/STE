// apps/api/src/public/public.ws.ts
import { Injectable } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { PrismaClient, Prisma } from '@prisma/client';
import { Interval } from '@nestjs/schedule';
import { MetricsService } from '../observability/metrics.service';

type SubMsg = { symbol: string };
type OrdersSubMsg = { address: string };

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/' })
@Injectable()
export class PublicWsGateway {
  @WebSocketServer() server!: Server;
  private prisma = new PrismaClient();
  constructor(private readonly metrics: MetricsService) {}

  // socketId -> set of CANONICAL symbols
  private subsBySocket = new Map<string, Set<string>>();
  // CANONICAL symbol -> subscriber count (orderbook)
  private refCount = new Map<string, number>();

  // ⬇️ NUEVO: refcount opcional para trades por símbolo
  private tradesRefCount = new Map<string, number>();

  // --- helpers: resolver símbolo canónico (case-insensitive) ---
  private async resolveCanonicalSymbol(raw: string): Promise<string | null> {
    const s = (raw ?? '').trim();
    if (!s) return null;
    const m = await this.prisma.market.findFirst({
      where: { symbol: { equals: s, mode: 'insensitive' } },
      select: { symbol: true },
    });
    return m?.symbol ?? null;
  }

  @SubscribeMessage('book:subscribe')
  async handleBookSub(
    @MessageBody() body: SubMsg,
    @ConnectedSocket() socket: Socket,
  ) {
    const canonical = await this.resolveCanonicalSymbol(body?.symbol ?? '');
    if (!canonical) return;

    // track per-socket
    const set = this.subsBySocket.get(socket.id) ?? new Set<string>();
    set.add(canonical);
    this.subsBySocket.set(socket.id, set);

    // increment refcount y unirse al room canónico
    this.refCount.set(canonical, (this.refCount.get(canonical) ?? 0) + 1);
    await socket.join(`book:${canonical}`);
    socket.emit('book:ack', { symbol: canonical, ok: true });
  }

  @SubscribeMessage('orders:subscribe')
  async handleOrdersSub(
    @MessageBody() body: OrdersSubMsg,
    @ConnectedSocket() socket: Socket,
  ) {
    const addr = (body?.address ?? '').toString().trim().toLowerCase();
    if (!addr) return;
    await socket.join(`orders:${addr}`);
    socket.emit('orders:subscribed', { address: addr });
  }

  @SubscribeMessage('book:unsubscribe')
  async handleBookUnsub(
    @MessageBody() body: SubMsg,
    @ConnectedSocket() socket: Socket,
  ) {
    const canonical = await this.resolveCanonicalSymbol(body?.symbol ?? '');
    if (!canonical) return;

    const set = this.subsBySocket.get(socket.id);
    if (set?.delete(canonical)) {
      this.refCount.set(
        canonical,
        Math.max(0, (this.refCount.get(canonical) ?? 1) - 1),
      );
      await socket.leave(`book:${canonical}`);
      socket.emit('book:ack', { symbol: canonical, ok: false });
    }
  }

  @SubscribeMessage('orders:unsubscribe')
  async handleOrdersUnsub(
    @MessageBody() body: OrdersSubMsg,
    @ConnectedSocket() socket: Socket,
  ) {
    const addr = (body?.address ?? '').toString().trim().toLowerCase();
    if (!addr) return;
    await socket.leave(`orders:${addr}`);
    socket.emit('orders:unsubscribed', { address: addr });
  }

  // ====== NUEVO: trades.subscribe / trades.unsubscribe ======

  @SubscribeMessage('trades:subscribe')
  async handleTradesSub(
    @MessageBody() body: SubMsg,
    @ConnectedSocket() socket: Socket,
  ) {
    const canonical = await this.resolveCanonicalSymbol(body?.symbol ?? '');
    if (!canonical) return;

    // refcount opcional por símbolo (para métricas, si quieres usarlo después)
    this.tradesRefCount.set(
      canonical,
      (this.tradesRefCount.get(canonical) ?? 0) + 1,
    );

    // unirse al room trades:{symbol}
    await socket.join(`trades:${canonical}`);
    socket.emit('trades:subscribed', { symbol: canonical });

    // backfill: últimos N trades
    const N = 50;
    const rows = await this.prisma.trade.findMany({
      where: { market: { symbol: canonical } },
      select: {
        makerOrderHash: true,
        taker: true,
        priceTicks: true,
        sizeBase: true,
        // 👈 quitamos createdAt porque no existe en el modelo tipado
      },
      // 👈 quitamos orderBy: { createdAt: 'desc' } por el mismo motivo
      take: N,
    });

    // Generamos un ts sintético pero consistente (orden cronológico por índice)
    const now = Date.now();
    const items = rows.map((r, idx) => ({
      makerOrderHash: r.makerOrderHash,
      taker: r.taker,
      priceTicks: r.priceTicks.toString(),
      sizeBase: r.sizeBase.toString(),
      ts: new Date(
        now - (rows.length - idx - 1) * 1000, // 1s de separación entre cada trade "histórico"
      ).toISOString(),
    }));

    socket.emit('trades:init', { symbol: canonical, items });
  }

  @SubscribeMessage('trades:unsubscribe')
  async handleTradesUnsub(
    @MessageBody() body: SubMsg,
    @ConnectedSocket() socket: Socket,
  ) {
    const canonical = await this.resolveCanonicalSymbol(body?.symbol ?? '');
    if (!canonical) return;

    this.tradesRefCount.set(
      canonical,
      Math.max(0, (this.tradesRefCount.get(canonical) ?? 1) - 1),
    );
    await socket.leave(`trades:${canonical}`);
    socket.emit('trades:unsubscribed', { symbol: canonical });
  }

  // ====== NUEVO: emisor para un trade puntual (realtime) ======
  emitTrade(symbol: string, payload: unknown) {
    const room = `trades:${symbol}`;
    this.server.to(room).emit('trades', payload);
    this.metrics.wsBroadcasts.inc();
  }

  // Emit order lifecycle events to a user's room
  emitOrderEvent(makerLower: string, payload: unknown) {
    const addr = makerLower.toLowerCase();
    const room = `orders:${addr}`;
    this.server.to(room).emit(room, payload);
    this.server.to(room).emit('orders', payload);
  }

  async handleDisconnect(socket: Socket) {
    const set = this.subsBySocket.get(socket.id);
    if (set) {
      for (const symbol of set) {
        this.refCount.set(
          symbol,
          Math.max(0, (this.refCount.get(symbol) ?? 1) - 1),
        );
        await socket.leave(`book:${symbol}`);
      }
      this.subsBySocket.delete(socket.id);
    }
  }

  // Broadcast loop (~1s): send latest snapshot per subscribed symbol
  @Interval(1000)
  async tick() {
    const t0 = Date.now();
    const active = [...this.refCount.entries()]
      .filter(([, n]) => n > 0)
      .map(([s]) => s);
    this.metrics.booksActive.set(active.length);
    // si mantienes un recuento total de subs (p.ej. sumando refCount), setéalo:
    const subsTotal = [...this.refCount.values()].reduce(
      (a, b) => a + (b || 0),
      0,
    );
    this.metrics.wsSubscribers.set(subsTotal);
    if (active.length === 0) return;

    // fetch marketIds for active CANONICAL symbols
    const markets = await this.prisma.market.findMany({
      where: { symbol: { in: active } },
      select: { id: true, symbol: true },
    });
    const bySymbol = new Map(markets.map((m) => [m.symbol, m.id]));

    // snapshot directo desde `order` (PLACED + remaining > 0) → siempre fresco
    const snapshotFromDb = async (marketId: string) => {
      const rows = await this.prisma.order.findMany({
        where: {
          marketId,
          status: { in: ['PLACED', 'PARTIALLY_FILLED'] },
          remainingBase: { gt: new Prisma.Decimal(0) },
        },
        select: { side: true, priceTicks: true, remainingBase: true },
      });

      const bidsMap = new Map<string, bigint>();
      const asksMap = new Map<string, bigint>();
      for (const r of rows) {
        const px = r.priceTicks.toString();
        const rem = BigInt(r.remainingBase.toString());
        if (r.side === 'BUY') bidsMap.set(px, (bidsMap.get(px) ?? 0n) + rem);
        else asksMap.set(px, (asksMap.get(px) ?? 0n) + rem);
      }

      const bids = [...bidsMap.entries()]
        .sort((a, b) => {
          const ax = BigInt(a[0]),
            bx = BigInt(b[0]);
          return ax === bx ? 0 : bx > ax ? 1 : -1;
        })
        .slice(0, 25)
        .map(([priceTicks, size]) => ({
          priceTicks,
          sizeBase: size.toString(),
        }));

      const asks = [...asksMap.entries()]
        .sort((a, b) => {
          const ax = BigInt(a[0]),
            bx = BigInt(b[0]);
          return ax === bx ? 0 : ax > bx ? 1 : -1;
        })
        .slice(0, 25)
        .map(([priceTicks, size]) => ({
          priceTicks,
          sizeBase: size.toString(),
        }));

      return { bids, asks };
    };

    for (const symbol of active) {
      const id = bySymbol.get(symbol);
      if (!id) continue;

      const fb = await snapshotFromDb(id);
      const payload = {
        symbol,
        ts: new Date(),
        bids: fb.bids,
        asks: fb.asks,
      };

      this.server.to(`book:${symbol}`).emit('book', payload);
      this.metrics.wsBroadcasts.inc();
    }
    this.metrics.wsTickLatency.observe(Date.now() - t0);
  }
}
