import { get } from '@vercel/blob';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

async function getUserId(request: Request) {
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const cookieStore = await cookies();
  const token = bearerToken || cookieStore.get('siro_auth_token')?.value;

  if (!token) return null;

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return typeof payload.userId === 'string' ? payload.userId : null;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { documentId } = await context.params;
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        transaction: { business: { userId } },
      },
      select: { url: true, mimeType: true },
    });

    if (!document) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    const blob = await get(document.url, { access: 'private' });
    if (!blob?.stream) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    return new Response(blob.stream, {
      headers: {
        'Content-Type': document.mimeType,
        'Content-Disposition': 'inline',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Document Download Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve document.' }, { status: 500 });
  }
}
