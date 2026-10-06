import 'server-only';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getAccessTokenCookie } from '@/server/auth/token-store';

export async function resolveActiveToken(): Promise<string | null> {
  let token = await getAccessTokenCookie();

  if (!token) {
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (session?.session?.token) {
        token = session.session.token;
      }
    } catch {}
  }

  return token;
}
