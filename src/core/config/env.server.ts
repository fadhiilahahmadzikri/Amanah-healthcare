import 'server-only';

export const serverEnv = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  API_BASE_URL:
    (process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim(),
  ACCESS_TOKEN_COOKIE_NAME: process.env.ACCESS_TOKEN_COOKIE_NAME ?? 'amanah_access_token',
  REFRESH_TOKEN_COOKIE_NAME: process.env.REFRESH_TOKEN_COOKIE_NAME ?? 'amanah_refresh_token',
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME ?? 'better-auth.session_token',
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? '',
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? '',

  // HTTP Observability Configuration
  HTTP_LOGGING_ENABLED: process.env.HTTP_LOGGING_ENABLED !== 'false',
  HTTP_LOG_REQUEST_BODY:
    process.env.HTTP_LOG_REQUEST_BODY === 'true' ||
    (process.env.NODE_ENV !== 'production' && process.env.HTTP_LOG_REQUEST_BODY !== 'false'),
  HTTP_LOG_RESPONSE_BODY:
    process.env.HTTP_LOG_RESPONSE_BODY === 'true' ||
    (process.env.NODE_ENV !== 'production' && process.env.HTTP_LOG_RESPONSE_BODY !== 'false'),
  HTTP_LOG_HEADERS:
    process.env.HTTP_LOG_HEADERS === 'true' ||
    (process.env.NODE_ENV !== 'production' && process.env.HTTP_LOG_HEADERS !== 'false'),
  LOG_LEVEL: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  HTTP_LOG_MAX_BODY_LENGTH: Number(process.env.HTTP_LOG_MAX_BODY_LENGTH) || 10_000,
  TRUSTED_PROXY: process.env.TRUSTED_PROXY === 'true'
} as const;

export type ServerEnv = typeof serverEnv;
