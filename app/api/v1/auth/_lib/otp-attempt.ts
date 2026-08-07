import { prisma } from "@/lib/prisma";

type ReservedAttempt = {
  otpAttempts: number;
};

export async function reserveOtpAttempt(
  userId: string,
  otpSecret: string,
  expiresAfter: Date,
  maxAttempts: number
): Promise<number | null> {
  const rows = await prisma.$queryRaw<ReservedAttempt[]>`
    UPDATE "User"
    SET
      "otpAttempts" = "otpAttempts" + 1,
      "updatedAt" = NOW()
    WHERE
      "id" = ${userId}
      AND "otpSecret" = ${otpSecret}
      AND "otpExpiresAt" > ${expiresAfter}
      AND "otpAttempts" < ${maxAttempts}
    RETURNING "otpAttempts"
  `;

  return rows[0]?.otpAttempts ?? null;
}
