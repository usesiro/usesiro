import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { recordAuditLog } from '@/lib/logger';

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

const ALLOWED_DOCUMENT_TYPES = {
  'application/pdf': {
    extension: 'pdf',
    matchesSignature: (bytes: Uint8Array) =>
      bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d,
  },
  'image/jpeg': {
    extension: 'jpg',
    matchesSignature: (bytes: Uint8Array) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  'image/png': {
    extension: 'png',
    matchesSignature: (bytes: Uint8Array) =>
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
      bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a,
  },
  'image/webp': {
    extension: 'webp',
    matchesSignature: (bytes: Uint8Array) =>
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50,
  },
} as const;

async function validateDocument(file: File) {
  if (file.size === 0) return 'The selected document is empty.';
  if (file.size > MAX_DOCUMENT_SIZE) return 'Documents must be 10 MB or smaller.';

  const allowedType = ALLOWED_DOCUMENT_TYPES[file.type as keyof typeof ALLOWED_DOCUMENT_TYPES];
  if (!allowedType) return 'Only PDF, JPEG, PNG, and WebP documents are allowed.';

  const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (!allowedType.matchesSignature(signature)) return 'The file contents do not match its declared type.';

  return null;
}

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
    const fileEntry = formData.get('file');
    const transactionIdEntry = formData.get('transactionId');

    if (!(fileEntry instanceof File) || typeof transactionIdEntry !== 'string' || !transactionIdEntry) {
      return NextResponse.json({ error: "File and transaction ID are required." }, { status: 400 });
    }

    const file = fileEntry;
    const transactionId = transactionIdEntry;
    const validationError = await validateDocument(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
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
    const allowedType = ALLOWED_DOCUMENT_TYPES[file.type as keyof typeof ALLOWED_DOCUMENT_TYPES];
    const safeName = `docs/${business.id}/${crypto.randomUUID()}.${allowedType.extension}`;

    const blob = await put(safeName, file, {
      access: 'private',
      contentType: file.type,
    });

    // 4. Save the URL to your Prisma Database
    const document = await prisma.document.create({
      data: {
        transactionId: transactionId,
        // Store the opaque blob pathname, not a directly usable storage URL.
        url: blob.pathname,
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

    return NextResponse.json({
      success: true,
      document: { ...document, url: `/api/v1/documents/${document.id}` },
    });

  } catch (error) {
    console.error("Document Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload document." }, { status: 500 });
  }
}
