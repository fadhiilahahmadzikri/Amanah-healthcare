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
    accessTokenCookieMaxAge: 60 * 60 * 24, // 1 day in seconds
    refreshTokenCookieMaxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    sessionCookieMaxAge: 60 * 60 * 24 * 7 // 7 days in seconds
  },
  pagination: {
    defaultLimit: 10,
    maxLimit: 100
  }
} as const;

export type RuntimeConfig = typeof runtimeConfig;
