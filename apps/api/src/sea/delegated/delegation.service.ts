// apps/api/src/sea/delegated/delegation.service.ts
//
// Guarded orchestrator for delegated CMR. EVERY write path (grant prepare/
// finalize, revoke) passes `delegationWriteGate` first, so the feature is inert
// unless explicitly enabled on a writable profile. Base-mainnet and READ_ONLY
// can never write. Grant is a NON-CUSTODIAL prepare/finalize split: the backend
// derives the policy from the intent + market context and returns the digest;
// the USER signs it in their wallet; finalize persists the ACTIVE grant. The
// backend only ever holds the scoped SESSION signer (never a user key). This
// does not touch the manual CMR flow.
import { Inject, Injectable, Logger } from '@nestjs/common';
import { DelegationGrantStatus } from '@prisma/client';
import type { DelegationConfig } from './delegation.config';
import { delegationWriteGate } from './delegation.guard';
import {
  DELEGATION_CONFIG,
  DELEGATION_PROVIDER,
  type DelegationProvider,
  type SaStatusResult,
} from './delegation-provider.interface';
import {
  buildCmrDelegationPolicy,
  type CmrPolicyInput,
} from './cmr-delegation-policy.builder';
import { DelegationGrantRepository } from './delegation-grant.repository';
import { DelegatedExecutionAuditRepository } from './delegated-execution-audit.repository';
import { SessionSignerProvider } from './session-signer.provider';
import { PersistenceRepository } from '../../matching/persistence.repository';
import type {
  CmrDelegationPolicy,
  DelegationAccountModel,
} from './delegated.types';

export interface DelegationStatus {
  enabled: boolean;
  writable: boolean;
  profile: string;
  chainId: number;
  provider: string;
  signerConfigured: boolean;
  reason?: string;
}

export interface PrepareGrantParams {
  intentId: string;
  owner: string;
  accountModel?: DelegationAccountModel;
}
export interface PrepareGrantOutcome {
  ok: boolean;
  reason?: string;
  accountAddress?: string;
  needsDelegation?: boolean;
  delegationImplementation?: string;
  enableDigest?: string;
  sessionBlob?: string;
}

export interface FinalizeGrantParams {
  intentId: string;
  owner: string;
  accountModel?: DelegationAccountModel;
  accountAddress: string;
  sessionBlob: string;
  ownerSignature: string;
}
export interface FinalizeGrantOutcome {
  ok: boolean;
  reason?: string;
  grantId?: string;
  permissionId?: string;
}

export interface RevokeParams {
  intentId: string;
  owner: string;
}
export interface RevokeOutcome {
  ok: boolean;
  reason?: string;
  to?: string;
  data?: string;
}

export interface SaStatusParams {
  intentId: string;
  owner: string;
  accountModel?: DelegationAccountModel;
}

export interface DelegatedGrantSummary {
  intentId: string;
  status: string;
  accountModel: string;
  accountAddress: string | null;
  permissionId: string | null;
  validUntil: string;
}

export interface DelegatedAttemptSummary {
  decision: string;
  reason: string | null;
  txHash: string | null;
  providerRef: string | null;
  createdAt: string;
}

@Injectable()
export class DelegationService {
  private readonly log = new Logger('DelegationService');
  private readonly feeBufferBps: number;

  constructor(
    @Inject(DELEGATION_CONFIG) private readonly cfg: DelegationConfig,
    @Inject(DELEGATION_PROVIDER) private readonly provider: DelegationProvider,
    private readonly grants: DelegationGrantRepository,
    private readonly audit: DelegatedExecutionAuditRepository,
    private readonly signer: SessionSignerProvider,
    private readonly persistence: PersistenceRepository,
  ) {
    const raw = Number(process.env.DELEGATION_FEE_BUFFER_BPS ?? '');
    this.feeBufferBps =
      Number.isFinite(raw) && raw >= 0 && raw <= 2000 ? raw : 200; // default 2%
  }

  /** Read-only status. Always safe to call (no write). */
  status(): DelegationStatus {
    return {
      enabled: this.cfg.enabled,
      writable: this.cfg.writable,
      profile: this.cfg.profile,
      chainId: this.cfg.chainId,
      provider: this.cfg.provider,
      signerConfigured: this.signer.isAvailable(),
      reason: this.cfg.enabled ? undefined : this.cfg.disabledReason,
    };
  }

  async capabilities() {
    const caps = await this.provider.capabilities({
      chainId: this.cfg.chainId,
      profile: this.cfg.profile,
    });
    return { ...this.status(), capabilities: caps };
  }

