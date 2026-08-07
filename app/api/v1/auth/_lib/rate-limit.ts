import { consumeDistributedRateLimit } from "@/lib/distributed-rate-limit";

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  return consumeDistributedRateLimit({
    scope: "auth",
    identifier: key,
    limit,
    windowMs,
  });
}
