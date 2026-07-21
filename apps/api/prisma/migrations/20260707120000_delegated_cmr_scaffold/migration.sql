-- Delegated CMR (Phase 1 scaffold). Additive; no changes to existing tables.
-- NON-CUSTODIAL: no key material is stored. `sessionKeyRef` is a non-secret label.

-- CreateEnum
CREATE TYPE "DelegationAccountModel" AS ENUM ('EIP7702', 'NEXUS_SA');

-- CreateEnum
CREATE TYPE "DelegationProviderKind" AS ENUM ('MOCK', 'BICONOMY');

-- CreateEnum
CREATE TYPE "DelegationGrantStatus" AS ENUM ('PENDING', 'ACTIVE', 'USED', 'REVOKED', 'EXPIRED', 'FAILED');

-- CreateEnum
CREATE TYPE "DelegatedExecutionDecision" AS ENUM ('VALIDATED', 'REJECTED', 'SUBMITTED', 'CONFIRMED', 'FAILED');

-- CreateTable
CREATE TABLE "DelegationGrant" (
    "id" TEXT NOT NULL,
    "intentId" TEXT NOT NULL,
    "owner" VARCHAR(42) NOT NULL,
    "chainId" INTEGER NOT NULL,
    "profile" TEXT NOT NULL,
    "accountModel" "DelegationAccountModel" NOT NULL,
    "provider" "DelegationProviderKind" NOT NULL DEFAULT 'MOCK',
    "sessionKeyRef" TEXT,
    "permissionId" TEXT,
    "target" VARCHAR(42) NOT NULL,
    "functionSelector" VARCHAR(10) NOT NULL,
    "spendToken" VARCHAR(42) NOT NULL,
    "spendCapQ" DECIMAL(78,0) NOT NULL,
    "usageLimit" INTEGER NOT NULL DEFAULT 1,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "status" "DelegationGrantStatus" NOT NULL DEFAULT 'PENDING',
    "revokedAt" TIMESTAMP(3),
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DelegationGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DelegatedExecutionAttempt" (
    "id" BIGSERIAL NOT NULL,
    "intentId" TEXT NOT NULL,
    "grantId" TEXT,
    "chainId" INTEGER NOT NULL,
    "profile" TEXT NOT NULL,
    "decision" "DelegatedExecutionDecision" NOT NULL,
    "reason" TEXT,
    "txHash" VARCHAR(66),
    "providerRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DelegatedExecutionAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DelegationGrant_intentId_key" ON "DelegationGrant"("intentId");

-- CreateIndex
CREATE INDEX "DelegationGrant_owner_status_idx" ON "DelegationGrant"("owner", "status");

-- CreateIndex
CREATE INDEX "DelegationGrant_status_validUntil_idx" ON "DelegationGrant"("status", "validUntil");

-- CreateIndex
CREATE INDEX "DelegationGrant_intentId_idx" ON "DelegationGrant"("intentId");

-- CreateIndex
CREATE INDEX "DelegatedExecutionAttempt_intentId_createdAt_idx" ON "DelegatedExecutionAttempt"("intentId", "createdAt");

-- CreateIndex
CREATE INDEX "DelegatedExecutionAttempt_grantId_idx" ON "DelegatedExecutionAttempt"("grantId");
