import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- LAYER 1: UI PAGE PROTECTION ---
  const protectedPageRoutes = [
    '/dashboard',
    '/transactions',
    '/tax-readiness',
    '/reconciliation',
    '/reports',
    '/settings',
    '/pigshit' // New admin protection
  ];

  const adminRoutes = ['/pigshit'];
  const isProtectedRoute = protectedPageRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const pageToken = request.cookies.get('siro_auth_token')?.value;

  const isAuthPage = 
    pathname.includes('/pigshit/setup') || 
    pathname.includes('/pigshit/auth') || 
    pathname.includes('/pigshit/verify');

  if (isProtectedRoute) {
    // 1. Genesis Check: If no users exist, redirect to /pigshit/setup
    // Skip this if we're already on an auth/setup/verify page to prevent loops
    if (isAdminRoute && !isAuthPage) {
      try {
        const statusRes = await fetch(new URL('/api/v1/auth/status', request.url));
        if (statusRes.ok) {
           const { adminCount } = await statusRes.json();
           if (adminCount === 0) {
             return NextResponse.redirect(new URL('/pigshit/setup', request.url));
           }
        }
      } catch (err) { console.error("Genesis check failed", err); }
    }

    if (!pageToken && !isAuthPage) {
      // Unauthenticated on admin? Dedicated Admin Login
      const authUrl = isAdminRoute ? '/pigshit/auth' : '/login';
      return NextResponse.redirect(new URL(authUrl, request.url));
    }

    if (pageToken) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(pageToken, secret);
        
        // RBAC Check for Admin Routes
        if (isAdminRoute && !isAuthPage) {
          const role = payload.role as string;
          if (role === 'USER') {
            return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
          }
        }
      } catch (err) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('siro_auth_token');
        return response;
      }
    }
  }


  // --- LAYER 2: API ROUTE PROTECTION (Your Existing Logic) ---
  if (pathname.startsWith('/api/v1/')) {
    // Let public auth/waitlist/contact pass
    if (
      pathname.startsWith('/api/v1/auth') || 
      pathname.startsWith('/api/v1/waitlist') ||
      pathname.startsWith('/api/v1/contact') ||
      pathname.startsWith('/api/v1/bookings')
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
    '/pigshit/:path*',
    '/transactions/:path*',
    '/tax-readiness/:path*',
    '/reconciliation/:path*',
    '/reports/:path*',
    '/settings/:path*'
  ],
};