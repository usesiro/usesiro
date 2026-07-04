# AI Import Pipeline Update

## Latest Update

- **Updated By:** Morenike Oyewole
- **Date:** July 4, 2026

---

## Overview

The AI-powered import pipeline for both CSV and PDF files has been migrated from direct provider API calls to the **Vercel AI SDK**, using **Google Gemini 2.5 Flash**.

The migration simplifies the AI integration by:

- Reducing boilerplate code
- Improving type safety through Zod schemas
- Making it easier to switch AI providers in the future

---

# Setup

## 1. Install Dependencies

```bash
npm install
```

Required AI packages:

- `ai`
- `@ai-sdk/google`
- `@ai-sdk/xai`
- `zod`

---

## 2. Configure Environment Variables

Add the following to your `.env` file:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key
```

> **Note:** `CEREBRAS_API_KEY` is no longer required, as both the CSV and PDF import pipelines have been migrated to the Vercel AI SDK with Google Gemini.

---

## 3. Obtain a Google AI API Key

1. Visit https://aistudio.google.com/app/apikey
2. Generate an API key.
3. Add it to your `.env` file.
4. Restart the development server.

---

## 4. AI Configuration

| Setting | Value |
|----------|-------|
| **Provider** | Google AI |
| **Model** | `gemini-2.5-flash` |
| **SDK** | Vercel AI SDK |
| **Output** | `generateObject()` + Zod schemas |

The AI SDK abstracts the provider implementation, making future provider changes straightforward.

---

## 5. Project Structure

```text
lib/
└── ai/
    ├── prompts.ts
    └── import-schema.ts
```

CSV standardization endpoint:

```text
app/api/import/standardize/route.ts
```

---

# Changes Implemented

## Full Vercel AI SDK Migration

The standardization endpoint for both CSV and PDF imports has been migrated from the legacy Cerebras implementation to the Vercel AI SDK. This unifies the extraction and standardization logic under a single, modern architecture.

---

## Enhanced PDF Extraction

PDF parsing now leverages **Google Generative AI's multimodal capabilities** for more robust and accurate data extraction, significantly improving reliability over the previous implementation.

---

## AI SDK Adoption

### Replaced

- Manual `fetch()` requests
- Manual retry logic
- Manual JSON parsing
- Manual response validation
- Provider-specific request handling

### With

- `generateObject()`
- Built-in retry handling
- Zod schema validation
- Structured object generation
- Provider abstraction

---

## Improved Schemas and Error Handling

- Extracted prompts into reusable modules.
- Updated and expanded shared Zod schemas for more consistent and reliable AI response validation across both CSV and PDF pipelines.
- Implemented more robust error handling for AI API calls and data processing.

---

# Remaining Work

## Authentication

Authentication still requires additional work before the import pipeline is considered production-ready.

---

## Testing

After making changes to the AI import pipeline, verify the following scenarios.

### CSV Import

- Import a valid bank statement and verify all transactions are extracted correctly.
- Import a statement without a **Balance** column.
- Import a statement containing positive and negative amounts to verify automatic income/expense detection.
- Import a foreign currency statement and verify currency detection.
- Upload an invalid CSV (non-transaction data) and confirm appropriate validation errors are displayed.
- Upload an empty CSV containing only headers and verify the application handles it gracefully.

---

### PDF Import

- Import a valid PDF bank statement.
- Verify that all transactions are extracted correctly.
- Test a scanned (image-only) PDF to ensure the application fails gracefully when text cannot be extracted.

---

### Additional Scenarios

- Import the same statement twice and verify duplicate handling.
- Test multiple date formats:
  - `DD/MM/YYYY`
  - `YYYY-MM-DD`
  - `MMM DD, YYYY`
  - Excel serial dates
- Test statements from different banks with varying column names, such as:
  - Narration
  - Details
  - Particulars
- Test large files (500–1000 transactions) to verify:
  - Batching
  - Progress updates
  - Retries
  - Overall performance