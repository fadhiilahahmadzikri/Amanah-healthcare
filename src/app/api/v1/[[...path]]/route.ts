import { NextRequest, NextResponse } from 'next/server';
import { getBaseApiUrl } from '@/server/api/base-url';
import { getAccessTokenCookie, getRefreshTokenCookie } from '@/server/auth/token-store';
import { refreshTokenCommand } from '@/server/services/auth/refresh-token.command';
import {
  formatRequestBox,
  formatResponseBox,
  formatErrorBox
} from '@/core/observability/formatters/box-logger.formatter';
import { sanitizePayload } from '@/core/observability/sanitizers/payload.sanitizer';
import {
  extractClientMetadata,
  extractHeadersMap
} from '@/core/observability/extractors/client-metadata.extractor';
import { extractClientIp } from '@/core/observability/extractors/ip.extractor';
import { redactHeaders } from '@/core/observability/sanitizers/redaction.sanitizer';
import { ssotLogger } from '@/core/observability/adapters/pino/pino-logger.adapter';
import { apiFileLogger } from '@/core/observability/services/api-file-logger.service';

export const dynamic = 'force-dynamic';

async function handleProxy(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const startTime = Date.now();
  const resolvedParams = await params;
  const pathSegments = resolvedParams.path || [];
  const subpath = pathSegments.join('/');

  const backendBaseUrl = getBaseApiUrl();
  const search = request.nextUrl.search;
  const targetUrl = `${backendBaseUrl}/api/v1/${subpath}${search}`;

  const requestId =
    request.headers.get('x-request-id') ||
    `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const correlationId = request.headers.get('x-correlation-id') || requestId;
  const method = request.method.toUpperCase();
  const rawHeadersMap = extractHeadersMap(request.headers);
  const clientMetadata = extractClientMetadata(request.headers);
  const clientIp = extractClientIp(request.headers);
  const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());

  // 1. Resolve Access Token
  let accessToken =
    (await getAccessTokenCookie()) || request.cookies.get('amanah_access_token')?.value;

  // 2. Prepare headers for upstream backend
  const buildHeaders = (token: string | null | undefined): Headers => {
    const upstreamHeaders = new Headers();

    // Copy important client headers
    for (const [key, value] of request.headers.entries()) {
      const lower = key.toLowerCase();
      // Skip hop-by-hop headers
      if (['host', 'connection', 'content-length'].includes(lower)) {
        continue;
      }
      upstreamHeaders.set(key, value);
    }

    // Explicitly forward client cookies so backend session authentication succeeds
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      upstreamHeaders.set('cookie', cookieHeader);
    }

    if (token) {
      upstreamHeaders.set('Authorization', `Bearer ${token}`);
    }

    // Propagate tracing headers upstream
    upstreamHeaders.set('x-request-id', requestId);
    upstreamHeaders.set('x-correlation-id', correlationId);

    return upstreamHeaders;
  };

  // 3. Prepare request body if applicable
  const hasBody = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  let requestBody: ArrayBuffer | undefined = undefined;
  let parsedRequestBody: unknown = undefined;

  if (hasBody) {
    try {
      requestBody = await request.arrayBuffer();
      if (requestBody.byteLength > 0) {
        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const text = new TextDecoder().decode(requestBody);
          try {
            parsedRequestBody = JSON.parse(text);
          } catch {
            parsedRequestBody = text;
          }
        } else {
          parsedRequestBody = `[BODY (${requestBody.byteLength} bytes)]`;
        }
      }
    } catch {
      requestBody = undefined;
      parsedRequestBody = undefined;
    }
  }

  // 4. Log Inbound HTTP Request to Dev Server Console
  const sanitizedRequestBody =
    parsedRequestBody !== undefined ? sanitizePayload(parsedRequestBody) : undefined;
  const redactedRequestHeaders = redactHeaders(rawHeadersMap);

  if (process.env.NODE_ENV !== 'production' && typeof process !== 'undefined' && process.stdout) {
    process.stdout.write(
      formatRequestBox({
        event: 'http.request',
        requestId,
        correlationId,
        timestamp: new Date(startTime).toISOString(),
        http: {
          method,
          path: `${request.nextUrl.pathname}${search}`,
          query: Object.keys(queryParams).length > 0 ? queryParams : undefined
        },
        client: clientMetadata,
        ip: clientIp,
        headers: redactedRequestHeaders,
        body: sanitizedRequestBody
      }) + '\n'
    );
  } else {
    ssotLogger.info('http_inbound_request', {
      method,
      path: request.nextUrl.pathname,
      targetUrl,
      requestId,
      correlationId
    });
  }

  // 5. Forward request to upstream backend
  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(targetUrl, {
      method,
      headers: buildHeaders(accessToken),
      body: requestBody,
      cache: 'no-store'
    });
  } catch (netErr: unknown) {
    const durationMs = Date.now() - startTime;
    const errMsg = netErr instanceof Error ? netErr.message : String(netErr);

    // Write to persistent versioned file log
    apiFileLogger.logTransaction({
      id: requestId,
      requestId,
      correlationId,
      timestamp: new Date(startTime).toISOString(),
      durationMs,
      request: {
        method,
        url: targetUrl,
        path: `${request.nextUrl.pathname}${search}`,
        query: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        headers: redactedRequestHeaders,
        body: sanitizedRequestBody
      },
      error: {
        name: 'UpstreamUnreachable',
        message: `Failed to contact backend API (${targetUrl}): ${errMsg}`,
        statusCode: 502
      },
      client: clientMetadata,
      ip: clientIp
    });

    if (process.env.NODE_ENV !== 'production' && typeof process !== 'undefined' && process.stderr) {
      process.stderr.write(
        formatErrorBox({
          event: 'http.error',
          requestId,
          correlationId,
          timestamp: new Date().toISOString(),
          http: {
            method,
            path: `${request.nextUrl.pathname}${search}`,
            statusCode: 502,
            durationMs
          },
          client: clientMetadata,
          ip: clientIp,
          error: {
            name: 'UpstreamUnreachable',
            message: `Failed to contact backend API (${targetUrl}): ${errMsg}`,
            statusCode: 502
          }
        }) + '\n'
      );
    } else {
      ssotLogger.error('upstream_unreachable', netErr, {
        targetUrl,
        requestId,
        correlationId,
        durationMs
      });
    }

    return NextResponse.json(
      { success: false, error: `Backend service unreachable (${errMsg})` },
      { status: 502 }
    );
  }

  // 6. Silent refresh if 401 Unauthorized
  if (upstreamResponse.status === 401) {
    const refreshToken =
      (await getRefreshTokenCookie()) || request.cookies.get('amanah_refresh_token')?.value;
    if (refreshToken) {
      const refreshResult = await refreshTokenCommand();
      if (refreshResult.ok && refreshResult.value) {
        accessToken = refreshResult.value.accessToken;
        try {
          upstreamResponse = await fetch(targetUrl, {
            method,
            headers: buildHeaders(accessToken),
            body: requestBody,
            cache: 'no-store'
          });
        } catch {
          // If retry fails, preserve previous response
        }
      }
    }
  }

  const durationMs = Date.now() - startTime;

  // 7. Parse response body for observability and client response
  const responseHeaders = new Headers();
  const contentType = upstreamResponse.headers.get('content-type') || '';
  if (contentType) {
    responseHeaders.set('content-type', contentType);
  }

  // Forward Set-Cookie headers from upstream backend
  if (typeof upstreamResponse.headers.getSetCookie === 'function') {
    const setCookies = upstreamResponse.headers.getSetCookie();
    for (const sc of setCookies) {
      responseHeaders.append('set-cookie', sc);
    }
  } else {
    const setCookie = upstreamResponse.headers.get('set-cookie');
    if (setCookie) {
      responseHeaders.set('set-cookie', setCookie);
    }
  }

  if (upstreamResponse.status === 204) {
    // Write 204 to versioned file log
    apiFileLogger.logTransaction({
      id: requestId,
      requestId,
      correlationId,
      timestamp: new Date(startTime).toISOString(),
      durationMs,
      request: {
        method,
        url: targetUrl,
        path: `${request.nextUrl.pathname}${search}`,
        query: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        headers: redactedRequestHeaders,
        body: sanitizedRequestBody
      },
      response: {
        statusCode: 204,
        headers: Object.fromEntries(responseHeaders.entries()),
        body: null
      },
      client: clientMetadata,
      ip: clientIp
    });

    if (process.env.NODE_ENV !== 'production' && typeof process !== 'undefined' && process.stdout) {
      process.stdout.write(
        formatResponseBox({
          event: 'http.response',
          requestId,
          correlationId,
          timestamp: new Date().toISOString(),
          http: {
            method,
            path: `${request.nextUrl.pathname}${search}`,
            statusCode: 204,
            durationMs
          },
          client: clientMetadata,
          ip: clientIp,
          response: null
        }) + '\n'
      );
    }

    return new NextResponse(null, {
      status: 204,
      headers: responseHeaders
    });
  }

  const responseBody = await upstreamResponse.arrayBuffer();
  let parsedResponseBody: unknown = undefined;

  if (contentType.includes('application/json') && responseBody.byteLength > 0) {
    try {
      const text = new TextDecoder().decode(responseBody);
      parsedResponseBody = JSON.parse(text);
    } catch {
      parsedResponseBody = undefined;
    }
  }

  const sanitizedResponseBody =
    parsedResponseBody !== undefined ? sanitizePayload(parsedResponseBody) : undefined;

  // Write full transaction record into versioned file log
  apiFileLogger.logTransaction({
    id: requestId,
    requestId,
    correlationId,
    timestamp: new Date(startTime).toISOString(),
    durationMs,
    request: {
      method,
      url: targetUrl,
      path: `${request.nextUrl.pathname}${search}`,
      query: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      headers: redactedRequestHeaders,
      body: sanitizedRequestBody
    },
    response: {
      statusCode: upstreamResponse.status,
      headers: Object.fromEntries(upstreamResponse.headers.entries()),
      body: sanitizedResponseBody
    },
    client: clientMetadata,
    ip: clientIp
  });

  // 8. Log Outbound Response to Dev Server Console
  if (process.env.NODE_ENV !== 'production' && typeof process !== 'undefined' && process.stdout) {
    if (upstreamResponse.status >= 500) {
      process.stderr.write(
        formatErrorBox({
          event: 'http.error',
          requestId,
          correlationId,
          timestamp: new Date().toISOString(),
          http: {
            method,
            path: `${request.nextUrl.pathname}${search}`,
            statusCode: upstreamResponse.status,
            durationMs
          },
          client: clientMetadata,
          ip: clientIp,
          error: {
            name: 'UpstreamServerError',
            message: `Upstream HTTP ${upstreamResponse.status} ${upstreamResponse.statusText}`,
            statusCode: upstreamResponse.status,
            payload: sanitizedResponseBody
          }
        }) + '\n'
      );
    } else {
      process.stdout.write(
        formatResponseBox({
          event: 'http.response',
          requestId,
          correlationId,
          timestamp: new Date().toISOString(),
          http: {
            method,
            path: `${request.nextUrl.pathname}${search}`,
            statusCode: upstreamResponse.status,
            durationMs
          },
          client: clientMetadata,
          ip: clientIp,
          response: sanitizedResponseBody
        }) + '\n'
      );
    }
  } else {
    ssotLogger.info('http_inbound_response', {
      method,
      path: request.nextUrl.pathname,
      statusCode: upstreamResponse.status,
      durationMs,
      requestId,
      correlationId
    });
  }

  return new NextResponse(responseBody, {
    status: upstreamResponse.status,
    headers: responseHeaders
  });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return handleProxy(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return handleProxy(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return handleProxy(request, context);
}
