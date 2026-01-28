import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  // Public paths
  if (path === '/login' || path === '/register' || path === '/') {
    if (token) {
      const payload = await verifyJWT(token);
      if (payload) {
        // Redirect based on role
        const role = payload.role as string;
        if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url));
        if (role === 'AGENT') return NextResponse.redirect(new URL('/agent', request.url));
        if (role === 'PLAYER') return NextResponse.redirect(new URL('/player', request.url));
      }
    }
    return NextResponse.next();
  }

  // Protected paths
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const role = payload.role as string;

  if (path.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (path.startsWith('/agent') && role !== 'AGENT') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (path.startsWith('/player') && role !== 'PLAYER') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
