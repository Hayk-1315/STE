// apps/api/src/dev/engine.controller.ts
// Dev-only endpoints que llaman al OrderBookService real (MatchingModule)

import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { OrderBookService, Side } from '../matching/orderbook.service';
import { PrismaClient } from '@prisma/client';
import { PersistenceRepository } from '../matching/persistence.repository';
import { BadRequestException } from '@nestjs/common';
import type { DumpBook } from '../matching/orderbook.service';

type PlaceDTO = {
  marketId: string;
  orderHash: string;
  maker: string;
  side: 'BUY' | 'SELL';
  priceTicks: string | number;
  sizeBase: string | number;
};
type MarketDTO = {
  marketId: string;
  side: 'BUY' | 'SELL';
  sizeBase: string | number;
};
type CancelDTO = { marketId: string; orderHash: string };

function requireFields(obj: Record<string, unknown>, fields: string[]) {
  const missing = fields.filter(
    (f) => obj[f] === undefined || obj[f] === null || obj[f] === '',
  );
  if (missing.length)
    throw new BadRequestException(`Missing: ${missing.join(', ')}`);
}

// Shape of /dev/engine/markets output (dev-only)
type MarketOut = {
  id: string;
  symbol: string;
  baseDecimals: number;
  quoteDecimals: number;
  minSizeB_raw: string;
  minSizeB_human: number;
  minNotionalQ_raw: string;
  minNotionalQ_human: number;
  priceTickQ_raw: string;
};

const prisma = new PrismaClient();

@Controller('dev/engine')
export class EngineController {
  constructor(
    private readonly ob: OrderBookService,
    private readonly repo: PersistenceRepository,
  ) {}

  @Get('sanity')
  sanity() {
    // Devolvemos hasta 5 niveles por mercado conocido
    const markets = this.ob.listMarkets().map((m: string) => ({
      marketId: m,
      l2: this.ob.snapshot(m, 5),
    }));
    return { markets };
  }

  @Get('inspect')
  inspect(@Query('symbol') symbol: string): { symbol: string } & DumpBook {
    if (!symbol) {
      throw new BadRequestException('symbol required');
    }
    const out = this.ob.dump(symbol);
    return { symbol: symbol.toUpperCase(), ...out };
  }

  @Post('place')
  async place(@Body() b: PlaceDTO) {
    requireFields(b, [
      'marketId',
      'orderHash',
      'maker',
      'side',
      'priceTicks',
      'sizeBase',
    ]);
    // Body esperado:
    // { marketId, orderHash, maker, side: "BUY"|"SELL", priceTicks, sizeBase }
    const side = String(b.side || '').toUpperCase() === 'SELL' ? 'SELL' : 'BUY';
    return this.ob.place({
      marketId: b.marketId,
      orderHash: b.orderHash,
      maker: b.maker,
      side: side as Side,
      priceTicks: BigInt(b.priceTicks),
      sizeBase: BigInt(b.sizeBase),
    });
  }

  @Post('market')
  async market(@Body() b: MarketDTO) {
    requireFields(b, ['marketId', 'side', 'sizeBase']);
    // Body: { marketId, side: "BUY"|"SELL", sizeBase }
    const side = String(b.side || '').toUpperCase() === 'SELL' ? 'SELL' : 'BUY';
    return this.ob.market({
      marketId: b.marketId,
      side: side as Side,
      sizeBase: BigInt(b.sizeBase),
    });
  }

  @Post('cancel')
  async cancel(@Body() b: CancelDTO) {
    // Body: { marketId, orderHash }
    return this.ob.cancel(b.marketId, b.orderHash);
  }

  // apps/api/src/dev/engine.controller.ts (método snapshot)
  @Get('snapshot')
  async latest(
    @Query('marketId') marketId: string,
    @Query('symbol') symbol?: string,
  ) {
    if (!marketId && !symbol) return { error: 'marketId or symbol required' };

    let whereId = marketId;
    if (!whereId && symbol) {
      const m = await prisma.market.findUnique({
        where: { symbol },
        select: { id: true },
      });
      if (!m) return { error: 'market_not_found' };
      whereId = m.id;
    }

    const snap = await prisma.bookSnapshot.findFirst({
      where: { marketId: whereId },
      orderBy: { ts: 'desc' },
      select: { ts: true, bids: true, asks: true },
    });
    return { marketId: whereId, snapshot: snap ?? null };
  }

  @Get('markets')
  async markets() {
    const list = await this.repo.listMarketsBasic();
    const out: MarketOut[] = [];
    for (const m of list) {
      const ctx = await this.repo.getTradingContext(m.id);
      const toHuman = (raw: bigint, decimals: number) =>
        Number(raw) / Number(BigInt(10) ** BigInt(decimals)); // dev-only view

      out.push({
        id: ctx.id,
        symbol: m.symbol,
        baseDecimals: ctx.baseDecimals,
        quoteDecimals: ctx.quoteDecimals,
        minSizeB_raw: ctx.minSizeB.toString(),
        minSizeB_human: toHuman(ctx.minSizeB, ctx.baseDecimals),
        minNotionalQ_raw: ctx.minNotionalQ.toString(),
        minNotionalQ_human: toHuman(ctx.minNotionalQ, ctx.quoteDecimals),
        priceTickQ_raw: ctx.priceTickQ.toString(),
        // price per 1 base unit = priceTicks * priceTickQ / 10^quoteDecimals
      });
    }
    return out;
  }
}
