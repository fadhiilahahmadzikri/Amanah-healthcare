export const clientEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? '',
  NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? '',
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL ?? '',
  NEXT_PUBLIC_GOOGLE_CLIENT_ID:
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID &&
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.trim() !== ''
      ? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      : '649477011186-augsamgganq024tesomp0c8rvgs9c7ua.apps.googleusercontent.com'
} as const;

export type ClientEnv = typeof clientEnv;

export function getClientSocketUrl(): string {
  const socketUrl = clientEnv.NEXT_PUBLIC_SOCKET_URL?.trim();
  if (socketUrl) {
    return socketUrl.replace(/\/+$/, '');
  }

  return 'http://localhost:3001';
}
