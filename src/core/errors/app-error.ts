import { ErrorCodes, type ErrorCode } from './error-codes';
import type { ProblemDetails, InvalidParam } from './problem-details';

export interface AppErrorInit {
  code: ErrorCode;
  message: string;
  status?: number;
  expected?: boolean;
  problemDetails?: ProblemDetails;
  invalidParams?: InvalidParam[];
  retryAfter?: number;
  traceId?: string;
  cause?: unknown;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly expected: boolean;
  readonly problemDetails?: ProblemDetails;
  readonly invalidParams?: InvalidParam[];
  readonly retryAfter?: number;
  readonly traceId?: string;

  constructor(init: AppErrorInit) {
    super(init.message, { cause: init.cause });
    this.name = 'AppError';
    this.code = init.code;
    this.status = init.status ?? 500;
    this.expected = init.expected ?? (this.status >= 400 && this.status < 500 && this.status !== 408);
    this.problemDetails = init.problemDetails;
    this.invalidParams = init.invalidParams ?? init.problemDetails?.invalidParams;
    this.retryAfter = init.retryAfter ?? init.problemDetails?.retryAfter;
    this.traceId = init.traceId ?? init.problemDetails?.traceId;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  get httpStatus(): number {
    return this.status;
  }

  static validation(
    message: string,
    invalidParams?: InvalidParam[],
    details?: ProblemDetails
  ): AppError {
    return new AppError({
      code: ErrorCodes.VALIDATION_FAILED,
      status: 422,
      expected: true,
      message,
      invalidParams,
      problemDetails: details
    });
  }

  static unauthenticated(
    message = 'Sesi autentikasi tidak valid atau token tidak disertakan',
    details?: ProblemDetails
  ): AuthenticationError {
    return new AuthenticationError(message, details);
  }

  static forbidden(
    message = 'Forbidden resource or insufficient permissions',
    details?: ProblemDetails
  ): ForbiddenError {
    return new ForbiddenError(message, details);
  }

  static notFound(message = 'Resource not found', details?: ProblemDetails): AppError {
    return new AppError({
      code: ErrorCodes.NOT_FOUND,
      status: 404,
      expected: true,
      message,
      problemDetails: details
    });
  }

  static rateLimit(
    message = 'Rate limit exceeded',
    retryAfter?: number,
    details?: ProblemDetails
  ): AppError {
    return new AppError({
      code: ErrorCodes.RATE_LIMIT_EXCEEDED,
      status: 429,
      expected: true,
      message,
      retryAfter,
      problemDetails: details
    });
  }

  static timeout(message = 'Request deadline exceeded'): AppError {
    return new AppError({
      code: ErrorCodes.TIMEOUT,
      status: 408,
      expected: false,
      message
    });
  }

  static network(message = 'Network transport failure', cause?: unknown): TransientServerError {
    return new TransientServerError(message, 503, undefined, cause);
  }

  static schemaParse(message: string, cause?: unknown): AppError {
    return new AppError({
      code: ErrorCodes.SCHEMA_PARSE_ERROR,
      status: 502,
      expected: false,
      message,
      cause
    });
  }

  static internal(message = 'An internal server error occurred', cause?: unknown): UnexpectedAppError {
    return new UnexpectedAppError(message, 500, undefined, cause);
  }
}

/**
 * Sesi tidak ada / invalid / expired -> EXPECTED, bukan bug aplikasi.
 */
export class AuthenticationError extends AppError {
  override readonly expected = true;
  override readonly status = 401;

  constructor(
    message = 'Sesi autentikasi tidak valid atau token tidak disertakan',
    details?: ProblemDetails,
    cause?: unknown
  ) {
    super({
      code: ErrorCodes.UNAUTHENTICATED,
      status: 401,
      expected: true,
      message,
      problemDetails: details,
      cause
    });
    this.name = 'AuthenticationError';
  }
}

/**
 * Sesi valid tapi tidak punya hak akses -> EXPECTED, tapi beda penanganan UI.
 */
export class ForbiddenError extends AppError {
  override readonly expected = true;
  override readonly status = 403;

  constructor(
    message = 'Akses ditolak atau izin tidak mencukupi',
    details?: ProblemDetails,
    cause?: unknown
  ) {
    super({
      code: ErrorCodes.FORBIDDEN,
      status: 403,
      expected: true,
      message,
      problemDetails: details,
      cause
    });
    this.name = 'ForbiddenError';
  }
}

/**
 * Backend mati / timeout / network failure / 5xx -> TIDAK expected, perlu alert / retry.
 */
export class TransientServerError extends AppError {
  override readonly expected = false;

  constructor(
    message = 'Server sementara tidak dapat dihubungi atau sedang mengalami gangguan',
    status = 503,
    details?: ProblemDetails,
    cause?: unknown
  ) {
    super({
      code: ErrorCodes.NETWORK_ERROR,
      status: status || 503,
      expected: false,
      message,
      problemDetails: details,
      cause
    });
    this.name = 'TransientServerError';
  }
}

/**
 * Bug internal tak terduga / crash internal
 */
export class UnexpectedAppError extends AppError {
  override readonly expected = false;

  constructor(
    message = 'Terjadi kesalahan sistem yang tidak terduga',
    status = 500,
    details?: ProblemDetails,
    cause?: unknown
  ) {
    super({
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      status: status || 500,
      expected: false,
      message,
      problemDetails: details,
      cause
    });
    this.name = 'UnexpectedAppError';
  }
}
