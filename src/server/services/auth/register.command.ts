import 'server-only';
import type { Result } from '@/core/result/result';
import type { AppError } from '@/core/errors/app-error';
import { authRepository, type IAuthRepository } from '../../repositories/auth/auth.repository';
import type { AuthRegisterRequest } from '../../contracts/auth/auth.request';

export async function registerCommand(
  payload: AuthRegisterRequest,
  repo: IAuthRepository = authRepository
): Promise<Result<void, AppError>> {
  return repo.register(payload);
}
