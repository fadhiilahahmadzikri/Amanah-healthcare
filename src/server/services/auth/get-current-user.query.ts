import 'server-only';
import { headers } from 'next/headers';
import { ok, err, type Result } from '@/core/result/result';
import { AppError } from '@/core/errors/app-error';
import { auth } from '@/lib/auth';
import { authRepository, type IAuthRepository } from '../../repositories/auth/auth.repository';
import {
  getAccessTokenCookie,
  getRefreshTokenCookie,
  setAuthCookies,
  clearAuthCookies
} from '../../auth/token-store';
import type { User } from '../../domain/auth/auth.model';

export async function getCurrentUserQuery(
  repo: IAuthRepository = authRepository
): Promise<Result<User | null, AppError>> {
  const accessToken = await getAccessTokenCookie();

  if (accessToken) {
    const result = await repo.getMe(accessToken);
    if (result.ok) {
      return ok(result.value);
    }
    // If not unauthenticated (e.g. 500 network/db error), return the error
    if (result.error.status !== 401) {
      return err(result.error);
    }
  }

  // Attempt silent refresh if refresh token is available
  const refreshToken = await getRefreshTokenCookie();
  if (!refreshToken) {
    // Fallback: Check if user is authenticated via Better Auth (e.g. Google OAuth)
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (session?.session?.token) {
        const betterAuthResult = await repo.getMe(session.session.token);
        if (betterAuthResult.ok) {
          return ok(betterAuthResult.value);
        }
      }
    } catch {
      // Better Auth session not present
    }

    return ok(null);
  }

  const refreshResult = await repo.refreshToken(refreshToken);
  if (!refreshResult.ok) {
    // Refresh token expired or revoked - clear invalid cookies
    await clearAuthCookies();
    return ok(null);
  }

  const newTokens = refreshResult.value;
  await setAuthCookies({
    accessToken: newTokens.accessToken,
    refreshToken: newTokens.refreshToken,
    expiresAt: newTokens.expiresAt
  });

  const retryMeResult = await repo.getMe(newTokens.accessToken);
  if (retryMeResult.ok) {
    return ok(retryMeResult.value);
  }

  return err(retryMeResult.error);
}
