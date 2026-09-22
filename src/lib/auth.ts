import 'server-only';
import { serverEnv } from '@/core/config/env.server';
import { logger } from '@/core/logging/logger';

export interface BetterAuthUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: string | null;
  emailVerified?: boolean;
  banned?: boolean | null;
  [key: string]: unknown;
}

export interface BetterAuthSession {
  session: {
    id: string;
    userId: string;
    expiresAt: Date | string;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    [key: string]: unknown;
  };
  user: BetterAuthUser;
}

export async function getServerSession(options?: {
  headers?: Headers;
}): Promise<BetterAuthSession | null> {
  try {
    const baseUrl = (
      serverEnv.BETTER_AUTH_URL ||
      serverEnv.API_BASE_URL ||
      'http://localhost:3001'
    ).replace(/\/+$/, '');

    const cookieHeader = options?.headers?.get('cookie') ?? '';

    // If no cookies at all or no session token, skip network request
    if (
      !cookieHeader ||
      (!cookieHeader.includes('better-auth') && !cookieHeader.includes('session'))
    ) {
      return null;
    }

    const res = await fetch(`${baseUrl}/api/auth/get-session`, {
      headers: {
        cookie: cookieHeader
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (!data || !data.user) {
      return null;
    }

    return data as BetterAuthSession;
  } catch (err) {
    logger.info('better_auth_session_fetch_failed', {
      message: err instanceof Error ? err.message : String(err)
    });
    return null;
  }
}

export const auth = {
  api: {
    getSession: getServerSession,
    userHasPermission: async (_options?: {
      body?: {
        userId?: string;
        role?: string;
        permissions?: Record<string, string[]>;
      };
    }): Promise<{ success: boolean }> => {
      return { success: true };
    }
  }
};
