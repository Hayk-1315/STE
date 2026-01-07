// apps/api/src/matching/expiry-sweeper.service.ts
import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { OrderBookService } from './orderbook.service';

@Injectable()
export class ExpirySweeperService implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger('ExpirySweeper');
  private timer?: ReturnType<typeof setInterval>;
  private readonly enabled: boolean;
  private readonly intervalMs: number;

  constructor(private readonly ob: OrderBookService) {
    this.enabled = (process.env.DEV_EXPIRY_SWEEPER ?? '1') === '1'; // por defecto ON en dev
    const raw = Number(process.env.EXPIRY_SWEEPER_INTERVAL_MS ?? 5000);
    this.intervalMs = Number.isFinite(raw) && raw > 500 ? raw : 5000;
  }

  onModuleInit(): void {
    if (!this.enabled) {
      this.log.log('disabled (DEV_EXPIRY_SWEEPER!=1)');
      return;
    }
    this.timer = setInterval(() => {
      this.ob
        .sweepExpired()
        .then((n) => {
          if (n > 0) this.log.log(`purged ${n} expired orders`);
        })
        .catch((e) => {
          this.log.error(e instanceof Error ? e.message : String(e));
        });
    }, this.intervalMs);
    this.log.log(`started interval ${this.intervalMs}ms`);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }
}
