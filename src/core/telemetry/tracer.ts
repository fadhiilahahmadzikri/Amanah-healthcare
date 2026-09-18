import { v4 as uuidv4 } from 'uuid';

export const TRACE_HEADERS = {
  CORRELATION_ID: 'x-correlation-id',
  REQUEST_ID: 'x-request-id'
} as const;

export function generateCorrelationId(): string {
  return uuidv4();
}

export interface TraceContext {
  correlationId: string;
  traceParent?: string;
}
