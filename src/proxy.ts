import { NextRequest, NextResponse } from 'next/server';
import { defaultHttpObservability } from '@/core/observability/adapters/http/next-http-observability.adapter.edge';
import { ALL_AUTH_COOKIE_NAMES } from '@/core/auth/auth.constants';
import { isProtectedRoute, ROUTES, safeRedirect } from '@/core/routes';

let aliasCache: { data: Record<string, string>; expiresAt: number } | null = null;

async function getDynamicRouteAliases(): Promise<Record<string, string>> {
  const now = Date.now();
  if (aliasCache && aliasCache.expiresAt > now) {
    return aliasCache.data;
  }
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) {
    return aliasCache?.data || {};
  }
  try {
    const res = await fetch(`${baseUrl}/api/v1/admin/pages/routes/aliases`, {
      next: { revalidate: 30 }
    });
    if (res.ok) {
      const data = (await res.json()) as Record<string, string>;
      aliasCache = { data, expiresAt: now + 30000 };
      return data;
    }
  } catch {
    // Upstream network error
  }
  return aliasCache?.data || {};
}

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

  // 3. Protected routes check (presence check only, deny-only)
  const isProtected = isProtectedRoute(pathname);
  const hasAnyAuthCookie = ALL_AUTH_COOKIE_NAMES.some((name) => request.cookies.has(name));

  if (isProtected && !hasAnyAuthCookie) {
    const signInUrl = new URL(ROUTES.signIn, request.url);
    signInUrl.searchParams.set(
      'redirect',
      safeRedirect(pathname + search, ROUTES.adminAppointmentPasien)
    );
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

  // 4. Dynamic Route Alias Rewriting from Database
  const dynamicAliases = await getDynamicRouteAliases();
  const physicalTarget = dynamicAliases[pathname];

  // 5. Forward request with injected x-pathname and correlation headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', physicalTarget || pathname);
  if (physicalTarget) {
    requestHeaders.set('x-alias-pathname', pathname);
  }

  if (obsContext) {
    requestHeaders.set('x-request-id', obsContext.requestId);
    requestHeaders.set('x-correlation-id', obsContext.correlationId);
    requestHeaders.set('x-request-start-time', String(obsContext.startTime));
  }

  const rawAccessToken = request.cookies.get('amanah_access_token')?.value;
  if (rawAccessToken && !requestHeaders.has('authorization')) {
    requestHeaders.set('authorization', `Bearer ${rawAccessToken}`);
  }

  const response = physicalTarget
    ? NextResponse.rewrite(new URL(physicalTarget + search, request.url), {
        request: {
          headers: requestHeaders
        }
      })
    : NextResponse.next({
        request: {
          headers: requestHeaders
        }
      });

  // 6. Enforce anti-caching on protected routes
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
