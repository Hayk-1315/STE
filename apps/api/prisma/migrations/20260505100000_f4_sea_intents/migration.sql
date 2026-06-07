-- CreateEnum
CREATE TYPE "IntentType" AS ENUM ('CONDITIONAL_LIMIT', 'CONDITIONAL_MARKET_READY');

-- CreateEnum
CREATE TYPE "IntentStatus" AS ENUM ('DRAFT', 'ACTIVE', 'TRIGGERED', 'READY', 'EXECUTING', 'PLACED', 'EXECUTED', 'CANCELLED', 'EXPIRED', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('PRICE_BELOW', 'PRICE_ABOVE');

-- CreateEnum
CREATE TYPE "ReferencePriceKind" AS ENUM ('BEST_BID', 'BEST_ASK', 'MID');

-- CreateEnum
CREATE TYPE "ExecutionAuthority" AS ENUM ('USER_CONFIRMATION_REQUIRED', 'PRE_SIGNED_LIMIT_ORDER', 'DELEGATED_FUTURE');

-- CreateEnum
CREATE TYPE "IntentEventType" AS ENUM ('CREATED', 'ACTIVATED', 'TRIGGERED', 'READY', 'EXECUTING', 'PLACED', 'EXECUTED', 'CANCELLED', 'EXPIRED', 'REJECTED', 'FAILED', 'PROGRESS');

-- CreateTable
CREATE TABLE "Intent" (
    "id" TEXT NOT NULL,
    "owner" VARCHAR(42) NOT NULL,
    "marketId" TEXT NOT NULL,
    "type" "IntentType" NOT NULL,
    "status" "IntentStatus" NOT NULL DEFAULT 'DRAFT',
    "side" "OrderSide" NOT NULL,
    "sizeBase" DECIMAL(78,0) NOT NULL,
    "limitPriceTicks" BIGINT,
    "tif" TEXT,
    "triggerType" "TriggerType" NOT NULL,
    "triggerReference" "ReferencePriceKind" NOT NULL,
    "triggerPriceTicks" BIGINT NOT NULL,
    "executionAuthority" "ExecutionAuthority" NOT NULL,
    "preSignedOrderHash" TEXT,
    "preSignedOrder" JSONB,
    "preSignedSignature" BYTEA,
    "linkedOrderHash" TEXT,
    "preparedQuote" JSONB,
    "preparedQuoteAt" TIMESTAMP(3),
    "cooldownUntilAt" TIMESTAMP(3),
    "rawText" TEXT,
    "parsedJson" JSONB NOT NULL,
    "parserMeta" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastEvaluatedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Intent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntentEvent" (
    "id" BIGSERIAL NOT NULL,
    "intentId" TEXT NOT NULL,
    "type" "IntentEventType" NOT NULL,
    "payload" JSONB,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Intent_owner_status_idx" ON "Intent"("owner", "status");

-- CreateIndex
CREATE INDEX "Intent_marketId_status_idx" ON "Intent"("marketId", "status");

-- CreateIndex
CREATE INDEX "Intent_status_expiresAt_idx" ON "Intent"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "Intent_linkedOrderHash_idx" ON "Intent"("linkedOrderHash");

-- CreateIndex
CREATE INDEX "IntentEvent_intentId_ts_idx" ON "IntentEvent"("intentId", "ts");

-- AddForeignKey
ALTER TABLE "Intent" ADD CONSTRAINT "Intent_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntentEvent" ADD CONSTRAINT "IntentEvent_intentId_fkey" FOREIGN KEY ("intentId") REFERENCES "Intent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
