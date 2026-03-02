import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Let public authentication routes pass freely without a token
  if (pathname.startsWith('/api/v1/auth')) {
    return NextResponse.next();
  }

  // 2. For all other API routes, demand the Authorization header
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized: Missing or invalid token format' }, 
      { status: 401 }
    );
  }

  // 3. Extract the actual token string
  const token = authHeader.split(' ')[1];

  try {
    // 4. Verify the token cryptographically
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    
    // 5. If valid, open the gates!
    return NextResponse.next();
    
  } catch (error) {
    console.error('JWT Verification Failed:', error);
    return NextResponse.json(
      { error: 'Unauthorized: Expired or invalid token' }, 
      { status: 401 }
    );
  }
}

// 6. Tell Next.js to only run this middleware on API routes to save execution costs
export const config = {
  matcher: ['/api/v1/:path*'],
};