import 'server-only';
import { ok, type Result } from '@/core/result/result';
import type { AppError } from '@/core/errors/app-error';
import { authRepository, type IAuthRepository } from '../../repositories/auth/auth.repository';
import { getAccessTokenCookie, clearAuthCookies } from '../../auth/token-store';

export async function logoutCommand(
  repo: IAuthRepository = authRepository
): Promise<Result<void, AppError>> {
  const token = await getAccessTokenCookie();
  if (token) {
    // Best-effort server notification
    await repo.logout(token);
  }
  // Clear client-side httpOnly cookies
  await clearAuthCookies();
  return ok(undefined);
}
