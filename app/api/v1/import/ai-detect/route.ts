import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { SIRO_FIELDS } from "@/lib/bank-mappings";

export async function POST(request: Request) {
  try {
    // 1. Authenticate Request
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Your session has expired. Please sign in again to continue." }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    // 2. Validate Request Body
    const { headers, sampleRows } = await request.json();
    if (!headers || !Array.isArray(headers) || !sampleRows || !Array.isArray(sampleRows)) {
      return NextResponse.json({ error: "Invalid data format provided." }, { status: 400 });
    }

    // 3. Rate Limiting Check (Max 10 AI Mapping attempts per hour per user)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const attemptCount = await prisma.auditLog.count({
      where: {
        userId,
        action: "AI_MAPPING_ATTEMPT",
        createdAt: { gte: oneHourAgo }
      }
    });

    if (attemptCount >= 10) {
      return NextResponse.json({ 
        error: "You have reached the limit of 10 AI Smart Mappings per hour. Please map your remaining columns manually." 
      }, { status: 429 });
    }

    // Record this attempt regardless of success to prevent spam
    await prisma.auditLog.create({
      data: {
        userId,
        action: "AI_MAPPING_ATTEMPT",
        status: "INITIATED",
        details: { headersCount: headers.length }
      }
    });

    // 4. Build Groq Payload
    // We strictly instruct Clearsheet AI to output raw JSON mapped to our exact SiroField set.
    const systemPrompt = `You are a strict financial data mapper API.
Your job is to look at the user's custom bank statement headers and a few rows of sample data, and map them to our internal system columns.

Our system columns MUST BE exactly one of these (case sensitive):
[${SIRO_FIELDS.map(f => `"${f}"`).join(', ')}]

Rules:
1. Return ONLY a raw JSON object. No markdown formatting, no backticks, no explanations.
2. The JSON keys MUST be the exact headers provided by the user.
3. The JSON values MUST be the matching system column.
4. If a user header does not fit any system column, map it to null.
5. Pay close attention to Debit vs Credit if Amount doesn't exist. "Item Bought" or "Narration" usually means "description".`;

    const userMessage = JSON.stringify({
      userHeaders: headers,
      sampleData: sampleRows.slice(0, 3) // Hard limit to top 3 rows for token economy and privacy
    });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Use the massive Meta Llama 3.3 70B for high logic accuracy
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Data to map:\n" + userMessage }
        ],
        temperature: 0, // Zero creativity, strict deterministic output
        max_tokens: 300,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      console.error("Groq API Error:", await response.text());
      throw new Error("Failed to communicate with AI mapping service.");
    }

    const groqData = await response.json();
    const aiMessage = groqData.choices[0]?.message?.content;
    
    if (!aiMessage) throw new Error("AI returned empty response");

    // 5. Parse and Validate AI output
    const aiMapping = JSON.parse(aiMessage);
    
    // Ensure all returned values are valid SiroFields or null
    const sanitizedMapping: Record<string, string | null> = {};
    for (const header of headers) {
      const suggestedVal = aiMapping[header];
      if (SIRO_FIELDS.includes(suggestedVal as any)) {
        sanitizedMapping[header] = suggestedVal;
      } else {
        sanitizedMapping[header] = null;
      }
    }

    // Record success
    await prisma.auditLog.create({
      data: {
        userId,
        action: "AI_MAPPING_SUCCESS",
        status: "SUCCESS"
      }
    });

    return NextResponse.json({ mapping: sanitizedMapping });

  } catch (error: any) {
    console.error("AI Detect Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
