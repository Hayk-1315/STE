// apps/api/src/sea/delegated/delegation-grant.repository.ts
//
// Thin persistence for DelegationGrant (Phase 1 scaffold). Mirrors the existing
// SEA repo convention (a local PrismaClient). No secrets are ever persisted —
// `sessionKeyRef` is a non-secret label. Not wired into any live path yet.
import { Injectable } from '@nestjs/common';
import {
  PrismaClient,
  Prisma,
  DelegationGrantStatus,
  DelegationAccountModel,
  DelegationProviderKind,
} from '@prisma/client';
import type { CmrDelegationPolicy } from './delegated.types';

export interface CreateGrantInput {
  intentId: string;
  owner: string;
  chainId: number;
  profile: string;
  accountModel: DelegationAccountModel;
  provider: DelegationProviderKind;
  sessionKeyRef?: string | null;
  permissionId?: string | null;
  policy: CmrDelegationPolicy;
  meta?: Prisma.InputJsonValue;
  /** Defaults to PENDING; finalizeGrant persists ACTIVE after the user signs. */
  status?: DelegationGrantStatus;
}

@Injectable()
export class DelegationGrantRepository {
  private prisma = new PrismaClient();

  create(input: CreateGrantInput) {
    return this.prisma.delegationGrant.create({
      data: {
        intentId: input.intentId,
        owner: input.owner.toLowerCase(),
        chainId: input.chainId,
        profile: input.profile,
        accountModel: input.accountModel,
        provider: input.provider,
        sessionKeyRef: input.sessionKeyRef ?? null,
        permissionId: input.permissionId ?? null,
        target: input.policy.target,
        functionSelector: input.policy.functionSelector,
        spendToken: input.policy.spendToken,
        spendCapQ: input.policy.spendCapQ.toString(),
        usageLimit: input.policy.usageLimit,
        validUntil: new Date(input.policy.validUntil * 1000),
        status: input.status ?? DelegationGrantStatus.PENDING,
        meta: input.meta,
      },
    });
  }

  findByIntentId(intentId: string) {
    return this.prisma.delegationGrant.findUnique({ where: { intentId } });
  }

  /** READ-ONLY: all of an owner's grants (for the delegated status UI). */
  listByOwner(owner: string) {
    return this.prisma.delegationGrant.findMany({
      where: { owner: owner.toLowerCase() },
      orderBy: { updatedAt: 'desc' },
      select: {
        intentId: true,
        owner: true,
        status: true,
        accountModel: true,
        permissionId: true,
        validUntil: true,
        meta: true,
        updatedAt: true,
      },
    });
  }

  markStatus(id: string, status: DelegationGrantStatus) {
    return this.prisma.delegationGrant.update({
      where: { id },
      data: {
        status,
        ...(status === DelegationGrantStatus.REVOKED
          ? { revokedAt: new Date() }
          : {}),
      },
    });
  }

  /** READ-ONLY intent fields used to derive the grant policy. No mutation. */
  readIntent(intentId: string) {
    return this.prisma.intent.findUnique({
      where: { id: intentId },
      select: {
        id: true,
        owner: true,
        marketId: true,
        type: true,
        side: true,
        sizeBase: true,
        triggerPriceTicks: true,
        expiresAt: true,
        status: true,
      },
    });
  }
}
