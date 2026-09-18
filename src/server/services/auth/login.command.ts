import 'server-only';
import { ok, err, type Result } from '@/core/result/result';
import type { AppError } from '@/core/errors/app-error';
import { authRepository, type IAuthRepository } from '../../repositories/auth/auth.repository';
import { setAuthCookies } from '../../auth/token-store';
import type { AuthEmailLoginRequest } from '../../contracts/auth/auth.request';
import type { User } from '../../domain/auth/auth.model';

export async function loginCommand(
  payload: AuthEmailLoginRequest,
  repo: IAuthRepository = authRepository
): Promise<Result<User, AppError>> {
  const result = await repo.loginWithEmail(payload);
  if (!result.ok) {
    return err(result.error);
  }

  const session = result.value;
  await setAuthCookies({
    accessToken: session.tokens.accessToken,
    refreshToken: session.tokens.refreshToken,
    expiresAt: session.tokens.expiresAt
  });

  return ok(session.user);
}
