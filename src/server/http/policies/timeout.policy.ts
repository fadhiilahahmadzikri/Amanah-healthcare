import 'server-only';
import { runtimeConfig } from '@/core/config/runtime.config';

export type TimeoutClass = 'quick' | 'default' | 'long';

export function resolveTimeoutMs(timeoutClass?: TimeoutClass | number): number {
  if (typeof timeoutClass === 'number') {
    return timeoutClass;
  }
  switch (timeoutClass) {
    case 'quick':
      return runtimeConfig.http.quickTimeoutMs;
    case 'long':
      return runtimeConfig.http.longTimeoutMs;
    case 'default':
    default:
      return runtimeConfig.http.defaultTimeoutMs;
  }
}

export function createTimeoutSignal(
  timeoutMs: number,
  externalSignal?: AbortSignal | null
): {
  signal: AbortSignal;
  cleanup: () => void;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error(`Timeout of ${timeoutMs}ms exceeded`));
  }, timeoutMs);

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort(externalSignal.reason);
    } else {
      externalSignal.addEventListener(
        'abort',
        () => {
          controller.abort(externalSignal.reason);
        },
        { once: true }
      );
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId)
  };
}
