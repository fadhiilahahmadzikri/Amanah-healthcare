import 'server-only';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { ok, err, type Result } from '@/core/result/result';
import { AppError } from '@/core/errors/app-error';
import { auth } from '@/lib/auth';
import { authRepository, type IAuthRepository } from '../../repositories/auth/auth.repository';
import { getAccessTokenCookie, clearAuthCookies } from '../../auth/token-store';
import { invalidateTag } from '../../cache/revalidate';
import type { DeleteAccountResponseDto } from '../../contracts/auth/auth.dto';

/**
 * Executes Systemic Self-Account Deletion (Account Purge).
 * Supports dual-engine authentication:
 * - Primary: Canonical JWT cookie (accessToken)
 * - Fallback: Better Auth session token (Google OAuth)
 *
 * Performs hard-purge on backend, cleans local auth cookies,
 * and clears server-side cached tags.
 */
export async function deleteAccountCommand(
  repo: IAuthRepository = authRepository
): Promise<Result<DeleteAccountResponseDto, AppError>> {
  let token = await getAccessTokenCookie();

  if (!token) {
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (session?.session?.token) {
        token = session.session.token;
      }
    } catch {
      // Better Auth session not present or failed to parse
    }
  }

  if (!token) {
    return err(
      AppError.unauthenticated(
        'Sesi autentikasi tidak valid atau token tidak disertakan. Silakan masuk kembali.'
      )
    );
  }

  const result = await repo.deleteAccount(token);

  if (!result.ok) {
    return err(result.error);
  }

  // Clear server-side HTTP-only cookies
  try {
    await clearAuthCookies();
  } catch {
    // Non-critical cookie clearing error
  }

  // Invalidate cache
  try {
    invalidateTag('auth:me');
    revalidatePath('/', 'layout');
  } catch {
    // Non-critical cache invalidation error
  }

  return ok(result.value);
}
