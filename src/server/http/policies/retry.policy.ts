import 'server-only';
import { runtimeConfig } from '@/core/config/runtime.config';

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
}

export function isIdempotentMethod(method: string): boolean {
  const m = method.toUpperCase();
  return m === 'GET' || m === 'HEAD' || m === 'PUT' || m === 'DELETE' || m === 'OPTIONS';
}

export function calculateBackoffWithJitter(
  attempt: number,
  initialDelayMs = runtimeConfig.http.retryInitialDelayMs,
  maxDelayMs = runtimeConfig.http.retryMaxDelayMs
): number {
  const exponential = Math.min(maxDelayMs, initialDelayMs * Math.pow(2, attempt));
  // Full jitter: random between 0 and exponential
  return Math.floor(Math.random() * exponential);
}

export function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status === 502 || status === 503 || status === 504;
}
