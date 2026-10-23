export const clientEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? '',
  NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? '',
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL ?? ''
} as const;

export type ClientEnv = typeof clientEnv;

export function getClientSocketUrl(): string {
  return (clientEnv.NEXT_PUBLIC_SOCKET_URL || '').replace(/\/+$/, '');
}
