// apps/api/src/sea/intent-event.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient, type Prisma, IntentEventType } from '@prisma/client';

@Injectable()
export class IntentEventRepository {
  private prisma = new PrismaClient();

  async append(
    intentId: string,
    type: IntentEventType,
    payload?: Prisma.InputJsonValue,
  ): Promise<void> {
    await this.prisma.intentEvent.create({
      data: {
        intentId,
        type,
        ...(payload !== undefined ? { payload } : {}),
      },
    });
  }
}
