-- AlterTable
ALTER TABLE "User"
  ADD COLUMN "onboardingSteps" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "onboardingDismissedAt" TIMESTAMP(3),
  ADD COLUMN "onboardingCompletedAt" TIMESTAMP(3);
