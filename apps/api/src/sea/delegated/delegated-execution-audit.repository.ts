// apps/api/src/sea/delegated/delegated-execution-audit.repository.ts
//
// Append-only audit trail of delegated execution attempts (Phase 1 scaffold).
// One row per decision (validated / rejected / submitted / …). No secrets.
import { Injectable } from '@nestjs/common';
import { PrismaClient, DelegatedExecutionDecision } from '@prisma/client';

export interface AuditInput {
  intentId: string;
  grantId?: string | null;
  chainId: number;
  profile: string;
  decision: DelegatedExecutionDecision;
  reason?: string | null;
  txHash?: string | null;
  providerRef?: string | null;
}

@Injectable()
export class DelegatedExecutionAuditRepository {
  private prisma = new PrismaClient();

  append(input: AuditInput) {
    return this.prisma.delegatedExecutionAttempt.create({
      data: {
        intentId: input.intentId,
        grantId: input.grantId ?? null,
        chainId: input.chainId,
        profile: input.profile,
        decision: input.decision,
        reason: input.reason ?? null,
        txHash: input.txHash ?? null,
        providerRef: input.providerRef ?? null,
      },
    });
  }

  /** READ-ONLY: recent attempts for one intent, newest first (status UI). */
  listByIntent(intentId: string, limit = 50) {
    return this.prisma.delegatedExecutionAttempt.findMany({
      where: { intentId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        decision: true,
        reason: true,
        txHash: true,
        providerRef: true,
        createdAt: true,
      },
    });
  }
}
