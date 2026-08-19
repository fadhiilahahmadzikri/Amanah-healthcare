import * as Sentry from '@sentry/nextjs';

if (!process.env.NEXT_PUBLIC_SENTRY_DISABLED) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    sendDefaultPii: true,

    tracesSampleRate: 1,

    debug: false
  });
}

export const onRouterTransitionStart = (
  Sentry as unknown as { captureRouterTransitionStart: () => void }
).captureRouterTransitionStart;
