import 'server-only';
import { ok, err, type Result } from '@/core/result/result';
import { AppError } from '@/core/errors/app-error';
import { authRepository, type IAuthRepository } from '../../repositories/auth/auth.repository';
import { getRefreshTokenCookie, setAuthCookies, clearAuthCookies } from '../../auth/token-store';
import type { AuthTokens } from '../../domain/auth/auth.model';

export async function refreshTokenCommand(
  repo: IAuthRepository = authRepository
): Promise<Result<AuthTokens, AppError>> {
  const refreshToken = await getRefreshTokenCookie();
  if (!refreshToken) {
    return err(AppError.unauthenticated('No refresh token available.'));
  }

  const result = await repo.refreshToken(refreshToken);
  if (!result.ok) {
    await clearAuthCookies();
    return err(result.error);
  }

  const tokens = result.value;
  await setAuthCookies({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: tokens.expiresAt
  });

  return ok(tokens);
}
