import 'server-only';
import { AppError } from '@/core/errors/app-error';
import { logger } from '@/core/logging/logger';
import { getRequestContext } from '../request-context';

export function logOutboundRequest(method: string, url: string, hasBody: boolean): void {
  const context = getRequestContext();
  logger.info('http_request_start', {
    method,
    url,
    hasBody,
    correlationId: context.correlationId
  });
}

export function logOutboundResponse(
  method: string,
  url: string,
  status: number,
  durationMs: number
): void {
  const context = getRequestContext();
  logger.info('http_request_completed', {
    method,
    url,
    status,
    durationMs,
    correlationId: context.correlationId
  });
}

export function logOutboundError(
  method: string,
  url: string,
  error: unknown,
  durationMs: number
): void {
  const context = getRequestContext();
  const logContext = {
    method,
    url,
    durationMs,
    correlationId: context.correlationId
  };

  if (error instanceof AppError && error.expected) {
    if (error.status === 403) {
      logger.warn('http_request_forbidden', {
        ...logContext,
        code: error.code || error.name,
        status: error.status
      });
    } else {
      logger.info('http_request_expected_failure', {
        ...logContext,
        code: error.code || error.name,
        status: error.status,
        message: error.message
      });
    }
  } else {
    logger.error('http_request_failed', error, logContext);
  }
}
