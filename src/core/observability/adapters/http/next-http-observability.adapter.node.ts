/**
 * Node.js runtime adapter — safe to use process.stdout / process.stderr / Pino.
 *
 * This file is ONLY reachable through the `nodejs` branch of instrumentation.ts.
 * It must never be imported unconditionally, otherwise Next.js will pull it into
 * the Edge bundle and flag every process.stdout reference as an error.
 */
import type { ILogger } from '../../ports/logger.port';
import type {
  HttpRequestEvent,
  HttpResponseEvent,
  HttpErrorEvent
} from '../../models/http-event.types';
import { ssotLogger } from '../pino/pino-logger.adapter';
import {
  formatRequestBox,
  formatResponseBox,
  formatErrorBox
} from '../../formatters/box-logger.formatter';
import {
  BaseHttpObservabilityAdapter,
  type NextHttpObservabilityConfig
} from './next-http-observability.adapter.base';

export type { NextHttpObservabilityConfig };

export class NodeHttpObservabilityAdapter extends BaseHttpObservabilityAdapter {
  constructor(logger: ILogger = ssotLogger, config: NextHttpObservabilityConfig = {}) {
    super(logger, config);
  }

  logRequestEvent(event: HttpRequestEvent): void {
    const isHealthEndpoint =
      event.http.path === '/health' ||
      event.http.path === '/healthz' ||
      event.http.path.startsWith('/api/health');

    if (process.env.NODE_ENV !== 'production') {
      if (!isHealthEndpoint) {
        process.stdout.write(formatRequestBox(event) + '\n');
      }
    } else {
      if (isHealthEndpoint) {
        this.logger.debug('HTTP REQUEST (health)', event as unknown as Record<string, unknown>);
      } else {
        this.logger.info('HTTP REQUEST', event as unknown as Record<string, unknown>);
      }
    }
  }

  logResponseEvent(event: HttpResponseEvent): void {
    const status = event.http.statusCode ?? 200;
    const isHealthEndpoint =
      event.http.path === '/health' ||
      event.http.path === '/healthz' ||
      event.http.path.startsWith('/api/health');

    if (process.env.NODE_ENV !== 'production') {
      if (!isHealthEndpoint) {
        process.stdout.write(formatResponseBox(event) + '\n');
      }
    } else {
      if (isHealthEndpoint) {
        this.logger.debug('HTTP RESPONSE (health)', event as unknown as Record<string, unknown>);
      } else if (status >= 500) {
        this.logger.error(
          'HTTP RESPONSE ERROR',
          undefined,
          event as unknown as Record<string, unknown>
        );
      } else if (status >= 400) {
        this.logger.warn(
          'HTTP RESPONSE CLIENT WARNING',
          event as unknown as Record<string, unknown>
        );
      } else {
        this.logger.info('HTTP RESPONSE', event as unknown as Record<string, unknown>);
      }
    }
  }

  logErrorEvent(event: HttpErrorEvent): void {
    const status = event.http.statusCode ?? 500;
    if (process.env.NODE_ENV !== 'production') {
      process.stderr.write(formatErrorBox(event) + '\n');
    } else {
      if (status >= 500) {
        this.logger.error('HTTP EXCEPTION', undefined, event as unknown as Record<string, unknown>);
      } else {
        this.logger.warn('HTTP ERROR', event as unknown as Record<string, unknown>);
      }
    }
  }
}

export const defaultHttpObservability = new NodeHttpObservabilityAdapter();
