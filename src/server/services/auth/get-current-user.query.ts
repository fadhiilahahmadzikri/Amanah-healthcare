import 'server-only';
import { headers } from 'next/headers';
import { ok, err, type Result } from '@/core/result/result';
import { AppError } from '@/core/errors/app-error';
import { auth } from '@/lib/auth';
import { authRepository, type IAuthRepository } from '../../repositories/auth/auth.repository';
import { getAccessTokenCookie } from '../../auth/token-store';
import type { User } from '../../domain/auth/auth.model';

export async function getCurrentUserQuery(
  repo: IAuthRepository = authRepository
): Promise<Result<User | null, AppError>> {
  const accessToken = await getAccessTokenCookie();

  if (accessToken) {
    const result = await repo.getMe(accessToken);
    if (result.ok) {
      if (result.value !== null) {
        return ok(result.value);
      }
      // Access token is expired or invalid (401).
      // Render must be pure: do not attempt side-effects or cookie mutations during RSC render.
      // Return ok(null) so the authLoader boundary immediately redirects to /auth/sign-in.
      return ok(null);
    } else {
      // If error is not unauthenticated (e.g. 500 network/db error), return the error
      return err(result.error);
    }
  }

  // Fallback: Check if user is authenticated via Better Auth (e.g. Google OAuth)
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.session?.token) {
      const betterAuthResult = await repo.getMe(session.session.token);
      if (betterAuthResult.ok && betterAuthResult.value) {
        return ok(betterAuthResult.value);
      }
    }
  } catch {
    // Better Auth session not present
  }

  return ok(null);
}
