import { consumeDistributedRateLimit } from "@/lib/distributed-rate-limit";
export {
  escapeHtml,
  getClientIdentifier,
  readLimitedJsonBody,
  safeEmailHeader,
} from "@/lib/public-form-utils";
export type { JsonBodyResult } from "@/lib/public-form-utils";

export function consumeRateLimit({
  scope,
  identifier,
  limit,
  windowMs,
}: {
  scope: string;
  identifier: string;
  limit: number;
  windowMs: number;
}) {
  return consumeDistributedRateLimit({ scope, identifier, limit, windowMs });
}
