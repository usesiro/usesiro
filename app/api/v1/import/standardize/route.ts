import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export async function POST(request: Request) {
  try {
    // 1. Authenticate
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Session expired" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    // 2. Body
    const { headers, data } = await request.json();
    if (!headers || !data) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // 3. Rate Limit & Audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: "IMPORT.STANDARDIZE_ATTEMPT",
        status: "INITIATED",
        details: { rowCount: data.length }
      }
    });

    // 4. Build AI Payload
    // We send a sample of 30 rows (enough to see patterns but stays under token limits)
    const sample = data.slice(0, 30);
    
    const systemPrompt = `You are a financial data cleanup expert. 
Your goal is to take a "messy" array of rows from a spreadsheet and identify the actual transactions.

Rules:
1. Ignore header rows, summary/total rows, and metadata notes.
2. Identify ONE row that is the "Header Row" (the one with the actual column names).
3. For each transaction row, extract: date, description, amount, type (INCOME/EXPENSE).
4. If there are split Debit/Credit columns, merge them into a single amount and determine the type.
5. Look for an "Opening Balance" note or row.
6. Look for any currency conversion notes (e.g. "rate: 1550").

Output valid JSON ONLY with this structure:
{
  "headerRowIndex": number,
  "transactions": [{ "originalIndex": number, "date": string, "description": string, "amount": number, "type": "INCOME" | "EXPENSE", "currency": string }],
  "openingBalance": number | null,
  "detectedCurrency": string,
  "suggestedRate": number | null,
  "skippedRows": [{ "index": number, "reason": string }]
}`;

    const userMsg = JSON.stringify({ headers, sampleRows: sample });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Data to clean:\n" + userMsg }
        ],
        temperature: 0,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) throw new Error("AI service unavailable");

    const groqData = await response.json();
    const result = JSON.parse(groqData.choices[0].message.content);

    return NextResponse.json(result);

  } catch (err: any) {
    console.error("Standardize Route Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
