import { describe, expect, test, mock, spyOn } from 'bun:test';

mock.module('server-only', () => ({}));

import {
  AppError,
  AuthenticationError,
  ForbiddenError,
  TransientServerError,
  UnexpectedAppError
} from '@/core/errors/app-error';
import { handleHttpErrorResponse } from '@/server/http/interceptors/error.interceptor';
import { logOutboundError } from '@/server/http/interceptors/logging.interceptor';
import { logger } from '@/core/logging/logger';
import { AuthRepository } from '@/server/repositories/auth/auth.repository';
import { getCurrentUserQuery } from '@/server/services/auth/get-current-user.query';
import { authLoader } from '@/server/loaders/auth.loader';
import { ok, err } from '@/core/result/result';
import type { IAuthRepository } from '@/server/repositories/auth/auth.repository.port';

describe('Auth Error Architecture & Taxonomy', () => {
  describe('1. Error Taxonomy', () => {
    test('AuthenticationError sets expected=true and httpStatus=401', () => {
      const error = new AuthenticationError('Token invalid');
      expect(error.expected).toBe(true);
      expect(error.httpStatus).toBe(401);
      expect(error.status).toBe(401);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(AuthenticationError);
    });

    test('ForbiddenError sets expected=true and httpStatus=403', () => {
      const error = new ForbiddenError('Akses ditolak');
      expect(error.expected).toBe(true);
      expect(error.httpStatus).toBe(403);
      expect(error.status).toBe(403);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('TransientServerError sets expected=false and status=503', () => {
      const error = new TransientServerError('Network failed', 503);
      expect(error.expected).toBe(false);
      expect(error.httpStatus).toBe(503);
      expect(error.status).toBe(503);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(TransientServerError);
    });

    test('UnexpectedAppError sets expected=false and status=500', () => {
      const error = new UnexpectedAppError('Bug internal', 500);
      expect(error.expected).toBe(false);
      expect(error.httpStatus).toBe(500);
      expect(error.status).toBe(500);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(UnexpectedAppError);
    });

    test('AppError static factory methods return typed instances', () => {
      const unauth = AppError.unauthenticated();
      expect(unauth).toBeInstanceOf(AuthenticationError);
      expect(unauth.expected).toBe(true);

      const forbidden = AppError.forbidden();
      expect(forbidden).toBeInstanceOf(ForbiddenError);
      expect(forbidden.expected).toBe(true);

      const network = AppError.network('Failed');
      expect(network).toBeInstanceOf(TransientServerError);
      expect(network.expected).toBe(false);

      const internal = AppError.internal('Crash');
      expect(internal).toBeInstanceOf(UnexpectedAppError);
      expect(internal.expected).toBe(false);
    });
  });

  describe('2. HTTP Error Interceptor Classification', () => {
    test('Status 401 throws AuthenticationError', async () => {
      const res = new Response(
        JSON.stringify({ message: 'Sesi autentikasi tidak valid atau token tidak disertakan' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );

      let thrown: unknown;
      try {
        await handleHttpErrorResponse(res, 'GET', '/api/v1/auth/me');
      } catch (e) {
        thrown = e;
      }

      expect(thrown).toBeInstanceOf(AuthenticationError);
      expect((thrown as AuthenticationError).expected).toBe(true);
      expect((thrown as AuthenticationError).httpStatus).toBe(401);
    });

    test('Status 403 throws ForbiddenError', async () => {
      const res = new Response(JSON.stringify({ message: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });

      let thrown: unknown;
      try {
        await handleHttpErrorResponse(res, 'GET', '/api/v1/admin');
      } catch (e) {
        thrown = e;
      }

      expect(thrown).toBeInstanceOf(ForbiddenError);
      expect((thrown as ForbiddenError).expected).toBe(true);
      expect((thrown as ForbiddenError).httpStatus).toBe(403);
    });

    test('Status 500 / 502 / 503 throws TransientServerError', async () => {
      const res = new Response(JSON.stringify({ message: 'Gateway Timeout' }), {
        status: 504,
        headers: { 'Content-Type': 'application/json' }
      });

      let thrown: unknown;
      try {
        await handleHttpErrorResponse(res, 'GET', '/api/v1/patients');
      } catch (e) {
        thrown = e;
      }

      expect(thrown).toBeInstanceOf(TransientServerError);
      expect((thrown as TransientServerError).expected).toBe(false);
      expect((thrown as TransientServerError).httpStatus).toBe(504);
    });
  });

  describe('3. Logging Interceptor Level Classification', () => {
    test('401 AuthenticationError logs at info level and NEVER at error level', () => {
      const infoSpy = spyOn(logger, 'info');
      const errorSpy = spyOn(logger, 'error');

      const authErr = new AuthenticationError('Sesi tidak valid');
      logOutboundError('GET', '/api/v1/auth/me', authErr, 120);

      expect(infoSpy).toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();

      infoSpy.mockRestore();
      errorSpy.mockRestore();
    });

    test('403 ForbiddenError logs at warn level and NEVER at error level', () => {
      const warnSpy = spyOn(logger, 'warn');
      const errorSpy = spyOn(logger, 'error');

      const forbiddenErr = new ForbiddenError('Akses ditolak');
      logOutboundError('GET', '/api/v1/secret', forbiddenErr, 100);

      expect(warnSpy).toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });

    test('TransientServerError (503/network) logs at error level', () => {
      const errorSpy = spyOn(logger, 'error');

      const transientErr = new TransientServerError('Network offline', 503);
      logOutboundError('GET', '/api/v1/auth/me', transientErr, 200);

      expect(errorSpy).toHaveBeenCalled();

      errorSpy.mockRestore();
    });
  });

  describe('4. AuthRepository Converts 401 Exception to Value null', () => {
    test('getMe returns ok(null) when AuthenticationError occurs', async () => {
      const { httpClient } = await import('@/server/http/http-client');
      const spy = spyOn(httpClient, 'request').mockImplementation(async () => {
        throw new AuthenticationError('Token invalid');
      });

      const repo = new AuthRepository();
      const res = await repo.getMe('invalid-token');
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value).toBeNull();
      }

      spy.mockRestore();
    });

    test('getMe propagates TransientServerError when network failure occurs', async () => {
      const { httpClient } = await import('@/server/http/http-client');
      const spy = spyOn(httpClient, 'request').mockImplementation(async () => {
        throw new TransientServerError('Server offline', 503);
      });

      const repo = new AuthRepository();
      const res = await repo.getMe('valid-token');
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBeInstanceOf(TransientServerError);
        expect(res.error.expected).toBe(false);
      }

      spy.mockRestore();
    });
  });

  describe('5. getCurrentUserQuery & authLoader Handling', () => {
    test('getCurrentUserQuery returns ok(null) when user is unauthenticated', async () => {
      const mockRepo: IAuthRepository = {
        loginWithEmail: mock(),
        register: mock(),
        getMe: mock(async () => ok(null)),
        refreshToken: mock(async () => ok(null)),
        forgotPassword: mock(),
        resetPassword: mock(),
        logout: mock(),
        deleteAccount: mock()
      };

      const tokenStore = await import('@/server/auth/token-store');
      const getAccessSpy = spyOn(tokenStore, 'getAccessTokenCookie').mockImplementation(async () => 'expired-token');
      const getRefreshSpy = spyOn(tokenStore, 'getRefreshTokenCookie').mockImplementation(async () => null);

      const result = await getCurrentUserQuery(mockRepo);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeNull();
      }

      getAccessSpy.mockRestore();
      getRefreshSpy.mockRestore();
    });

    test('getCurrentUserQuery returns err(TransientServerError) when backend is offline', async () => {
      const mockRepo: IAuthRepository = {
        loginWithEmail: mock(),
        register: mock(),
        getMe: mock(async () => err(new TransientServerError('Server offline', 503))),
        refreshToken: mock(async () => ok(null)),
        forgotPassword: mock(),
        resetPassword: mock(),
        logout: mock(),
        deleteAccount: mock()
      };

      const tokenStore = await import('@/server/auth/token-store');
      const getAccessSpy = spyOn(tokenStore, 'getAccessTokenCookie').mockImplementation(async () => 'token');

      const result = await getCurrentUserQuery(mockRepo);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(TransientServerError);
        expect(result.error.expected).toBe(false);
      }

      getAccessSpy.mockRestore();
    });

    test('authLoader redirects to /auth/sign-in when user is null', async () => {
      const nextNavigation = await import('next/navigation');
      let redirectedTo = '';
      const redirectSpy = spyOn(nextNavigation, 'redirect').mockImplementation((path: string) => {
        redirectedTo = path;
        const e = new Error('NEXT_REDIRECT');
        (e as unknown as { digest: string }).digest = `NEXT_REDIRECT;replace;${path}`;
        throw e;
      });

      const queryModule = await import('@/server/services/auth/get-current-user.query');
      const querySpy = spyOn(queryModule, 'getCurrentUserQuery').mockImplementation(async () => ok(null));

      let caughtErr: unknown;
      try {
        await authLoader();
      } catch (err) {
        caughtErr = err;
      }

      expect(redirectedTo).toBe('/auth/sign-in');
      expect((caughtErr as { digest?: string })?.digest).toContain('NEXT_REDIRECT');

      redirectSpy.mockRestore();
      querySpy.mockRestore();
    });
  });
});
