import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookiesOnResponse } from '@/server/auth/token-store';
import { ROUTES } from '@/core/routes';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const redirectTarget = request.nextUrl.searchParams.get('redirect');
  const targetUrl = new URL(ROUTES.signIn, request.url);
  if (redirectTarget && redirectTarget.startsWith('/') && !redirectTarget.startsWith('//')) {
    targetUrl.searchParams.set('redirect', redirectTarget);
  }

  const response = NextResponse.redirect(targetUrl);
  clearAuthCookiesOnResponse(response.cookies);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}
