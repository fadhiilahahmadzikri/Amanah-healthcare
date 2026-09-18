import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

const PROTECTED_PREFIXES = ['/dashboard', '/patient-registration'];
const AUTH_ONLY_PREFIXES = [
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth',
  '/verify-otp',
  '/login',
  '/register'
];

function safeCallbackUrl(pathname: string): string {
  if (pathname.startsWith('/') && !pathname.startsWith('//')) return pathname;
  return '/dashboard';
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie =
    getSessionCookie(request) ||
    request.cookies.get('amanah_access_token')?.value ||
    request.cookies.get('amanah_session')?.value ||
    request.cookies.get('better-auth.session_token')?.value;

  // Friendly aliases
  if (pathname === '/login') {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }
  if (pathname === '/register') {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/auth/sign-up', request.url));
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // 1. Unauthenticated users accessing protected paths -> redirect to sign-in
  if (isProtected && !sessionCookie) {
    const url = new URL('/auth/sign-in', request.url);
    url.searchParams.set('redirect', safeCallbackUrl(pathname));
    const response = NextResponse.redirect(url);
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  }

  // 2. Authenticated users accessing auth-only paths -> redirect to dashboard (unless viewing an error)
  const hasAuthError = request.nextUrl.searchParams.has('error');
  if (isAuthOnly && sessionCookie && !hasAuthError) {
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  }

  // 3. Forward request with injected x-pathname header so Server Layouts/Components know the route
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });

  // 4. If protected route, enforce anti-caching headers on response
  if (isProtected) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export { proxy };

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)'
  ]
};
