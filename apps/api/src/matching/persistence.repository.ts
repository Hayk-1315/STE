// apps/api/src/matching/persistence.repository.ts
import { Injectable } from '@nestjs/common';
import {
  PrismaClient,
  Prisma,
  OrderStatus,
  OrderSide,
  EventType,
} from '@prisma/client';

@Injectable()
export class PersistenceRepository {
  private prisma = new PrismaClient();

  async getTradingContext(key: string) {
    let m = await this.prisma.market.findUnique({
      where: { id: key },
      include: { baseToken: true, quoteToken: true },
    });
    if (!m) {
      m = await this.prisma.market.findUnique({
        where: { symbol: key },
        include: { baseToken: true, quoteToken: true },
      });
    }
    if (!m) throw new Error('market_not_found');

    return {
      id: m.id, // <-- ID CANÓNICO
      baseDecimals: m.baseToken.decimals,
      quoteDecimals: m.quoteToken.decimals,
      minNotionalQ: BigInt(m.minNotionalQ.toString()),
      minSizeB: BigInt(m.minSizeB.toString()),
      priceTickQ: BigInt(m.priceTickQ.toString()),
    };
  }

  // list id+symbol for debuging purposes
  async listMarketsBasic() {
    return this.prisma.market.findMany({ select: { id: true, symbol: true } });
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
  }

  async addTrade(
    marketId: string,
    makerOrderHash: string,
    taker: string,
    priceTicks: bigint,
    sizeBase: bigint,
  ) {
    await this.prisma.trade.create({
      data: {
        marketId,
        makerOrderHash,
        taker: taker.toLowerCase(),
        priceTicks,
        sizeBase: this.D(sizeBase),
      },
    });
  }

  async decreaseOrderRemaining(
    orderHash: string,
    execSizeBase: bigint,
    newStatus: OrderStatus,
  ) {
    await this.prisma.order.update({
      where: { orderHash },
      data: {
        remainingBase: { decrement: this.D(execSizeBase) },
        status: newStatus,
      },
    });
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
    await this.prisma.order.update({
      where: { orderHash },
      data: { status: OrderStatus.CANCELLED },
    });
    await this.prisma.orderEvent.create({
      data: {
        marketId,
        orderHash,
        type: EventType.CANCELLED,
        payload: Prisma.JsonNull,
      },
    });
  }
}
