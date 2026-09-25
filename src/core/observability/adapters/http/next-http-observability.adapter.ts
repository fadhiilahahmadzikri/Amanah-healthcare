import type { ILogger } from '../../ports/logger.port';
import type { IHttpObservabilityAdapter } from '../../ports/http-observability.port';
import type {
  HttpRequestEvent,
  HttpResponseEvent,
  HttpErrorEvent,
  ObservableRequest,
  ObservableResponse,
  ObservableContext,
  HttpErrorDetails
} from '../../models/http-event.types';
import { ssotLogger } from '../pino/pino-logger.adapter';
import {
  extractClientMetadata,
  extractHeadersMap
} from '../../extractors/client-metadata.extractor';
import { extractClientIp } from '../../extractors/ip.extractor';
import {
  resolveRequestId,
  extractQueryParams,
  extractUrlPath
} from '../../extractors/request-metadata.extractor';
import { redactHeaders } from '../../sanitizers/redaction.sanitizer';
import { sanitizePayload } from '../../sanitizers/payload.sanitizer';
import {
  formatRequestBox,
  formatResponseBox,
  formatErrorBox
} from '../../formatters/box-logger.formatter';

export interface NextHttpObservabilityConfig {
  logRequestBody?: boolean;
  logResponseBody?: boolean;
  logHeaders?: boolean;
  maxBodyLength?: number;
  trustedProxies?: boolean | string[];
}

export class NextHttpObservabilityAdapter implements IHttpObservabilityAdapter {
  constructor(
    private readonly logger: ILogger = ssotLogger,
    private readonly config: NextHttpObservabilityConfig = {}
  ) {}

  onIncomingRequest(
    req: ObservableRequest,
    params: Record<string, string | string[]> = {}
  ): ObservableContext {
    const startTime = Date.now();
    const headersMap = extractHeadersMap(req.headers);
    const { requestId, correlationId } = resolveRequestId(req.headers);
    const client = extractClientMetadata(req.headers);
    const ip = extractClientIp(req.headers, req.ip, { trustedProxies: this.config.trustedProxies });
    const { path, hostname, protocol } = extractUrlPath(req.url);
    const query = extractQueryParams(req.url);

    const isDev = process.env.NODE_ENV !== 'production';
    const shouldLogHeaders = this.config.logHeaders ?? isDev;
    const shouldLogBody = this.config.logRequestBody ?? isDev;

    let sanitizedBody: unknown = undefined;
    if (shouldLogBody && req.body !== undefined) {
      try {
        sanitizedBody = sanitizePayload(req.body, {
          maxBodyLength: this.config.maxBodyLength,
          contentType: headersMap['content-type']
        });
      } catch {
        sanitizedBody = '[BODY_EXTRACTION_ERROR]';
      }
    }

    const context: ObservableContext = {
      requestId,
      correlationId,
      startTime,
      method: req.method.toUpperCase(),
      path,
      query,
      params,
      client,
      ip,
      headers: shouldLogHeaders ? redactHeaders(headersMap) : undefined,
      requestBody: sanitizedBody
    };

    try {
      const event: HttpRequestEvent = {
        event: 'http.request',
        requestId,
        correlationId,
        timestamp: new Date(startTime).toISOString(),
        http: {
          method: context.method,
          path: context.path,
          protocol,
          hostname,
          params: Object.keys(params).length > 0 ? params : undefined,
          query: Object.keys(query).length > 0 ? query : undefined
        },
        client,
        ip,
        headers: context.headers,
        body: context.requestBody
      };

      this.logRequestEvent(event);
    } catch {
      // Degrade gracefully; observability must NEVER crash an incoming request
    }

    return context;
  }

  onResponse(ctx: ObservableContext, res: ObservableResponse): void {
    try {
      const endTime = Date.now();
      const durationMs = Math.max(0, endTime - ctx.startTime);
      const isDev = process.env.NODE_ENV !== 'production';
      const shouldLogHeaders = this.config.logHeaders ?? isDev;
      const shouldLogBody = this.config.logResponseBody ?? isDev;

      const resHeadersMap = res.headers ? extractHeadersMap(res.headers) : {};
      const contentType = resHeadersMap['content-type'];

      let sanitizedResponseBody: unknown = undefined;
      if (shouldLogBody && res.body !== undefined) {
        sanitizedResponseBody = sanitizePayload(res.body, {
          maxBodyLength: this.config.maxBodyLength,
          contentType
        });
      }

      const event: HttpResponseEvent = {
        event: 'http.response',
        requestId: ctx.requestId,
        correlationId: ctx.correlationId,
        timestamp: new Date(endTime).toISOString(),
        http: {
          method: ctx.method,
          path: ctx.path,
          route: ctx.route,
          statusCode: res.status,
          durationMs
        },
        client: ctx.client,
        ip: ctx.ip,
        headers:
          shouldLogHeaders && Object.keys(resHeadersMap).length > 0
            ? redactHeaders(resHeadersMap)
            : undefined,
        response: sanitizedResponseBody,
        auth: ctx.auth
      };

      this.logResponseEvent(event);
    } catch {
      // Degrade gracefully
    }
  }

  onError(
    ctx: ObservableContext,
    error: unknown,
    statusCode = 500,
    responsePayload?: unknown
  ): void {
    try {
      const endTime = Date.now();
      const durationMs = Math.max(0, endTime - ctx.startTime);
      const isDev = process.env.NODE_ENV !== 'production';

      let errorDetails: HttpErrorDetails;
      if (error instanceof Error) {
        errorDetails = {
          name: error.name,
          message: error.message,
          statusCode,
          stack: isDev ? error.stack : undefined,
          payload: responsePayload ? sanitizePayload(responsePayload) : undefined
        };
      } else {
        errorDetails = {
          name: 'UnknownError',
          message: String(error),
          statusCode,
          payload: responsePayload ? sanitizePayload(responsePayload) : undefined
        };
      }

      const event: HttpErrorEvent = {
        event: 'http.error',
        requestId: ctx.requestId,
        correlationId: ctx.correlationId,
        timestamp: new Date(endTime).toISOString(),
        http: {
          method: ctx.method,
          path: ctx.path,
          route: ctx.route,
          statusCode,
          durationMs
        },
        client: ctx.client,
        ip: ctx.ip,
        error: errorDetails,
        auth: ctx.auth
      };

      this.logErrorEvent(event);
    } catch {
      // Degrade gracefully
    }
  }

  logRequestEvent(event: HttpRequestEvent): void {
    const isHealthEndpoint =
      event.http.path === '/health' ||
      event.http.path === '/healthz' ||
      event.http.path.startsWith('/api/health');

    if (process.env.NODE_ENV !== 'production' && typeof process !== 'undefined' && process.stdout) {
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

    if (process.env.NODE_ENV !== 'production' && typeof process !== 'undefined' && process.stdout) {
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
    if (process.env.NODE_ENV !== 'production' && typeof process !== 'undefined' && process.stderr) {
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

export const defaultHttpObservability = new NextHttpObservabilityAdapter();
