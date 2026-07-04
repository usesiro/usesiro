# AI Import Pipeline Update

### Latest Update

**Updated By:** Morenike Oyewole

**Date:** July 4, 2026

**Summary**

- Migrated the CSV standardization endpoint to the Vercel AI SDK.

- Switched the AI provider to Google Gemini 2.5 Flash.

- Introduced reusable prompt and schema modules.

- Added AI SDK dependencies and supporting packages.

- PDF import still requires migration.

- Authentication flow still requires additional work.

## Overview

The AI-powered import pipeline has been updated to use the Vercel AI SDK instead of direct provider API calls. The initial implementation has been completed for the CSV standardization endpoint, which now uses Google Gemini for structured data extraction.

The goal of this change is to simplify the AI integration, reduce boilerplate code, improve type safety, and make it easier to switch AI providers in the future.

---

## What Changed

### AI SDK Integration

Added the following packages:

- `ai`
- `@ai-sdk/google`
- `@ai-sdk/xai` (installed for future provider flexibility)

The application now uses the AI SDK's built-in functionality instead of manually interacting with provider APIs.

---

### CSV Standardization

The `standardize` endpoint has been migrated from the previous Cerebras implementation to the AI SDK using Google Gemini.

#### Previous implementation

- Manual `fetch()` requests
- Manual retry logic
- Manual JSON parsing
- Manual response validation
- Provider-specific request handling

#### Current implementation

- `generateObject()` from the AI SDK
- Zod schema validation
- Automatic structured object generation
- Built-in retry handling
- Provider abstraction through the AI SDK

The endpoint now returns validated transaction objects directly from the model response.

---

### Prompt Organization

Prompt instructions have been moved into dedicated reusable modules under the AI utilities directory.

This separates prompt engineering from the API route, making prompts easier to maintain and reuse.

---

### Schema Validation

Response validation is now handled using Zod schemas.

Benefits include:

- Runtime validation of AI responses
- Strong TypeScript typing
- Reduced parsing errors
- Cleaner API route implementation

---

## Current AI Provider

The project is currently configured to use:

- Google Gemini 2.5 Flash

Although xAI support has been added as a dependency, it is not currently being used because the development account did not have API credits available.

Using the AI SDK means providers can be switched with minimal code changes.

---

## Remaining Work

### PDF Import

The PDF parsing endpoint still uses the previous Cerebras implementation.

It should be migrated to match the CSV standardization endpoint by using:

- AI SDK
- `generateObject()`
- Shared prompts
- Shared Zod schemas where appropriate
- Google Gemini

Keeping both import pipelines aligned will simplify maintenance and future enhancements.

---

## Dependency Updates

### Added

- `ai`
- `@ai-sdk/google`
- `@ai-sdk/xai`
- `dotenv`
- `tsx`

### Updated

- `@prisma/config`
- `prisma`

### Removed

- Unused `bcrypt` package

---

## Other Changes

- Simplified `dotenv` configuration in `prisma.config.ts`.
- Removed redundant migration statements from the User table migration.
- Reduced provider-specific code in the CSV import pipeline by relying on AI SDK abstractions.

---
