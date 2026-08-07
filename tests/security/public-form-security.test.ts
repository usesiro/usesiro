import assert from "node:assert/strict";
import test from "node:test";
import { hashRateLimitKey } from "../../lib/rate-limit-key";
import { escapeHtml, getClientIdentifier, readLimitedJsonBody, safeEmailHeader } from "../../lib/public-form-utils";

function jsonRequest(body: string, headers: Record<string, string> = {}) {
  return new Request("https://usesiro.com/api/test", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body,
  });
}

test("bounded JSON reader accepts valid JSON", async () => {
  const result = await readLimitedJsonBody(jsonRequest('{"name":"Siro"}'), 64);
  assert.deepEqual(result, { success: true, data: { name: "Siro" } });
});

test("bounded JSON reader rejects unsupported content types", async () => {
  const request = new Request("https://usesiro.com/api/test", {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: "hello",
  });
  const result = await readLimitedJsonBody(request);
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.status, 415);
});

test("bounded JSON reader rejects declared and streamed oversized bodies", async () => {
  const declared = await readLimitedJsonBody(
    jsonRequest("{}", { "content-length": "100" }),
    8,
  );
  assert.equal(declared.success, false);
  if (!declared.success) assert.equal(declared.status, 413);

  const streamed = await readLimitedJsonBody(jsonRequest('{"value":"too large"}'), 8);
  assert.equal(streamed.success, false);
  if (!streamed.success) assert.equal(streamed.status, 413);
});

test("bounded JSON reader rejects malformed JSON", async () => {
  const result = await readLimitedJsonBody(jsonRequest("{broken"));
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.status, 400);
});

test("email content helpers neutralize HTML and header injection", () => {
  assert.equal(
    escapeHtml(`<script>alert("x")</script> O'Reilly & Co.`),
    "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; O&#39;Reilly &amp; Co.",
  );
  assert.equal(
    safeEmailHeader("Invoice\r\nBcc: attacker@example.com\u0000"),
    "Invoice Bcc: attacker@example.com",
  );
});

test("client identifier prefers trusted platform forwarding headers", () => {
  const request = new Request("https://usesiro.com/api/test", {
    headers: {
      "x-vercel-forwarded-for": "203.0.113.7, 10.0.0.1",
      "x-real-ip": "198.51.100.4",
      "x-forwarded-for": "192.0.2.9",
    },
  });
  assert.equal(getClientIdentifier(request), "203.0.113.7");
});

test("rate-limit keys are normalized, fixed length, and do not expose identifiers", () => {
  const lower = hashRateLimitKey("login", " User@Example.com ");
  const upper = hashRateLimitKey("login", "user@example.com");
  assert.equal(lower, upper);
  assert.match(lower, /^[a-f0-9]{64}$/);
  assert.equal(lower.includes("example.com"), false);
  assert.notEqual(lower, hashRateLimitKey("register", "user@example.com"));
});
