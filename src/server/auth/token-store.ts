import 'server-only';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import { serverEnv } from '@/core/config/env.server';
import { runtimeConfig } from '@/core/config/runtime.config';
import { ALL_AUTH_COOKIE_NAMES } from '@/core/auth/auth.constants';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}

export function authCookieOptions(maxAgeSeconds: number) {
  const isProduction = serverEnv.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds
  };
}

export async function setAuthCookies(tokens: TokenPair): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(
      serverEnv.ACCESS_TOKEN_COOKIE_NAME,
      tokens.accessToken,
      authCookieOptions(runtimeConfig.auth.accessTokenCookieMaxAge)
    );

    cookieStore.set(
      serverEnv.REFRESH_TOKEN_COOKIE_NAME,
      tokens.refreshToken,
      authCookieOptions(runtimeConfig.auth.refreshTokenCookieMaxAge)
    );
  } catch {
    // In Server Components (RSC), cookies() is read-only.
  }
}

export async function getAccessTokenCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(serverEnv.ACCESS_TOKEN_COOKIE_NAME)?.value ?? null;
}

export async function getRefreshTokenCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(serverEnv.REFRESH_TOKEN_COOKIE_NAME)?.value ?? null;
}

export async function clearAuthCookies(): Promise<void> {
  try {
    const cookieStore = await cookies();
    for (const name of ALL_AUTH_COOKIE_NAMES) {
      cookieStore.delete(name);
    }
  } catch {
    // In Server Components (RSC), cookies() is read-only.
  }
}

export function clearAuthCookiesOnResponse(responseCookies: NextResponse['cookies']): void {
  for (const name of ALL_AUTH_COOKIE_NAMES) {
    responseCookies.set(name, '', authCookieOptions(0));
    responseCookies.delete(name);
  }
}
