-- AlterTable
ALTER TABLE "Business" ADD COLUMN "lastSyncedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT,
ADD COLUMN "phone" TEXT;
