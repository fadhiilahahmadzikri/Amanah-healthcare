import * as Sentry from '@sentry/nextjs';
import {
  ssotLogger,
  defaultHttpObservability,
  extractClientMetadata,
  extractClientIp
} from '@/core/observability';

const sentryOptions: Sentry.NodeOptions | Sentry.EdgeOptions = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  spotlight: process.env.NODE_ENV === 'development',
  sendDefaultPii: false,
  tracesSampleRate: 1,
  debug: false
};

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    ssotLogger.debug('Next.js server runtime initialized with Pino SSOT observability');
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

    defaultHttpObservability.logErrorEvent({
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
