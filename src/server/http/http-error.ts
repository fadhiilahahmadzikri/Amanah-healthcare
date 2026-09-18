import 'server-only';
import { AppError } from '@/core/errors/app-error';
import { ErrorCodes } from '@/core/errors/error-codes';
import type { ProblemDetails } from '@/core/errors/problem-details';

export class HttpTransportError extends AppError {
  readonly url: string;
  readonly method: string;

  constructor(init: {
    message: string;
    url: string;
    method: string;
    status?: number;
    problemDetails?: ProblemDetails;
    cause?: unknown;
  }) {
    super({
      code:
        init.status === 401
          ? ErrorCodes.UNAUTHENTICATED
          : init.status === 403
            ? ErrorCodes.FORBIDDEN
            : init.status === 404
              ? ErrorCodes.NOT_FOUND
              : init.status === 422
                ? ErrorCodes.VALIDATION_FAILED
                : init.status === 429
                  ? ErrorCodes.RATE_LIMIT_EXCEEDED
                  : ErrorCodes.NETWORK_ERROR,
      status: init.status ?? 500,
      message: init.message,
      problemDetails: init.problemDetails,
      cause: init.cause
    });
    this.name = 'HttpTransportError';
    this.url = init.url;
    this.method = init.method;
  }
}
