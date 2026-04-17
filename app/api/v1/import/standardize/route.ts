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

    // 4. Batch Processing Configuration
    const batchSize = 50;
    const batches: any[][] = [];
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }

    const systemPromptMain = `You are a financial data cleanup expert. 
Your goal is to take an array of rows from a spreadsheet and identify the actual transactions.

Rules:
1. Ignore header rows, summary/total rows, and metadata notes.
2. For each transaction row, extract: date, description, amount, type (INCOME/EXPENSE), balance (running balance), and reference (ID/Reference).
3. If there are split Debit/Credit columns, merge them into a single amount and determine the type.
4. Also look for "Opening Balance" notes or row and currency conversion notes (e.g. "rate: 1550").

Output valid JSON ONLY:
{
  "transactions": [{ "date": string, "description": string, "amount": number, "type": "INCOME" | "EXPENSE", "balance": number | string | null, "reference": string | null }],
  "openingBalance": number | null,
  "detectedCurrency": string,
  "suggestedRate": number | null
}`;

    const systemPromptSecondary = `You are a financial data cleanup expert. 
Extract transactions from this chunk of data. Use the same logic as before.
Make sure to extract "balance" and "reference" for every transaction if they are available in the data.

Output valid JSON ONLY:
{ "transactions": [{ "date": string, "description": string, "amount": number, "type": "INCOME" | "EXPENSE", "balance": number | string | null, "reference": string | null }] }`;

    const processWithRetry = async (prompt: string, userMsg: string, attempt = 1): Promise<any> => {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: prompt },
              { role: "user", content: "Data to clean:\n" + userMsg }
            ],
            temperature: 0,
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) {
          if (response.status === 429 && attempt < 3) {
            // Rate limit - wait and retry
            const delay = attempt * 2000;
            await new Promise(resolve => setTimeout(resolve, delay));
            return processWithRetry(prompt, userMsg, attempt + 1);
          }
          return null;
        }

        const groqData = await response.json();
        return JSON.parse(groqData.choices[0].message.content);
      } catch (e) {
        if (attempt < 3) {
           await new Promise(resolve => setTimeout(resolve, 1000));
           return processWithRetry(prompt, userMsg, attempt + 1);
        }
        return null;
      }
    };

    const processBatch = async (batch: any[], index: number) => {
      const prompt = index === 0 ? systemPromptMain : systemPromptSecondary;
      const userMsg = JSON.stringify({ headers, rows: batch });
      return processWithRetry(prompt, userMsg);
    };

    // Process all batches in parallel (Promise.all is safe here because of retry logic)
    const results = await Promise.all(batches.map((batch, i) => processBatch(batch, i)));

    // Merge Results
    let finalTransactions: any[] = [];
    let openingBalance = null;
    let detectedCurrency = "NGN";
    let suggestedRate = null;

    results.forEach((res, i) => {
      if (!res) return;
      if (Array.isArray(res.transactions)) {
        finalTransactions = finalTransactions.concat(res.transactions);
      }
      if (i === 0) {
        openingBalance = res.openingBalance ?? null;
        detectedCurrency = res.detectedCurrency ?? "NGN";
        suggestedRate = res.suggestedRate ?? null;
      }
    });

    return NextResponse.json({
      transactions: finalTransactions,
      openingBalance,
      detectedCurrency,
      suggestedRate
    });

  } catch (err: any) {
    console.error("Standardize Route Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
