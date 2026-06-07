// apps/api/src/sea/intent-expiry-sweeper.service.ts
//
// Phase 3.x-a: periodically transition DRAFT and ACTIVE intents whose
// `expiresAt` has passed to status EXPIRED, with `failureReason =
// 'intent_expired_by_ts'`. Emits `IntentEvent('EXPIRED', { reason })` per
// affected intent for audit trail consistency.
//
// Mid-execution and terminal statuses are intentionally NOT swept here:
//   - TRIGGERED / READY / EXECUTING are handed off to fire/CMR-prepare
//     reconciliation logic and need their own settlement.
//   - PLACED / EXECUTED / CANCELLED / EXPIRED / FAILED / REJECTED are
//     already terminal.
//
// Default-on (mirrors ExpirySweeperService for orders). Hard-disabled when
// READ_ONLY=true or PROFILE=mainnet — the sweeper only mutates first-party
// app state, but we honor the same gate as the rest of SEA write paths so
// production-like profiles never see surprise transitions until QA.
import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { IntentEventType } from '@prisma/client';
import { IntentRepository } from './intent.repository';
import { IntentEventRepository } from './intent-event.repository';

const DEFAULT_INTERVAL_MS = 30_000;
const DEFAULT_LIMIT = 100;

@Injectable()
export class IntentExpirySweeperService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly log = new Logger('IntentExpirySweeper');
  private timer?: ReturnType<typeof setInterval>;

  private readonly enabled: boolean;
  private readonly intervalMs: number;
  private readonly limitPerTick: number;

  constructor(
    private readonly repo: IntentRepository,
    private readonly events: IntentEventRepository,
  ) {
    // Default-on (mirrors DEV_EXPIRY_SWEEPER for orders). Set
    // SEA_INTENT_EXPIRY_ENABLED=0 to opt out.
    this.enabled = (process.env.SEA_INTENT_EXPIRY_ENABLED ?? '1') === '1';

    const rawInterval = Number(process.env.SEA_INTENT_EXPIRY_INTERVAL_MS ?? '');
    this.intervalMs =
      Number.isFinite(rawInterval) && rawInterval >= 1000
        ? rawInterval
        : DEFAULT_INTERVAL_MS;

    const rawLimit = Number(process.env.SEA_INTENT_EXPIRY_LIMIT_PER_TICK ?? '');
    this.limitPerTick =
      Number.isFinite(rawLimit) && rawLimit > 0 && rawLimit <= 500
        ? rawLimit
        : DEFAULT_LIMIT;
  }

  onModuleInit(): void {
    if (!this.enabled) {
      this.log.log('disabled (SEA_INTENT_EXPIRY_ENABLED!=1)');
      return;
    }
    if (process.env.READ_ONLY === 'true') {
      this.log.log('disabled (READ_ONLY=true)');
      return;
    }
    if (process.env.PROFILE === 'mainnet') {
      this.log.log('disabled (PROFILE=mainnet)');
      return;
    }
    this.timer = setInterval(() => {
      this.tick().catch((e: unknown) => {
        this.log.error(e instanceof Error ? e.message : String(e));
      });
    }, this.intervalMs);
    this.log.log(
      `started interval ${this.intervalMs}ms (limit/tick=${this.limitPerTick})`,
    );
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  /**
   * One sweep: bulk-find DRAFT/ACTIVE intents past `expiresAt`, transition
   * each atomically, and emit `IntentEvent('EXPIRED')` for each id that was
   * actually transitioned. Per-event errors are caught so one failure does
   * not stop the rest of the batch from being audited.
   */
  async tick(): Promise<void> {
    const expiredIds = await this.repo.expireDueIntents(this.limitPerTick);
    if (expiredIds.length === 0) return;
    for (const id of expiredIds) {
      try {
        await this.events.append(id, IntentEventType.EXPIRED, {
          reason: 'intent_expired_by_ts',
        });
      } catch (e) {
        this.log.error(
          `event append failed id=${id}: ${
            e instanceof Error ? e.message : String(e)
          }`,
        );
      }
    }
    this.log.log(`expired ${expiredIds.length} intent(s)`);
  }
}
