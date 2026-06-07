-- Phase 4.x-b + 4.x-c: CMR execution-lifecycle tracking.
-- Additive only; both columns nullable, no data backfill.

ALTER TABLE "Intent" ADD COLUMN "linkedTxHash"      VARCHAR(66);
ALTER TABLE "Intent" ADD COLUMN "walletLockUntilAt" TIMESTAMP(3);

-- CMR execution reconciler looks up Intent by (status=EXECUTING, linkedTxHash, marketId, owner).
-- Index just on linkedTxHash; the other fields are highly selective (single intent per (owner,market)).
CREATE INDEX "Intent_linkedTxHash_idx" ON "Intent"("linkedTxHash");
