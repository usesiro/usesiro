import { NextResponse } from "next/server";

/**
 * AI-Powered Text Chunk Parser.
 * Takes a slice of bank statement text and returns structured rows.
 * Part of the Progressive Import Pipeline.
 */
export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || text.trim().length < 5) {
      return NextResponse.json({ rows: [] });
    }

    if (!process.env.CEREBRAS_API_KEY) {
      console.error("CRITICAL: CEREBRAS_API_KEY is missing from environment variables.");
      return NextResponse.json({ error: "Server Configuration Error: Missing API Key on Vercel." }, { status: 500 });
    }

    const systemPrompt = `You are a high-precision financial data extraction agent. 
Your task is to take raw text from a bank statement and extract EVERY transaction row into a JSON array.

STRICT ACCURACY RULES:
1. HEADER METADATA: Look for "Opening Balance", "Initial Balance", "Start Balance", or "Currency" in the header text. If found, return them.
2. DO NOT SUMMARIZE: Do not skip ANY rows. If it looks like a transaction, extract it.
3. DATA FIELDS: Extract "date", "description", "amount", "type" (INCOME/EXPENSE), "balance", and "reference".
4. ULTRA-DENSE JSON: Omit any keys that are null or empty. Do not include 'reference' or 'balance' if they aren't explicitly on the line.
5. JSON FORMAT ONLY: Respond with a JSON object.

Schema: { "rows": [...], "openingBalance": number|null, "currency": string|null }`;

    const processWithRetry = async (prompt: string, chunk: string, attempt = 1): Promise<any> => {
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
              { role: "user", content: "Extract records from this text. Omit null fields:\n" + chunk }
            ],
            temperature: 0,
            max_tokens: 8192,
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) {
          // Retry on Rate Limit (429) or Server Errors (5xx)
          if ((response.status === 429 || response.status >= 500) && attempt < 6) {
            const delay = Math.pow(2, attempt) * 1000;
            console.warn(`AI Retry (Status ${response.status}): Attempt ${attempt}, waiting ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return processWithRetry(prompt, chunk, attempt + 1);
          }
          const errorBody = await response.text();
          throw new Error(`AI Request Failed: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const cerebrasData = await response.json();
        const rawContent = cerebrasData.choices[0].message.content;
        
        try {
          const content = JSON.parse(rawContent);
          const rows = content.rows || content.transactions || (Array.isArray(content) ? content : Object.values(content).find(Array.isArray)) || [];
          return { 
            rows, 
            openingBalance: content.openingBalance || null, 
            currency: content.currency || null 
          };
        } catch (parseError) {
          console.error("JSON Parse Error. Raw content snippet:", rawContent.substring(0, 500), "...");
          if (cerebrasData.choices[0].finish_reason === "length") {
             throw new Error("AI response was too long and got truncated. Try a smaller chunk size.");
          }
          throw parseError;
        }
      } catch (e: any) {
        const isNetworkError = e.message.includes('fetch failed') || e.name === 'ConnectTimeoutError' || e.code === 'UND_ERR_CONNECT_TIMEOUT' || e.code === 'ETIMEDOUT';
        
        if (isNetworkError && attempt < 6) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`AI Network Retry: Attempt ${attempt}, waiting ${delay}ms. Error: ${e.message}`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return processWithRetry(prompt, chunk, attempt + 1);
        }
        throw e;
      }
    };

    const result = await processWithRetry(systemPrompt, text);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Text Chunk Parse Error:", error);
    return NextResponse.json({ error: error.message || "Failed to parse text chunk" }, { status: 500 });
  }
}
