import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { detectColumnMapping, generateHeaderHash } from "@/lib/import-utils";

const MAX_HEADERS = 100;
const MAX_HEADER_LENGTH = 200;

/**
 * Endpoint to analyze uploaded file headers and suggest Siro column mappings.
 * Checks for previously saved mappings first, then falls back to fuzzy matching.
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Your session has expired. Please sign in again to continue." }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    const business = await prisma.business.findUnique({
      where: { userId },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const { headers } = await request.json();
    if (!headers || !Array.isArray(headers)) {
      return NextResponse.json({ error: "No headers provided" }, { status: 400 });
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

    // 1. Generate a hash for the current header structure
    const headerHash = generateHeaderHash(headers);

    // 2. Check for a previously saved mapping for this specific format
    const savedMapping = await prisma.savedMapping.findUnique({
      where: {
        businessId_headerHash: {
          businessId: business.id,
          headerHash
        }
      }
    });

    if (savedMapping) {
      return NextResponse.json({ 
        suggestedMapping: savedMapping.mapping, 
        isPredefined: true 
      });
    }

    // 3. Fallback to Fuzzy Matching Detection
    const suggestedMapping = detectColumnMapping(headers);

    // --- NEW: Validation Check ---
    // A valid transaction file MUST have a Date and at least one Amount source (Amount or Dr/Cr)
    const hasDate = suggestedMapping.date !== null;
    const hasAmount = suggestedMapping.amount !== null || (suggestedMapping.debit !== null && suggestedMapping.credit !== null);

    if (!hasDate || !hasAmount) {
      // If we can't find these, this file is likely not a transaction record (e.g., a list of songs or random doc)
      return NextResponse.json({ 
        error: "This file doesn't look like a transaction record. No Date or Amount columns were detected.",
        isInvalid: true 
      }, { status: 422 });
    }

    return NextResponse.json({ 
      suggestedMapping, 
      isPredefined: false 
    });

  } catch (error) {
    console.error("Detect Columns Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
