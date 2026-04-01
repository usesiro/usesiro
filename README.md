
# ⚡️ Siro - Financial Management & Tax-Readiness Platform

Siro is an automated financial management, reconciliation, and tax-readiness platform designed for businesses, creators, and public figures. It streamlines transaction tracking, calculates VAT obligations in real-time, and audits compliance by flagging missing receipts, uncategorized expenses, and untagged VAT transactions.

## 🚀 Key Features

* **Automated Bank Syncing:** Secure read-only integration with Nigerian bank accounts via the Mono API.
* **Dynamic VAT Engine:** Automatically calculates Output VAT (from income) and Input VAT (from expenses) to determine Net VAT Payable.
* **Tax Readiness Score:** A proprietary algorithm that analyzes transaction compliance (categories, VAT tags, and receipt documentation) to generate a real-time readiness percentage.
* **Compliance Checklist & Gap Analysis:** Instantly identifies unverified transactions and missing documentation to ensure audit-proof ledgers.
* **Secure Document Vault:** Upload and attach digital receipts and invoices directly to transactions via Vercel Blob storage.
* **Custom Reporting:** Client-side generation of professional PDF and CSV financial reports.
* **Bank-Grade Security:** Custom JWT authentication using edge-compatible `jose`, encrypted passwords, and HttpOnly cookies strictly protected by Next.js Server Middleware.

---

## 🛠 Tech Stack

Siro is built as a **Full-Stack Monorepo** utilizing modern web technologies for maximum type safety, performance, and scalability.

### Frontend
* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Icons:** Heroicons
* **Charts & Data Viz:** Recharts
* **Exports:** jsPDF & jsPDF-AutoTable

### Backend & Database
* **Architecture:** Next.js Serverless API Routes (`app/api/v1/*`)
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Authentication:** `jose` (JWT), `bcryptjs`, Next.js Middleware guard

### Integrations
* **Mono:** Open-banking API for real-time transaction pulling.
* **Resend:** Transactional email delivery (OTPs, password resets).
* **Vercel Blob:** Secure, scalable cloud storage for document uploads.

---

## 📂 Project Architecture

Because Siro is a monorepo, the frontend and backend share the same repository and Prisma types.

```text
siro/
├── app/
│   ├── api/v1/         # Backend Serverless API Routes (Auth, Transactions, Mono Sync)
│   ├── dashboard/      # Frontend: Main overview and charts
│   ├── transactions/   # Frontend: Transaction ledger and manual entry
│   ├── tax-readiness/  # Frontend: VAT engine and compliance score
│   ├── reconciliation/ # Frontend: Tax gap resolution and document upload
│   └── settings/       # Frontend: User, business, and security preferences
├── components/         # Reusable UI components (Layout, Modals, MonoButton)
├── hooks/              # Custom React hooks (e.g., useVatCalculator)
├── lib/                # Utility configurations (Prisma client instance)
├── prisma/             # Database schema and migrations
│   └── schema.prisma   # Source of truth for all DB models
└── middleware.ts       # Route guard for protecting authenticated pages/APIs
````

-----

## ⚙️ Local Development Setup

Follow these steps to get Siro running on your local machine.

### 1\. Prerequisites

Ensure you have the following installed:

  * [Node.js](https://nodejs.org/) (v18 or higher)
  * A PostgreSQL database (Local or Cloud provider like Supabase/Neon)
  * Git

### 2\. Clone the Repository

```bash
git clone [https://github.com/usesiro/usesiro.git](https://github.com/usesiro/usesiro.git)
cd siro
```

### 3\. Install Dependencies

```bash
npm install
# or
yarn install
```

### 4\. Environment Variables

Create a `.env` file in the root of the project and add the necessary configuration keys. Ask the repository admin for the development keys.

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/siro_db"

# Security
JWT_SECRET="your_super_secret_jwt_key_here"

# Resend (Emails)
RESEND_API_KEY="re_..."

# Mono API (Bank Syncing)
MONO_PUBLIC_KEY="test_pk_..."
MONO_SECRET_KEY="test_sk_..."

# Vercel Blob (Document Storage)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

### 5\. Database Setup (Prisma)

Generate the Prisma client and push the schema to your database to create the required tables.

```bash
npx prisma generate
npx prisma db push
```

*(Optional: If you want to view your database GUI locally, run `npx prisma studio`)*

### 6\. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser.

-----

## 🔒 Security & Authentication Flow

1.  **Login:** Users authenticate via `/api/v1/auth/login`. Upon success, the server returns a JWT and sets an `HttpOnly`, `Secure`, `SameSite=Lax` cookie named `siro_auth_token`.
2.  **Middleware Guard:** The `middleware.ts` file intercepts all requests to protected pages (like `/dashboard`) and API routes. If the `siro_auth_token` cookie is missing or invalid, the user is instantly redirected to `/login`.
3.  **API Security:** All API requests originating from the client must include the standard `Authorization: Bearer <token>` header to perform database operations.

-----

## 🤝 Contributing Guidelines

1.  **Branching Strategy:** \* `main` is the production-ready branch.
      * Create feature branches off `main` (e.g., `feat/mono-webhook-sync` or `fix/vat-calculation`).
2.  **Type Safety:** Ensure all frontend and API responses adhere to strict TypeScript interfaces. Avoid using `any`.
3.  **Prisma Changes:** If you modify `schema.prisma`, ensure you run `npx prisma generate` and test migrations locally before opening a Pull Request.

-----

*Developed by the Siro Engineering Team.*

```
```
