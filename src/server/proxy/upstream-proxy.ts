import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { getServerUpstream } from '@/core/config/endpoints';

export interface ProxyOptions {
  /**
   * Prefix subpath pada upstream (misal: '/api/auth' atau '/api/v1')
   */
  prefix: string;
  /**
   * Path segments yang diteruskan dari Next.js route params
   */
  pathSegments?: string[];
  /**
   * Optional custom auth token to inject in Authorization header
   */
  authToken?: string | null;
}

function resolveForwardedHost(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-host');
  if (forwarded) return forwarded;
  const direct = request.headers.get('host');
  if (direct) return direct;
  return request.nextUrl.host;
}

function resolveClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded;
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return '127.0.0.1';
}

/**
 * Shared Upstream Proxy Core:
 * Meneruskan request dari browser ke backend upstream NestJS server-to-server.
 * Memenuhi Invariant I-1 (Single Origin), menangani Set-Cookie multi-header,
 * streaming body tanpa buffering, dan redirect manual untuk OAuth callback.
 */
export async function proxyToUpstream(
  request: NextRequest,
  options: ProxyOptions
): Promise<NextResponse> {
  const upstreamBase = getServerUpstream();
  const subpath = (options.pathSegments || []).join('/');
  const search = request.nextUrl.search;
  const targetUrl = `${upstreamBase}${options.prefix}${subpath ? `/${subpath}` : ''}${search}`;

  const method = request.method.toUpperCase();

  // 1. Bangun headers upstream
  const upstreamHeaders = new Headers();
  const hopByHopHeaders = new Set([
    'host',
    'connection',
    'content-length',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailer',
    'transfer-encoding',
    'upgrade'
  ]);

  for (const [key, value] of request.headers.entries()) {
    if (!hopByHopHeaders.has(key.toLowerCase())) {
      upstreamHeaders.set(key, value);
    }
  }

  // Teruskan cookies agar sesi otentikasi upstream berjalan
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    upstreamHeaders.set('cookie', cookieHeader);
  }

  // Teruskan atau injeksikan Authorization token jika ada
  if (options.authToken) {
    upstreamHeaders.set('Authorization', `Bearer ${options.authToken}`);
  }

  // Set header X-Forwarded-* untuk backward propagation
  const host = resolveForwardedHost(request);
  const proto =
    request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '');
  upstreamHeaders.set('x-forwarded-host', host);
  upstreamHeaders.set('x-forwarded-proto', proto);

  const clientIp = resolveClientIp(request);
  upstreamHeaders.set('x-forwarded-for', clientIp);

  // 2. Siapkan request body untuk method yang membawa payload
  const hasBody = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  let bodyStream: ReadableStream<Uint8Array> | ArrayBuffer | undefined = undefined;

  if (hasBody && request.body) {
    bodyStream = request.body;
  }

  // 3. Eksekusi fetch upstream
  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(targetUrl, {
      method,
      headers: upstreamHeaders,
      body: bodyStream,
      redirect: 'manual', // Krusial: biarkan status 3xx dan Location diteruskan ke browser
      cache: 'no-store',
      // @ts-expect-error duplex required for streaming request body in Node.js fetch
      duplex: 'half'
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        success: false,
        error: `Layanan backend tidak dapat dihubungi (${errorMsg})`
      },
      { status: 502 }
    );
  }

  // 4. Bangun response headers
  const responseHeaders = new Headers();
  const contentType = upstreamResponse.headers.get('content-type');
  if (contentType) {
    responseHeaders.set('content-type', contentType);
  }

  const location = upstreamResponse.headers.get('location');
  if (location) {
    responseHeaders.set('location', location);
  }

  // Teruskan seluruh Set-Cookie header secara individual (tanpa digabung)
  if (typeof upstreamResponse.headers.getSetCookie === 'function') {
    const cookies = upstreamResponse.headers.getSetCookie();
    for (const c of cookies) {
      responseHeaders.append('set-cookie', c);
    }
  } else {
    const setCookie = upstreamResponse.headers.get('set-cookie');
    if (setCookie) {
      responseHeaders.set('set-cookie', setCookie);
    }
  }

  // 5. Handle empty responses (204 / 304)
  if (upstreamResponse.status === 204 || upstreamResponse.status === 304) {
    return new NextResponse(null, {
      status: upstreamResponse.status,
      headers: responseHeaders
    });
  }

  // 6. Return response stream langsung (non-buffering untuk SSE / AI streaming)
  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders
  });
}
