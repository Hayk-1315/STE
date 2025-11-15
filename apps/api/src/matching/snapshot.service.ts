// Periodic L2 snapshots of each market's book to DB, for recovery and WS fan-out.
// In F3, this will feed the WebSocket gateway.
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient } from '@prisma/client';
import { OrderBookService } from './orderbook.service';

@Injectable()
export class SnapshotService {
  private readonly log = new Logger(SnapshotService.name);
  private readonly prisma = new PrismaClient();

  constructor(private readonly ob: OrderBookService) {}

  @Cron(CronExpression.EVERY_SECOND)
  async tick() {
    const markets = await this.prisma.market.findMany({
      select: { id: true, symbol: true },
    });
    if (markets.length === 0) return;

    for (const m of markets) {
      const s = this.ob.snapshot(m.symbol, 25); // <-- símbolo para el LOB
      // Guardamos el snapshot referenciando el ID de DB (FK correcta)
      await this.prisma.bookSnapshot.create({
        data: { marketId: m.id, bids: s.bids, asks: s.asks },
      });
    }
  }
}
