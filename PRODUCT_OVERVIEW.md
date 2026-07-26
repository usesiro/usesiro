# Siro — Product Overview

**Tax Compliance & Automated Bookkeeping for Nigerian Businesses**

---

## What Is Siro?

Siro is a tax compliance platform purpose-built for Nigerian businesses. It takes the pain out of bookkeeping by automatically organizing every naira that flows in and out of a business, tagging it for VAT, categorizing it, and producing clean reports that are ready for the Federal Inland Revenue Service (FIRS) when filing day arrives.

**The core problem:** Most Nigerian SMEs track finances with WhatsApp notes, Excel sheets, or not at all. When tax season hits, they scramble. Siro eliminates that scramble by keeping your business tax-ready *every single day* — not just at filing time.

---

## The User Journey (End to End)

### Step 1: Sign Up & Onboarding

1. **Create Account** — User signs up with email and password.
2. **Email Verification** — A 6-digit OTP is sent to confirm the email address.
3. **Business Profile** — User enters their business name, business type (Sole Proprietorship, Partnership, or LLC), and selects from 33 industry categories covering every major Nigerian sector.
4. **Subscribe** — There is no free tier. The user is taken directly to the pricing page to subscribe at **₦9,999/month** via Paystack (card, bank transfer, or USSD). This is locked at an Early Adopter Rate — standard pricing of ₦15,000/month applies once automated bank syncing is live.
5. **Welcome** — After payment, the user lands on the Welcome page and chooses how to get their transactions into Siro.

---

### Step 2: Getting Transactions In

There are three ways transactions enter Siro:

#### a) File Upload — AI-Powered (Clearsheet Engine)

This is where Siro's intelligence shines. The user uploads a bank statement in **CSV, Excel (.xlsx), or PDF** format. Here is what happens behind the scenes:

1. **File Parsing** — Siro reads the raw file. For PDFs, it uses AI-powered text extraction to pull structured data from scanned or digital bank statements.

2. **AI Standardization** — The file is sent to Siro's AI engine (powered by Google Gemini). The AI:
   - Detects which columns represent date, description, amount, debit, credit, balance, and reference
   - Classifies each row as INCOME or EXPENSE based on debit/credit columns and transaction indicators
   - Detects the **opening/starting balance** from the statement header or first balance entry
   - Detects the **account currency** (NGN, USD, GBP, etc.)
   - Suggests a **currency conversion rate** if the statement is in a foreign currency

