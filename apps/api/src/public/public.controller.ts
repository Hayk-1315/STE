// apps/api/src/public/public.controller.ts
import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { OrderBookService } from '../matching/orderbook.service';

type OBSource = 'snapshot' | 'live';

@Controller()
export class PublicController {
  private prisma = new PrismaClient();
  constructor(private readonly ob: OrderBookService) {}

  // GET /markets
  @Get('markets')
  async markets() {
    const ms = await this.prisma.market.findMany({
      select: {
        id: true,
        symbol: true,
        baseToken: { select: { address: true, symbol: true, decimals: true } },
        quoteToken: { select: { address: true, symbol: true, decimals: true } },
        minNotionalQ: true,
        minSizeB: true,
        priceTickQ: true,
      },
      orderBy: { symbol: 'asc' },
    });
    return ms.map((m) => ({
      id: m.id,
      symbol: m.symbol,
      base: m.baseToken,
      quote: m.quoteToken,
      rules: {
        minNotionalQ: m.minNotionalQ.toString(),
        minSizeB: m.minSizeB.toString(),
        priceTickQ: m.priceTickQ.toString(),
      },
    }));
  }

  // GET /orderbook?symbol=WETH-USDC&depth=25&source=snapshot|live
  @Get('orderbook')
  async orderbook(
    @Query('symbol') symbol?: string,
    @Query('depth') depth?: string,
    @Query('source') source?: OBSource,
  ) {
    if (!symbol) throw new BadRequestException('symbol is required');
    const d = Number.parseInt(depth ?? '25', 10);
    const depthN = Number.isFinite(d) && d > 0 ? d : 25;
    const src: OBSource = source === 'live' ? 'live' : 'snapshot';

    if (src === 'live') {
      const l2 = this.ob.snapshot(symbol, depthN);
      return { symbol, source: src, l2 };
    }

    const m = await this.prisma.market.findUnique({
      where: { symbol },
      select: { id: true },
    });
    if (!m) throw new BadRequestException('market_not_found');

    const snap = await this.prisma.bookSnapshot.findFirst({
      where: { marketId: m.id },
      orderBy: { ts: 'desc' },
      select: { ts: true, bids: true, asks: true },
    });
    const l2 = snap
      ? {
          bids: (snap.bids as any[]).slice(0, depthN),
          asks: (snap.asks as any[]).slice(0, depthN),
          ts: snap.ts,
        }
      : { bids: [], asks: [], ts: null };
    return { symbol, source: src, l2 };
  }

  // GET /trades?symbol=WETH-USDC&limit=50
  @Get('trades')
  async trades(
    @Query('symbol') symbol?: string,
    @Query('limit') limit?: string,
  ) {
    if (!symbol) throw new BadRequestException('symbol is required');
    const m = await this.prisma.market.findUnique({
      where: { symbol },
      select: { id: true },
    });
    if (!m) throw new BadRequestException('market_not_found');

    const l = Number.parseInt(limit ?? '50', 10);
    const lim = Number.isFinite(l) && l > 0 && l <= 500 ? l : 50;

    const rows = await this.prisma.trade.findMany({
      where: { marketId: m.id },
      orderBy: { ts: 'desc' },
      take: lim,
      select: { ts: true, priceTicks: true, sizeBase: true },
    });

    return rows.map((r) => ({
      ts: r.ts,
      priceTicks: r.priceTicks.toString(),
      sizeBase: r.sizeBase.toString(),
    }));
  }
}
