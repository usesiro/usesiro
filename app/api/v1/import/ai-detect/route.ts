import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { AI_DETECT_PROMPT } from "@/lib/ai/prompts";
import { MappingSchema } from "@/lib/ai/import-schema";
import { SIRO_FIELDS } from "@/lib/bank-mappings";
import { google } from "@/lib/ai/google-client";

const MAX_HEADERS = 100;
const MAX_HEADER_LENGTH = 200;
const MAX_AI_PAYLOAD_CHARS = 50_000;

export async function POST(request: Request) {
  try {
    // 1. Authenticate Request
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    if (!token)
      return NextResponse.json(
        {
          error: "Your session has expired. Please sign in again to continue.",
        },
        { status: 401 },
      );

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    // 2. Validate Request Body
    const { headers, sampleRows } = await request.json();
    if (
      !headers ||
      !Array.isArray(headers) ||
      !sampleRows ||
      !Array.isArray(sampleRows)
    ) {
      return NextResponse.json(
        { error: "Invalid data format provided." },
        { status: 400 },
      );
    }

    if (
      headers.length === 0 ||
      headers.length > MAX_HEADERS ||
      headers.some((header) =>
        typeof header !== "string" || header.length > MAX_HEADER_LENGTH
      )
    ) {
      return NextResponse.json(
        { error: "Too many columns or an invalid column name was provided." },
        { status: 413 },
      );
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

    // 3. Rate Limiting Check (Max 10 AI Mapping attempts per hour per user)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const attemptCount = await prisma.auditLog.count({
      where: {
        userId,
        action: "AI_MAPPING_ATTEMPT",
        createdAt: { gte: oneHourAgo },
      },
    });

    if (attemptCount >= 10) {
      return NextResponse.json(
        {
          error:
            "You have reached the limit of 10 AI Smart Mappings per hour. Please map your remaining columns manually.",
        },
        { status: 429 },
      );
    }

    // Record this attempt regardless of success to prevent spam
    await prisma.auditLog.create({
      data: {
        userId,
        action: "AI_MAPPING_ATTEMPT",
        status: "INITIATED",
        details: { headersCount: headers.length },
      },
    });

    // 4. Build AI Payload
    const userMessage = JSON.stringify({
      userHeaders: headers,
      sampleData: sampleRows.slice(0, 3), // Hard limit to top 3 rows for token economy and privacy
    });

    if (userMessage.length > MAX_AI_PAYLOAD_CHARS) {
      return NextResponse.json(
        { error: "The sample data is too large to analyze safely." },
        { status: 413 },
      );
    }

    const { object: aiMapping } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: MappingSchema,
      prompt: userMessage,
      instructions: AI_DETECT_PROMPT(SIRO_FIELDS),
      temperature: 0,
      maxRetries: 5,
    });

    // Ensure all returned values are valid SiroFields or null
    const sanitizedMapping: Record<string, string | null> = {};
    for (const header of headers) {
      const suggestedVal = aiMapping[header];
      // Ensure the suggested value is a non-null string and exists in our list of valid fields.
      if (
        typeof suggestedVal === "string" &&
        SIRO_FIELDS.includes(suggestedVal)
      ) {
        sanitizedMapping[header] = suggestedVal as string;
      } else {
        sanitizedMapping[header] = null;
      }
    }

    // Record success
    await prisma.auditLog.create({
      data: {
        userId,
        action: "AI_MAPPING_SUCCESS",
        status: "SUCCESS",
      },
    });

    return NextResponse.json({ mapping: sanitizedMapping });
  } catch (error: any) {
    console.error("AI Detect Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
