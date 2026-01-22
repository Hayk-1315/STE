// apps/api/src/matching/lob-rehydrator.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PersistenceRepository } from './persistence.repository';
import { OrderBookService, type Side } from './orderbook.service';
import type { Signature, LimitOrder } from '../zeroex/limit-order.types';

@Injectable()
export class LobRehydratorService implements OnModuleInit {
  private readonly log = new Logger('LobRehydrator');
  private readonly enabled: boolean;

  constructor(
    private readonly repo: PersistenceRepository,
    private readonly ob: OrderBookService,
  ) {
    // En dev: ON por defecto (puedes controlar con DEV_REHYDRATE_LOB=0)
    this.enabled = (process.env.DEV_REHYDRATE_LOB ?? '1') === '1';
  }

  async onModuleInit(): Promise<void> {
    if (!this.enabled) {
      this.log.log('disabled (DEV_REHYDRATE_LOB!=1)');
      return;
    }

    const markets = await this.repo.listMarketsBasic(); // {id,symbol,...}
    let injected = 0;

    for (const m of markets) {
      const rows = await this.repo.listPlacedBySymbol(m.symbol);
      if (rows.length === 0) continue;

      for (const r of rows) {
        // Mete el nivel en el LOB in-memory (sin persistencia)
        this.ob.hydrateLevel(m.symbol, {
          orderHash: r.orderHash,
          maker: r.maker,
          side: r.side as Side, // 'BUY' | 'SELL'
          priceTicks: r.priceTicks,
          sizeBase: r.remainingBase,
        });
        injected++;

        // Adjunta raw (si existe) para poder construir calldata (y expirySec)
        const raw = await this.repo.findRawOrderByHash(r.orderHash);
        const order: LimitOrder | null = raw.zeroExOrder;
        const sig: Signature | `0x${string}` | null = raw.signature;

        if (order) {
          await this.ob.attachRaw(m.symbol, r.orderHash, {
            order,
            signature: (sig ?? '0x') as Signature | `0x${string}`,
          });
        }
      }
    }

    this.log.log(`rehydrated ${injected} orders into LOB`);
  }
}
