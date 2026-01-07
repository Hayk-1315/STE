// apps/api/src/public/orders.query.controller.ts
import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PersistenceRepository } from '../matching/persistence.repository';
import type { OrdersListResponse } from '../matching/persistence.repository';

type ListQuery = {
  address?: string;
  status?: string; // csv, e.g. "PLACED,PARTIALLY_FILLED"
  symbol?: string;
  limit?: string;
  cursorId?: string;
};

const parseStatuses = (csv?: string): OrderStatus[] | undefined => {
  if (!csv) return undefined;
  const parts = csv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const valid = new Set([
    'PLACED',
    'PARTIALLY_FILLED',
    'FILLED',
    'CANCELLED',
    'EXPIRED',
  ]);
  const out: OrderStatus[] = [];
  for (const p of parts) {
    if (!valid.has(p)) throw new BadRequestException('invalid_status');
    out.push(p as OrderStatus);
  }
  return out.length ? out : undefined;
};

@Controller()
export class OrdersQueryController {
  constructor(private readonly repo: PersistenceRepository) {}

  @Get('orders')
  async list(@Query() q: ListQuery): Promise<OrdersListResponse> {
    const maker = q.address?.toLowerCase();
    const status = parseStatuses(q.status);
    const symbol = q.symbol;
    const limit = q.limit ? Number(q.limit) : undefined;
    const cursorId = q.cursorId;

    if (!maker && !symbol) {
      throw new BadRequestException('address or symbol is required');
    }

    const res = await this.repo.findOrders({
      maker,
      status,
      symbol,
      limit,
      cursorId,
    });

    return res; // { items, nextCursor? }
  }
}
