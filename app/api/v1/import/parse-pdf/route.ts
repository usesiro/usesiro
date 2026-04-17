import { NextResponse } from "next/server";
import pdf from "pdf-parse";

/**
 * AI-Powered PDF parser for bank statements.
 * Extracts text and uses Clearsheet AI to structure it into tabular data.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Extract raw text from PDF
    const pdfData = await pdf(buffer);
    const text = pdfData.text;

    if (!text || text.trim().length < 10) {
      throw new Error("The PDF appears to be empty or an unreadable image scan.");
    }

    // 2. AI Table Extraction with Overlapping Chunks
    const chunkSize = 8000;
    const overlap = 1500;
    const chunks: string[] = [];
    
    if (text.length <= chunkSize) {
      chunks.push(text);
    } else {
      for (let i = 0; i < text.length; i += (chunkSize - overlap)) {
        chunks.push(text.slice(i, i + chunkSize));
        if (i + chunkSize >= text.length) break;
      }
    }

    const systemPrompt = `You are a professional financial data extractor. 
Take the raw text from a bank statement and extract the transaction table as a JSON array.
Each object should represent a row.

CRITICAL INSTRUCTIONS:
1. Capture every single row.
2. If available, ALWAYS extract: "Date", "Description/Narration", "Amount", "Balance" (Running/Account balance), and "Transaction ID/Reference".
3. Use standardized keys: "date", "description", "amount", "balance", "reference".
4. If a row appears truncated, still extract what you see.
5. Return valid JSON ONLY. 

Format: { "rows": [{...}] }`;

    // Process chunks with a concurrency limit to avoid Groq rate limits
    const processChunk = async (chunk: string) => {
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
              { role: "system", content: systemPrompt },
              { role: "user", content: "Extract records from this text:\n" + chunk }
            ],
            temperature: 0,
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) return [];

        const groqData = await response.json();
        const content = JSON.parse(groqData.choices[0].message.content);
        const rows = content.rows || content.transactions || (Array.isArray(content) ? content : Object.values(content).find(Array.isArray)) || [];
        return rows;
      } catch (e) {
        console.error("Chunk processing error:", e);
        return [];
      }
    };

    // Process in parallel batches to prevent timeouts/rate limits
    const results = [];
    const batchSize = 4;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processChunk));
      results.push(...batchResults);
    }

    // 3. Smart Boundary Merging (De-duplicate AI Overlaps)
    let allRows: any[] = [];
    results.forEach((rows: any[]) => {
      if (allRows.length === 0) {
        allRows = rows;
        return;
      }

      // We compare the start of the new chunk's rows with the end of the existing rows
      // to identify duplicates caused by the 1500 char overlap.
      let duplicateCount = 0;
      const recentRows = allRows.slice(-8).map(r => JSON.stringify(r));
      
      for (let j = 0; j < Math.min(rows.length, 8); j++) {
        if (recentRows.includes(JSON.stringify(rows[j]))) {
          duplicateCount = j + 1;
        } else {
          // If we find a non-matching row after potential matches, stop
          // but we take the latest duplicateCount found.
        }
      }

      allRows.push(...rows.slice(duplicateCount));
    });

    if (allRows.length === 0) {
       throw new Error("Clearsheet AI couldn't structure this PDF. Please try an Excel version.");
    }

    const headers = Object.keys(allRows[0]);

    return NextResponse.json({ headers, data: allRows });

  } catch (error: any) {
    console.error("PDF Parse Error:", error);
    return NextResponse.json({ error: error.message || "Failed to parse PDF statement" }, { status: 500 });
  }
}
