import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { recordAuditLog } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    // 1. Verify Auth
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    // 2. Parse the incoming form data (File + Transaction ID)
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const transactionId = formData.get('transactionId') as string;

    if (!file || !transactionId) {
      return NextResponse.json({ error: "File and transaction ID are required." }, { status: 400 });
    }

    // Verify transaction belongs to this user's business
    const business = await prisma.business.findUnique({ where: { userId } });
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, businessId: business.id }
    });
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Upload with randomized filename to prevent collisions
    const ext = file.name.split('.').pop() || 'bin';
    const safeName = `docs/${business.id}/${crypto.randomUUID()}.${ext}`;

    const blob = await put(safeName, file, {
      access: 'public',
    });

    // 4. Save the URL to your Prisma Database
    const document = await prisma.document.create({
      data: {
        transactionId: transactionId,
        url: blob.url,
        mimeType: file.type,
      }
    });

    // --- NEW: Record Audit Log ---
    await recordAuditLog({
      userId,
      action: "DOCUMENT.UPLOAD",
      status: "SUCCESS",
      details: { 
        transactionId,
        fileName: file.name,
        mimeType: file.type
      }
    });

    return NextResponse.json({ success: true, document });

  } catch (error) {
    console.error("Document Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload document." }, { status: 500 });
  }
}