// apps/api/src/public/public.controller.ts
import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { OrderBookService } from '../matching/orderbook.service';

type OBSource = 'snapshot' | 'live';

type OBLevel = { priceTicks: string; sizeBase: string };
type OBLevelWithTs = OBLevel & { ts?: string };

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

  // ---- helpers ----

  // 1) fecha del primer order "PLACED" que casa ese priceTicks (más antiguo)
  private async attachLevelTs(
    marketId: string,
    levels: OBLevel[],
  ): Promise<OBLevelWithTs[]> {
    const out: OBLevelWithTs[] = [];
    for (const l of levels) {
      const row = await this.prisma.order.findFirst({
        where: {
          marketId,
          status: { in: ['PLACED', 'PARTIALLY_FILLED'] },
          priceTicks: BigInt(l.priceTicks),
          remainingBase: { gt: new Prisma.Decimal(0) },
        },
        orderBy: { placedAt: 'asc' },
        select: { placedAt: true },
      });
      out.push({ ...l, ts: row?.placedAt?.toISOString() });
    }
    return out;
  }

  // 2) snapshot “de emergencia” desde DB si el LOB en memoria está vacío
  private async snapshotFromDb(
    marketId: string,
    depthN: number,
  ): Promise<{ bids: OBLevel[]; asks: OBLevel[] }> {
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
      if (r.side === 'BUY') {
        bidsMap.set(px, (bidsMap.get(px) ?? BigInt(0)) + rem);
      } else {
        asksMap.set(px, (asksMap.get(px) ?? BigInt(0)) + rem);
      }
    }

    const cmpDesc = (a: [string, bigint], b: [string, bigint]) => {
      const ax = BigInt(a[0]);
      const bx = BigInt(b[0]);
      return ax === bx ? 0 : bx > ax ? 1 : -1; // precio desc
    };
    const cmpAsc = (a: [string, bigint], b: [string, bigint]) => {
      const ax = BigInt(a[0]);
      const bx = BigInt(b[0]);
      return ax === bx ? 0 : ax > bx ? 1 : -1; // precio asc
    };

    const bids: OBLevel[] = [...bidsMap.entries()]
      .sort(cmpDesc)
      .slice(0, depthN)
      .map(([priceTicks, size]) => ({
        priceTicks,
        sizeBase: size.toString(),
      }));

    const asks: OBLevel[] = [...asksMap.entries()]
      .sort(cmpAsc)
      .slice(0, depthN)
      .map(([priceTicks, size]) => ({
        priceTicks,
        sizeBase: size.toString(),
      }));

    return { bids, asks };
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

    // marketId para poder anotar fechas
    const m = await this.prisma.market.findUnique({
      where: { symbol },
      select: { id: true },
    });
    if (!m) throw new BadRequestException('market_not_found');

    if (src === 'live') {
      // Siempre desde BD para evitar “fantasmas” tras clear-dev
      const base = await this.snapshotFromDb(m.id, depthN);

      const bids = await this.attachLevelTs(m.id, base.bids ?? []);
      const asks = await this.attachLevelTs(m.id, base.asks ?? []);

      return {
        symbol,
        source: src,
        l2: { bids, asks, ts: new Date().toISOString() },
      };
    }

    // snapshot persistido
    const snap = await this.prisma.bookSnapshot.findFirst({
      where: { marketId: m.id },
      orderBy: { ts: 'desc' },
      select: { ts: true, bids: true, asks: true },
    });

    const raw = snap
      ? {
          bids: (snap.bids as any[]).slice(0, depthN),
          asks: (snap.asks as any[]).slice(0, depthN),
          ts: snap.ts,
        }
      : { bids: [], asks: [], ts: null };

    const bids = await this.attachLevelTs(m.id, raw.bids ?? []);
    const asks = await this.attachLevelTs(m.id, raw.asks ?? []);

    return { symbol, source: src, l2: { bids, asks, ts: raw.ts } };
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
