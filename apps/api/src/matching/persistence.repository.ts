// apps/api/src/matching/persistence.repository.ts
import { Injectable } from '@nestjs/common';
import { PublicWsGateway } from '../public/public.ws';
import {
  PrismaClient,
  Prisma,
  OrderStatus,
  OrderSide,
  EventType,
} from '@prisma/client';
import type { LimitOrder, Signature } from '../zeroex/limit-order.types';
import { metrics } from '../infra/metrics';

type MarketBasic = {
  id: string;
  symbol: string;
  baseAddress: string;
  quoteAddress: string;
};

type TradingContext = {
  id: string;
  symbol: string;
  baseDecimals: number;
  quoteDecimals: number;
  minNotionalQ: bigint;
  minSizeB: bigint;
  priceTickQ: bigint;
  baseAddress: string;
  quoteAddress: string;
};

export type OrderListItem = {
  id: string;
  symbol: string;
  maker: string;
  status: OrderStatus;
  priceTicks: string;
  sizeBase: string;
  remainingBase: string;
  ts: string;
};
export type OrdersListResponse = {
  items: OrderListItem[];
  nextCursor?: { id: string };
};

@Injectable()
export class PersistenceRepository {
  private prisma = new PrismaClient();
  constructor(private readonly ws: PublicWsGateway) {}
  private emitOrderEvent(makerLower: string, payload: unknown) {
    this.ws.emitOrderEvent(makerLower, payload);
  }
  getSymbolSync: any;

  async expireOrder(marketId: string, orderHash: string) {
    const upd = await this.prisma.order.update({
      where: { orderHash },
      data: { status: OrderStatus.EXPIRED },
      select: { maker: true, market: { select: { symbol: true } } },
    });

    await this.prisma.orderEvent.create({
      data: {
        marketId,
        orderHash,
        type: EventType.EXPIRED,
        payload: Prisma.JsonNull,
      },
    });

    // Emitimos un WS específico "expired" al maker
    this.emitOrderEvent(upd.maker.toLowerCase(), {
      type: 'expired',
      orderHash,
      symbol: upd.market.symbol,
      ts: new Date().toISOString(),
    });
    metrics.inc('expired');
  }

  // apps/api/src/matching/persistence.repository.ts (dentro de class PersistenceRepository)
  async getOrderRemaining(orderHash: string): Promise<bigint | null> {
    const row = await this.prisma.order.findUnique({
      where: { orderHash },
      select: { remainingBase: true },
    });
    return row ? BigInt(row.remainingBase.toString()) : null;
  }

  async findPlacedOrderCore(orderHash: string): Promise<{
    symbol: string;
    maker: string;
    side: OrderSide;
    priceTicks: bigint;
    remainingBase: bigint;
  } | null> {
    const row = await this.prisma.order.findUnique({
      where: { orderHash },
      select: {
        status: true,
        maker: true,
        side: true,
        priceTicks: true,
        remainingBase: true,
        market: { select: { symbol: true } },
      },
    });
    if (!row || row.status !== OrderStatus.PLACED) return null;
    return {
      symbol: row.market.symbol,
      maker: row.maker,
      side: row.side,
      priceTicks: BigInt(row.priceTicks.toString()),
      remainingBase: BigInt(row.remainingBase.toString()),
    };
  }

