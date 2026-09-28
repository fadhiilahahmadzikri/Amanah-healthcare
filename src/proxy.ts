import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';
// proxy.ts runs in the Edge Runtime (it is the Next.js middleware).
// Must import from the Edge adapter — NOT the barrel or the Node adapter.
import { defaultHttpObservability } from '@/core/observability/adapters/http/next-http-observability.adapter.edge';

const PROTECTED_PREFIXES = ['/dashboard', '/patient-registration'];
const AUTH_ONLY_PREFIXES = [
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth',
  '/login',
  '/register',
  '/forgot-password'
];

function safeCallbackUrl(pathname: string): string {
  if (pathname.startsWith('/') && !pathname.startsWith('//')) return pathname;
  return '/dashboard';
}

function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (typeof payload.exp === 'number') {
      return payload.exp * 1000 < Date.now();
    }
    return false;
  } catch {
    return false;
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith('/api');

  // 0. Global HTTP Observability Boundary for incoming API requests only
  const obsContext = isApi ? defaultHttpObservability.onIncomingRequest(request) : null;

  const rawAccessToken = request.cookies.get('amanah_access_token')?.value;
  const rawRefreshToken = request.cookies.get('amanah_refresh_token')?.value;
  const betterAuthToken =
    getSessionCookie(request) ||
    request.cookies.get('better-auth.session_token')?.value ||
    request.cookies.get('__Secure-better-auth.session_token')?.value ||
    request.cookies.get('amanah_session')?.value;

  const hasValidAccessToken = Boolean(rawAccessToken && !isJwtExpired(rawAccessToken));
  const hasRefreshToken = Boolean(rawRefreshToken);
  const hasBetterAuth = Boolean(betterAuthToken);

  const sessionCookie =
    (hasValidAccessToken ? rawAccessToken : null) ||
    (hasRefreshToken ? rawRefreshToken : null) ||
    (hasBetterAuth ? betterAuthToken : null);

  // Friendly aliases
  if (pathname === '/login') {
    const dest = sessionCookie ? '/dashboard' : '/auth/sign-in';
    const redirectRes = NextResponse.redirect(new URL(dest, request.url));
    if (obsContext)
      defaultHttpObservability.onResponse(obsContext, {
        status: redirectRes.status,
        headers: redirectRes.headers
      });
    return redirectRes;
  }
  if (pathname === '/register') {
    const dest = sessionCookie ? '/dashboard' : '/auth/sign-up';
    const redirectRes = NextResponse.redirect(new URL(dest, request.url));
    if (obsContext)
      defaultHttpObservability.onResponse(obsContext, {
        status: redirectRes.status,
        headers: redirectRes.headers
      });
    return redirectRes;
  }
  if (pathname === '/forgot-password' || pathname === '/auth/forgot-password') {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/sign-in/forgot-password';
    const redirectRes = NextResponse.redirect(url);
    if (obsContext)
      defaultHttpObservability.onResponse(obsContext, {
        status: redirectRes.status,
        headers: redirectRes.headers
      });
    return redirectRes;
  }
  if (
    pathname === '/password-change' ||
    pathname === '/auth/password-change' ||
    pathname === '/reset-password' ||
    pathname === '/auth/reset-password'
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/sign-in/reset-password';
    const redirectRes = NextResponse.redirect(url);
    if (obsContext)
      defaultHttpObservability.onResponse(obsContext, {
        status: redirectRes.status,
        headers: redirectRes.headers
      });
    return redirectRes;
  }

  const isResetPassword =
    pathname.includes('/reset-password') ||
    pathname.includes('/password-change') ||
    request.nextUrl.searchParams.has('hash') ||
    request.nextUrl.searchParams.has('token');

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthOnly =
    !isResetPassword &&
    AUTH_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // 1. Unauthenticated users accessing protected paths -> redirect to sign-in
  if (isProtected && !sessionCookie) {
    const url = new URL('/auth/sign-in', request.url);
    url.searchParams.set('redirect', safeCallbackUrl(pathname));
    const response = NextResponse.redirect(url);
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    if (obsContext)
      defaultHttpObservability.onResponse(obsContext, {
        status: response.status,
        headers: response.headers
      });
    return response;
  }

  // 2. Authenticated users accessing auth-only pages -> redirect to dashboard
  if (isAuthOnly && sessionCookie) {
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    if (obsContext)
      defaultHttpObservability.onResponse(obsContext, {
        status: response.status,
        headers: response.headers
      });
    return response;
  }

  // 3. Forward request with injected x-pathname and correlation/request ID headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  if (obsContext) {
    requestHeaders.set('x-request-id', obsContext.requestId);
    requestHeaders.set('x-correlation-id', obsContext.correlationId);
    requestHeaders.set('x-request-start-time', String(obsContext.startTime));
  }

  if (rawAccessToken && !requestHeaders.has('authorization')) {
    requestHeaders.set('authorization', `Bearer ${rawAccessToken}`);
  }

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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)'
  ]
};
