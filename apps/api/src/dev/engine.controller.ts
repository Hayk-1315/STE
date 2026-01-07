// apps/api/src/dev/engine.controller.ts
// Dev-only endpoints que llaman al OrderBookService real (MatchingModule)

import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { OrderBookService, Side } from '../matching/orderbook.service';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { PersistenceRepository } from '../matching/persistence.repository';
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

function requireFields(obj: Record<string, unknown>, fields: string[]) {
  const missing = fields.filter(
    (f) => obj[f] === undefined || obj[f] === null || obj[f] === '',
  );
  if (missing.length)
    throw new BadRequestException(`Missing: ${missing.join(', ')}`);
}

const prisma = new PrismaClient();
const DEV_TAKER = '0x000000000000000000000000000000000000dEaD' as const;

// --- helpers de parseo seguro (sin any) ---
type ParsedFill = {
  makerOrderHash: string;
  priceTicks: bigint;
  sizeBase: bigint;
};

function toBigOrNull(v: unknown): bigint | null {
  if (typeof v === 'bigint') return v;
  if (typeof v === 'number' && Number.isFinite(v)) return BigInt(v);
  if (typeof v === 'string' && v.trim() !== '') {
    try {
      return BigInt(v);
    } catch {
      return null;
    }
  }
  return null;
}

/** Extrae fills del resultado de ob.market(...) sin acceder a `any`. */
function parseFills(res: unknown): ParsedFill[] {
  const out: ParsedFill[] = [];
  const obj =
    typeof res === 'object' && res !== null
      ? (res as Record<string, unknown>)
      : null;

  const arr: unknown[] =
    obj && Array.isArray(obj['fills']) ? (obj['fills'] as unknown[]) : [];
  for (const item of arr) {
    const r =
      typeof item === 'object' && item !== null
        ? (item as Record<string, unknown>)
        : null;
    if (!r) continue;

    const h =
      typeof r['makerOrderHash'] === 'string' ? r['makerOrderHash'] : '';
    const pt = toBigOrNull(r['priceTicks']);
    const sb = toBigOrNull(r['sizeBase']);

    if (h && pt !== null && sb !== null) {
      out.push({ makerOrderHash: h, priceTicks: pt, sizeBase: sb });
    }
  }
  return out;
}

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

    // 1) Ejecutar en el motor en memoria
    const res = await this.ob.market({
      marketId: b.marketId,
      side: side as Side,
      sizeBase: BigInt(b.sizeBase),
    });

    // 2) Persistir efectos (trades + remaining/status) para que "My Orders (live)" sobreviva a reload
    try {
      const fills = parseFills(res); // ← tipado seguro

      for (const f of fills) {
        if (f.sizeBase <= 0n) continue;

        // trade
        await this.repo.addTrade(
          b.marketId,
          f.makerOrderHash,
          DEV_TAKER, // taker simulado en dev
          f.priceTicks,
          f.sizeBase,
        );

        // status (PARTIALLY_FILLED vs FILLED)
        const row = await prisma.order.findUnique({
          where: { orderHash: f.makerOrderHash },
          select: { remainingBase: true },
        });
        const remBefore = row?.remainingBase
          ? BigInt(row.remainingBase.toString())
          : 0n;
        const remAfter = remBefore > f.sizeBase ? remBefore - f.sizeBase : 0n;
        const newStatus =
          remAfter > 0n ? OrderStatus.PARTIALLY_FILLED : OrderStatus.FILLED;

        await this.repo.decreaseOrderRemaining(
          f.makerOrderHash,
          f.sizeBase,
          newStatus,
        );
      }
    } catch {
      // en dev no reventamos la respuesta si algo de persistencia falla
    }

    return res;
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
