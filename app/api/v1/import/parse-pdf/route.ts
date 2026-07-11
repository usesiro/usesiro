import { NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { ResponseSchema } from "@/lib/ai/import-schema";
import { PDF_EXTRACT_PROMPT } from "@/lib/ai/prompts";
import { google } from '@/lib/ai/google-client';

/**
 * AI-Powered Text Chunk Parser.
 * Takes a slice of bank statement text and returns structured rows.
 * Part of the Progressive Import Pipeline.
 */


export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || text.trim().length < 10) {
      return NextResponse.json({ rows: [] });
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error(
        "CRITICAL: GOOGLE_GENERATIVE_AI_API_KEY is missing from environment variables.",
      );
      return NextResponse.json(
        { error: "Server Configuration Error: Missing API Key." },
        { status: 500 },
      );
    }

    const { object } = await generateObject({
      model: google("gemini-3.1-flash-lite"),
      schema: ResponseSchema,
      prompt: text,
      instructions: PDF_EXTRACT_PROMPT,
      temperature: 0,
      maxRetries: 5,
    });

    // Maintain the existing API contract for the frontend
    return NextResponse.json({
      rows: object.transactions,
      openingBalance: object.openingBalance ?? null,
      currency: object.detectedCurrency, // Now defaults to "NGN" via schema
    });
  } catch (error: any) {
    console.error("Text Chunk Parse Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse text chunk" },
      { status: 500 },
    );
  }
}
