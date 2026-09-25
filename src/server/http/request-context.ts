import 'server-only';
import { AsyncLocalStorage } from 'node:async_hooks';
import { generateCorrelationId } from '@/core/telemetry/tracer';

export interface RequestContext {
  readonly correlationId: string;
  readonly requestId?: string;
  readonly authToken?: string;
  readonly tenantId?: string;
  readonly clientIp?: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext {
  return (
    storage.getStore() ?? {
      correlationId: generateCorrelationId(),
      requestId: `req_${generateCorrelationId().replace(/-/g, '').slice(0, 12)}`
    }
  );
}

export function runWithContext<T>(context: RequestContext, fn: () => T): T {
  return storage.run(context, fn);
}
