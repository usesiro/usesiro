import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { ResponseSchema } from "@/lib/ai/import-schema";
import { IMPORT_PROMPT } from "@/lib/ai/prompts";
import { google } from "@/lib/ai/google-client";

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
      prompt: JSON.stringify({
        headers,
        rows: data,
      }),
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
