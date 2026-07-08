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
    // check if the file is a PDF
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported." },
        { status: 400 },
      );
    }

    // Check file size (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "PDF exceeds the 10MB limit." },
        { status: 400 },
      );
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract raw text from PDF

    try {
      const pdfData = await pdf(buffer);

      if (pdfData.text.trim().length < 20) {
        return NextResponse.json(
          {
            error:
              "This appears to be a scanned PDF. Please upload a digital bank statement instead.",
          },
          { status: 400 },
        );
      }

      return NextResponse.json({
        text: pdfData.text,

        pages: pdfData.numpages,

        info: pdfData.info,
      });
    } catch (err: any) {
      if (
        err.message?.includes("bad XRef") ||
        err.message?.includes("Invalid PDF") ||
        err.message?.includes("FormatError")
      ) {
        return NextResponse.json(
          {
            error:
              "This PDF appears to be corrupted or uses an unsupported format. Please export the statement again from your bank.",
          },
          { status: 400 },
        );
      }

      throw err;
    }
  } catch (error: any) {
    console.error({
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      { error: error.message || "Failed to extract text from PDF" },
      { status: 500 },
    );
  }
}
