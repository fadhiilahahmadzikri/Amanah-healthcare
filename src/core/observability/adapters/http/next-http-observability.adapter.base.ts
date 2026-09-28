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

export interface NextHttpObservabilityConfig {
  logRequestBody?: boolean;
  logResponseBody?: boolean;
  logHeaders?: boolean;
  maxBodyLength?: number;
  trustedProxies?: boolean | string[];
}

/**
 * Runtime-agnostic base class for HTTP observability.
 *
 * Contains all request lifecycle logic (context extraction, event building,
 * routing to log*Event hooks). Subclasses provide the concrete log*Event
 * implementation that is appropriate for their runtime (Node.js vs Edge).
 *
 * This class intentionally imports nothing from Node-specific APIs so it is
 * safe to include in any runtime bundle.
 */
export abstract class BaseHttpObservabilityAdapter implements IHttpObservabilityAdapter {
  constructor(
    protected readonly logger: ILogger,
    protected readonly config: NextHttpObservabilityConfig = {}
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

  // ── Abstract hooks — implemented per runtime ──────────────────────────────

  abstract logRequestEvent(event: HttpRequestEvent): void;
  abstract logResponseEvent(event: HttpResponseEvent): void;
  abstract logErrorEvent(event: HttpErrorEvent): void;
}
