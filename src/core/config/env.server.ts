import 'server-only';

export const serverEnv = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  API_BASE_URL:
    process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  ACCESS_TOKEN_COOKIE_NAME: process.env.ACCESS_TOKEN_COOKIE_NAME ?? 'amanah_access_token',
  REFRESH_TOKEN_COOKIE_NAME: process.env.REFRESH_TOKEN_COOKIE_NAME ?? 'amanah_refresh_token',
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME ?? 'better-auth.session_token',
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? '',
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? ''
} as const;

export type ServerEnv = typeof serverEnv;
