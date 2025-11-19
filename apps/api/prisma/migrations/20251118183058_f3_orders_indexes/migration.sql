-- CreateIndex
CREATE INDEX "Order_maker_status_placedAt_idx" ON "Order"("maker", "status", "placedAt");

-- CreateIndex
CREATE INDEX "Order_maker_placedAt_idx" ON "Order"("maker", "placedAt");
