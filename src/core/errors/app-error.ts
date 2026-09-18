import { ErrorCodes, type ErrorCode } from './error-codes';
import type { ProblemDetails, InvalidParam } from './problem-details';

export interface AppErrorInit {
  code: ErrorCode;
  message: string;
  status?: number;
  problemDetails?: ProblemDetails;
  invalidParams?: InvalidParam[];
  retryAfter?: number;
  traceId?: string;
  cause?: unknown;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly problemDetails?: ProblemDetails;
  readonly invalidParams?: InvalidParam[];
  readonly retryAfter?: number;
  readonly traceId?: string;

  constructor(init: AppErrorInit) {
    super(init.message, { cause: init.cause });
    this.name = 'AppError';
    this.code = init.code;
    this.status = init.status ?? 500;
    this.problemDetails = init.problemDetails;
    this.invalidParams = init.invalidParams ?? init.problemDetails?.invalidParams;
    this.retryAfter = init.retryAfter ?? init.problemDetails?.retryAfter;
    this.traceId = init.traceId ?? init.problemDetails?.traceId;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static validation(
    message: string,
    invalidParams?: InvalidParam[],
    details?: ProblemDetails
  ): AppError {
    return new AppError({
      code: ErrorCodes.VALIDATION_FAILED,
      status: 422,
      message,
      invalidParams,
      problemDetails: details
    });
  }

  static unauthenticated(
    message = 'Unauthorized or session expired',
    details?: ProblemDetails
  ): AppError {
    return new AppError({
      code: ErrorCodes.UNAUTHENTICATED,
      status: 401,
      message,
      problemDetails: details
    });
  }

  static forbidden(
    message = 'Forbidden resource or insufficient permissions',
    details?: ProblemDetails
  ): AppError {
    return new AppError({
      code: ErrorCodes.FORBIDDEN,
      status: 403,
      message,
      problemDetails: details
    });
  }

  static notFound(message = 'Resource not found', details?: ProblemDetails): AppError {
    return new AppError({
      code: ErrorCodes.NOT_FOUND,
      status: 404,
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
      message,
      retryAfter,
      problemDetails: details
    });
  }

  static timeout(message = 'Request deadline exceeded'): AppError {
    return new AppError({
      code: ErrorCodes.TIMEOUT,
      status: 408,
      message
    });
  }

  static network(message = 'Network transport failure', cause?: unknown): AppError {
    return new AppError({
      code: ErrorCodes.NETWORK_ERROR,
      status: 503,
      message,
      cause
    });
  }

  static schemaParse(message: string, cause?: unknown): AppError {
    return new AppError({
      code: ErrorCodes.SCHEMA_PARSE_ERROR,
      status: 502,
      message,
      cause
    });
  }

  static internal(message = 'An internal server error occurred', cause?: unknown): AppError {
    return new AppError({
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      status: 500,
      message,
      cause
    });
  }
}
