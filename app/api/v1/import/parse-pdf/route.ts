import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

/**
 * Heuristic PDF parser for bank statements.
 * Extracts rows that look like transactions using regex patterns.
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

    // 2. Heuristic Row Extraction
    // We look for lines that contain a Date and a Currency-like amount.
    const lines = text.split('\n');
    const extractedRows: any[] = [];
    
    // Pattern for Dates (DD/MM/YYYY, DD-MM-YYYY, or YYYY/MM/DD)
    const datePattern = /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})|(\d{4}[/-]\d{1,2}[/-]\d{1,2})|([a-zA-Z]{3}\s\d{1,2},?\s\d{4})/;
    
    // Pattern for Amounts (e.g. 1,234.56 or -1,234.56 or 1234)
    // We target numbers that look like currency (presence of comma or decimal)
    const amountPattern = /(-?\d{1,3}(,\d{3})+(\.\d{2})?)|(-?\d+(\.\d{2}))/;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      const dateMatch = trimmedLine.match(datePattern);
      const amountMatch = trimmedLine.match(amountPattern);

      // If a line has both a date and an amount, it's highly likely a transaction row
      if (dateMatch && amountMatch) {
        // We push a "virtual row" where we try to separate components
        const segments = trimmedLine.split(/\s{2,}/).filter((s: string) => s.trim().length > 0);
        
        // If splitting by multiple spaces doesn't yield much, try single spaces
        const finalSegments = segments.length > 2 ? segments : trimmedLine.split(/\s+/);

        const rowObj: any = {};
        finalSegments.forEach((seg: string, i: number) => {
          rowObj[`Column ${i + 1}`] = seg;
        });

        extractedRows.push(rowObj);
      }
    }

    if (extractedRows.length === 0) {
      return NextResponse.json({ 
        error: "We couldn't find any transaction-like data in this PDF. Please try a CSV or Excel version if possible." 
      }, { status: 422 });
    }

    // Generate virtual headers for the mapping step
    const maxCols = Math.max(...extractedRows.map(r => Object.keys(r).length));
    const headers = Array.from({ length: maxCols }, (_, i) => `Column ${i + 1}`);

    return NextResponse.json({ 
      headers, 
      data: extractedRows 
    });

  } catch (error) {
    console.error("PDF Parse Error:", error);
    return NextResponse.json({ error: "Failed to parse PDF statement" }, { status: 500 });
  }
}
