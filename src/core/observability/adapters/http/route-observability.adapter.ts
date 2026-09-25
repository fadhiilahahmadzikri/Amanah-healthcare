import { NextRequest, NextResponse } from 'next/server';
import type { IHttpObservabilityAdapter } from '../../ports/http-observability.port';
import { defaultHttpObservability } from './next-http-observability.adapter';
import { extractAuthContext } from '../../extractors/auth-context.extractor';

type RouteContext<TParams = Record<string, string | string[]>> = {
  params?: Promise<TParams> | TParams;
};

type RouteHandler<TParams = Record<string, string | string[]>> = (
  req: NextRequest,
  ctx?: RouteContext<TParams>
) => Promise<Response | NextResponse> | Response | NextResponse;

export function withApiObservability<TParams = Record<string, string | string[]>>(
  handler: RouteHandler<TParams>,
  adapter: IHttpObservabilityAdapter = defaultHttpObservability
): RouteHandler<TParams> {
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

      // 6. Record response
      adapter.onResponse(obsContext, {
        status: response.status,
        headers: response.headers,
        body: responseBody
      });

      return response;
    } catch (error: unknown) {
      // 7. Record exception and rethrow without swallowing
      adapter.onError(obsContext, error, 500);
      throw error;
    }
  };
}

export const observeRoute = withApiObservability;
