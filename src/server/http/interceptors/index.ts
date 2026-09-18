import 'server-only';
import { applyTraceHeaders } from './trace.interceptor';
import { applyAuthHeader } from './auth.interceptor';
import { applyIdempotencyHeader } from './idempotency.interceptor';
import { logOutboundRequest, logOutboundResponse, logOutboundError } from './logging.interceptor';
import { handleHttpErrorResponse } from './error.interceptor';

export interface InterceptorOptions {
  tokenOverride?: string | null;
  idempotencyKey?: string;
}

export function prepareRequestHeaders(
  initHeaders?: HeadersInit,
  options?: InterceptorOptions
): Headers {
  const headers = new Headers(initHeaders);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json, application/problem+json');
  }

  applyTraceHeaders(headers);
  applyAuthHeader(headers, options?.tokenOverride);
  applyIdempotencyHeader(headers, options?.idempotencyKey);

  return headers;
}

export { logOutboundRequest, logOutboundResponse, logOutboundError, handleHttpErrorResponse };
