import 'server-only';
import { TRACE_HEADERS } from '@/core/telemetry/tracer';
import { getRequestContext } from '../request-context';

export function applyTraceHeaders(headers: Headers): void {
  const context = getRequestContext();
  if (!headers.has(TRACE_HEADERS.CORRELATION_ID)) {
    headers.set(TRACE_HEADERS.CORRELATION_ID, context.correlationId);
  }
  if (!headers.has(TRACE_HEADERS.REQUEST_ID)) {
    headers.set(TRACE_HEADERS.REQUEST_ID, context.correlationId);
  }
}
