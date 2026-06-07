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
import {
  normalizeOrderForJson,
  packedBytesToTuple,
  signatureToTuple,
  tupleToPackedBytes,
  type ZeroExSigTuple,
} from './raw-order.util';
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
    // Phase 4.x-a: optional on-chain tx hash. FillWatcher passes the source
    // transaction hash so SEA reconciliation (Phase 4.x-c) can match a Trade
    // to its CMR intent in O(1) via Trade.txHash. Existing callers
    // (OrderBookService.market, EngineController dev path) omit it and the
    // column stays NULL — keeps the dev/no-watcher behaviour byte-identical.
    txHash?: string,
  ) {
    // Normalise to lowercase only when a well-formed 0x66-char value is
    // supplied; anything else (empty string, malformed) collapses to
    // undefined so Prisma writes NULL rather than a junk value.
    const txHashNorm =
      typeof txHash === 'string' && /^0x[0-9a-fA-F]{64}$/.test(txHash)
        ? txHash.toLowerCase()
        : undefined;

    const row = await this.prisma.trade.create({
      data: {
        marketId,
        makerOrderHash,
        taker: taker.toLowerCase(),
        priceTicks,
        sizeBase: this.D(sizeBase),
        ...(txHashNorm ? { txHash: txHashNorm } : {}),
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

  /**
   * Phase 4.x-b ownership-bound trade lookup.
   *
   * Returns a Trade row ONLY when ALL THREE constraints hold:
   *   - `trade.txHash    === txHash.toLowerCase()`
   *   - `trade.marketId  === marketId`
   *   - `trade.taker     === owner.toLowerCase()`
   *
   * Consumed by `IntentService.markExecuting`'s fast-path A. The single
   * WHERE clause prevents a foreign txHash, a cross-market hash, or a
   * wrong-taker hash from driving a `READY → EXECUTED` transition (only
   * the intent owner's own taker fill against the matched market may
   * shortcut to EXECUTED).
   */
  async findTradeByTxHashForIntent(p: {
    txHash: string;
    marketId: string;
    owner: string;
  }): Promise<{
    id: bigint;
    makerOrderHash: string;
    sizeBase: string;
  } | null> {
    const row = await this.prisma.trade.findFirst({
      where: {
        txHash: p.txHash.toLowerCase(),
        marketId: p.marketId,
        taker: p.owner.toLowerCase(),
      },
      select: { id: true, makerOrderHash: true, sizeBase: true },
    });
    if (!row) return null;
    return {
      id: row.id,
      makerOrderHash: row.makerOrderHash,
      sizeBase: row.sizeBase.toString(),
    };
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
  /**
   * Phase 5 P0 fix: persist raw order JSON + signature for a placed Order.
   *
   * Inputs are strictly validated and normalised:
   * - `signature` accepts a tuple `{signatureType, v, r, s}` OR a 65-byte
   *   0x hex string. Anything else throws — `attachRawToOrder` is now
   *   load-bearing; callers must roll back placement on failure.
   * - `order` may contain bigint primitives in numeric fields (the
   *   IntentFire path produces these); `normalizeOrderForJson` rewrites
   *   them as decimal strings so Prisma's JSON column accepts the value.
   *
   * Signature is packed into 66 bytes `[signatureType:1][r:32][s:32][v:1]`
   * so the on-chain `signatureType` discriminator (EIP712 vs ETHSIGN)
   * round-trips through `findRawOrderByHash` to the tx builder.
   */
  async attachRawToOrder(params: {
    orderHash: string;
    order: LimitOrder | Record<string, unknown>;
    // Accepts a {signatureType,v,r,s} tuple OR a 65-byte 0x hex string; any
    // other shape is rejected at runtime by signatureToTuple (validation
    // unchanged). Typed `unknown` because the prior union collapsed to unknown.
    signature: unknown;
  }) {
    const tuple: ZeroExSigTuple | undefined = signatureToTuple(
      params.signature,
    );
    if (!tuple) {
      throw new Error(
        'attachRawToOrder: signature must be a 65-byte 0x hex string OR a valid (signatureType, v, r, s) tuple with signatureType in {2,3}',
      );
    }
    const sigBuf = tupleToPackedBytes(tuple);

    const normalizedOrder = normalizeOrderForJson(params.order);
    const expiryBig = BigInt(Number(normalizedOrder.expiry));
    const saltStr = String(normalizedOrder.salt);

    await this.prisma.order.update({
      where: { orderHash: params.orderHash },
      data: {
        zeroExOrder: normalizedOrder as unknown as Prisma.InputJsonValue,
        // Prisma's generated Bytes type narrows to `Uint8Array<ArrayBuffer>`;
        // our utility returns a fresh-allocated Uint8Array but TypeScript
        // sees `ArrayBufferLike`. The cast is safe at runtime because we
        // allocated over a non-shared ArrayBuffer in tupleToPackedBytes.
        signature: sigBuf as unknown as Uint8Array<ArrayBuffer>,
        expiry: expiryBig,
        salt: saltStr,
      },
    });
  }

  /**
   * Returns a parsed (signatureType, v, r, s) tuple — directly consumable by
   * `ZeroExTxBuildersService.buildFillLimitOrder`.
   *
   * Legacy rows that pre-date the Phase 5 P0 fix (0-byte or 65-byte
   * `Order.signature` buffers) intentionally return `signature: null` so
   * /match/quote falls through to the existing `missing_raw` branch instead
   * of producing a malformed fill tx that would revert on-chain.
   */
  async findRawOrderByHash(
    orderHash: string,
  ): Promise<{ zeroExOrder: LimitOrder | null; signature: Signature | null }> {
    const row = await this.prisma.order.findUnique({
      where: { orderHash },
      select: { zeroExOrder: true, signature: true },
    });

    const raw = row?.zeroExOrder as unknown;
    const zeroExOrder: LimitOrder | null =
      raw == null ? null : (raw as LimitOrder);

    const sigBuf = row?.signature as Buffer | Uint8Array | null | undefined;
    const tuple = packedBytesToTuple(sigBuf);
    const signature = tuple ? (tuple as unknown as Signature) : null;

    return { zeroExOrder, signature };
  }
}
