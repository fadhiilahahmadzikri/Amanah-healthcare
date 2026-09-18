import 'server-only';
import { cookies } from 'next/headers';
import { serverEnv } from '@/core/config/env.server';
import { runtimeConfig } from '@/core/config/runtime.config';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}

export async function setAuthCookies(tokens: TokenPair): Promise<void> {
  const cookieStore = await cookies();
  const isProduction = serverEnv.NODE_ENV === 'production';

  cookieStore.set(serverEnv.ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: runtimeConfig.auth.accessTokenCookieMaxAge
  });

  cookieStore.set(serverEnv.REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: runtimeConfig.auth.refreshTokenCookieMaxAge
  });
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
  const cookieStore = await cookies();
  cookieStore.delete(serverEnv.ACCESS_TOKEN_COOKIE_NAME);
  cookieStore.delete(serverEnv.REFRESH_TOKEN_COOKIE_NAME);
  cookieStore.delete(serverEnv.SESSION_COOKIE_NAME);
}
