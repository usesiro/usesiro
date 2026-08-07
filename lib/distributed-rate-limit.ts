import { prisma } from "@/lib/prisma";
import { hashRateLimitKey } from "@/lib/rate-limit-key";

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export { hashRateLimitKey } from "@/lib/rate-limit-key";

export async function consumeDistributedRateLimit({
  scope,
  identifier,
  limit,
  windowMs,
}: {
  scope: string;
  identifier: string;
  limit: number;
  windowMs: number;
}): Promise<RateLimitResult> {
  if (!Number.isInteger(limit) || limit < 1 || !Number.isFinite(windowMs) || windowMs < 1) {
    throw new Error("Invalid rate-limit configuration");
  }

  const now = new Date();
  const nextResetAt = new Date(now.getTime() + windowMs);
  const key = hashRateLimitKey(scope, identifier);

  const [bucket] = await prisma.$queryRaw<Array<{ count: number; resetAt: Date }>>`
    INSERT INTO "rate_limit_buckets" ("key", "count", "resetAt", "updatedAt")
    VALUES (${key}, 1, ${nextResetAt}, NOW())
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "rate_limit_buckets"."resetAt" <= NOW() THEN 1
        ELSE "rate_limit_buckets"."count" + 1
      END,
      "resetAt" = CASE
        WHEN "rate_limit_buckets"."resetAt" <= NOW() THEN ${nextResetAt}
        ELSE "rate_limit_buckets"."resetAt"
      END,
      "updatedAt" = NOW()
    RETURNING "count", "resetAt"
  `;

  if (!bucket) throw new Error("Unable to reserve rate-limit attempt");

  // Opportunistically remove old buckets without adding a cleanup query to every request.
  if (key.startsWith("00")) {
    await prisma.rateLimitBucket.deleteMany({
      where: { resetAt: { lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } },
    });
  }

  return {
    allowed: bucket.count <= limit,
    retryAfterSeconds: bucket.count <= limit
      ? 0
      : Math.max(1, Math.ceil((bucket.resetAt.getTime() - now.getTime()) / 1000)),
  };
}
