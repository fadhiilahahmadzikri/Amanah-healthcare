import 'server-only';
import { ok, err, type Result } from '@/core/result/result';
import { AppError } from '@/core/errors/app-error';
import { httpClient } from '../../http/http-client';
import { paths } from '../../api/paths';
import {
  loginResponseDtoSchema,
  authenticatedUserDtoSchema,
  refreshResponseDtoSchema,
  noContentDtoSchema
} from '../../contracts/auth/auth.dto';
import type {
  AuthEmailLoginRequest,
  AuthForgotPasswordRequest,
  AuthRegisterRequest,
  AuthResetPasswordRequest
} from '../../contracts/auth/auth.request';
import { toSessionDomain, toUserDomain, toRefreshTokensDomain } from '../../mappers/auth.mapper';
import type { User, AuthSession, AuthTokens } from '../../domain/auth/auth.model';
import type { IAuthRepository } from './auth.repository.port';

export class AuthRepository implements IAuthRepository {
  async loginWithEmail(payload: AuthEmailLoginRequest): Promise<Result<AuthSession, AppError>> {
    try {
      const dto = await httpClient.request(paths.auth.login(), loginResponseDtoSchema, {
        method: 'POST',
        body: payload,
        cache: 'no-store'
      });
      const session = toSessionDomain(dto);
      return ok(session);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return err(error);
      }
      return err(AppError.internal('Unexpected error during email login', error));
    }
  }

  async register(payload: AuthRegisterRequest): Promise<Result<void, AppError>> {
    try {
      await httpClient.request(paths.auth.register(), noContentDtoSchema, {
        method: 'POST',
        body: payload,
        cache: 'no-store'
      });
      return ok(undefined);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return err(error);
      }
      return err(AppError.internal('Unexpected error during user registration', error));
    }
  }

  async getMe(accessToken: string): Promise<Result<User, AppError>> {
    try {
      const dto = await httpClient.request(paths.auth.me(), authenticatedUserDtoSchema, {
        method: 'GET',
        tokenOverride: accessToken,
        cache: 'no-store'
      });
      const user = toUserDomain(dto);
      return ok(user);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return err(error);
      }
      return err(AppError.internal('Unexpected error fetching active profile', error));
    }
  }

  async refreshToken(refreshToken: string): Promise<Result<AuthTokens, AppError>> {
    try {
      const dto = await httpClient.request(paths.auth.refresh(), refreshResponseDtoSchema, {
        method: 'POST',
        tokenOverride: refreshToken,
        cache: 'no-store'
      });
      const tokens = toRefreshTokensDomain(dto);
      return ok(tokens);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return err(error);
      }
      return err(AppError.internal('Unexpected error refreshing authentication token', error));
    }
  }

  async forgotPassword(payload: AuthForgotPasswordRequest): Promise<Result<void, AppError>> {
    try {
      await httpClient.request(paths.auth.forgotPassword(), noContentDtoSchema, {
        method: 'POST',
        body: payload,
        cache: 'no-store'
      });
      return ok(undefined);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return err(error);
      }
      return err(AppError.internal('Unexpected error sending forgot password request', error));
    }
  }

  async resetPassword(payload: AuthResetPasswordRequest): Promise<Result<void, AppError>> {
    try {
      await httpClient.request(paths.auth.resetPassword(), noContentDtoSchema, {
        method: 'POST',
        body: payload,
        cache: 'no-store'
      });
      return ok(undefined);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return err(error);
      }
      return err(AppError.internal('Unexpected error executing reset password request', error));
    }
  }

  async logout(accessToken: string): Promise<Result<void, AppError>> {
    try {
      await httpClient.request(paths.auth.logout(), noContentDtoSchema, {
        method: 'POST',
        tokenOverride: accessToken,
        cache: 'no-store'
      });
      return ok(undefined);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return err(error);
      }
      return err(AppError.internal('Unexpected error executing logout request', error));
    }
  }
}

export { type IAuthRepository } from './auth.repository.port';
export const authRepository: IAuthRepository = new AuthRepository();
