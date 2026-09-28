import * as Sentry from '@sentry/nextjs';
// Import extractors directly from source — NOT from @/core/observability barrel.
// The barrel is Edge-safe now, but keeping direct imports here documents intent:
// instrumentation.ts must never acquire a static dependency on Node-only modules.
import { extractClientMetadata } from '@/core/observability/extractors/client-metadata.extractor';
import { extractClientIp } from '@/core/observability/extractors/ip.extractor';
import type { IHttpObservabilityAdapter } from '@/core/observability/ports/http-observability.port';

const sentryOptions: Sentry.NodeOptions | Sentry.EdgeOptions = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  spotlight: process.env.NODE_ENV === 'development',
  sendDefaultPii: false,
  tracesSampleRate: 1,
  debug: false
};

/**
 * Composition root — wires the correct HTTP observability adapter per runtime.
 *
 * Dynamic imports inside each branch ensure the Node.js adapter (which uses
 * process.stdout / Pino) is NEVER included in the Edge bundle, and the Edge
 * adapter (console.* only) is NEVER burdened with Node-specific transports.
 *
 * NEXT_RUNTIME is injected by Next.js at build time for each bundle:
 *   'nodejs' — server-side Node.js (API routes, RSC, middleware on Node)
 *   'edge'   — Vercel Edge / Cloudflare Workers runtime (middleware, edge routes)
 */
let httpObservability: IHttpObservabilityAdapter | null = null;

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { NodeHttpObservabilityAdapter, defaultHttpObservability } =
      await import('./core/observability/adapters/http/next-http-observability.adapter.node');

    httpObservability = defaultHttpObservability;

    // Notify via the Node logger that the runtime is up (Pino is safe here)
    const { ssotLogger } = await import('./core/observability/adapters/pino/pino-logger.adapter');
    ssotLogger.debug('Next.js server runtime initialized with Pino SSOT observability');

    void NodeHttpObservabilityAdapter; // keep import side-effect-free but suppress unused warning
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    const { defaultHttpObservability } =
      await import('./core/observability/adapters/http/next-http-observability.adapter.edge');

    httpObservability = defaultHttpObservability;
  }

  if (!process.env.NEXT_PUBLIC_SENTRY_DISABLED) {
    if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
      Sentry.init(sentryOptions);
    }
  }
}

export async function onRequestError(
  err: { digest?: string } & Error,
  request: {
    path: string;
    method: string;
    headers: { [key: string]: string };
  },
  context: {
    routerKind: 'Pages Router' | 'App Router';
    routePath: string;
    routeType: 'render' | 'route' | 'action' | 'middleware';
    renderSource?: 'react-server-components' | 'server-rendering';
    revalidateReason?: 'on-demand' | 'stale' | 'experiment';
  }
) {
  try {
    const headers = request.headers || {};
    const requestId = headers['x-request-id'] || `req_err_${Date.now()}`;
    const correlationId = headers['x-correlation-id'] || requestId;

    httpObservability?.logErrorEvent({
      event: 'http.error',
      requestId,
      correlationId,
      timestamp: new Date().toISOString(),
      http: {
        method: request.method || 'GET',
        path: request.path || '/',
        route: context.routePath
      },
      client: extractClientMetadata(headers),
      ip: extractClientIp(headers),
      error: {
        name: err.name || 'UncaughtError',
        message: err.message || 'Unknown error',
        statusCode: 500,
        stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
      }
    });
  } catch {
    // Degrade gracefully
  }

  if (!process.env.NEXT_PUBLIC_SENTRY_DISABLED) {
    await Sentry.captureRequestError(err, request, context);
  }
}
