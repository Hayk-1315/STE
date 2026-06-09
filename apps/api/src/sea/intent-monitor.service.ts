// apps/api/src/sea/intent-monitor.service.ts
//
// Phase 3 monitor: every tick, fetch active CL intents and dispatch the ones
// whose trigger condition is satisfied to IntentFireService. Opt-in by
// default (SEA_MONITOR_ENABLED=1) to avoid accidental firing before
// explicit QA. Hard-disabled in read-only or mainnet profiles.
//
// Lifecycle: uses OnApplicationBootstrap (not OnModuleInit) so the timer
// only starts after every module's awaited onModuleInit has resolved —
// LobRehydratorService.onModuleInit is async and awaited by Nest, so the
// in-memory LOB is hydrated before the first tick. A documented fallback
// knob `SEA_MONITOR_BOOT_DELAY_MS` (default 0) is honored for paranoid
// environments that introduce a non-awaited rehydration path.
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { OrderBookService } from '../matching/orderbook.service';
import { IntentRepository } from './intent.repository';
import { IntentFireService, type FireableIntent } from './intent-fire.service';
import { CmrPrepareService } from './cmr-prepare.service';
import { IntentEventRepository } from './intent-event.repository';
import { CMR_EXECUTING_MARK_GRACE_SEC } from './intent.service';
import {
  IntentEventType,
  TriggerType,
  ReferencePriceKind,
} from '@prisma/client';

const DEFAULT_INTERVAL_MS = 1000;
const DEFAULT_LIMIT = 100;
const DEFAULT_REARM_COOLDOWN_SECS = 5;
const REARM_COOLDOWN_MIN = 0;
const REARM_COOLDOWN_MAX = 60;

