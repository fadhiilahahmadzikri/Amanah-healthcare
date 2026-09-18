import 'server-only';
import type { Result } from '@/core/result/result';
import type { AppError } from '@/core/errors/app-error';
import type {
  AuthEmailLoginRequest,
  AuthForgotPasswordRequest,
  AuthRegisterRequest,
  AuthResetPasswordRequest
} from '../../contracts/auth/auth.request';
import type { User, AuthSession, AuthTokens } from '../../domain/auth/auth.model';

export interface IAuthRepository {
  loginWithEmail(payload: AuthEmailLoginRequest): Promise<Result<AuthSession, AppError>>;
  register(payload: AuthRegisterRequest): Promise<Result<void, AppError>>;
  getMe(accessToken: string): Promise<Result<User, AppError>>;
  refreshToken(refreshToken: string): Promise<Result<AuthTokens, AppError>>;
  forgotPassword(payload: AuthForgotPasswordRequest): Promise<Result<void, AppError>>;
  resetPassword(payload: AuthResetPasswordRequest): Promise<Result<void, AppError>>;
  logout(accessToken: string): Promise<Result<void, AppError>>;
}
