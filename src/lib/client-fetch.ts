import { AppError } from '@/core/errors/app-error';

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
    const key =
      options.idempotencyKey ||
      headers.get('x-idempotency-key') ||
      headers.get('Idempotency-Key') ||
      (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined);

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

    const message =
      (errorBody as { message?: string; error?: string })?.message ||
      (errorBody as { message?: string; error?: string })?.error ||
      `HTTP ${response.status} ${response.statusText}`;

    if (response.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
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
