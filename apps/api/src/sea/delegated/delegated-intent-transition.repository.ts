// apps/api/src/sea/delegated/delegated-intent-transition.repository.ts
//
// DEDICATED writer for delegated CMR lifecycle. Does NOT touch IntentRepository,
// IntentService, or FillWatcher. Only ever moves an intent that (a) has an
// ACTIVE DelegationGrant and (b) is currently READY, and only through
// READY -> EXECUTING -> EXECUTED/FAILED. Every transition is a race-safe
// compound-where `updateMany` (returns count) so it can never clobber the manual
// path: the manual `Execute now` also moves READY -> EXECUTING, and whoever
// wins the compound-where is the sole executor. A claim requires READY AND no
// `linkedTxHash` (no execution already in progress).
import { Injectable } from '@nestjs/common';
import {
  PrismaClient,
  IntentStatus,
  IntentType,
  DelegationGrantStatus,
  type Intent,
  type DelegationGrant,
} from '@prisma/client';

export interface ExecutableDelegated {
  intent: Intent;
  grant: DelegationGrant;
}

@Injectable()
export class DelegatedIntentTransitionRepository {
  private prisma = new PrismaClient();

  /**
   * READY CMR intents that have an ACTIVE, unexpired DelegationGrant and no
   * execution in progress (`linkedTxHash` null). Read-only.
   */
  async findExecutable(limit: number): Promise<ExecutableDelegated[]> {
    const now = new Date();
    const grants = await this.prisma.delegationGrant.findMany({
      where: { status: DelegationGrantStatus.ACTIVE, validUntil: { gt: now } },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });
    const out: ExecutableDelegated[] = [];
    for (const grant of grants) {
      const intent = await this.prisma.intent.findFirst({
        where: {
          id: grant.intentId,
          status: IntentStatus.READY,
          type: IntentType.CONDITIONAL_MARKET_READY,
          linkedTxHash: null,
          expiresAt: { gt: now },
        },
      });
      if (intent) out.push({ intent, grant });
    }
    return out;
  }

  /**
   * Atomic claim READY -> EXECUTING (no linkedTxHash yet). Returns true iff this
   * caller won the race. Does not stamp linkedTxHash (there is no tx yet).
   */
  async claimExecuting(intentId: string): Promise<boolean> {
    const res = await this.prisma.intent.updateMany({
      where: {
        id: intentId,
        status: IntentStatus.READY,
        type: IntentType.CONDITIONAL_MARKET_READY,
        linkedTxHash: null,
      },
      data: { status: IntentStatus.EXECUTING },
    });
    return res.count === 1;
  }

  /**
   * Release EXECUTING -> READY when the executor failed BEFORE anything was
   * submitted on-chain (still no linkedTxHash), so the manual fallback survives.
   */
  async releaseToReady(intentId: string): Promise<boolean> {
    const res = await this.prisma.intent.updateMany({
      where: {
        id: intentId,
        status: IntentStatus.EXECUTING,
        linkedTxHash: null,
      },
      data: { status: IntentStatus.READY },
    });
    return res.count === 1;
  }

  /** EXECUTING -> EXECUTED, stamping the confirmed userOp tx hash. */
  async markExecuted(intentId: string, txHash: string): Promise<boolean> {
    const res = await this.prisma.intent.updateMany({
      where: { id: intentId, status: IntentStatus.EXECUTING },
      data: { status: IntentStatus.EXECUTED, linkedTxHash: txHash },
    });
    return res.count === 1;
  }

  /** EXECUTING -> FAILED (optionally stamping the tx hash for an uncertain fill). */
  async markFailed(
    intentId: string,
    reason: string,
    txHash?: string,
  ): Promise<boolean> {
    const res = await this.prisma.intent.updateMany({
      where: { id: intentId, status: IntentStatus.EXECUTING },
      data: {
        status: IntentStatus.FAILED,
        failureReason: reason,
        ...(txHash ? { linkedTxHash: txHash } : {}),
      },
    });
    return res.count === 1;
  }

  async setGrantStatus(
    grantId: string,
    status: DelegationGrantStatus,
  ): Promise<void> {
    await this.prisma.delegationGrant.updateMany({
      where: { id: grantId },
      data: {
        status,
        ...(status === DelegationGrantStatus.REVOKED
          ? { revokedAt: new Date() }
          : {}),
      },
    });
  }
}
