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
import { PrismaClient } from '@prisma/client';
import { Interval } from '@nestjs/schedule';

type SubMsg = { symbol: string };
type OrdersSubMsg = { address: string };

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/' })
@Injectable()
export class PublicWsGateway {
  @WebSocketServer() server!: Server;
  private prisma = new PrismaClient();

  // socketId -> set of symbols
  private subsBySocket = new Map<string, Set<string>>();
  // symbol -> subscriber count
  private refCount = new Map<string, number>();

  @SubscribeMessage('book:subscribe')
  async handleBookSub(
    @MessageBody() body: SubMsg,
    @ConnectedSocket() socket: Socket,
  ) {
    const symbol = (body?.symbol || '').toUpperCase();
    if (!symbol) return;

    // track per-socket
    const set = this.subsBySocket.get(socket.id) ?? new Set<string>();
    set.add(symbol);
    this.subsBySocket.set(socket.id, set);

    // increment refcount
    this.refCount.set(symbol, (this.refCount.get(symbol) ?? 0) + 1);
    await socket.join(`book:${symbol}`);
    socket.emit('book:ack', { symbol, ok: true });
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
    const symbol = (body?.symbol || '').toUpperCase();
    if (!symbol) return;
    const set = this.subsBySocket.get(socket.id);
    if (set?.delete(symbol)) {
      this.refCount.set(
        symbol,
        Math.max(0, (this.refCount.get(symbol) ?? 1) - 1),
      );
      await socket.leave(`book:${symbol}`);
      socket.emit('book:ack', { symbol, ok: false });
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

  // Emit order lifecycle events to a user's room
  emitOrderEvent(makerLower: string, payload: unknown) {
    this.server.to(`orders:${makerLower}`).emit('orders:event', payload);
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
    const active = [...this.refCount.entries()]
      .filter(([, n]) => n > 0)
      .map(([s]) => s);
    if (active.length === 0) return;

    // fetch marketIds for active symbols
    const markets = await this.prisma.market.findMany({
      where: { symbol: { in: active } },
      select: { id: true, symbol: true },
    });
    const bySymbol = new Map(markets.map((m) => [m.symbol, m.id]));

    for (const symbol of active) {
      const id = bySymbol.get(symbol);
      if (!id) continue;

      const snap = await this.prisma.bookSnapshot.findFirst({
        where: { marketId: id },
        orderBy: { ts: 'desc' },
        select: { ts: true, bids: true, asks: true },
      });
      const payload = {
        symbol,
        ts: snap?.ts ?? null,
        bids: (snap?.bids as any[] | undefined) ?? [],
        asks: (snap?.asks as any[] | undefined) ?? [],
      };
      this.server.to(`book:${symbol}`).emit('book', payload);
    }
  }
}
