import { serverEnv } from './env.server';

export const runtimeConfig = {
  http: {
    defaultTimeoutMs: 15_000,
    quickTimeoutMs: 5_000,
    longTimeoutMs: 30_000,
    maxRetries: 3,
    retryInitialDelayMs: 300,
    retryMaxDelayMs: 3_000
  },
  auth: {
    accessTokenCookieMaxAge: serverEnv.ACCESS_TOKEN_COOKIE_MAX_AGE,
    refreshTokenCookieMaxAge: serverEnv.REFRESH_TOKEN_COOKIE_MAX_AGE,
    sessionCookieMaxAge: serverEnv.SESSION_COOKIE_MAX_AGE
  },
  pagination: {
    defaultLimit: 10,
    maxLimit: 100
  }
} as const;

export type RuntimeConfig = typeof runtimeConfig;