  async listPlacedBySymbol(symbol: string): Promise<
    Array<{
      orderHash: string;
      maker: string;
      side: OrderSide;
      priceTicks: bigint;
      remainingBase: bigint;
    }>
  > {
    const rows = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.PLACED,
        market: { symbol },
        remainingBase: { gt: new Prisma.Decimal(0) },
      },
      select: {
        orderHash: true,
        maker: true,
        side: true,
        priceTicks: true,
        remainingBase: true,
      },
      orderBy: [{ placedAt: 'asc' }, { orderHash: 'asc' }],
      take: 10000,
    });

    return rows.map((r) => ({
      orderHash: r.orderHash,
      maker: r.maker,
      side: r.side,
      priceTicks: BigInt(r.priceTicks.toString()),
      remainingBase: BigInt(r.remainingBase.toString()),
    }));
  }

  async sumOpenBaseByMakerSymbol(
    maker: string,
    symbol: string,
  ): Promise<bigint> {
    const agg = await this.prisma.order.aggregate({
      _sum: { remainingBase: true },
      where: {
        maker: maker.trim().toLowerCase(),
        market: { symbol },
        status: { in: [OrderStatus.PLACED, OrderStatus.PARTIALLY_FILLED] },
      },
    });

    const s = agg._sum.remainingBase as unknown;
    // Prisma.Decimal | null → bigint
    return s ? BigInt((s as { toString(): string }).toString()) : 0n;
  }

  async getTradingContext(marketOrSymbol: string): Promise<TradingContext> {
    const m = await this.prisma.market.findFirst({
      where: { OR: [{ id: marketOrSymbol }, { symbol: marketOrSymbol }] },
      include: { baseToken: true, quoteToken: true },
    });
    if (!m) throw new Error('market_not_found');

    return {
      id: m.id,
      symbol: m.symbol,
      baseDecimals: m.baseToken.decimals,
      quoteDecimals: m.quoteToken.decimals,
      minNotionalQ: BigInt(m.minNotionalQ.toString()),
      minSizeB: BigInt(m.minSizeB.toString()),
      priceTickQ: BigInt(m.priceTickQ.toString()),
      baseAddress: m.baseToken.address.toLowerCase(),
      quoteAddress: m.quoteToken.address.toLowerCase(),
    };
  }

  // list id+symbol for debuging purposes
  async listMarketsBasic(): Promise<MarketBasic[]> {
    const rows = await this.prisma.market.findMany({
      select: {
        id: true,
        symbol: true,
        baseToken: { select: { address: true } },
        quoteToken: { select: { address: true } },
      },
    });

    return rows.map((r) => ({
      id: r.id,
      symbol: r.symbol,
      baseAddress: r.baseToken.address.toLowerCase(),
      quoteAddress: r.quoteToken.address.toLowerCase(),
    }));
  }

  async findOrders(params: {
    maker?: string;
    status?: OrderStatus[];
    symbol?: string;
    limit?: number;
    cursorId?: string; // orderHash para paginación
  }): Promise<OrdersListResponse> {
    const makerLower = params.maker
      ? params.maker.trim().toLowerCase()
      : undefined;
    const limit = Math.max(1, Math.min(params.limit ?? 50, 200));

    // where dinámico
    const where: Prisma.OrderWhereInput = {};
    if (makerLower) where.maker = makerLower;
    if (params.status && params.status.length > 0)
      where.status = { in: params.status };
    if (params.symbol) where.market = { symbol: params.symbol };

    // 1) select fuertemente tipado
    const orderSelect = Prisma.validator<Prisma.OrderSelect>()({
      orderHash: true,
      maker: true,
      status: true,
      priceTicks: true,
      sizeBase: true,
      remainingBase: true,
      placedAt: true,
      market: { select: { symbol: true } },
    });

    type OrderRow = Prisma.OrderGetPayload<{ select: typeof orderSelect }>;

    // 2) findMany con args inline (no uses una var `query` tipada amplio)
    const rows: OrderRow[] = await this.prisma.order.findMany({
      where,
      orderBy: [{ placedAt: 'desc' }, { orderHash: 'desc' }],
      take: limit,
      select: orderSelect,
      ...(params.cursorId
        ? { cursor: { orderHash: params.cursorId }, skip: 1 }
        : {}),
    });

    const items: OrderListItem[] = rows.map((r) => ({
      id: r.orderHash,
      symbol: r.market.symbol, // <- ahora es string tipado
      maker: r.maker,
      status: r.status,
      priceTicks: r.priceTicks.toString(),
      sizeBase: r.sizeBase.toString(),
      remainingBase: r.remainingBase.toString(),
      ts: r.placedAt.toISOString(),
    }));

    const nextCursor =
      rows.length === limit
        ? { id: rows[rows.length - 1].orderHash }
        : undefined;

    return { items, nextCursor };
  }

  private D(x: bigint | number | string): Prisma.Decimal {
    return new Prisma.Decimal(x.toString());
  }

  async upsertOrderPlaced(p: {
    orderHash: string;
    marketId: string;
    maker: string;
    side: OrderSide;
    priceTicks: bigint;
    sizeBase: bigint;
  }) {
    await this.prisma.order.upsert({
      where: { orderHash: p.orderHash },
      update: { status: OrderStatus.PLACED },
      create: {
        orderHash: p.orderHash,
        marketId: p.marketId,
        maker: p.maker.toLowerCase(),
        side: p.side,
        priceTicks: p.priceTicks,
        sizeBase: this.D(p.sizeBase),
        remainingBase: this.D(p.sizeBase),
        status: OrderStatus.PLACED,
        expiry: 0n, // placeholder F2
        salt: '',
        zeroExOrder: Prisma.JsonNull, // placeholder F2
        signature: Buffer.alloc(0),
      },
    });
    await this.prisma.orderEvent.create({
      data: {
        marketId: p.marketId,
        orderHash: p.orderHash,
        type: EventType.PLACED,
        payload: {
          side: p.side,
          priceTicks: p.priceTicks.toString(),
          sizeBase: p.sizeBase.toString(),
        } as Prisma.InputJsonValue,
      },
    });

    // Emit "placed" to the maker room (orders:{maker})
    const symRow = await this.prisma.market.findUnique({
      where: { id: p.marketId },
      select: { symbol: true },
    });
    this.emitOrderEvent(p.maker.toLowerCase(), {
      type: 'placed',
      orderHash: p.orderHash,
      symbol: symRow?.symbol ?? 'UNKNOWN',
      priceTicks: p.priceTicks.toString(),
      sizeBase: p.sizeBase.toString(),
      remainingBase: p.sizeBase.toString(),
      ts: new Date().toISOString(),
    });
    metrics.inc('placed');
  }

  async addTrade(
    marketId: string,
    makerOrderHash: string,
    taker: string,
    priceTicks: bigint,
    sizeBase: bigint,
  ) {
    const row = await this.prisma.trade.create({
      data: {
        marketId,
        makerOrderHash,
        taker: taker.toLowerCase(),
        priceTicks,
        sizeBase: this.D(sizeBase),
      },
      select: {
        market: { select: { symbol: true } },
        // 👈 quitamos createdAt: true porque no está en el modelo tipado
      },
    });

    const symbol = row.market.symbol;
    // payload simple y string-friendly para el front
    this.ws.emitTrade(symbol, {
      symbol,
      makerOrderHash,
      taker: taker.toLowerCase(),
      priceTicks: priceTicks.toString(),
      sizeBase: sizeBase.toString(),
      ts: new Date().toISOString(), // 👈 usamos "ahora" como timestamp del trade
    });
  }

  async decreaseOrderRemaining(
    orderHash: string,
    execSizeBase: bigint,
    newStatus: OrderStatus,
  ) {
    const updated = await this.prisma.order.update({
      where: { orderHash },
      data: {
        remainingBase: { decrement: this.D(execSizeBase) },
        status: newStatus,
      },
      select: {
        maker: true,
        remainingBase: true,
        market: { select: { symbol: true } },
      },
    });

    // Emit "partial_fill" or "filled" to the maker room
    this.emitOrderEvent(updated.maker.toLowerCase(), {
      type: newStatus === OrderStatus.FILLED ? 'filled' : 'partial_fill',
      orderHash,
      symbol: updated.market.symbol,
      remainingBase: updated.remainingBase.toString(),
      ts: new Date().toISOString(),
    });
    if (newStatus === OrderStatus.FILLED) metrics.inc('filled');
    else metrics.inc('partial_fill');
  }

  async appendEvent(
    marketId: string,
    orderHash: string,
    type: EventType,
    payload: Prisma.InputJsonValue,
  ) {
    await this.prisma.orderEvent.create({
      data: { marketId, orderHash, type, payload },
    });
  }

  async cancelOrder(marketId: string, orderHash: string) {
    const upd = await this.prisma.order.update({
      where: { orderHash },
      data: { status: OrderStatus.CANCELLED },
      select: { maker: true, market: { select: { symbol: true } } },
    });

    await this.prisma.orderEvent.create({
      data: {
        marketId,
        orderHash,
        type: EventType.CANCELLED,
        payload: Prisma.JsonNull,
      },
    });
    // Emit "cancelled" to the maker room
    this.emitOrderEvent(upd.maker.toLowerCase(), {
      type: 'cancelled',
      orderHash,
      symbol: upd.market.symbol,
      ts: new Date().toISOString(),
    });
    metrics.inc('cancelled');
  }

  /** Bytes → 0x-prefixed hex string */
  private bytesToHex(b: Uint8Array): `0x${string}` {
    let out = '0x';
    for (let i = 0; i < b.length; i++) {
      out += b[i].toString(16).padStart(2, '0');
    }
    return out as `0x${string}`;
  }

  /**
   * Minimal raw fetch for quote → build txData.
   * Returns zeroExOrder + signature for a given orderHash (typed).
   */
  // al final de la clase PersistenceRepository, antes de findRawOrderByHash o junto a él
  async attachRawToOrder(params: {
    orderHash: string;
    order: LimitOrder;
    signature?: Signature | `0x${string}`;
  }) {
    const { orderHash, order, signature } = params;

    // expiry en BD es bigint: normalizamos desde number/string/bigint
    const expRaw = (order as unknown as { expiry?: unknown })?.expiry;
    const expiryBig =
      typeof expRaw === 'number'
        ? BigInt(expRaw)
        : typeof expRaw === 'string'
          ? BigInt(expRaw)
          : typeof expRaw === 'bigint'
            ? expRaw
            : 0n;

    // salt como string (columna existente)
    const saltRaw = (order as unknown as { salt?: unknown })?.salt;
    const saltStr =
      typeof saltRaw === 'string'
        ? saltRaw
        : typeof saltRaw === 'number'
          ? String(saltRaw)
          : typeof saltRaw === 'bigint'
            ? saltRaw.toString()
            : '';

    // signature → bytes si es hex; si no, la dejamos vacía (para cancel no es necesaria)
    const sigBuf =
      typeof signature === 'string' && signature.startsWith('0x')
        ? Buffer.from(signature.slice(2), 'hex')
        : Buffer.alloc(0);

    await this.prisma.order.update({
      where: { orderHash },
      data: {
        zeroExOrder: order as unknown as Prisma.InputJsonValue,
        signature: sigBuf,
        expiry: expiryBig,
        salt: saltStr,
      },
    });
  }

  async findRawOrderByHash(
    orderHash: string,
  ): Promise<{ zeroExOrder: LimitOrder | null; signature: Signature | null }> {
    const row = await this.prisma.order.findUnique({
      where: { orderHash },
      select: { zeroExOrder: true, signature: true },
    });

    // Trata null/undefined como ausencia de orden; si hay valor, típalo como LimitOrder
    const raw = row?.zeroExOrder as unknown;
    const zeroExOrder: LimitOrder | null =
      raw == null ? null : (raw as LimitOrder);

    // signature puede ser Buffer/Uint8Array o string (según el schema/client)
    let signature: Signature | null = null;
    const s = row?.signature as unknown;

    if (typeof s === 'string') {
      const hex = s.startsWith('0x') ? (s as `0x${string}`) : `0x${s}`;
      signature = hex as unknown as Signature;
    } else if (s && typeof (s as { length: number }).length === 'number') {
      // Buffer o Uint8Array
      const hex = this.bytesToHex(s as Uint8Array);
      signature = hex as unknown as Signature;
    }

    return { zeroExOrder, signature };
  }
}
