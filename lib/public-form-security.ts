const DEFAULT_MAX_BODY_BYTES = 16 * 1024;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Map<string, RateLimitEntry>;

const globalWithPublicFormLimits = globalThis as typeof globalThis & {
  publicFormRateLimits?: RateLimitStore;
};

const rateLimits =
  globalWithPublicFormLimits.publicFormRateLimits ?? new Map<string, RateLimitEntry>();

globalWithPublicFormLimits.publicFormRateLimits = rateLimits;

export type JsonBodyResult =
  | { success: true; data: unknown }
  | { success: false; error: string; status: 400 | 413 | 415 };

/** Read JSON without allowing an unbounded request body to be buffered in memory. */
export async function readLimitedJsonBody(
  request: Request,
  maxBytes = DEFAULT_MAX_BODY_BYTES,
): Promise<JsonBodyResult> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim();
  if (contentType !== "application/json") {
    return { success: false, error: "Content-Type must be application/json.", status: 415 };
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return { success: false, error: "Request body is too large.", status: 413 };
  }

  if (!request.body) {
    return { success: false, error: "A JSON request body is required.", status: 400 };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      receivedBytes += value.byteLength;
      if (receivedBytes > maxBytes) {
        await reader.cancel();
        return { success: false, error: "Request body is too large.", status: 413 };
      }
      chunks.push(value);
    }

    const body = new Uint8Array(receivedBytes);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return { success: true, data: JSON.parse(new TextDecoder().decode(body)) };
  } catch {
    return { success: false, error: "Invalid JSON request body.", status: 400 };
  } finally {
    reader.releaseLock();
  }
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

/** Remove characters that can create additional email headers. */
export function safeEmailHeader(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
}

export function getClientIdentifier(request: Request): string {
  return (
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

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
}): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const key = `${scope}:${identifier.toLowerCase()}`;
  const current = rateLimits.get(key);

  // Keep the process-local fallback bounded even under a high-cardinality attack.
  if (rateLimits.size > 1_000) {
    for (const [storedKey, entry] of rateLimits) {
      if (entry.resetAt <= now) rateLimits.delete(storedKey);
    }
  }
  if (!current && rateLimits.size >= 10_000) {
    const oldestKey = rateLimits.keys().next().value;
    if (oldestKey) rateLimits.delete(oldestKey);
  }

  if (!current || current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
