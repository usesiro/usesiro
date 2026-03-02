/*
  Warnings:

  - A unique constraint covering the columns `[monoAccountId]` on the table `Business` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Business" DROP CONSTRAINT "Business_userId_fkey";

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "monoAccountId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Business_monoAccountId_key" ON "Business"("monoAccountId");

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
