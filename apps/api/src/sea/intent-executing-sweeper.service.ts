// apps/api/src/sea/intent-executing-sweeper.service.ts
//
// Phase 4.x-d: periodic safety net that transitions stale `EXECUTING`
// CMR intents to `FAILED('stale_pending')`. Covers the gap where
// FillWatcher never closes an EXECUTING row (RPC blackhole, cursor
// lag past stale-threshold, replaced-by-fee with a different selector,
// etc.).
//
// **Scope is narrow by design**: this sweeper only handles rows
// already in EXECUTING. It does NOT fix the separate orphan case
// where wallet-lock succeeded but `POST /sea/intents/:id/executing`
// was never sent — those rows stay in READY with `walletLockUntilAt`
// stamped and are recovered by the existing monitor re-arm path
// (wait for the lock to expire, then monitor re-arms to ACTIVE).
// That orphan path is intentionally out of scope here.
//
// Default-DISABLED (opposite of IntentExpirySweeperService) because
// EXECUTING rows could legitimately still complete on-chain (slow
// chains, RPC catch-up) — terminal-marking them is more invasive than
// the `expiresAt` sweep. Opt-in via SEA_EXECUTING_SWEEP_ENABLED=1.
//
// Hard-disabled by EITHER `READ_ONLY=true` OR `PROFILE=mainnet`
// (OR — either condition alone disables, matching the other SEA
// write-path gates).
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
const DEFAULT_STALE_MIN = 10;
const STALE_MIN_MIN = 1;
const STALE_MIN_MAX = 1440; // 24h hard ceiling

@Injectable()
export class IntentExecutingSweeperService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly log = new Logger('IntentExecutingSweeper');
  private timer?: ReturnType<typeof setInterval>;

  private readonly enabled: boolean;
  private readonly intervalMs: number;
  private readonly limitPerTick: number;
  private readonly staleThresholdMs: number;

  constructor(
    private readonly repo: IntentRepository,
    private readonly events: IntentEventRepository,
  ) {
    // Default-OFF. Opt-in via SEA_EXECUTING_SWEEP_ENABLED=1.
    this.enabled = process.env.SEA_EXECUTING_SWEEP_ENABLED === '1';

    const rawInterval = Number(
      process.env.SEA_EXECUTING_SWEEP_INTERVAL_MS ?? '',
    );
    this.intervalMs =
      Number.isFinite(rawInterval) && rawInterval >= 1000
        ? rawInterval
        : DEFAULT_INTERVAL_MS;

    const rawLimit = Number(
      process.env.SEA_EXECUTING_SWEEP_LIMIT_PER_TICK ?? '',
    );
    this.limitPerTick =
      Number.isFinite(rawLimit) && rawLimit > 0 && rawLimit <= 500
        ? rawLimit
        : DEFAULT_LIMIT;

    const rawStale = Number(process.env.SEA_EXECUTING_STALE_MIN ?? '');
    const staleMin =
      Number.isFinite(rawStale) &&
      rawStale >= STALE_MIN_MIN &&
      rawStale <= STALE_MIN_MAX
        ? rawStale
        : DEFAULT_STALE_MIN;
    this.staleThresholdMs = staleMin * 60_000;
  }

  onModuleInit(): void {
    if (!this.enabled) {
      this.log.log('disabled (SEA_EXECUTING_SWEEP_ENABLED!=1)');
      return;
    }
    // EITHER hard-disable condition alone disables (OR, not AND).
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
      `started interval ${this.intervalMs}ms (limit/tick=${this.limitPerTick} stale=${
        this.staleThresholdMs / 60_000
      }min)`,
    );
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  /**
   * One sweep: ask the repo for the ids that actually transitioned via
   * compound-where UPDATE (race-safe vs FillWatcher's `markExecuted` /
   * `markFailedFromExecuting`). Append `IntentEvent('FAILED', { reason:
   * 'stale_pending' })` only for those ids. Per-event errors are caught
   * so one failure doesn't stop the rest of the batch.
   */
  async tick(): Promise<void> {
    const sweptIds = await this.repo.sweepStaleExecuting(
      this.limitPerTick,
      this.staleThresholdMs,
    );
    if (sweptIds.length === 0) return;
    for (const id of sweptIds) {
      try {
        await this.events.append(id, IntentEventType.FAILED, {
          reason: 'stale_pending',
        });
      } catch (e) {
        this.log.error(
          `event append failed id=${id}: ${
            e instanceof Error ? e.message : String(e)
          }`,
        );
      }
    }
    this.log.log(`stale-pending swept ${sweptIds.length} intent(s)`);
  }
}
