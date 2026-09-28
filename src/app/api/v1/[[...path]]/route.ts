import { NextRequest, NextResponse } from 'next/server';
import { getBaseApiUrl } from '@/server/api/base-url';
import { getAccessTokenCookie, getRefreshTokenCookie } from '@/server/auth/token-store';
import { refreshTokenCommand } from '@/server/services/auth/refresh-token.command';

export const dynamic = 'force-dynamic';

async function handleProxy(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const resolvedParams = await params;
  const pathSegments = resolvedParams.path || [];
  const subpath = pathSegments.join('/');

  const backendBaseUrl = getBaseApiUrl();
  const search = request.nextUrl.search;
  const targetUrl = `${backendBaseUrl}/api/v1/${subpath}${search}`;

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
      if (['host', 'connection', 'content-length', 'cookie'].includes(lower)) {
        continue;
      }
      upstreamHeaders.set(key, value);
    }

    if (token) {
      upstreamHeaders.set('Authorization', `Bearer ${token}`);
    }

    return upstreamHeaders;
  };

  // 3. Prepare request body if applicable
  const method = request.method.toUpperCase();
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);
  let requestBody: ArrayBuffer | undefined = undefined;
  if (hasBody) {
    try {
      requestBody = await request.arrayBuffer();
    } catch {
      requestBody = undefined;
    }
  }

  // 4. Initial forward attempt
  let upstreamResponse = await fetch(targetUrl, {
    method,
    headers: buildHeaders(accessToken),
    body: requestBody,
    cache: 'no-store'
  });

  // 5. Silent refresh if 401 Unauthorized
  if (upstreamResponse.status === 401) {
    const refreshToken =
      (await getRefreshTokenCookie()) || request.cookies.get('amanah_refresh_token')?.value;
    if (refreshToken) {
      const refreshResult = await refreshTokenCommand();
      if (refreshResult.ok && refreshResult.value) {
        accessToken = refreshResult.value.accessToken;
        // Retry backend request with new access token
        upstreamResponse = await fetch(targetUrl, {
          method,
          headers: buildHeaders(accessToken),
          body: requestBody,
          cache: 'no-store'
        });
      }
    }
  }

  // 6. Return response to client
  const responseHeaders = new Headers();
  const contentType = upstreamResponse.headers.get('content-type');
  if (contentType) {
    responseHeaders.set('content-type', contentType);
  }

  if (upstreamResponse.status === 204) {
    return new NextResponse(null, {
      status: 204,
      headers: responseHeaders
    });
  }

  const responseBody = await upstreamResponse.arrayBuffer();
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
