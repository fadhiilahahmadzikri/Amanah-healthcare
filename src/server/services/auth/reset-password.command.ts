import 'server-only';
import type { Result } from '@/core/result/result';
import type { AppError } from '@/core/errors/app-error';
import { authRepository, type IAuthRepository } from '../../repositories/auth/auth.repository';
import type { AuthResetPasswordRequest } from '../../contracts/auth/auth.request';

export async function resetPasswordCommand(
  payload: AuthResetPasswordRequest,
  repo: IAuthRepository = authRepository
): Promise<Result<void, AppError>> {
  return repo.resetPassword(payload);
}
