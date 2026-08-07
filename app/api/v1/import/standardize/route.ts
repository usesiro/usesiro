import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { ResponseSchema } from "@/lib/ai/import-schema";
import { IMPORT_PROMPT } from "@/lib/ai/prompts";
import { google } from "@/lib/ai/google-client";

const MAX_HEADERS = 100;
const MAX_ROWS = 2_000;
const MAX_AI_PAYLOAD_CHARS = 750_000;
const MAX_STANDARDIZE_ATTEMPTS_PER_HOUR = 10;

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const { payload } = await jwtVerify(token, secret);

    const userId = payload.userId as string;

    const { headers, data } = await request.json();

    if (!headers || !Array.isArray(headers) || !data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 },
      );
    }

    if (headers.length === 0 || headers.length > MAX_HEADERS || data.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `Imports are limited to ${MAX_ROWS.toLocaleString()} rows and ${MAX_HEADERS} columns per AI request.` },
        { status: 413 },
      );
    }

    const aiPayload = JSON.stringify({ headers, rows: data });
    if (aiPayload.length > MAX_AI_PAYLOAD_CHARS) {
      return NextResponse.json(
        { error: "This import is too large for AI standardization. Split it into smaller files." },
        { status: 413 },
      );
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        {
          error: "Missing GOOGLE_GENERATIVE_AI_API_KEY",
        },
        {
          status: 500,
        },
      );
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentAttempts = await prisma.auditLog.count({
      where: {
        userId,
        action: "IMPORT.STANDARDIZE_ATTEMPT",
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentAttempts >= MAX_STANDARDIZE_ATTEMPTS_PER_HOUR) {
      return NextResponse.json(
        { error: "AI standardization limit reached. Please try again later." },
        { status: 429 },
      );
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action: "IMPORT.STANDARDIZE_ATTEMPT",
        status: "INITIATED",
        details: {
          rowCount: data.length,
        },
      },
    });

    const { object } = await generateObject({
      model: google("gemini-3.1-flash-lite"),
      schema: ResponseSchema,
      instructions: IMPORT_PROMPT,
      prompt: aiPayload,
      temperature: 0,
      maxRetries: 5,
    });

    return NextResponse.json({
      transactions: object.transactions,
      openingBalance: object.openingBalance ?? null,
      detectedCurrency: object.detectedCurrency ?? "NGN",
      suggestedRate: object.suggestedRate ?? null,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
