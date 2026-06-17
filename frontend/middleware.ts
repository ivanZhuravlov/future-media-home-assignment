import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasRefreshCookie = request.cookies.has('refresh_token');
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!hasRefreshCookie && !isPublicPath && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (hasRefreshCookie && isPublicPath) {
    return NextResponse.redirect(new URL('/messages', request.url));
  }

  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(hasRefreshCookie ? '/messages' : '/login', request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/register', '/messages/:path*'],
};
