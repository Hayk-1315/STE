// apps/api/src/sea/delegated/delegated-executor.worker.ts
//
// Delegated CMR executor. Follows the SEA sweeper lifecycle (OnModuleInit +
// setInterval + OnModuleDestroy) but the loop only ever runs when
// `delegationExecGate` is open — WRITABLE profile, !READ_ONLY, PROFILE!=mainnet,
// SEA_DELEGATED_ENABLED=1 AND SEA_DELEGATED_EXEC_ENABLED=1 — AND a session
// signer is configured. All default OFF, so it is inert by default and never
// boots (or makes any provider call) in normal CI.
//
// Per-intent flow (constraints honored):
//   1. build a FRESH single-fill plan (reuses existing services read-only)
//   2. STE-side authoritative validation (full-size, single-fill, taker token,
//      fill bound, spend cap, expiry) — never bypassed
//   3. race-safe claim READY -> EXECUTING (compound-where); loser skips
//   4. submit via provider (session key signs); provider self-confirms the fill
//      from the receipt logs (never trusts tx status alone)
//   5. transition + audit. If nothing was submitted, RELEASE back to READY so
//      the manual CMR fallback survives.
import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  DelegatedExecutionDecision,
  DelegationGrantStatus,
  type DelegationGrant,
  type Intent,
} from '@prisma/client';
import type { DelegationConfig } from './delegation.config';
import { delegationExecGate } from './delegation.guard';
import {
  DELEGATION_CONFIG,
  DELEGATION_PROVIDER,
  type DelegationProvider,
  type ExecuteResult,
} from './delegation-provider.interface';
import { DelegatedIntentTransitionRepository } from './delegated-intent-transition.repository';
import { DelegatedFillBuilder } from './delegated-fill.builder';
import { DelegatedExecutionAuditRepository } from './delegated-execution-audit.repository';
import { DelegatedFillReconcilerService } from './delegated-fill-reconciler.service';
import { SessionSignerProvider } from './session-signer.provider';
import { validateFreshQuoteAgainstPolicy } from './cmr-delegated-policy.validator';
import type {
  CmrDelegationPolicy,
  DelegationAccountModel,
} from './delegated.types';
import type { Side } from '../../matching/orderbook.service';

const DEFAULT_INTERVAL_MS = 5_000;
const DEFAULT_LIMIT = 10;

interface GrantMeta {
  accountAddress?: string;
  enableData?: string;
  maxTakerFillAmountQ?: string;
}

