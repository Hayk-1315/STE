// apps/api/src/public/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ZeroExAddressesService } from '../zeroex/addresses.service';
import { OrderBookService } from '../matching/orderbook.service';
//import { metrics } from '../infra/metrics';
import { JsonRpcProvider } from 'ethers';

@Controller()
export class HealthController {
  private prisma = new PrismaClient();
  private provider?: JsonRpcProvider;

  constructor(
    private readonly addr: ZeroExAddressesService,
    private readonly ob: OrderBookService,
  ) {
    const url = process.env.RPC_URL_READONLY ?? process.env.RPC_URL ?? '';
    if (url) this.provider = new JsonRpcProvider(url);
  }

  /*@Get('healthz')
  healthz() {
    return {
      ok: true as const,
      uptimeSec: metrics.snapshot().uptimeSec,
      env: process.env.NODE_ENV ?? 'development',
    };
  }*/

  @Get('readyz')
  async readyz() {
    const out: {
      ok: boolean;
      db: 'ok' | 'down' | 'unknown';
      provider: 'ok' | 'down' | 'unknown';
      exchangeProxy: `0x${string}`;
      lobMarkets: number;
    } = {
      ok: true,
      db: 'unknown',
      provider: 'unknown',
      exchangeProxy: this.addr.resolve().exchangeProxy as `0x${string}`,
      lobMarkets: this.ob.listMarkets().length,
    };

    // DB ping
    try {
      await this.prisma.$queryRawUnsafe('SELECT 1');
      out.db = 'ok';
    } catch {
      out.db = 'down';
      out.ok = false;
    }

    // Provider ping (opcional)
    if (this.provider) {
      try {
        const p = this.provider.getBlockNumber();
        const res = await Promise.race([
          p,
          new Promise((_, rej) =>
            setTimeout(() => rej(new Error('timeout')), 800),
          ),
        ]);
        if (typeof res === 'number') out.provider = 'ok';
      } catch {
        out.provider = 'down';
        out.ok = false;
      }
    }

    return out;
  }

  /*@Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4')
  metrics() {
    return metrics.toProm();
  }*/
}
