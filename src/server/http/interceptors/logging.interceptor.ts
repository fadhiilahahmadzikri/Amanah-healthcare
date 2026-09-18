import 'server-only';
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
  logger.error('http_request_failed', error, {
    method,
    url,
    durationMs,
    correlationId: context.correlationId
  });
}
