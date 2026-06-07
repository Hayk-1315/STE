-- CreateTable
CREATE TABLE "CancelPairFloor" (
    "maker" VARCHAR(42) NOT NULL,
    "makerToken" VARCHAR(42) NOT NULL,
    "takerToken" VARCHAR(42) NOT NULL,
    "minValidSalt" DECIMAL(78,0) NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fromTxHash" VARCHAR(66),

    CONSTRAINT "CancelPairFloor_pkey" PRIMARY KEY ("maker", "makerToken", "takerToken")
);

-- CreateIndex
CREATE INDEX "CancelPairFloor_maker_idx" ON "CancelPairFloor"("maker");
