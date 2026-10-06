import { NextRequest, NextResponse } from 'next/server';
import { defaultHttpObservability } from '@/core/observability/adapters/http/next-http-observability.adapter.edge';
import { ALL_AUTH_COOKIE_NAMES } from '@/core/auth/auth.constants';
import { isProtectedRoute, ROUTES, safeRedirect } from '@/core/routes';

export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isApi = pathname.startsWith('/api');
  const obsContext = isApi ? defaultHttpObservability.onIncomingRequest(request) : null;

  // 1. Friendly aliases (deterministic routing)
  if (pathname === '/login') {
    const response = NextResponse.redirect(new URL(ROUTES.signIn, request.url));
    if (obsContext) {
      defaultHttpObservability.onResponse(obsContext, {
        status: response.status,
        headers: response.headers
      });
    }
    return response;
  }

  if (pathname === '/register') {
    const response = NextResponse.redirect(new URL(ROUTES.signUp, request.url));
    if (obsContext) {
      defaultHttpObservability.onResponse(obsContext, {
        status: response.status,
        headers: response.headers
      });
    }
    return response;
  }

  if (pathname === '/forgot-password' || pathname === '/auth/forgot-password') {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/sign-in/forgot-password';
    const response = NextResponse.redirect(url);
    if (obsContext) {
      defaultHttpObservability.onResponse(obsContext, {
        status: response.status,
        headers: response.headers
      });
    }
    return response;
  }

  if (
    pathname === '/password-change' ||
    pathname === '/auth/password-change' ||
    pathname === '/reset-password' ||
    pathname === '/auth/reset-password'
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/sign-in/reset-password';
    const response = NextResponse.redirect(url);
    if (obsContext) {
      defaultHttpObservability.onResponse(obsContext, {
        status: response.status,
        headers: response.headers
      });
    }
    return response;
  }

  // 2. Protected routes check (presence check only, deny-only)
  const isProtected = isProtectedRoute(pathname);

  const hasAnyAuthCookie = ALL_AUTH_COOKIE_NAMES.some((name) => request.cookies.has(name));

  if (isProtected && !hasAnyAuthCookie) {
    const signInUrl = new URL(ROUTES.signIn, request.url);
    signInUrl.searchParams.set('redirect', safeRedirect(pathname + search, ROUTES.dashboard));
    const response = NextResponse.redirect(signInUrl);
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    if (obsContext) {
      defaultHttpObservability.onResponse(obsContext, {
        status: response.status,
        headers: response.headers
      });
    }
    return response;
  }

  // 3. Forward request with injected x-pathname and correlation headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  if (obsContext) {
    requestHeaders.set('x-request-id', obsContext.requestId);
    requestHeaders.set('x-correlation-id', obsContext.correlationId);
    requestHeaders.set('x-request-start-time', String(obsContext.startTime));
  }

  const rawAccessToken = request.cookies.get('amanah_access_token')?.value;
  if (rawAccessToken && !requestHeaders.has('authorization')) {
    requestHeaders.set('authorization', `Bearer ${rawAccessToken}`);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });

  // 4. Enforce anti-caching on protected routes
  if (isProtected) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export { proxy };

export const config = {
  matcher: ['/((?!_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)']
};
