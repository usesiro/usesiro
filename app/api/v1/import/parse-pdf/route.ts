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

    const systemPrompt = `You are a high-precision financial data extraction agent. 
Your task is to take raw text from a bank statement and extract EVERY transaction row into a JSON array.

STRICT ACCURACY RULES:
1. COUNT BEFORE RESPONDING: Count the number of transactions in the input FIRST. Your array MUST match this count.
2. HEADER METADATA: Look for "Opening Balance", "Initial Balance", "Start Balance", or "Currency" in the header text. If found, return them.
3. DO NOT SUMMARIZE: Do not skip ANY rows. If it looks like a transaction, extract it.
4. BE EXHAUSTIVE: Even if there are many rows, capture every single one in this text chunk.
5. DATA FIELDS: Extract "date", "description", "amount", "type" (INCOME/EXPENSE), "balance", and "reference".
6. JSON FORMAT ONLY: Respond with a JSON object.

Schema: { "count": number, "rows": [...], "openingBalance": number|null, "currency": string|null }`;

    const processWithRetry = async (prompt: string, chunk: string, attempt = 1): Promise<any> => {
      try {
        const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.CEREBRAS_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama3.1-8b",
            messages: [
              { role: "system", content: prompt },
              { role: "user", content: "Extract records from this text. Remember to count them first so you don't miss any:\n" + chunk }
            ],
            temperature: 0,
            max_tokens: 8192,
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) {
          if ((response.status === 429 || response.status === 503) && attempt < 6) {
            const delay = attempt * 2000; 
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
        if (attempt < 3) {
           await new Promise(resolve => setTimeout(resolve, 2000));
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
