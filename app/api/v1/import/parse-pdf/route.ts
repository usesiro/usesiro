import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

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
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    const text = pdfData.text;

    if (!text || text.trim().length < 10) {
      throw new Error("The PDF appears to be empty or an unreadable image scan.");
    }

    // 2. AI Table Extraction
    // We send a substantial chunk of text (first ~4000 chars) to get the main table structure
    const systemPrompt = `You are a financial document parser. 
Take the raw text from a bank statement and extract the transaction table as a JSON array of objects.
Each object should represent a row in the table. Use generic keys like "Column 1", "Column 2", etc.

Ignore headers/footers outside the main table. Return valid JSON ONLY.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // Use faster/cheaper model for PDF text restructure
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Raw text:\n" + text.slice(0, 6000) }
        ],
        temperature: 0,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) throw new Error("AI PDF extraction failed");

    const groqData = await response.json();
    const content = JSON.parse(groqData.choices[0].message.content);
    
    // Result might be wrapped in a key like "rows" or "data"
    const extractedRows = Array.isArray(content) ? content : (content.rows || content.transactions || Object.values(content)[0]);

    if (!Array.isArray(extractedRows) || extractedRows.length === 0) {
       throw new Error("We couldn't structure the data in this PDF. Please try an Excel version.");
    }

    // 3. Generate virtual headers
    const headers = Object.keys(extractedRows[0]);

    return NextResponse.json({ 
      headers, 
      data: extractedRows 
    });

  } catch (error: any) {
    console.error("PDF Parse Error:", error);
    return NextResponse.json({ error: error.message || "Failed to parse PDF statement" }, { status: 500 });
  }
}