  /**
   * Read-only Nexus SA setup facts for the FE (NEXUS_SA account model): SA
   * address + on-chain deploy/fund/approve/module state, plus the required
   * amounts derived from the intent policy. No write, no signing, no tx.
   */
  async saStatus(params: SaStatusParams): Promise<SaStatusResult> {
    if (!this.cfg.enabled) {
      return {
        ok: false,
        reason: this.cfg.disabledReason ?? 'delegated_disabled',
      };
    }
    if (!this.cfg.exchangeProxy) {
      return { ok: false, reason: 'exchangeProxy not configured' };
    }
    const accountModel = params.accountModel ?? this.cfg.accountModelDefault;
    const built = await this.buildPolicyForIntent(
      params.intentId,
      params.owner,
    );
    if (!built.ok) return { ok: false, reason: built.reason };
    return this.provider.saStatus({
      owner: params.owner,
      accountModel,
      spendToken: built.policy.spendToken,
      requiredTokenQ: built.policy.spendCapQ,
      exchangeProxy: this.cfg.exchangeProxy,
    });
  }

  /**
   * Read-only: all of an owner's delegated grants (intentId -> status). The FE
   * uses this to know which intents are delegated (so it renders delegated row
   * actions instead of manual Execute-now) and to show grant status. No write.
   */
  async listGrants(owner: string): Promise<DelegatedGrantSummary[]> {
    const rows = await this.grants.listByOwner(owner);
    return rows.map((g) => ({
      intentId: g.intentId,
      status: g.status,
      accountModel: g.accountModel,
      accountAddress: this.metaAccountAddress(g.meta),
      permissionId: g.permissionId,
      validUntil: g.validUntil.toISOString(),
    }));
  }

  /**
   * Read-only: recent delegated execution attempts for one intent (newest
   * first). Owner-scoped via the grant (a delegated intent always has one); if
   * the caller is not the grant owner, returns empty. No write.
   */
  async listAttempts(
    owner: string,
    intentId: string,
  ): Promise<DelegatedAttemptSummary[]> {
    const grant = await this.grants.findByIntentId(intentId);
    if (!grant || grant.owner.toLowerCase() !== owner.toLowerCase()) return [];
    const rows = await this.audit.listByIntent(intentId);
    return rows.map((a) => ({
      decision: a.decision,
      reason: a.reason,
      txHash: a.txHash,
      providerRef: a.providerRef,
      createdAt: a.createdAt.toISOString(),
    }));
  }

  private metaAccountAddress(meta: unknown): string | null {
    if (meta && typeof meta === 'object' && 'accountAddress' in meta) {
      const v = (meta as { accountAddress?: unknown }).accountAddress;
      return typeof v === 'string' ? v : null;
    }
    return null;
  }

  /**
   * Step 1: build the session policy from the intent + market context and
   * return the enable digest for the USER to sign. No DB write; stateless.
   */
  async prepareGrant(params: PrepareGrantParams): Promise<PrepareGrantOutcome> {
    const gate = delegationWriteGate(this.cfg);
    if (!gate.allowed) return { ok: false, reason: gate.reason };
    if (!this.cfg.exchangeProxy) {
      return { ok: false, reason: 'exchangeProxy not configured' };
    }
    const sessionKeyAddress = await this.signer.getAddress();
    if (!sessionKeyAddress) {
      return { ok: false, reason: 'session_signer_unavailable' };
    }
    const built = await this.buildPolicyForIntent(
      params.intentId,
      params.owner,
    );
    if (!built.ok) return { ok: false, reason: built.reason };

    const res = await this.provider.prepareGrant({
      intentId: params.intentId,
      owner: params.owner,
      accountModel: params.accountModel ?? this.cfg.accountModelDefault,
      policy: built.policy,
      sessionKeyAddress,
    });
    if (!res.ok) return { ok: false, reason: res.reason ?? 'prepare_failed' };
    return {
      ok: true,
      accountAddress: res.accountAddress,
      needsDelegation: res.needsDelegation,
      delegationImplementation: res.delegationImplementation,
      enableDigest: res.enableDigest,
      sessionBlob: res.sessionBlob,
    };
  }

  /** Step 2: persist the ACTIVE grant with the user's session-enable signature. */
  async finalizeGrant(
    params: FinalizeGrantParams,
  ): Promise<FinalizeGrantOutcome> {
    const gate = delegationWriteGate(this.cfg);
    if (!gate.allowed) return { ok: false, reason: gate.reason };
    const sessionKeyAddress = await this.signer.getAddress();
    if (!sessionKeyAddress) {
      return { ok: false, reason: 'session_signer_unavailable' };
    }
    const built = await this.buildPolicyForIntent(
      params.intentId,
      params.owner,
    );
    if (!built.ok) return { ok: false, reason: built.reason };

    const res = await this.provider.finalizeGrant({
      intentId: params.intentId,
      owner: params.owner,
      sessionBlob: params.sessionBlob,
      ownerSignature: params.ownerSignature,
    });
    if (!res.ok || !res.enableData) {
      return { ok: false, reason: res.reason ?? 'finalize_failed' };
    }

    const accountModel = params.accountModel ?? this.cfg.accountModelDefault;
    const row = await this.grants.create({
      intentId: params.intentId,
      owner: params.owner,
      chainId: this.cfg.chainId,
      profile: this.cfg.profile,
      accountModel,
      provider: this.cfg.provider,
      sessionKeyRef: sessionKeyAddress,
      permissionId: res.permissionId ?? null,
      policy: built.policy,
      status: DelegationGrantStatus.ACTIVE,
      meta: {
        accountAddress: params.accountAddress,
        enableData: res.enableData,
        maxTakerFillAmountQ: built.policy.maxTakerFillAmountQ.toString(),
      },
    });
    this.log.log(`delegated grant active intent=${params.intentId}`);
    return { ok: true, grantId: row.id, permissionId: res.permissionId };
  }