@Injectable()
export class IntentMonitorService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly log = new Logger('IntentMonitor');
  private timer?: ReturnType<typeof setInterval>;

  private readonly enabled: boolean;
  private readonly cmrEnabled: boolean;
  private readonly intervalMs: number;
  private readonly limitPerTick: number;
  private readonly bootDelayMs: number;
  private readonly rearmCooldownSec: number;

  constructor(
    private readonly repo: IntentRepository,
    private readonly ob: OrderBookService,
    private readonly fire: IntentFireService,
    private readonly cmr: CmrPrepareService,
    private readonly events: IntentEventRepository,
  ) {
    // Opt-in by default. Anyone running this in a sensitive environment must
    // explicitly set SEA_MONITOR_ENABLED=1.
    this.enabled = process.env.SEA_MONITOR_ENABLED === '1';
    // Phase 4 sub-gate: CMR readiness only runs when the master switch AND
    // the CMR-specific switch are both on. Defaults off.
    this.cmrEnabled =
      this.enabled && process.env.SEA_CMR_PREPARE_ENABLED === '1';

    const rawInterval = Number(process.env.SEA_MONITOR_INTERVAL_MS ?? '');
    this.intervalMs =
      Number.isFinite(rawInterval) && rawInterval >= 250
        ? rawInterval
        : DEFAULT_INTERVAL_MS;

    const rawLimit = Number(process.env.SEA_MONITOR_LIMIT_PER_TICK ?? '');
    this.limitPerTick =
      Number.isFinite(rawLimit) && rawLimit > 0 && rawLimit <= 500
        ? rawLimit
        : DEFAULT_LIMIT;

    const rawDelay = Number(process.env.SEA_MONITOR_BOOT_DELAY_MS ?? '');
    this.bootDelayMs = Number.isFinite(rawDelay) && rawDelay > 0 ? rawDelay : 0;

    const rawRearm = Number(process.env.SEA_CMR_REARM_COOLDOWN_SECS ?? '');
    this.rearmCooldownSec =
      Number.isFinite(rawRearm) && rawRearm >= 0
        ? Math.min(
            REARM_COOLDOWN_MAX,
            Math.max(REARM_COOLDOWN_MIN, Math.floor(rawRearm)),
          )
        : DEFAULT_REARM_COOLDOWN_SECS;
  }

  async onApplicationBootstrap(): Promise<void> {
    if (!this.enabled) {
      this.log.log('disabled (SEA_MONITOR_ENABLED!=1)');
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

    if (this.bootDelayMs > 0) {
      this.log.log(`boot delay ${this.bootDelayMs}ms before first tick`);
      await new Promise((resolve) => setTimeout(resolve, this.bootDelayMs));
    }

    this.timer = setInterval(() => {
      this.tick().catch((e: unknown) => {
        this.log.error(e instanceof Error ? e.message : String(e));
      });
    }, this.intervalMs);
    this.log.log(
      `started interval ${this.intervalMs}ms (limit/tick=${this.limitPerTick}) cl=on cmr=${this.cmrEnabled ? 'on' : 'off'}`,
    );
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  /**
   * One tick: CL fan-out (Phase 3) then CMR fan-out (Phase 4) when the CMR
   * gate is on. Per-intent errors are caught so one bad row does not stop
   * the rest of the tick.
   */
  async tick(): Promise<void> {
    await this.tickCL();
    if (this.cmrEnabled) {
      await this.tickCMRActive();
      await this.tickCMRReady();
    }
  }

  /** Phase 3 CL branch — unchanged behavior. */
  private async tickCL(): Promise<void> {
    const intents = await this.repo.findActiveCLIntents(this.limitPerTick);
    if (intents.length === 0) return;

    for (const intent of intents) {
      try {
        const refTicks = this.readReferenceTicks(
          intent.marketSymbol,
          intent.triggerReference,
        );
        if (refTicks === null) continue; // empty book on the relevant side

        const fires = this.triggerSatisfied(
          intent.triggerType,
          refTicks,
          intent.triggerPriceTicks,
        );
        if (!fires) continue;

        const fireable: FireableIntent = {
          id: intent.id,
          owner: intent.owner,
          marketId: intent.marketId,
          marketSymbol: intent.marketSymbol,
          side: intent.side as 'BUY' | 'SELL',
          sizeBase: intent.sizeBase,
          limitPriceTicks: intent.limitPriceTicks,
          preSignedOrder: intent.preSignedOrder,
          preSignedSignature: intent.preSignedSignature,
          preSignedOrderHash: intent.preSignedOrderHash,
          expiresAt: intent.expiresAt,
        };
        await this.fire.fire(fireable);
      } catch (e) {
        // Defense in depth: we already wrap fire() inside fire-service, but
        // any throw from the monitor's own loop body must not break the tick.
        this.log.error(
          `tick error id=${intent.id}: ${
            e instanceof Error ? e.message : String(e)
          }`,
        );
      }
    }
  }

  /**
   * Phase 4 CMR active branch — evaluate trigger + liquidity for each ACTIVE
   * CMR intent whose cooldown has elapsed; CmrPrepareService handles the
   * atomic ACTIVE→READY transition and the debounced insufficient-liquidity
   * PROGRESS path.
   */
  private async tickCMRActive(): Promise<void> {
    const intents = await this.repo.findActiveCMRIntents(this.limitPerTick);
    if (intents.length === 0) return;
    for (const intent of intents) {
      try {
        await this.cmr.evaluateAndPrepare(intent);
      } catch (e) {
        this.log.error(
          `cmr active tick error id=${intent.id}: ${
            e instanceof Error ? e.message : String(e)
          }`,
        );
      }
    }
  }

  /**
   * Phase 4 CMR ready branch — drive the READY → ACTIVE re-arm on TTL expiry
   * and the READY → EXPIRED transition on hard expiry. preparedQuote.ttlSec
   * is read from the persisted snapshot so the decision is independent of
   * any env change since the READY transition.
   */
  private async tickCMRReady(): Promise<void> {
    const intents = await this.repo.findReadyCMRIntents(this.limitPerTick);
    if (intents.length === 0) return;
    const now = Date.now();

    for (const intent of intents) {
      try {
        // (1) Hard expiry — runs FIRST. walletLock CANNOT shield from this.
        //     Phase 4.x-b Blocker 1: hard expiry strictly wins over any
        //     wallet-lock window so a slow MetaMask user past the hard
        //     ceiling still moves to EXPIRED.
        if (now > intent.expiresAt.getTime()) {
          const ok = await this.repo.markExpiredFromReady(
            intent.id,
            'intent_expired_by_ts',
          );
          if (ok) {
            await this.events.append(intent.id, IntentEventType.EXPIRED, {
              from: 'READY',
              reason: 'past_expiresAt',
            });
          }
          continue;
        }

        // (2) walletLock guard — blocks READY → ACTIVE re-arm during the
        //     pre-tx wallet-lock window AND the marker grace, so the monitor
        //     cannot steal the row from a fill the user just confirmed slightly
        //     after expiry (the marker accepts it within
        //     CMR_EXECUTING_MARK_GRACE_SEC — see IntentService.markExecuting).
        //     Never gates hard expiry above.
        if (
          intent.walletLockUntilAt &&
          intent.walletLockUntilAt.getTime() +
            CMR_EXECUTING_MARK_GRACE_SEC * 1000 >
            now
        ) {
          continue;
        }

        // (3) TTL-driven re-arm (unchanged from Phase 4).
        const ttlSec = readTtlSecFromSnapshot(intent.preparedQuote);
        const preparedAtMs = intent.preparedQuoteAt
          ? intent.preparedQuoteAt.getTime()
          : 0;
        if (preparedAtMs === 0) {
          // Defensive: a READY row without preparedQuoteAt is malformed.
          // Re-arm to ACTIVE so the next tick can re-prepare.
          await this.rearmWithCooldown(intent.id, 'missing_preparedQuoteAt');
          continue;
        }

        if (now > preparedAtMs + ttlSec * 1000) {
          await this.rearmWithCooldown(intent.id, 'ready_ttl_expired');
        }
      } catch (e) {
        this.log.error(
          `cmr ready tick error id=${intent.id}: ${
            e instanceof Error ? e.message : String(e)
          }`,
        );
      }
    }
  }

  private async rearmWithCooldown(id: string, reason: string): Promise<void> {
    const cooldownUntilAt = new Date(Date.now() + this.rearmCooldownSec * 1000);
    const ok = await this.repo.rearmFromReady(id, cooldownUntilAt);
    if (ok) {
      await this.events.append(id, IntentEventType.PROGRESS, {
        from: 'READY',
        to: 'ACTIVE',
        reason,
        cooldownSec: this.rearmCooldownSec,
      });
    }
  }

  private readReferenceTicks(
    symbol: string,
    reference: ReferencePriceKind,
  ): bigint | null {
    const snap = this.ob.snapshot(symbol, 1);
    if (reference === ReferencePriceKind.BEST_ASK) {
      const ask = snap.asks[0]?.priceTicks;
      return ask ? BigInt(ask) : null;
    }
    if (reference === ReferencePriceKind.BEST_BID) {
      const bid = snap.bids[0]?.priceTicks;
      return bid ? BigInt(bid) : null;
    }
    // MID is not supported in v1 (rejected at create time); defensive null.
    return null;
  }

  private triggerSatisfied(
    type: TriggerType,
    refTicks: bigint,
    threshold: bigint,
  ): boolean {
    if (type === TriggerType.PRICE_BELOW) return refTicks <= threshold;
    if (type === TriggerType.PRICE_ABOVE) return refTicks >= threshold;
    return false;
  }
}

/**
 * Best-effort read of `ttlSec` from a persisted preparedQuote snapshot.
 * Falls back to 60s (Phase 4 default) if the field is missing or malformed —
 * which forces the row to re-arm sooner rather than later, preserving
 * monotonic safety.
 */
function readTtlSecFromSnapshot(snapshot: unknown): number {
  if (!snapshot || typeof snapshot !== 'object') return 60;
  const raw = (snapshot as { ttlSec?: unknown }).ttlSec;
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
    return Math.min(300, Math.max(5, Math.floor(raw)));
  }
  return 60;
}
