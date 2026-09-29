export const AUTH_COOKIES = {
  betterAuth: 'better-auth.session_token',
  betterAuthSecure: '__Secure-better-auth.session_token',
  session: 'amanah_session',
  accessToken: 'amanah_access_token',
  refreshToken: 'amanah_refresh_token'
} as const;

export const ALL_AUTH_COOKIE_NAMES = [
  'better-auth.session_token',
  '__Secure-better-auth.session_token',
  'amanah_session',
  'amanah_access_token',
  'amanah_refresh_token'
] as const;
