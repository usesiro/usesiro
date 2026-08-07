-- AlterTable
ALTER TABLE "Payment"
  ADD COLUMN "userId" TEXT,
  ADD COLUMN "accessStartsAt" TIMESTAMP(3),
  ADD COLUMN "accessEndsAt" TIMESTAMP(3);

-- Preserve existing successful payments while moving entitlement away from email lookup.
UPDATE "Payment" AS payment
SET
  "userId" = app_user."id",
  "accessStartsAt" = COALESCE(payment."paidAt", payment."createdAt"),
  "accessEndsAt" = COALESCE(payment."paidAt", payment."createdAt") + INTERVAL '30 days'
FROM "User" AS app_user
WHERE LOWER(payment."email") = LOWER(app_user."email")
  AND payment."status" = 'SUCCESS';

ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Payment_userId_accessEndsAt_idx" ON "Payment"("userId", "accessEndsAt");
