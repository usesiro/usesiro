# ⚡️ SIRO — Engineering Handover Document

**Author:** Bolaji
**Date:** May 27, 2026
**Branch:** `product_upgrade`
**Status:** All features are functional. AI features require a funded `CEREBRAS_API_KEY` before production use.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Clearsheet AI — The Intelligent Import Engine](#3-clearsheet-ai--the-intelligent-import-engine)
   - 3.1 [What It Does](#31-what-it-does)
   - 3.2 [The Pipeline (Step-by-Step)](#32-the-pipeline-step-by-step)
   - 3.3 [API Routes Reference](#33-api-routes-reference)
   - 3.4 [Supporting Libraries](#34-supporting-libraries)
   - 3.5 [Frontend Component](#35-frontend-component-transactionimportmodaltsx)
   - 3.6 [AI Provider & Model Details](#36-ai-provider--model-details)
   - 3.7 [Rate Limiting & Cost Controls](#37-rate-limiting--cost-controls)
   - 3.8 [Resilience & Error Handling](#38-resilience--error-handling)
   - 3.9 [Known Limitations & Unfinished Work](#39-known-limitations--unfinished-work)
4. [Backend Stabilization & Security](#4-backend-stabilization--security)
   - 4.1 [Global Middleware (proxy.ts)](#41-global-middleware-proxyts)
   - 4.2 [Authentication Flow](#42-authentication-flow)
   - 4.3 [Admin Dashboard & RBAC](#43-admin-dashboard--rbac)
   - 4.4 [Compliance Audit Logging](#44-compliance-audit-logging)
5. [Database Architecture](#5-database-architecture)
   - 5.1 [New Models Added](#51-new-models-added)
   - 5.2 [Prisma Client Configuration](#52-prisma-client-configuration)
6. [Mono Bank Sync Optimizations](#6-mono-bank-sync-optimizations)
7. [Booking System](#7-booking-system)
8. [Frontend & UX Overhaul](#8-frontend--ux-overhaul)
9. [Infrastructure & DevOps](#9-infrastructure--devops)
10. [Environment Variables Reference](#10-environment-variables-reference)
11. [Uncommitted Changes (Current Diff)](#11-uncommitted-changes-current-diff)
12. [Onboarding Checklist for Next Engineer](#12-onboarding-checklist-for-next-engineer)

---

## 1. Executive Summary

This document serves as a comprehensive handover of all engineering work performed on the Siro platform. The work spans four major domains:

| Domain | Summary |
|---|---|
| **Clearsheet AI** | A multi-stage AI-powered transaction import engine that can parse CSV, XLSX, and PDF bank statements into structured ledger entries. Uses Cerebras API (Qwen 3 235B model). |
| **Backend & Security** | Global middleware for JWT authentication, RBAC for admin/user portals, audit logging, and HttpOnly cookie-based session management. |
| **Data Architecture** | New Prisma models (`AuditLog`, `SavedMapping`, `Booking`, `ContactMessage`), bulk-insert strategies via `createMany`, and idempotent transaction fingerprinting. |
| **UX Polish** | Skeleton loaders, mobile bottom navigation, personalized greetings, holiday engine, responsive layouts, and a multi-stage import review UI. |

---

## 2. Architecture Overview

Siro is a **Next.js App Router** monorepo. All backend logic lives in serverless API routes under `app/api/v1/`.

```
siro/
├── app/
│   └── api/v1/
│       ├── auth/              # Login, Signup, OTP, Password Reset, Logout, Status
│       ├── import/            # ★ CLEARSHEET AI PIPELINE (6 sub-routes)
│       │   ├── ai-detect/     # AI-powered column header mapping
│       │   ├── detect-columns/# Fuzzy matching fallback column detection
│       │   ├── extract-text/  # PDF → raw text extraction (non-AI)
│       │   ├── parse-pdf/     # AI text chunk → structured rows
│       │   ├── standardize/   # AI data cleanup & normalization
│       │   └── execute/       # Final DB insert with deduplication
│       ├── bookings/          # Demo booking system
│       ├── mono/              # Bank sync via Mono API
│       ├── transactions/      # CRUD for transactions
│       ├── business/          # Business profile management
│       ├── categories/        # Expense/Income categories
│       ├── documents/         # Receipt/invoice uploads (Vercel Blob)
│       ├── audit-logs/        # Admin audit trail viewer
│       ├── notifications/     # In-app notification system
│       ├── contact/           # Contact form handler
│       └── waitlist/          # Waitlist registration
├── components/
│   └── TransactionImportModal.tsx  # ★ THE CLEARSHEET AI FRONTEND
├── lib/
│   ├── bank-mappings.ts       # SiroField type definitions & bank column aliases
│   ├── import-parsers.ts      # Date/amount parsing, PDF region extraction, chunking
│   ├── import-utils.ts        # Fuzzy matching, idempotency key generation, header hashing
│   ├── categorizer.ts         # Auto-categorization engine for transactions
│   ├── logger.ts              # Centralized audit log writer
│   └── prisma.ts              # Singleton Prisma client with Neon PostgreSQL adapter
├── proxy.ts                   # ★ GLOBAL MIDDLEWARE (JWT guard for all routes)
├── prisma/
│   └── schema.prisma          # Database schema (source of truth)
└── hooks/
    └── useVatCalculator.ts    # VAT computation hook
```

---

## 3. Clearsheet AI — The Intelligent Import Engine

### 3.1 What It Does

Clearsheet AI is Siro's proprietary transaction import system. It allows users to upload **any** bank statement file (CSV, XLSX, XLS, or PDF) and have it automatically:

1. **Parsed** — Raw text/data extracted from the file
2. **Mapped** — Column headers intelligently matched to Siro's internal fields
3. **Cleaned** — Dates normalized, currencies detected, amounts sanitized, duplicates removed
4. **Reviewed** — Presented in an interactive, paginated table for human verification
5. **Imported** — Bulk-inserted into PostgreSQL with idempotent fingerprinting

### 3.2 The Pipeline (Step-by-Step)

The import process differs slightly depending on whether the user uploads a **spreadsheet** (CSV/XLSX) or a **PDF**.

#### Path A: CSV / XLSX Upload

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. User uploads .csv / .xlsx / .xls file                          │
│  2. Client-side: XLSX.js parses file → extracts headers + rows     │
│  3. handleStandardize() batches rows (25 per batch)                │
│  4. Each batch → POST /api/v1/import/standardize                   │
│     └── AI cleans data, detects types, normalizes dates/amounts    │
│  5. Results accumulated client-side with progress bar              │
│  6. If opening balance or foreign currency detected:               │
│     └── Show CONFIRM_CLEANUP step (user confirms rate/balance)     │
│  7. REVIEW step: paginated editable table (20 rows/page)           │
│  8. User clicks "Confirm & Finish"                                 │
│  9. POST /api/v1/import/execute                                    │
│     └── Bulk insert via Prisma createMany with deduplication       │
│ 10. SUCCESS screen with count + duplicates                         │
└─────────────────────────────────────────────────────────────────────┘
```

#### Path B: PDF Upload (3-Stage Progressive Pipeline)

```
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 1 — TEXT EXTRACTION (No AI)                                 │
│  ├── Upload PDF as FormData                                        │
│  ├── POST /api/v1/import/extract-text                              │
│  ├── Uses `pdf-parse` npm package to convert PDF → raw text        │
│  └── Returns plain text string                                     │
│                                                                     │
│  STAGE 2 — AI RECORD EXTRACTION (Chunked)                          │
│  ├── Client runs extractTransactionRegions(rawText)                │
│  │   └── Filters noise lines, keeps only rows with dates/amounts   │
│  ├── Client splits into chunks of 25 lines (2-line overlap)        │
│  ├── Each chunk → POST /api/v1/import/parse-pdf                    │
│  │   └── AI extracts: date, description, amount, type, balance     │
│  ├── "Split-and-Retry": If AI truncates, chunk is halved           │
│  │   and each half is re-processed recursively                     │
│  ├── De-duplication via composite key (date_description_amount)    │
│  └── Metadata captured: openingBalance, currency                   │
│                                                                     │
│  STAGE 3 — AI STANDARDIZATION (Same as CSV path)                   │
│  ├── Extracted rows → POST /api/v1/import/standardize              │
│  ├── AI normalizes all fields to consistent format                 │
│  └── Proceeds to CONFIRM_CLEANUP → REVIEW → EXECUTE               │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.3 API Routes Reference

#### `POST /api/v1/import/extract-text`
**File:** `app/api/v1/import/extract-text/route.ts`
**Purpose:** Non-AI PDF text extraction.
**Auth:** Bearer token required.
**Input:** `FormData` with `file` field (PDF).
**Output:** `{ text: string }` — raw text content of the PDF.
**Dependencies:** `pdf-parse` npm package.
**Notes:**
- Rejects empty or image-only PDFs (< 10 chars).
- No AI cost — purely server-side parsing.

---

#### `POST /api/v1/import/parse-pdf`
**File:** `app/api/v1/import/parse-pdf/route.ts`
**Purpose:** AI-powered text chunk → structured transaction rows.
**Auth:** None required at route level (should be behind middleware).
**Input:** `{ text: string }` — a chunk of bank statement text.
**Output:**
```json
{
  "rows": [
    { "date": "2025-01-15", "description": "POS Purchase", "amount": 5000, "type": "EXPENSE", "balance": 45000 }
  ],
  "openingBalance": 50000,
  "currency": "NGN"
}
```
**AI Model:** `qwen-3-235b-a22b-instruct-2507` via Cerebras API
**Max Tokens:** 8192
**Temperature:** 0 (deterministic)
**Response Format:** Strict JSON (`response_format: { type: "json_object" }`)
**Retry Logic:** Exponential backoff (2s, 4s, 8s, 16s, 32s) on:
- HTTP 429 (Rate limit)
- HTTP 5xx (Server errors)
- Network errors (fetch failed, timeout)

**Key Design Decision:** This route is intentionally unauthenticated at the route level because it's called from the client during the PDF processing loop. Authentication is handled by the global middleware in `proxy.ts`.

---

#### `POST /api/v1/import/ai-detect`
**File:** `app/api/v1/import/ai-detect/route.ts`
**Purpose:** AI-powered column header mapping. Takes user's custom bank statement headers and maps them to Siro's internal field names.
**Auth:** Bearer token + JWT verification.
**Input:**
```json
{
  "headers": ["Transaction Date", "Narration", "Debit", "Credit", "Balance"],
  "sampleRows": [{ "Transaction Date": "2025-01-01", "Narration": "POS", ... }]
}
```
**Output:**
```json
{
  "mapping": {
    "Transaction Date": "date",
    "Narration": "description",
    "Debit": "debit",
    "Credit": "credit",
    "Balance": "balance"
  }
}
```
**Rate Limiting:**
- Max **10 AI mapping attempts per hour** per user.
- Tracked via `AuditLog` table with action `AI_MAPPING_ATTEMPT`.
- Returns HTTP 429 with user-friendly message when exceeded.

**Sanitization:**
- AI output is validated against the `SIRO_FIELDS` array.
- Any AI-suggested value NOT in `SIRO_FIELDS` is set to `null`.
- This prevents prompt injection or hallucinated field names from reaching the database.

**Micro-Payload Strategy:**
- Only the first 3 sample rows are sent to the AI (hard limit).
- Minimizes data exposure and token cost.

---

#### `POST /api/v1/import/standardize`
**File:** `app/api/v1/import/standardize/route.ts`
**Purpose:** AI-powered data cleanup. Takes raw transaction data and returns normalized, structured transactions.
**Auth:** Bearer token + JWT verification.
**Input:**
```json
{
  "headers": ["Date", "Description", "Amount"],
  "data": [{ "Date": "8,04,2020", "Description": "MTN Airtime", "Amount": "(5,000.00)" }]
}
```
**Output:**
```json
{
  "transactions": [
    { "date": "2020-04-08", "description": "MTN Airtime", "amount": 5000, "type": "EXPENSE" }
  ],
  "openingBalance": null,
  "detectedCurrency": "NGN",
  "suggestedRate": null
}
```
**AI Behavior:**
- Counts input records and ensures output count matches (instruction in prompt).
- Detects INCOME vs EXPENSE from Debit/Credit columns, negative amounts, and keywords.
- Detects opening balances and foreign currencies (USD → NGN conversion rates).

---

#### `POST /api/v1/import/detect-columns`
**File:** `app/api/v1/import/detect-columns/route.ts`
**Purpose:** Non-AI fallback column detection using fuzzy matching (Fuse.js).
**Auth:** Bearer token + JWT verification.
**Input:** `{ headers: string[] }`
**Output:**
```json
{
  "suggestedMapping": { "Date": "date", "Narration": "description", ... },
  "isPredefined": false
}
```
**Logic:**
1. Generates a hash of the incoming headers (`generateHeaderHash`).
2. Checks the `SavedMapping` table for a previously saved mapping with that hash for this business.
3. If found → returns saved mapping with `isPredefined: true`.
4. If not → runs `detectColumnMapping()` which uses **Fuse.js fuzzy matching** against the `BANK_COLUMN_MAP` dictionary.
5. Validates that at least a `date` and an `amount` (or `debit`+`credit`) column was detected. Returns HTTP 422 if the file doesn't look like a transaction record.

---

#### `POST /api/v1/import/execute`
**File:** `app/api/v1/import/execute/route.ts`
**Purpose:** Final import step. Takes cleaned transactions and bulk-inserts them into the database.
**Auth:** Bearer token + JWT verification.
**Input:**
```json
{
  "data": [{ "date": "...", "description": "...", "amount": 5000, "type": "INCOME" }],
  "mapping": { ... },
  "headers": ["Date", "Description", ...],
  "rate": 1600,
  "updateOpeningBalance": 50000
}
```
**Key Operations:**
1. **Persists column mapping** — Upserts to `SavedMapping` table so the same file format is auto-detected next time.
2. **Processes each row:**
   - Supports two modes: **Standardized data** (direct keys from AI) and **Raw data** (with manual mapping).
   - Parses dates with `parseFlexibleDate()` — handles Excel serial numbers, DD/MM/YYYY, month names, messy separators.
   - Parses amounts with `parseFlexibleAmount()` — handles currency symbols (₦, $), commas, accounting parentheses `(5,000.00)`.
   - Detects INCOME/EXPENSE from the `transaction_type` column keywords or from debit/credit column presence.
   - Applies currency conversion if a rate is provided.
3. **Generates idempotency key** — SHA-256 hash of `amount|date|description|businessId|reference|balance`. Stored as `externalId` with a `@unique` constraint on the `Transaction` model.
4. **Auto-categorizes** — Uses regex-based rules in `categorizer.ts` to assign a category based on description keywords.
5. **Bulk inserts** — `prisma.transaction.createMany({ data, skipDuplicates: true })`.
6. **Records audit log** of the import (count, duplicates, rate applied).
7. **Records opening balance** in audit log if user requested it.

---

### 3.4 Supporting Libraries

#### `lib/bank-mappings.ts`
Defines the canonical mapping between Siro's internal field names and common bank statement column names across Nigerian banks.

**Type:** `SiroField` = `'date' | 'description' | 'amount' | 'debit' | 'credit' | 'balance' | 'reference' | 'notes' | 'transaction_type' | 'category'`

**Coverage includes:** GTBank, Access Bank, First Bank, UBA, Zenith, Mono, Paystack, and most POS terminals. The dictionary includes aliases like:
- `date` → "transaction date", "trans date", "value date", "txn date", "post date", "booking date"
- `description` → "narration", "remarks", "transaction narrative", "item bought", "particulars"
- `debit` → "withdrawals", "dr", "outcome", "payment"
- `credit` → "deposits", "cr", "income", "receipt"

---

#### `lib/import-parsers.ts`
Core parsing utilities:

| Function | Purpose |
|---|---|
| `parseFlexibleDate(val)` | Parses dates from any format: Excel serial numbers (e.g., `44927`), `DD,MM,YYYY`, `DD-MM-YYYY`, `DD/MM/YYYY`, `YYYY/MM/DD`, month names (`Jan 3`), ISO strings, Unix timestamps. Handles 2-digit years (>50 = 1900s, ≤50 = 2000s). |
| `parseFlexibleAmount(val)` | Strips currency symbols (₦, $, NGN), commas, spaces. Handles accounting parentheses `(40,000)` → `-40000`. Returns 0 for empty/invalid. |
| `extractTransactionRegions(rawText)` | **Critical for PDF pipeline.** Filters raw PDF text to keep only lines that contain date patterns (`DD/MM/YYYY`), money patterns (`digits.00`), or financial keywords (`balance`, `opening`, `closing`). Always preserves the first 25 lines (header area) for metadata. Removes lines shorter than 10 characters. Reduces AI token usage by 40-60%. |
| `chunkByLines(lines, size, overlap)` | Groups lines into chunks of `size` with `overlap` lines of overlap between consecutive chunks. Default: 25 lines per chunk, 2-line overlap. Used to ensure continuity across chunk boundaries so transactions split across chunks aren't lost. |

---

#### `lib/import-utils.ts`
Utility functions for the import pipeline:

| Function | Purpose |
|---|---|
| `detectColumnMapping(headers)` | Uses **Fuse.js** fuzzy matching (threshold: 0.3) against `BANK_COLUMN_MAP` to guess which Siro field each header belongs to. Tries exact match first, then fuzzy. |
| `generateTransactionIdempotencyKey(amount, date, description, businessId, reference?, balance?)` | Creates a **SHA-256 hash** fingerprint for each transaction. Format: `amount(2dp)|date(ISO)|description(lower)|businessId[|ref:reference][|bal:balance]`. This is stored as `externalId` in the Transaction table with a unique constraint to prevent duplicate imports. |
| `generateHeaderHash(headers)` | MD5 hash of sorted, lowercased, pipe-joined headers. Used to match against `SavedMapping` records so returning users don't need to re-map the same file format. |

---

#### `lib/categorizer.ts`
Rule-based auto-categorization engine:

- **Expense rules** match keywords like: AWS, MTN, Paystack, salary, rent, fuel, etc.
- **Income rules** match: POS settlement, payout, sale, Opay, Moniepoint, etc.
- Falls back to `uncategorized-income` or `uncategorized-expense` if no match.
- Categories are stored as database records in the `Category` table with slugs.

---

#### `lib/logger.ts`
Centralized audit logger:

```typescript
await recordAuditLog({
  userId: "...",
  action: "TRANSACTION.IMPORT",
  status: "SUCCESS",
  details: { count: 143, duplicates: 2 }
});
```

- Automatically captures `IP address` and `User-Agent` from request headers.
- Non-throwing — if logging fails, it logs to console but doesn't break the main request.

---

### 3.5 Frontend Component: `TransactionImportModal.tsx`

**File:** `components/TransactionImportModal.tsx` (662 lines)

This is the main user-facing component for the entire import flow. It's a multi-step modal with the following states:

```
Step Flow:
UPLOAD → STANDARDIZING → CONFIRM_CLEANUP → MAP → REVIEW → IMPORTING → SUCCESS
```

#### UI States & Features:

| Step | What the User Sees |
|---|---|
| `UPLOAD` | Drag-and-drop zone accepting `.csv`, `.xlsx`, `.xls`, `.pdf` |
| `STANDARDIZING` | Animated spinner with SparklesIcon, real-time progress bar, batch status text ("AI Structuring: Records 26 to 50..."), and stage-specific messages (Reading → Extracting → Cleaning) |
| `CONFIRM_CLEANUP` | Cards showing AI-detected opening balance (with checkbox to apply) and foreign currency exchange rate (with editable input field) |
| `REVIEW` | Paginated table (20 rows/page) with editable cells for date, description, type (INCOME/EXPENSE dropdown), and amount. Delete button per row. Color-coded amounts (green for income, red for expense). |
| `IMPORTING` | Spinning loader with "Finalizing Import" message |
| `SUCCESS` | Green checkmark, count of created transactions, count of duplicates, "Done" button |

#### Error Handling UI:

- Network errors show a **"Retry From Records X"** button that resumes from the last successfully processed batch.
- Non-network errors reset to the UPLOAD step.
- Error banner with red styling and ExclamationCircleIcon.

#### Key Technical Details:

- **Batch Size:** 25 rows per AI request (for standardize).
- **Chunk Size:** 25 lines per AI request (for PDF parse), with 2-line overlap.
- **Rate Limiting Delay:** 4500ms between standardize batches, 2500ms between PDF parse chunks (to stay under Cerebras free tier limits of ~30 RPM).
- **Pagination:** 20 rows per page in REVIEW step.
- **De-duplication:** Composite key `${date}_${description}_${amount}` (lowercased, whitespace stripped).

---

### 3.6 AI Provider & Model Details

| Property | Value |
|---|---|
| **Provider** | Cerebras |
| **API Endpoint** | `https://api.cerebras.ai/v1/chat/completions` |
| **Model** | `qwen-3-235b-a22b-instruct-2507` (Qwen 3, 235 billion params, 22B active) |
| **Environment Variable** | `CEREBRAS_API_KEY` |
| **Response Format** | `{ type: "json_object" }` (enforced JSON output) |
| **Temperature** | `0` (deterministic, no randomness) |
| **Max Tokens** | 400 (ai-detect), 8192 (parse-pdf, standardize) |

> **Historical Note:** The system was originally built on Groq (Llama 3.3 70B) using `GROQ_API_KEY`. It was later migrated to Cerebras for better inference speed and the Qwen 3 235B model. The `GROQ_API_KEY` env var still exists in some environments but is no longer used by any active code.

---

### 3.7 Rate Limiting & Cost Controls

| Control | Implementation |
|---|---|
| **Per-user rate limit** | 10 AI mapping attempts/hour via `AuditLog` count query (ai-detect only) |
| **Micro-payload** | Only 3 sample rows sent to AI for header mapping |
| **Token economy** | `extractTransactionRegions()` pre-filters PDF text to remove 40-60% noise before sending to AI |
| **Client-side throttle** | 4500ms delay between standardize batches, 2500ms between PDF chunks |
| **Prompt engineering** | "ULTRA-DENSE JSON: Omit any keys that are null or empty" reduces output tokens |
| **Small chunks** | 25 lines/rows per batch to minimize per-request cost |

---

### 3.8 Resilience & Error Handling

All three AI routes (`ai-detect`, `parse-pdf`, `standardize`) share the same `processWithRetry` pattern:

```
Retry Strategy:
├── Max Retries: 5 (total 6 attempts)
├── Backoff: Exponential (2^attempt × 1000ms)
│   └── 2s → 4s → 8s → 16s → 32s
├── Retryable Conditions:
│   ├── HTTP 429 (Rate Limited)
│   ├── HTTP 5xx (Server Error)
│   ├── fetch failed (Network Error)
│   ├── ConnectTimeoutError
│   ├── UND_ERR_CONNECT_TIMEOUT
│   └── ETIMEDOUT
└── Non-Retryable: HTTP 4xx (except 429), Parse errors
```

**PDF-specific resilience:**
- If AI response is truncated (`finish_reason === "length"`), a specific error is thrown.
- On the frontend, truncation triggers "Split-and-Retry": the chunk is split in half with 2-line overlap, and each half is processed independently.
- This recursion ensures even very long bank statements are fully processed.

**Frontend resumability:**
- `lastProcessedIndex` state tracks the last successfully processed batch.
- On network failure, a "Retry" button appears that resumes from the exact batch where processing failed, avoiding re-processing already completed batches.

---

### 3.9 Known Limitations & Unfinished Work

> [!WARNING]
> **These items need attention before production deployment of AI features.**

| Item | Details |
|---|---|
| **No AI credits purchased** | The `CEREBRAS_API_KEY` needs to be funded. Without it, all AI routes return HTTP 500 with "Server Configuration Error: Missing API Key on Vercel." |
| **Not end-to-end tested** | The full pipeline (upload → AI → review → import) has not been tested with a funded API key in staging or production. |
| **`parse-pdf` has no auth** | The route does not perform its own JWT verification. It relies on the global middleware in `proxy.ts` to protect it. Ensure middleware is active. |
| **Manual column mapping UI not visible** | The `MAP` step exists in the state type but the UI for it is not shown in the current modal JSX. The flow skips directly from AI standardization to REVIEW. The older manual mapping flow (using detect-columns + ai-detect) would need UI integration if manual mapping is desired as a fallback. |
| **Opening balance is logged, not stored** | When a user confirms an opening balance, it's recorded in `AuditLog` but not persisted to a dedicated field on the `Business` or `Account` model. A `startingBalance` field should be added to the schema. |
| **Image-based PDFs not supported** | `pdf-parse` can only extract text from text-based PDFs. Scanned image PDFs will fail with "The PDF appears to be empty or an unreadable image scan." OCR integration (e.g., Tesseract) would be needed. |
| **No unit tests for AI routes** | The AI routes lack automated tests. Mock the Cerebras API responses to test the parsing, sanitization, and retry logic. |

---

## 4. Backend Stabilization & Security

### 4.1 Global Middleware (`proxy.ts`)

**File:** `proxy.ts` (root of project)

This is the **single source of truth** for all route protection. It runs at the Edge on every matched request.

**Layer 1 — UI Page Protection:**
- Protects: `/dashboard`, `/transactions`, `/tax-readiness`, `/reconciliation`, `/reports`, `/settings`, `/pigshit` (admin)
- Checks for `siro_auth_token` HttpOnly cookie.
- If missing → redirects to `/login` (or `/pigshit/auth` for admin routes).
- If present → verifies JWT signature.
- **RBAC:** Admin routes (`/pigshit/*`) additionally check that `payload.role !== 'USER'`.
- **Genesis Check:** If no admin users exist in the database, redirects to `/pigshit/setup` for first-time SuperAdmin initialization.

**Layer 2 — API Route Protection:**
- Protects: All `/api/v1/*` routes.
- **Exceptions (public):** `/api/v1/auth`, `/api/v1/waitlist`, `/api/v1/contact`, `/api/v1/bookings`.
- Checks for `Authorization: Bearer <token>` header.
- If missing or invalid → returns HTTP 401 JSON response.

**Matcher configuration:**
```typescript
export const config = {
  matcher: [
    '/api/v1/:path*',
    '/dashboard/:path*',
    '/pigshit/:path*',
    '/transactions/:path*',
    '/tax-readiness/:path*',
    '/reconciliation/:path*',
    '/reports/:path*',
    '/settings/:path*'
  ],
};
```

> **Note:** The file is named `proxy.ts` instead of `middleware.ts`. Next.js requires the middleware to be at the project root as `middleware.ts` or `middleware.js`. Verify that this file is correctly referenced/renamed for production deployment. If it's currently `proxy.ts`, it may need to be renamed to `middleware.ts` for Next.js to auto-detect it.

---

### 4.2 Authentication Flow

```
Login Flow:
1. POST /api/v1/auth/login { email, password }
2. Server verifies credentials → generates JWT
3. Sets HttpOnly cookie: siro_auth_token (Secure, SameSite=Lax)
4. Returns JSON with user data (token no longer in response body)
5. Client stores token from cookie for API calls

Session Lifecycle:
- Page access → middleware checks cookie → verifies JWT
- API calls → middleware checks Authorization header → verifies JWT
- Logout → POST /api/v1/auth/logout → deletes cookie server-side
```

**Security hardening performed:**
- Removed `accessToken` from login JSON response body (cookie-only).
- Standardized password hashing to `bcryptjs` across all portals.
- Fixed password reset flow to use consistent hashing.

---

### 4.3 Admin Dashboard & RBAC

The admin dashboard lives under `/pigshit/` (internal codename).

**Features implemented:**
- **Portal-aware authentication:** Login API checks role to prevent cross-portal access.
- **Genesis lockdown:** Auto-locks after first SuperAdmin is created.
- **Admin OTP gating:** Secondary verification for admin signup/login.
- **Role hierarchy:** `SUPER_ADMIN` > `BUSINESS_ADMIN` > `FINANCE_ADMIN` > `USER`

---

### 4.4 Compliance Audit Logging

Every security-critical action is logged to the `AuditLog` table:

| Action | When |
|---|---|
| `AUTH.LOGIN` | User logs in |
| `AUTH.SIGNUP` | User registers |
| `AUTH.LOGOUT` | User logs out |
| `AUTH.PASSWORD_RESET` | Password is reset |
| `AI_MAPPING_ATTEMPT` | User triggers AI column mapping |
| `AI_MAPPING_SUCCESS` | AI mapping completes |
| `IMPORT.STANDARDIZE_ATTEMPT` | Standardize batch initiated |
| `TRANSACTION.IMPORT` | Transactions imported to DB |
| `BUSINESS.SET_STARTING_BALANCE` | Opening balance confirmed |

Each log entry captures: `userId`, `action`, `status`, `details` (JSON), `ip`, `userAgent`, `createdAt`.

---

## 5. Database Architecture

### 5.1 New Models Added

These models were added to `prisma/schema.prisma` during this work:

#### `AuditLog`
```prisma
model AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  user      User?    @relation(...)
  action    String   // e.g., "AUTH.LOGIN"
  status    String   // SUCCESS, FAILURE, WARNING
  details   Json?    // Contextual metadata
  ip        String?
  userAgent String?
  createdAt DateTime @default(now())
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}
```

#### `SavedMapping`
```prisma
model SavedMapping {
  id          String   @id @default(uuid())
  businessId  String
  business    Business @relation(...)
  headerHash  String   // MD5 hash of sorted column names
  mapping     Json     // { "Date": "date", "Narration": "description", ... }
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@unique([businessId, headerHash])
}
```

#### `Booking`
```prisma
model Booking {
  id           String   @id @default(uuid())
  fullName     String
  email        String
  companyName  String?
  notes        String?
  startTime    DateTime @unique  // DB-level race condition prevention
  endTime      DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@index([startTime])
}
```

#### `ContactMessage`
```prisma
model ContactMessage {
  id        String   @id @default(uuid())
  fullName  String
  email     String
  topic     String
  message   String
  createdAt DateTime @default(now())
}
```

#### User Model Updates
```prisma
model User {
  // Added fields:
  firstName    String?
  lastName     String?
  phone        String?
}
```

### 5.2 Prisma Client Configuration

**File:** `lib/prisma.ts`

The Prisma client uses a custom configuration for Neon PostgreSQL compatibility:

- **Adapter:** `@prisma/adapter-pg` (PrismaPg) for Neon's serverless driver.
- **Connection Pool:** `pg` Pool with `max: 10`, `connectionTimeoutMillis: 30000`, `idleTimeoutMillis: 30000`, SSL enabled.
- **Singleton Pattern:** Uses a unique global key (`__siro_v4_prisma__`) to prevent multiple instances during Next.js hot reload.
- **Logging:** Full query logging in development, error-only in production.

---

## 6. Mono Bank Sync Optimizations

**Problem:** The original Mono sync endpoint used a `for` loop that queried the database line-by-line for each transaction, causing timeouts on large syncs.

**Solution:**
- Replaced individual `prisma.transaction.create()` calls with `prisma.transaction.createMany()`.
- All transactions from a Mono sync are now inserted in a **single database trip**.
- `skipDuplicates: true` prevents duplicate entries using the `externalId` unique constraint.
- The `externalId` for Mono transactions is a SHA-256 hash of the transaction details, maintaining idempotency.

---

## 7. Booking System

**API Route:** `POST /api/v1/bookings`

A demo booking system allowing users to schedule time-slot reservations:

- **Database model:** `Booking` with `startTime` as `@unique` to prevent double-booking at the DB level.
- **Auto-fallback:** If the internal booking API fails, the frontend seamlessly triggers the Cal.com embed widget.
- **Email notifications:** Automated alerts to the Siro team via Resend when new bookings are created.
- **Configuration:** All "From" addresses standardized to `info@usesiro.com` to prevent emails landing in Junk.

---

## 8. Frontend & UX Overhaul

### Implemented Features:

| Feature | Details |
|---|---|
| **Skeleton Loaders** | Replaced all "Loading..." text with layout-matched, animated skeleton components for Dashboard, Transactions, Reconciliation, Tax Readiness, and Settings pages. |
| **Mobile Bottom Nav** | Deprecated the hamburger menu sidebar on mobile. Implemented a sticky, glassmorphic `DashboardBottomNav.tsx` with a "Drop-up" menu for secondary actions. |
| **Dynamic Greetings** | Personalized "Good [Morning/Afternoon/Evening], [FirstName] 👋" header. Includes a holiday-aware engine (e.g., "Happy Easter! 🐣") and rotating productivity messages. |
| **Profile Completion Alert** | Slim dismissible indigo banner prompting users to complete their profile if `lastName` or `phone` is missing. |
| **Responsive Layouts** | Stat cards: 2-column grid on mobile with glassmorphic styling. Data tables: auto-switch to list views on mobile. Settings tabs: horizontal scroll on mobile. |
| **Header Truncation** | Business name limited to 18 characters in the header to prevent layout overflow. |
| **Profile Navigation** | Entire top-right profile section is clickable, linking to Settings. |

---

## 9. Infrastructure & DevOps

### Database
- **Provider:** Neon PostgreSQL (Serverless)
- **Staging Branch:** Separate staging database branch in Neon console.
- **Migration Strategy:** `prisma db push` for schema sync (not full migrations for speed).
- **Drift Fix:** Cleared a "Drift detected" error by resetting migration history.

### Deployment
- **Platform:** Vercel
- **Build Command:** `prisma generate && next build`
- **Environment:** `CEREBRAS_API_KEY` and `GROQ_API_KEY` configured across Vercel environments.
- **Email Deliverability:** All "From" addresses use verified `info@usesiro.com` domain.

### Git Workflow
- **Adopted:** Feature Branch → Pull Request → Staging → Main
- **Current Branch:** `product_upgrade` (all uncommitted AI updates are here)

---

## 10. Environment Variables Reference

| Variable | Purpose | Required For |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string | Everything |
| `JWT_SECRET` | Secret key for JWT signing/verification | Auth, Middleware |
| `RESEND_API_KEY` | Resend email service API key | OTPs, Password Resets, Booking Notifications |
| `NEXT_PUBLIC_MONO_PUBLIC_KEY` | Mono Connect.js public key (client-side) | Bank Link Widget |
| `MONO_SECRET_KEY` | Mono API secret key (server-side) | Bank Sync |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage token | Document Uploads |
| `CEREBRAS_API_KEY` | Cerebras AI inference API key | **All Clearsheet AI features** |
| `GROQ_API_KEY` | Legacy Groq API key (no longer used in code) | None (deprecated) |

> [!IMPORTANT]
> The `CEREBRAS_API_KEY` is the **critical dependency** for all AI features. Without a funded key, the import pipeline will fall back to showing error messages. The key needs to be set in both `.env.local` (for local dev) and in the Vercel dashboard (for production/staging).

---

## 11. Uncommitted Changes (Current Diff)

The following changes are on the `product_upgrade` branch but **not yet committed**:

```
Modified files:
  app/api/v1/import/ai-detect/route.ts    | 76 changes (+/-)
  app/api/v1/import/parse-pdf/route.ts    | 33 changes (+/-)
  app/api/v1/import/standardize/route.ts  | 21 changes (+/-)
  components/TransactionImportModal.tsx   | 152 changes (+/-)
```

### Summary of Changes:

#### `ai-detect/route.ts`
- **Migrated from Groq to Cerebras** API endpoint and model.
- Changed model from Llama 3.3 70B to `qwen-3-235b-a22b-instruct-2507`.
- Changed env var from `GROQ_API_KEY` to `CEREBRAS_API_KEY`.
- Added `response_format: { type: "json_object" }` for strict JSON output.
- Added network error detection and retry for `fetch failed`, `ConnectTimeoutError`, `ETIMEDOUT`.

#### `parse-pdf/route.ts`
- **Migrated from Groq to Cerebras** API endpoint and model.
- Changed env var from `GROQ_API_KEY` to `CEREBRAS_API_KEY`.
- Added robust response parsing: looks for `rows`, `transactions`, or first array value in response.
- Added truncation detection (`finish_reason === "length"`).
- Added network error retry logic.

#### `standardize/route.ts`
- **Migrated from Groq to Cerebras** API endpoint and model.
- Changed env var from `GROQ_API_KEY` to `CEREBRAS_API_KEY`.
- Added network error retry logic.

#### `TransactionImportModal.tsx`
- **Split-and-Retry for PDF chunks:** If AI truncates a response, the chunk is automatically split in half and each half is re-processed recursively.
- **Reduced chunk size:** From 40 lines to 25 lines per chunk (optimized for Qwen-235B token limits).
- **Reduced delay:** From 4500ms to 2500ms between PDF parse chunks.
- **Resume-from-failure:** Added `lastProcessedIndex` tracking so failed batches can be retried without re-processing completed ones.
- **Retry button UI:** Error banner now shows a "Retry From Records X" button when network errors occur during processing.
- **Success state cleanup:** `lastProcessedIndex` is properly reset on success.
- **Better error classification:** Network errors keep the user in the current processing step (allowing retry), while non-network errors reset to UPLOAD.

---

## 12. Onboarding Checklist for Next Engineer

- [ ] **Fund the Cerebras API key** — Sign up at [cerebras.ai](https://cerebras.ai) and get an API key. Add it to `.env.local` and Vercel dashboard as `CEREBRAS_API_KEY`.
- [ ] **Test the full AI import pipeline** — Upload a CSV, XLSX, and PDF bank statement end-to-end with a funded API key.
- [ ] **Verify `proxy.ts` is active** — Ensure this file is being picked up by Next.js as middleware. It may need to be renamed to `middleware.ts`.
- [ ] **Add a `startingBalance` field** — To the `Business` model in `schema.prisma` so opening balances are persisted (currently only logged to `AuditLog`).
- [ ] **Add unit tests for AI routes** — Mock Cerebras responses and test the retry logic, sanitization, and error handling.
- [ ] **Consider OCR for scanned PDFs** — `pdf-parse` only works with text-based PDFs. Scanned documents need an OCR layer.
- [ ] **Review rate limits** — The 10/hour AI mapping limit and client-side delays (4500ms/2500ms) were calibrated for the Cerebras free tier. Adjust for a paid plan.
- [ ] **Review the `GROQ_API_KEY`** — This is a legacy variable from the original Groq integration. It can be safely removed from all environments.
- [ ] **Run `npx prisma generate`** — After cloning, to generate the Prisma client.
- [ ] **Run `npx prisma db push`** — To sync the schema with your database.

---

*End of Handover Document.*
*Author: Bolaji | May 2026*
