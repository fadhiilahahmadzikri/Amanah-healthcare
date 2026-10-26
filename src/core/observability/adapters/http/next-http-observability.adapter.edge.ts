/**
 * Edge runtime adapter — uses only Web Standard APIs (console.*).
 *
 * This file must NEVER import Pino, process.stdout, process.stderr, or any
 * other Node.js-only API. It is the adapter wired up inside the `edge` branch
 * of instrumentation.ts so the bundler never includes Node-specific modules in
 * the Edge runtime bundle.
 *
 * console.log / console.error are available on every runtime including Edge.
 */
import type { ILogger } from '../../ports/logger.port';
import type {
  HttpRequestEvent,
  HttpResponseEvent,
  HttpErrorEvent
} from '../../models/http-event.types';
import {
  BaseHttpObservabilityAdapter,
  type NextHttpObservabilityConfig
} from './next-http-observability.adapter.base';

export type { NextHttpObservabilityConfig };

/**
 * Minimal ILogger backed by console.* — safe for Edge runtime.
 * Used as a fallback when Pino (Node-only) is unavailable.
 */
const consoleLogger: ILogger = {
  level: 'info',
  trace: (msg, ctx) => console.debug('[TRACE]', msg, ctx ?? ''),
  debug: (msg, ctx) => console.debug('[DEBUG]', msg, ctx ?? ''),
  info: (msg, ctx) => console.log('[INFO]', msg, ctx ?? ''),
  warn: (msg, ctx) => console.warn('[WARN]', msg, ctx ?? ''),
  error: (msg, _err, ctx) => console.error('[ERROR]', msg, ctx ?? ''),
  fatal: (msg, _err, ctx) => console.error('[FATAL]', msg, ctx ?? ''),
  child: () => consoleLogger
};

export class EdgeHttpObservabilityAdapter extends BaseHttpObservabilityAdapter {
  constructor(logger: ILogger = consoleLogger, config: NextHttpObservabilityConfig = {}) {
    super(logger, config);
  }

  logRequestEvent(event: HttpRequestEvent): void {
    const isHealthEndpoint = event.http.path.startsWith('/health');

    if (isHealthEndpoint) {
      this.logger.debug('HTTP REQUEST (health)', event as unknown as Record<string, unknown>);
    } else {
      this.logger.info('HTTP REQUEST', event as unknown as Record<string, unknown>);
    }
  }

  logResponseEvent(event: HttpResponseEvent): void {
    const status = event.http.statusCode ?? 200;
    const isHealthEndpoint = event.http.path.startsWith('/health');

    if (isHealthEndpoint) {
      this.logger.debug('HTTP RESPONSE (health)', event as unknown as Record<string, unknown>);
    } else if (status >= 500) {
      this.logger.error(
        'HTTP RESPONSE ERROR',
        undefined,
        event as unknown as Record<string, unknown>
      );
    } else if (status >= 400) {
      this.logger.warn('HTTP RESPONSE CLIENT WARNING', event as unknown as Record<string, unknown>);
    } else {
      this.logger.info('HTTP RESPONSE', event as unknown as Record<string, unknown>);
    }
  }

  logErrorEvent(event: HttpErrorEvent): void {
    const status = event.http.statusCode ?? 500;
    if (status >= 500) {
      this.logger.error('HTTP EXCEPTION', undefined, event as unknown as Record<string, unknown>);
    } else {
      this.logger.warn('HTTP ERROR', event as unknown as Record<string, unknown>);
    }
  }
}

export const defaultHttpObservability = new EdgeHttpObservabilityAdapter();