@Injectable()
export class DelegatedExecutorWorker implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger('DelegatedExecutorWorker');
  private timer?: ReturnType<typeof setInterval>;
  private running = false;
  private readonly intervalMs: number;
  private readonly limitPerTick: number;

  constructor(
    @Inject(DELEGATION_CONFIG) private readonly cfg: DelegationConfig,
    @Inject(DELEGATION_PROVIDER) private readonly provider: DelegationProvider,
    private readonly transitions: DelegatedIntentTransitionRepository,
    private readonly fillBuilder: DelegatedFillBuilder,
    private readonly audit: DelegatedExecutionAuditRepository,
    private readonly reconciler: DelegatedFillReconcilerService,
    private readonly signer: SessionSignerProvider,
  ) {
    const rawI = Number(process.env.SEA_DELEGATED_EXEC_INTERVAL_MS ?? '');
    this.intervalMs =
      Number.isFinite(rawI) && rawI >= 1000 ? rawI : DEFAULT_INTERVAL_MS;
    const rawL = Number(process.env.SEA_DELEGATED_EXEC_LIMIT_PER_TICK ?? '');
    this.limitPerTick =
      Number.isFinite(rawL) && rawL > 0 && rawL <= 100 ? rawL : DEFAULT_LIMIT;
  }

  onModuleInit(): void {
    const gate = delegationExecGate(this.cfg);
    if (!gate.allowed) {
      this.log.log(`inert (${gate.reason})`);
      return;
    }
    if (!this.signer.isAvailable()) {
      this.log.warn('inert (session signer not configured)');
      return;
    }
    this.timer = setInterval(() => {
      if (this.running) return;
      this.running = true;
      this.tick()
        .catch((e: unknown) =>
          this.log.error(e instanceof Error ? e.message : String(e)),
        )
        .finally(() => {
          this.running = false;
        });
    }, this.intervalMs);
    this.log.warn(
      `LIVE executor started (interval ${this.intervalMs}ms, provider ${this.cfg.provider})`,
    );
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async tick(): Promise<void> {
    // Belt-and-braces: re-check the gate each tick.
    if (!delegationExecGate(this.cfg).allowed || !this.signer.isAvailable()) {
      return;
    }
    const batch = await this.transitions.findExecutable(this.limitPerTick);
    for (const { intent, grant } of batch) {
      await this.processOne(intent, grant);
    }
  }

  private async processOne(
    intent: Intent,
    grant: DelegationGrant,
  ): Promise<void> {
    const meta = (grant.meta ?? {}) as GrantMeta;
    const accountAddress = meta.accountAddress;
    if (!accountAddress || !meta.enableData || !grant.permissionId) {
      await this.auditRow(intent, grant, 'REJECTED', 'grant_incomplete');
      return;
    }
    const policy = this.policyFromGrant(grant, meta);

    // 1) fresh fill (read-only reuse). Failure leaves the intent READY.
    const fill = await this.fillBuilder.buildFreshFill(
      {
        marketId: intent.marketId,
        side: intent.side as Side,
        sizeBase: BigInt(intent.sizeBase.toString()),
        triggerPriceTicks: BigInt(intent.triggerPriceTicks.toString()),
      },
      accountAddress,
    );
    if (!fill.ok || !fill.freshQuote || !fill.calldata || !fill.target) {
      await this.auditRow(intent, grant, 'REJECTED', fill.reason ?? 'no_fill');
      return;
    }

    // 2) STE-side authoritative validation (never bypassed).
    const v = validateFreshQuoteAgainstPolicy({
      policy,
      quote: fill.freshQuote,
    });
    if (!v.ok) {
      await this.auditRow(intent, grant, 'REJECTED', v.reason ?? 'invalid');
      return;
    }
    if (fill.target.toLowerCase() !== policy.target.toLowerCase()) {
      await this.auditRow(intent, grant, 'REJECTED', 'target_mismatch');
      return;
    }

    // 3) race-safe claim READY -> EXECUTING (only now do we change state).
    const claimed = await this.transitions.claimExecuting(intent.id);
    if (!claimed) return; // lost race to manual path or another tick
    await this.auditRow(intent, grant, 'VALIDATED', 'claimed');

    // 4) submit + provider self-confirmation.
    let res: ExecuteResult;
    try {
      res = await this.provider.execute({
        intentId: intent.id,
        accountModel: grant.accountModel as DelegationAccountModel,
        accountAddress,
        permissionId: grant.permissionId,
        enableData: meta.enableData,
        policy,
        target: fill.target,
        calldata: fill.calldata,
        expected: fill.expected!,
      });
    } catch (e) {
      // Unexpected throw: treat as pre-submit failure, restore manual fallback.
      await this.transitions.releaseToReady(intent.id);
      await this.auditRow(
        intent,
        grant,
        'REJECTED',
        `execute_threw:${e instanceof Error ? e.message : String(e)}`,
      );
      return;
    }

    // 5) transition + audit.
    if (res.ok && res.confirmed && res.txHash) {
      // markExecuted is a race-safe EXECUTING->EXECUTED update that returns true
      // for exactly ONE caller. Gate post-fill reconciliation on it so a delegated
      // fill is reconciled into product state exactly once (never double-counted
      // with a retry — and FillWatcher structurally never sees a userOp fill).
      const executed = await this.transitions.markExecuted(
        intent.id,
        res.txHash,
      );
      await this.transitions.setGrantStatus(
        grant.id,
        DelegationGrantStatus.USED,
      );
      await this.auditRow(
        intent,
        grant,
        'CONFIRMED',
        'fill_verified',
        res.txHash,
      );
      if (executed && fill.expected) {
        // Additive: reuses the SAME public methods the manual path uses
        // (addTrade + applyExternalFill). The reconciler already swallows its
        // own errors; the extra try/catch is belt-and-braces so nothing here
        // can break the tick — the intent is already EXECUTED and on-chain.
        try {
          await this.reconciler.reconcileConfirmedFill({
            marketId: intent.marketId,
            orderHash: fill.expected.orderHash,
            execBase: fill.expected.execBase,
            taker: accountAddress,
            priceTicks: fill.expected.priceTicks,
            txHash: res.txHash,
          });
        } catch (e) {
          this.log.warn(
            `post-fill reconcile threw intent=${intent.id} tx=${res.txHash}: ${
              e instanceof Error ? e.message : String(e)
            }`,
          );
        }
      }
    } else if (res.txHash) {
      // Submitted but the fill could NOT be verified → uncertain. Never fake
      // success; mark FAILED and keep the tx hash for investigation.
      await this.transitions.markFailed(
        intent.id,
        res.reason ?? 'fill_unverified',
        res.txHash,
      );
      await this.transitions.setGrantStatus(
        grant.id,
        DelegationGrantStatus.FAILED,
      );
      await this.auditRow(
        intent,
        grant,
        'FAILED',
        res.reason ?? 'fill_unverified',
        res.txHash,
      );
    } else {
      // Nothing landed on-chain (rejected pre-inclusion) → restore READY so the
      // manual CMR fallback still works.
      await this.transitions.releaseToReady(intent.id);
      await this.auditRow(
        intent,
        grant,
        'REJECTED',
        res.reason ?? 'submit_rejected',
      );
    }
  }

  private policyFromGrant(
    grant: DelegationGrant,
    meta: GrantMeta,
  ): CmrDelegationPolicy {
    return {
      chainId: grant.chainId,
      profile: grant.profile as CmrDelegationPolicy['profile'],
      target: grant.target,
      functionSelector: grant.functionSelector,
      usageLimit: grant.usageLimit,
      validUntil: Math.floor(grant.validUntil.getTime() / 1000),
      spendToken: grant.spendToken,
      spendCapQ: BigInt(grant.spendCapQ.toString()),
      maxTakerFillAmountQ: BigInt(meta.maxTakerFillAmountQ ?? '0'),
      accountModel: grant.accountModel as DelegationAccountModel,
    };
  }

  private async auditRow(
    intent: Intent,
    grant: DelegationGrant,
    decision: keyof typeof DelegatedExecutionDecision,
    reason: string,
    txHash?: string,
  ): Promise<void> {
    try {
      await this.audit.append({
        intentId: intent.id,
        grantId: grant.id,
        chainId: grant.chainId,
        profile: grant.profile,
        decision: DelegatedExecutionDecision[decision],
        reason,
        txHash: txHash ?? null,
        providerRef: grant.permissionId ?? null,
      });
    } catch (e) {
      this.log.error(
        `audit append failed intent=${intent.id}: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }
}