3. **Starting Balance Detection** — When the AI detects an opening balance (e.g., the first row's balance minus the first transaction), it surfaces this to the user in the review screen. The user sees a card showing *"Detected Starting Balance: ₦X,XXX,XXX"* and can toggle a checkbox labeled *"Set as Account Start?"* to save it to their business profile. This is important because it establishes the baseline that all subsequent financial calculations are measured against.

4. **Currency Handling** — If the statement is in USD or another foreign currency, Siro shows the detected currency and suggested exchange rate. The user can accept the rate or override it before import.

5. **Review & Edit** — Before importing, the user sees a full preview of all extracted transactions in a table. They can edit descriptions, amounts, types, or delete rows they don't want.

6. **Smart Duplicate Detection** — Each transaction gets a unique fingerprint (based on amount, date, description, and reference). If the user uploads the same statement twice, duplicates are automatically skipped.

7. **Batch Import** — Transactions are imported in batches with a progress bar. The system reports how many were imported and how many were skipped as duplicates.

#### b) Manual Entry

For cash transactions, POS settlements, or anything that does not appear on a bank statement — the user adds them one by one through a simple form (date, description, amount, type).

#### c) Bank Sync (Coming Soon)

Direct connection to Nigerian banks via Mono's Open Banking API. Transactions will pull in automatically. This feature is fully built but disabled while the Mono partnership is finalized. Users see a "Coming Soon" badge.

---

### Step 3: The Three-Pass Categorization Engine

This is the core intelligence that separates Siro from a basic spreadsheet. When transactions enter the system — whether from file upload, manual entry, or bank sync — Siro runs a **three-pass categorization pipeline**:

#### Pass 1 — Business Memory (Tenant-Specific)

Has this specific business seen this description before? If a human previously categorized *"DANGOTE CEMENT LTD"* as a Construction expense for **this** business, Siro remembers and applies it automatically.

These rules are **tenant-specific** — Business A's category mappings never leak to Business B. Each business builds its own dictionary over time.

#### Pass 2 — Standard Rules (Built-In Patterns)

Siro has built-in recognition patterns for common Nigerian transactions:

| Pattern | Category |
|---------|----------|
| MTN, Airtel, Glo, IBEDC, fuel, diesel | Fuel & Utilities |
| Paystack, Flutterwave, Moniepoint, transfer fee | Bank & POS Charges |
| Salary, payroll, stipend, bonus | Salary & Wages |
| Facebook, Google Ads, Instagram | Marketing & Ads |
| AWS, Vercel, GitHub, Zoom | Software & IT |
| POS settlement, Opay payout | Sales |
| Interest, dividend | Interest Income |

If a transaction description matches any of these patterns, it is auto-categorized.

#### Pass 3 — Flag for Human Review

If **neither** Pass 1 nor Pass 2 produces a match, Siro does **NOT guess or hallucinate** a category. Instead, it flags the transaction as **"Pending Review"** and routes it to a review queue for a human to manually categorize.

**This is critical for compliance.** A wrong category can misstate deductions and trigger audit flags. Siro would rather ask than assume.

---

### Step 4: The Pending Review Queue

On the Transactions page, there is a **"Pending Review"** tab with a badge showing how many transactions need attention.

The review flow:
1. Open the Pending Review tab
2. See each flagged transaction with its date, description, amount, and type
3. Select the correct category from a dropdown
4. Click **"Resolve"**

When a transaction is resolved:
- The category is applied to that transaction
- The description-to-category mapping is **saved permanently** for that business
- Next time a transaction with the same description is imported, it is categorized automatically (via Pass 1)

**The system gets smarter with every resolution.**

---

### Step 5: VAT Tagging

Every transaction can be tagged with one of three VAT statuses:
- **Tagged** — VAT applies (7.5% rate)
- **Exempt** — VAT does not apply
- **Missing** — Not yet reviewed

Siro calculates:
- **Output VAT** — VAT collected from customers (on income transactions)
- **Input VAT** — VAT paid on purchases (on expense transactions)
- **Net VAT Payable** = Output VAT − Input VAT

This is the number the business reports to FIRS.

---

### Step 6: Tax Computation

Siro computes company income tax per **CITA** (Companies Income Tax Act):

```
Gross Income      = Sum of all INCOME transactions
Deductions        = Sum of categorized EXPENSE transactions
                    (auto-categorized + human-resolved)
Taxable Income    = Gross Income − Deductions
Company Tax       = Taxable Income × Tax Rate
```

The tax rate depends on the business's bracket, which they select in Settings:

| Bracket | Annual Turnover | CIT Rate |
|---------|----------------|----------|
| Small   | Below ₦25M     | 0%       |
| Medium  | ₦25M – ₦100M   | 20%      |
| Large   | Above ₦100M    | 30%      |

**Important:** Expenses that are still in "Pending Review" (uncategorized) are **excluded** from deductions until resolved. This is a conservative, audit-safe approach — it means the business may show a higher tax liability until all transactions are categorized, which motivates timely resolution.

---

### Step 7: The Dashboard

The dashboard gives a real-time overview:

- **Tax Readiness Score** — A single percentage showing how prepared the business is for a tax audit, based on categorization, VAT tagging, and documentation completeness
- **Compliance Breakdown** — Individual progress bars for VAT tagging, categorization, and document attachment
- **Financial Snapshot** — Total income, total expenses, and net balance at a glance
- **Action Cards** — Urgent items like *"47 transactions untagged for VAT"* or *"12 transactions uncategorized"* with direct links to fix them
- **Recent Activity** — The 5 most recent transactions

---

### Step 8: Reports & Export

When filing day arrives, the user exports a clean tax report:
- Choose a **date range** (start and end dates)
- Choose a **format** (PDF or CSV)
- Download instantly

Everything is pre-organized — categories, VAT tags, amounts, dates. No last-minute scramble.

---

### Step 9: Reconciliation

A dedicated page for matching transactions against records and flagging discrepancies before they become compliance issues.

---

## Platform Features Summary

| Feature | Status |
|---------|--------|
| Email/password authentication with OTP | Live |
| Business profile setup (33 industries) | Live |
| Paystack subscription (₦9,999/mo) | Live |
| File upload — CSV, Excel, PDF | Live |
| AI-powered statement parsing (Gemini) | Live |
| Starting balance detection | Live |
| Foreign currency detection & conversion | Live |
| Smart duplicate prevention | Live |
| Three-pass auto-categorization | Live |
| Tenant-specific pattern memorization | Live |
| Pending Review queue with resolve UI | Live |
| Manual transaction entry | Live |
| VAT tagging & computation | Live |
| Company income tax computation (CITA) | Live |
| Tax readiness scoring | Live |
| PDF & CSV report export | Live |
| Transaction reconciliation | Live |
| Compliance dashboard | Live |
| Guided product tour (Driver.js) | Live |
| Bank sync via Mono | Coming Soon |

---

## Why Siro Is Different

| Traditional Approach | Siro |
|---|---|
| Excel sheets, WhatsApp notes | Automated categorization engine |
| Accountant guesses categories | AI + human-in-the-loop — no hallucination |
| One-size-fits-all rules | Tenant-specific pattern memory that learns |
| End-of-quarter scramble | Real-time tax readiness score |
| Manual VAT calculation | Automatic VAT tagging + computation |
| Hiring a bookkeeper | Self-service at ₦9,999/month |

---

## How to Talk About Siro

**For business owners:**
> "Siro keeps your business tax-ready every single day — not just at filing time."

**For investors:**
> "Siro is the compliance infrastructure layer for Nigerian SMEs — automated bookkeeping, VAT tagging, and FIRS-ready reporting in one platform."

**For accountants and consultants:**
> "Siro handles the 80% of transactions that are obvious, and routes the 20% that need judgment directly to you — with pattern learning so you never categorize the same thing twice."

---

*Siro Technologies — Your business, always tax-ready.*
