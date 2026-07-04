import { z } from "zod";

export const TransactionSchema = z.object({
  date: z.string(),
  description: z.string(),
  amount: z.number(),
  type: z.enum(["INCOME", "EXPENSE"]),
  balance: z.number().nullable().optional(),
  reference: z.string().nullable().optional(),
});

export const ResponseSchema = z.object({
  transactions: z.array(TransactionSchema),
  openingBalance: z.number().nullable().optional(),
  detectedCurrency: z.string().nullable().optional().default("NGN"),
  suggestedRate: z.number().nullable().optional(),
});

/**
 * Schema for the AI-detected header mapping.
 * The result is an object where keys are the user's original headers.
 */
export const MappingSchema = z.record(z.string(), z.string().nullable());
