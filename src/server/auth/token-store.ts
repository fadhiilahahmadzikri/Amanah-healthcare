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
  const isProduction = serverEnv.NODE_ENV === 'production';

  try {
    const cookieStore = await cookies();
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
  } catch {
    // In Server Components (RSC), cookies() is read-only.
    // Mutations are only allowed in Server Actions or Route Handlers.
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
    cookieStore.delete(serverEnv.ACCESS_TOKEN_COOKIE_NAME);
    cookieStore.delete(serverEnv.REFRESH_TOKEN_COOKIE_NAME);
    cookieStore.delete(serverEnv.SESSION_COOKIE_NAME);
  } catch {
    // In Server Components (RSC), cookies() is read-only.
    // Mutations are only allowed in Server Actions or Route Handlers.
  }
}
