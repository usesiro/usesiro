<div align="center">
  <a href="https://usesiro.com">
    <img src="public/landing/logo.svg" alt="Siro" width="150" />
  </a>

  <h1>Better records. Easier taxes.</h1>

  <p>
    Siro helps Nigerian businesses organize transactions, review VAT treatment,
    track tax readiness, and export clean financial reports from one workspace.
  </p>

  <p>
    <a href="https://usesiro.com"><strong>Visit Siro</strong></a>
    ·
    <a href="https://usesiro.com/register">Create an account</a>
    ·
    <a href="https://usesiro.com/contact">Book a demo</a>
  </p>
</div>

![Siro transactions dashboard](public/landing/hero-transactions.png)

## About Siro

Siro is a financial recordkeeping and tax-readiness platform built for Nigerian businesses. It replaces scattered spreadsheets and informal records with a structured workflow for importing transactions, reviewing classifications, tracking supporting documents, and preparing reports.

The platform helps teams maintain cleaner records throughout the year, so tax preparation is a continuous process rather than a last-minute scramble.

## Product capabilities

- **Flexible transaction capture** — import CSV, Excel, and digital PDF bank statements or add cash and informal transactions manually.
- **AI-assisted statement processing** — detect statement structures, standardize transaction data, and review extracted records before import.
- **Duplicate prevention** — identify previously imported transactions using deterministic fingerprints.
- **Transaction categorization** — apply built-in patterns, remember business-specific decisions, and route uncertain records for human review.
- **VAT review** — mark transactions as tagged, exempt, or missing and monitor input and output VAT.
- **Tax-readiness tracking** — see how categorization, VAT review, and supporting documents affect record completeness.
- **Reports and exports** — review income, expenses, and document coverage, then export PDF or CSV reports.
- **Document management** — attach receipts and invoices to relevant transactions.
- **Secure account access** — email/password registration, email OTP verification, password recovery, protected sessions, and role-based administration.
- **Subscription billing** — Paystack-powered access for the Siro beta plan.

Direct bank synchronization through Mono is present behind a feature flag and is not currently part of the public product experience.

## How it works

1. **Bring in your records.** Upload a supported bank statement or enter a transaction manually.
2. **Review and organize.** Confirm extracted data, resolve uncategorized records, and review VAT treatment.
3. **Track readiness.** Monitor incomplete categories, VAT tags, and supporting documents from the dashboard.
4. **Export clean reports.** Generate organized records for your reporting and filing workflow.

## Technology

| Area | Technology |
| --- | --- |
| Application | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS, Heroicons, AOS |
| Data | PostgreSQL, Prisma ORM |
| Authentication | JWT with `jose`, bcrypt password hashing, HTTP-only cookies |
| AI processing | Google Generative AI SDK |
| Payments | Paystack |
| Email | Resend |
| File storage | Vercel Blob |
| Bank integration | Mono, feature-flagged |
| Reporting | Recharts, jsPDF, CSV export |

## Repository structure

```text
usesiro/
├── app/
│   ├── api/                 # Route handlers for auth, payments, and product APIs
│   ├── dashboard/           # Financial overview and readiness actions
│   ├── transactions/        # Ledger, imports, review, and manual entry
│   ├── reconciliation/      # Record reconciliation workflow
│   ├── reports/             # Reporting and exports
│   ├── tax-readiness/       # VAT and tax-readiness views
│   └── settings/            # Business, account, and security settings
├── components/              # Shared UI and feature components
├── context/                 # Application providers and shared client state
├── hooks/                   # Reusable React hooks
├── lib/                     # Auth, data, AI, import, tax, and security utilities
├── prisma/                  # Database schema, migrations, and seed data
├── public/                  # Static assets and PWA files
├── tests/security/          # Security-focused automated tests
└── proxy.ts                 # Request authentication and route protection
```

## Getting started

### Prerequisites

- Node.js 22 or later
- npm
- PostgreSQL
- Credentials for any integrations you intend to exercise locally

### 1. Clone and install

```bash
git clone https://github.com/usesiro/usesiro.git
cd usesiro
npm install
```

### 2. Configure the environment

Create a `.env` file in the repository root. Never commit this file or real credentials.

```dotenv
# Core application
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
JWT_SECRET="replace-with-a-long-random-secret"

# AI-assisted imports
GOOGLE_GENERATIVE_AI_API_KEY=""

# Transactional email
RESEND_API_KEY=""

# Payments
NEXT_PUBLIC_PAYSTACK_KEY=""
PAYSTACK_SECRET_KEY=""

# Document storage
BLOB_READ_WRITE_TOKEN=""

# Optional administrative bootstrap
ADMIN_BOOTSTRAP_SECRET=""

# Optional Mono integration
NEXT_PUBLIC_ENABLE_MONO="false"
NEXT_PUBLIC_MONO_PUBLIC_KEY=""
MONO_SECRET_KEY=""
```

Ask a project maintainer for approved development credentials. Values prefixed with `NEXT_PUBLIC_` are exposed to the browser and must never contain private secrets.

### 3. Prepare the database

```bash
npx prisma generate
npx prisma migrate dev
```

To load the project seed data when needed:

```bash
npx prisma db seed
```

### 4. Start the application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Next.js development server |
| `npm run build` | Generate Prisma Client and create a production build |
| `npm start` | Run the production server after a successful build |
| `npm run test:security` | Run the security regression suite |
| `npx tsc --noEmit` | Run TypeScript validation without emitting files |

## Authentication and security

- Public registration validates input server-side, hashes passwords with bcrypt, and requires email OTP verification.
- Successful login creates a signed JWT session stored in an HTTP-only cookie.
- `proxy.ts` protects authenticated pages and API routes and applies role-aware access checks.
- Public forms use bounded request parsing and rate limiting.
- Sensitive actions, including password changes and administrative access, are validated again on the server.
- Authentication events are written to the audit log where applicable.

Do not weaken server-side validation, expose secrets through `NEXT_PUBLIC_` variables, or rely on client checks for authorization.

## Development workflow

1. Create a focused branch from the team’s current integration branch.
2. Keep changes scoped and include database migrations for Prisma schema updates.
3. Before opening a pull request, run:

   ```bash
   npx tsc --noEmit
   npm run build
   npm run test:security
   git diff --check
   ```

4. Document new environment variables and operational requirements.
5. Never commit `.env` files, access tokens, customer data, or production exports.

## Deployment

Siro is structured for deployment on Vercel with a managed PostgreSQL database. Production environments must provide all required secrets, run committed Prisma migrations, configure the Paystack webhook endpoint, and use a verified sending domain in Resend.

The production application is available at [usesiro.com](https://usesiro.com).

## Support and security reports

For product support, partnership enquiries, or responsible disclosure of a security issue, use the [Siro contact page](https://usesiro.com/contact). Do not include credentials, personal financial records, or exploitable details in public issues.

## Ownership

Copyright © 2026 Siro Technologies. All rights reserved. This repository does not currently include an open-source license.
