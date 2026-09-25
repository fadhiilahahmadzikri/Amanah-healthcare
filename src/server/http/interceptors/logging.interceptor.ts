import 'server-only';
import { AppError } from '@/core/errors/app-error';
import { logger } from '@/core/logging/logger';
import { getRequestContext } from '../request-context';
import {
  formatRequestBox,
  formatResponseBox,
  formatErrorBox
} from '@/core/observability/formatters/box-logger.formatter';
import { sanitizePayload } from '@/core/observability/sanitizers/payload.sanitizer';

export function logOutboundRequest(
  method: string,
  url: string,
  bodyOrHasBody?: unknown,
  _headers?: unknown
): void {
  const context = getRequestContext();
  const hasBody = typeof bodyOrHasBody === 'boolean' ? bodyOrHasBody : Boolean(bodyOrHasBody);
  const actualBody =
    typeof bodyOrHasBody !== 'boolean' ? sanitizePayload(bodyOrHasBody) : undefined;

  if (process.env.NODE_ENV !== 'production' && typeof process !== 'undefined' && process.stdout) {
    process.stdout.write(
      formatRequestBox({
        event: 'http.request',
        requestId: context.requestId || context.correlationId,
        correlationId: context.correlationId,
        timestamp: new Date().toISOString(),
        http: {
          method,
          path: url
        },
        client: {},
        ip: { ip: context.clientIp || '127.0.0.1', source: 'socket', isTrustedProxy: false },
        body: actualBody
      }) + '\n'
    );
  } else {
    logger.info('http_request_start', {
      method,
      url,
      hasBody,
      correlationId: context.correlationId
    });
  }
}

export function logOutboundResponse(
  method: string,
  url: string,
  status: number,
  durationMs: number,
  responseBody?: unknown,
  _headers?: unknown
): void {
  const context = getRequestContext();
  const sanitizedBody = responseBody !== undefined ? sanitizePayload(responseBody) : undefined;

  if (process.env.NODE_ENV !== 'production' && typeof process !== 'undefined' && process.stdout) {
    process.stdout.write(
      formatResponseBox({
        event: 'http.response',
        requestId: context.requestId || context.correlationId,
        correlationId: context.correlationId,
        timestamp: new Date().toISOString(),
        http: {
          method,
          path: url,
          statusCode: status,
          durationMs
        },
        client: {},
        ip: { ip: context.clientIp || '127.0.0.1', source: 'socket', isTrustedProxy: false },
        response: sanitizedBody
      }) + '\n'
    );
  } else {
    logger.info('http_request_completed', {
      method,
      url,
      status,
      durationMs,
      correlationId: context.correlationId
    });
  }
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

  const status = error instanceof AppError ? error.status : 500;
  const message = error instanceof Error ? error.message : String(error);
  const name = error instanceof Error ? error.name : 'OutboundHttpError';

  if (process.env.NODE_ENV !== 'production' && typeof process !== 'undefined' && process.stderr) {
    process.stderr.write(
      formatErrorBox({
        event: 'http.error',
        requestId: context.requestId || context.correlationId,
        correlationId: context.correlationId,
        timestamp: new Date().toISOString(),
        http: {
          method,
          path: url,
          statusCode: status,
          durationMs
        },
        client: {},
        ip: { ip: context.clientIp || '127.0.0.1', source: 'socket', isTrustedProxy: false },
        error: {
          name,
          message,
          statusCode: status,
          stack: error instanceof Error ? error.stack : undefined
        }
      }) + '\n'
    );
  }

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
