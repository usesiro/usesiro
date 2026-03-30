import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- LAYER 1: UI PAGE PROTECTION ---
  // Define all routes that require a user to be logged in
  const protectedPageRoutes = [
    '/dashboard',
    '/transactions',
    '/tax-readiness',
    '/reconciliation',
    '/reports',
    '/settings'
  ];

  const isProtectedRoute = protectedPageRoutes.some(route => pathname.startsWith(route));
  const pageToken = request.cookies.get('siro_auth_token')?.value;

  if (isProtectedRoute) {
    if (!pageToken) {
      // No token found in cookies? Kick them to login
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Optional: Verify JWT here too for maximum security on page loads
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(pageToken, secret);
    } catch (err) {
      // Token expired or fake? Kick to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }


  // --- LAYER 2: API ROUTE PROTECTION (Your Existing Logic) ---
  if (pathname.startsWith('/api/v1/')) {
    // Let public auth/waitlist/contact pass
    if (
      pathname.startsWith('/api/v1/auth') || 
      pathname.startsWith('/api/v1/waitlist') ||
      pathname.startsWith('/api/v1/contact')
    ) {
      return NextResponse.next();
    }

    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing token' }, 
        { status: 401 }
      );
    }

    const apiToken = authHeader.split(' ')[1];

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(apiToken, secret);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' }, 
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

// Optimization: Match API routes AND your dashboard pages
export const config = {
  matcher: [
    '/api/v1/:path*',
    '/dashboard/:path*',
    '/transactions/:path*',
    '/tax-readiness/:path*',
    '/reconciliation/:path*',
    '/reports/:path*',
    '/settings/:path*'
  ],
};