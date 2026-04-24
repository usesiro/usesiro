import { NextResponse } from "next/server";
import pdf from "pdf-parse";

/**
 * Fast, non-AI PDF text extractor.
 * Converts PDF to raw text for client-side progressive AI processing.
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

    // Extract raw text from PDF
    const pdfData = await pdf(buffer);
    const text = pdfData.text;

    if (!text || text.trim().length < 10) {
      throw new Error("The PDF appears to be empty or an unreadable image scan.");
    }

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("Extract Text Error:", error);
    return NextResponse.json({ error: error.message || "Failed to extract text from PDF" }, { status: 500 });
  }
}
