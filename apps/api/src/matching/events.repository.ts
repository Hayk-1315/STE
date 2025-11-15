import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma, EventType } from '@prisma/client';

@Injectable()
export class EventsRepository {
  private prisma = new PrismaClient();

  async append(
    marketId: string,
    orderHash: string,
    type: EventType,
    payload: Prisma.InputJsonValue,
  ) {
    await this.prisma.orderEvent.create({
      data: { marketId, orderHash, type, payload },
    });
  }
}
