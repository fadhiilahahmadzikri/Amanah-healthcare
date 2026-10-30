import { NextRequest, NextResponse } from 'next/server';
import type { IHttpObservabilityAdapter } from '../../ports/http-observability.port';
import { defaultHttpObservability } from './next-http-observability.adapter';
import { extractAuthContext } from '../../extractors/auth-context.extractor';
import { apiFileLogger } from '../../services/api-file-logger.service';

type RouteContext<TParams = Record<string, string | string[]>> = {
  params: Promise<TParams>;
};

export type RouteHandler<TParams = Record<string, string | string[]>> = (
  req: NextRequest,
  ctx: RouteContext<TParams>
) => Promise<Response | NextResponse> | Response | NextResponse;

export function withApiObservability<TParams = Record<string, string | string[]>>(
  handler: (
    req: NextRequest,
    ctx?: RouteContext<TParams>
  ) => Promise<Response | NextResponse> | Response | NextResponse,
  adapter: IHttpObservabilityAdapter = defaultHttpObservability
): (req: NextRequest, ctx: RouteContext<TParams>) => Promise<Response | NextResponse> {
  return async (
    req: NextRequest,
    rawCtx?: RouteContext<TParams>
  ): Promise<Response | NextResponse> => {
    // 1. Resolve params if provided (Promise in Next.js 15/16)
    let params: Record<string, string | string[]> = {};
    if (rawCtx?.params) {
      params = (rawCtx.params instanceof Promise ? await rawCtx.params : rawCtx.params) as Record<
        string,
        string | string[]
      >;
    }

    // 2. Clone request to read body safely without consuming the stream
    let requestBody: unknown = undefined;
    const contentType = req.headers.get('content-type') || '';
    if (req.method !== 'GET' && req.method !== 'HEAD' && contentType.includes('application/json')) {
      try {
        const cloned = req.clone();
        requestBody = await cloned.json();
      } catch {
        // Body reading failed or empty, proceed without crashing
      }
    }

    // 3. Initiate observable context
    const obsContext = adapter.onIncomingRequest(
      {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: requestBody
      },
      params
    );

    const user = (req as unknown as { user?: unknown }).user;
    if (user) {
      obsContext.auth = extractAuthContext(user);
    }

    try {
      // 4. Execute the actual Route Handler
      const response = await handler(req, rawCtx);

      // 5. Inspect response safely
      let responseBody: unknown = undefined;
      const resContentType = response.headers.get('content-type') || '';

      if (resContentType.includes('application/json')) {
        try {
          const clonedRes = response.clone();
          responseBody = await clonedRes.json();
        } catch {
          // Response body already streamed or empty
        }
      } else if (resContentType.includes('text/event-stream')) {
        responseBody = '[EVENT_STREAM_ACTIVE]';
      }

      // 6. Record response in adapter
      adapter.onResponse(obsContext, {
        status: response.status,
        headers: response.headers,
        body: responseBody
      });

      // 7. Record transaction into versioned file log
      apiFileLogger.logTransaction({
        id: obsContext.requestId,
        requestId: obsContext.requestId,
        correlationId: obsContext.correlationId,
        timestamp: new Date(obsContext.startTime).toISOString(),
        durationMs: Math.max(0, Date.now() - obsContext.startTime),
        request: {
          method: obsContext.method,
          url: req.url,
          path: obsContext.path,
          query:
            Object.keys(obsContext.query).length > 0
              ? (obsContext.query as Record<string, string>)
              : undefined,
          headers: obsContext.headers,
          body: obsContext.requestBody
        },
        response: {
          statusCode: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseBody
        },
        client: obsContext.client,
        ip: obsContext.ip
      });

      return response;
    } catch (error: unknown) {
      // 8. Record exception and rethrow without swallowing
      adapter.onError(obsContext, error, 500);

      apiFileLogger.logTransaction({
        id: obsContext.requestId,
        requestId: obsContext.requestId,
        correlationId: obsContext.correlationId,
        timestamp: new Date(obsContext.startTime).toISOString(),
        durationMs: Math.max(0, Date.now() - obsContext.startTime),
        request: {
          method: obsContext.method,
          url: req.url,
          path: obsContext.path,
          query:
            Object.keys(obsContext.query).length > 0
              ? (obsContext.query as Record<string, string>)
              : undefined,
          headers: obsContext.headers,
          body: obsContext.requestBody
        },
        error: {
          name: error instanceof Error ? error.name : 'UnhandledRouteError',
          message: error instanceof Error ? error.message : String(error),
          statusCode: 500,
          stack: error instanceof Error ? error.stack : undefined
        },
        client: obsContext.client,
        ip: obsContext.ip
      });

      throw error;
    }
  };
}
