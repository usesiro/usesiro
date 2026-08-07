import crypto from "crypto";

export function hashRateLimitKey(scope: string, identifier: string): string {
  return crypto
    .createHash("sha256")
    .update(`${scope}:${identifier.trim().toLowerCase()}`)
    .digest("hex");
}