  /** Return the user-signed remove-session call and mark the grant REVOKED. */
  async revoke(params: RevokeParams): Promise<RevokeOutcome> {
    const gate = delegationWriteGate(this.cfg);
    if (!gate.allowed) return { ok: false, reason: gate.reason };
    const grant = await this.grants.findByIntentId(params.intentId);
    if (!grant) return { ok: false, reason: 'grant_not_found' };
    if (grant.owner.toLowerCase() !== params.owner.toLowerCase()) {
      return { ok: false, reason: 'owner_mismatch' };
    }
    const meta = (grant.meta ?? {}) as { accountAddress?: string };
    const res = await this.provider.revokePrepare({
      intentId: params.intentId,
      owner: params.owner,
      accountAddress: meta.accountAddress ?? grant.owner,
      permissionId: grant.permissionId ?? '',
    });
    // Stop the executor immediately regardless of when the user sends the tx.
    await this.grants.markStatus(grant.id, DelegationGrantStatus.REVOKED);
    if (!res.ok) return { ok: false, reason: res.reason ?? 'revoke_failed' };
    return { ok: true, to: res.to, data: res.data };
  }

  /** Derive the coarse session policy from the intent + market context. */
  private async buildPolicyForIntent(
    intentId: string,
    owner: string,
  ): Promise<
    { ok: true; policy: CmrDelegationPolicy } | { ok: false; reason: string }
  > {
    const intent = await this.grants.readIntent(intentId);
    if (!intent) return { ok: false, reason: 'intent_not_found' };
    if (intent.type !== 'CONDITIONAL_MARKET_READY') {
      return { ok: false, reason: 'not_cmr' };
    }
    if (intent.owner.toLowerCase() !== owner.toLowerCase()) {
      return { ok: false, reason: 'owner_mismatch' };
    }
    const terminal = ['EXECUTED', 'FAILED', 'CANCELLED', 'EXPIRED', 'REJECTED'];
    if (terminal.includes(intent.status)) {
      return { ok: false, reason: `intent_${intent.status.toLowerCase()}` };
    }

    const ctx = await this.getCtx(intent.marketId);
    if (!ctx) return { ok: false, reason: 'market_context_unavailable' };

    const sizeBase = BigInt(intent.sizeBase.toString());
    const triggerTicks = BigInt(intent.triggerPriceTicks.toString());
    const priceTickQ = BigInt(ctx.priceTickQ.toString());
    const denomBase = 10n ** BigInt(ctx.baseDecimals);

    // Upper-bound taker outflow at the trigger price (fills are at-or-better).
    const takerFillAmountQ =
      intent.side === 'BUY'
        ? (sizeBase * triggerTicks * priceTickQ) / denomBase
        : sizeBase;
    if (takerFillAmountQ <= 0n) {
      return { ok: false, reason: 'zero_taker_amount' };
    }
    // Fee buffer covers the maker order's takerTokenFeeAmount (unknown at grant
    // time). The executor's fresh-quote validation re-checks the ACTUAL fill.
    const takerFeeAmountQ =
      (takerFillAmountQ * BigInt(this.feeBufferBps)) / 10000n;
    const spendToken =
      intent.side === 'BUY' ? ctx.quoteAddress : ctx.baseAddress;

    const input: CmrPolicyInput = {
      chainId: this.cfg.chainId,
      profile: this.cfg.profile,
      exchangeProxy: this.cfg.exchangeProxy as string,
      spendToken,
      takerFillAmountQ,
      takerFeeAmountQ,
      validUntilUnix: Math.floor(intent.expiresAt.getTime() / 1000),
      accountModel: this.cfg.accountModelDefault,
    };
    try {
      return { ok: true, policy: buildCmrDelegationPolicy(input) };
    } catch (e) {
      return { ok: false, reason: (e as Error).message };
    }
  }

  private async getCtx(marketId: string) {
    try {
      return await this.persistence.getTradingContext(marketId);
    } catch {
      return null;
    }
  }
}
