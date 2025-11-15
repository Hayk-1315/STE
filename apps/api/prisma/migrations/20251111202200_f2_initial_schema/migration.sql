/*
  Warnings:

  - You are about to drop the column `active` on the `Market` table. All the data in the column will be lost.
  - You are about to drop the column `base` on the `Market` table. All the data in the column will be lost.
  - You are about to drop the column `quote` on the `Market` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[symbol]` on the table `Market` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `baseTokenId` to the `Market` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minNotionalQ` to the `Market` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minSizeB` to the `Market` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceTickQ` to the `Market` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quoteTokenId` to the `Market` table without a default value. This is not possible if the table is not empty.
  - Added the required column `symbol` to the `Market` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Market` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderSide" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PLACED', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('PLACED', 'PARTIAL_FILL', 'FILLED', 'CANCELLED', 'EXPIRED');

-- DropIndex
DROP INDEX "Market_base_quote_key";

-- AlterTable
ALTER TABLE "Market" DROP COLUMN "active",
DROP COLUMN "base",
DROP COLUMN "quote",
ADD COLUMN     "baseTokenId" TEXT NOT NULL,
ADD COLUMN     "minNotionalQ" DECIMAL(78,0) NOT NULL,
ADD COLUMN     "minSizeB" DECIMAL(78,0) NOT NULL,
ADD COLUMN     "priceTickQ" DECIMAL(78,0) NOT NULL,
ADD COLUMN     "quoteTokenId" TEXT NOT NULL,
ADD COLUMN     "symbol" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "address" VARCHAR(42) NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "orderHash" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "maker" VARCHAR(42) NOT NULL,
    "side" "OrderSide" NOT NULL,
    "priceTicks" BIGINT NOT NULL,
    "sizeBase" DECIMAL(78,0) NOT NULL,
    "remainingBase" DECIMAL(78,0) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PLACED',
    "expiry" BIGINT NOT NULL,
    "salt" TEXT NOT NULL,
    "zeroExOrder" JSONB NOT NULL,
    "signature" BYTEA NOT NULL,
    "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("orderHash")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" BIGSERIAL NOT NULL,
    "marketId" TEXT NOT NULL,
    "makerOrderHash" TEXT NOT NULL,
    "taker" VARCHAR(42) NOT NULL,
    "priceTicks" BIGINT NOT NULL,
    "sizeBase" DECIMAL(78,0) NOT NULL,
    "txHash" VARCHAR(66),
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderEvent" (
    "id" BIGSERIAL NOT NULL,
    "marketId" TEXT NOT NULL,
    "orderHash" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "payload" JSONB NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookSnapshot" (
    "id" BIGSERIAL NOT NULL,
    "marketId" TEXT NOT NULL,
    "bids" JSONB NOT NULL,
    "asks" JSONB NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Token_address_key" ON "Token"("address");

-- CreateIndex
CREATE INDEX "Order_marketId_status_idx" ON "Order"("marketId", "status");

-- CreateIndex
CREATE INDEX "Order_maker_idx" ON "Order"("maker");

-- CreateIndex
CREATE INDEX "Trade_marketId_ts_idx" ON "Trade"("marketId", "ts");

-- CreateIndex
CREATE INDEX "OrderEvent_marketId_ts_idx" ON "OrderEvent"("marketId", "ts");

-- CreateIndex
CREATE INDEX "OrderEvent_orderHash_ts_idx" ON "OrderEvent"("orderHash", "ts");

-- CreateIndex
CREATE INDEX "BookSnapshot_marketId_ts_idx" ON "BookSnapshot"("marketId", "ts");

-- CreateIndex
CREATE UNIQUE INDEX "Market_symbol_key" ON "Market"("symbol");

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_baseTokenId_fkey" FOREIGN KEY ("baseTokenId") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_quoteTokenId_fkey" FOREIGN KEY ("quoteTokenId") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEvent" ADD CONSTRAINT "OrderEvent_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookSnapshot" ADD CONSTRAINT "BookSnapshot_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
