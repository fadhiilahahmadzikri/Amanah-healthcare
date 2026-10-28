import { AppError } from '@/core/errors/app-error';
import { ErrorCodes } from '@/core/errors/error-codes';
import type { ProblemDetails } from '@/core/errors/problem-details';
import { isProtectedRoute } from '@/core/routes';

export interface ClientFetchOptions extends RequestInit {
  query?: Record<string, unknown>;
  idempotencyKey?: string;
}

/**
 * Standard same-origin JSON fetch wrapper for client components and hooks.
 * - Always relative to Next.js origin (never exposes backend port).
 * - Relies purely on browser HttpOnly cookies (zero localStorage/sessionStorage tokens).
 * - Enforces idempotency key on non-GET calls (POST, PUT, PATCH, DELETE).
 * - Deterministic error throwing (AppError).
 */
function resolveIdempotencyKey(optionsKey?: string, headers?: Headers): string | undefined {
  if (optionsKey) return optionsKey;
  const headerKey = headers?.get('x-idempotency-key') ?? headers?.get('idempotency-key');
  if (headerKey) return headerKey;
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return undefined;
}

function extractErrorMessage(errorBody: unknown, defaultMessage: string): string {
  if (typeof errorBody === 'object' && errorBody !== null) {
    const err = errorBody as Record<string, unknown>;

    if (Array.isArray(err.invalidParams) && err.invalidParams.length > 0) {
      const details = err.invalidParams
        .map((p: any) => `${p.name || 'field'}: ${p.reason || 'invalid'}`)
        .join(', ');
      const baseMsg =
        typeof err.detail === 'string' && err.detail.trim().length > 0
          ? err.detail
          : typeof err.message === 'string' && err.message.trim().length > 0
            ? err.message
            : defaultMessage;
      return `${baseMsg} (${details})`;
    }

    if (typeof err.message === 'string' && err.message.trim().length > 0) {
      return err.message;
    }
    if (Array.isArray(err.message) && err.message.length > 0) {
      return String(err.message[0]);
    }
    if (typeof err.detail === 'string' && err.detail.trim().length > 0) {
      return err.detail;
    }
    if (typeof err.error === 'string' && err.error.trim().length > 0) {
      return err.error;
    }
  }
  return defaultMessage;
}

export async function clientFetch<T>(
  endpoint: string,
  options: ClientFetchOptions = {}
): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json, application/problem+json');
  }

  // Enforce idempotency on non-GET calls
  if (method !== 'GET' && method !== 'HEAD') {
    const key = resolveIdempotencyKey(options.idempotencyKey, headers);

    if (key) {
      if (!headers.has('x-idempotency-key')) headers.set('x-idempotency-key', key);
      if (!headers.has('Idempotency-Key')) headers.set('Idempotency-Key', key);
    }
  }

  // Construct URL with query parameters
  let url = endpoint;
  if (options.query) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(options.query)) {
      if (v !== undefined && v !== null) {
        qs.set(k, String(v));
      }
    }
    const qString = qs.toString();
    if (qString) {
      url += (url.includes('?') ? '&' : '?') + qString;
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      method,
      headers,
      credentials: 'same-origin'
    });
  } catch (netErr) {
    throw AppError.network(`Gagal terhubung ke endpoint (${url})`, netErr);
  }

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = null;
    }

    const defaultMsg = `HTTP ${response.status} ${response.statusText}`;
    const message = extractErrorMessage(errorBody, defaultMsg);

    if (response.status === 400) {
      const pDetails = errorBody as ProblemDetails | undefined;
      const errorObj =
        typeof errorBody === 'object' && errorBody !== null
          ? (errorBody as Record<string, unknown>)
          : undefined;
      const rawCode =
        pDetails?.code ??
        (typeof errorObj?.error === 'string' ? errorObj.error : ErrorCodes.VALIDATION_FAILED);
      const code = rawCode as (typeof ErrorCodes)[keyof typeof ErrorCodes];
      throw new AppError({
        code,
        status: 400,
        expected: true,
        message,
        problemDetails: pDetails
      });
    }
    if (response.status === 401) {
      if (typeof window !== 'undefined' && isProtectedRoute(window.location.pathname)) {
        const lastRedirect = sessionStorage.getItem('last_auth_redirect');
        const now = Date.now();
        if (!lastRedirect || now - Number(lastRedirect) > 5000) {
          sessionStorage.setItem('last_auth_redirect', String(now));
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/auth/sign-in?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
      throw AppError.unauthenticated(message);
    }
    if (response.status === 403) {
      throw AppError.forbidden(message);
    }
    if (response.status === 404) {
      throw AppError.notFound(message);
    }
    if (response.status === 409) {
      throw AppError.conflict(message, errorBody as ProblemDetails);
    }
    if (response.status === 422) {
      throw AppError.validation(message);
    }

    throw AppError.internal(message);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return (await response.json()) as T;
}
