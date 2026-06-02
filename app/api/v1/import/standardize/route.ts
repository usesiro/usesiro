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

    if (!headers || !Array.isArray(headers) || !data || !Array.isArray(data)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    if (!process.env.CEREBRAS_API_KEY) {
      console.error("CRITICAL: CEREBRAS_API_KEY is missing from environment variables.");
      return NextResponse.json({ error: "Server Configuration Error: Missing API Key on Vercel." }, { status: 500 });
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

    // 4. Single Batch Processing (Client-side now handles the loop)
    const systemPrompt = `You are a professional financial auditor.
Extract EVERY transaction from this chunk of data.

RULES:
1. COUNT BEFORE RESPONDING: Count the records in the input FIRST. Your result MUST match this count.
2. IDENTIFY ALL TRANSACTIONS: Date, description, amount, type (INCOME/EXPENSE), balance, and reference.
3. TYPE DETECTION: 
   - Debit/Withdrawal -> EXPENSE.
   - Credit/Deposit -> INCOME.
   - Negative amount -> EXPENSE.
4. CURRENCY: Look for opening balances and exchange rates (only applies if this is the start of the file).
5. JSON ONLY: { "count": number, "transactions": [...], "openingBalance": number?, "detectedCurrency": string?, "suggestedRate": number? }`;

    const processWithRetry = async (prompt: string, userMsg: string, attempt = 1): Promise<any> => {
      try {
        const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.CEREBRAS_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "qwen-3-235b-a22b-instruct-2507",
            messages: [
              { role: "system", content: prompt },
              { role: "user", content: "Data to clean:\n" + userMsg }
            ],
            temperature: 0,
            max_tokens: 8192,
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) {
          // Retry on Rate Limit (429) or Server Errors (5xx)
          if ((response.status === 429 || response.status >= 500) && attempt < 6) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential: 2s, 4s, 8s, 16s...
            console.warn(`AI Retry (Status ${response.status}): Attempt ${attempt}, waiting ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return processWithRetry(prompt, userMsg, attempt + 1);
          }
          const errorBody = await response.text();
          throw new Error(`AI Request Failed: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const cerebrasData = await response.json();
        const rawContent = cerebrasData.choices[0].message.content;
        try {
          return JSON.parse(rawContent);
        } catch (parseError) {
          console.error("JSON Parse Error. Raw content snippet:", rawContent.substring(0, 500), "...");
          if (cerebrasData.choices[0].finish_reason === "length") {
            throw new Error("AI response was too long and got truncated. Try a smaller chunk size.");
          }
          throw parseError;
        }
      } catch (e: any) {
        // Catch network errors specifically (TypeError: fetch failed, ConnectTimeout, etc.)
        const isNetworkError = e.message.includes('fetch failed') || e.name === 'ConnectTimeoutError' || e.code === 'UND_ERR_CONNECT_TIMEOUT' || e.code === 'ETIMEDOUT';
        
        if (isNetworkError && attempt < 6) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`AI Network Retry: Attempt ${attempt}, waiting ${delay}ms. Error: ${e.message}`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return processWithRetry(prompt, userMsg, attempt + 1);
        }
        throw e;
      }
    };

    const userMsg = JSON.stringify({ headers, rows: data });
    const result = await processWithRetry(systemPrompt, userMsg);

    return NextResponse.json({
      transactions: result.transactions || [],
      openingBalance: result.openingBalance || null,
      detectedCurrency: result.detectedCurrency || "NGN",
      suggestedRate: result.suggestedRate || null
    });

  } catch (err: any) {
    console.error("Standardize Route Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
