import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

export async function POST(request: Request) {
  try {
    // 1. Verify Auth
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);

    // 2. Parse the incoming form data (File + Transaction ID)
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const transactionId = formData.get('transactionId') as string;

    if (!file || !transactionId) {
      return NextResponse.json({ error: "File and transaction ID are required." }, { status: 400 });
    }

    // 3. Upload the file to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public', // Makes the URL viewable
    });

    // 4. Save the URL to your Prisma Database
    const document = await prisma.document.create({
      data: {
        transactionId: transactionId,
        url: blob.url,
        mimeType: file.type,
      }
    });

    return NextResponse.json({ success: true, document });

  } catch (error) {
    console.error("Document Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload document." }, { status: 500 });
  }
}