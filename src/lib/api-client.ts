import { clientEnv } from '@/core/config/env.client';
import { AppError } from '@/core/errors/app-error';
import { problemDetailsSchema, type ProblemDetails } from '@/core/errors/problem-details';

const BASE_URL = clientEnv.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let memoryAccessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
  memoryAccessToken = token;
};

export const getAccessToken = (): string | null => {
  return memoryAccessToken;
};

export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('amanah_refresh_token');
  }
  return null;
};

export const setRefreshToken = (token: string | null): void => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('amanah_refresh_token', token);
    } else {
      localStorage.removeItem('amanah_refresh_token');
    }
  }
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

export interface FetchOptions extends RequestInit {
  query?: Record<string, unknown>;
  skipAuth?: boolean;
}

export async function apiClient<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json, application/problem+json');
  }

  // 1. Correlation ID
  if (!headers.has('x-correlation-id') && typeof crypto !== 'undefined' && crypto.randomUUID) {
    headers.set('x-correlation-id', crypto.randomUUID());
  }

  // 2. In-memory access token
  if (!options.skipAuth && memoryAccessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${memoryAccessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch (netErr) {
    throw AppError.network(`Gagal terhubung ke server (${url})`, netErr);
  }

  // 3. Silent token refresh on 401
  if (
    response.status === 401 &&
    !endpoint.includes('/auth/email/login') &&
    !endpoint.includes('/auth/refresh')
  ) {
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        headers.set('Authorization', `Bearer ${newToken}`);
        return apiClient<T>(endpoint, { ...options, headers });
      });
    }

    isRefreshing = true;
    const currentRefreshToken = getRefreshToken();

    if (!currentRefreshToken) {
      setAccessToken(null);
      setRefreshToken(null);
      isRefreshing = false;
      throw AppError.unauthenticated('Sesi telah berakhir. Silakan masuk kembali.');
    }

    try {
      const refreshRes = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentRefreshToken}`
        }
      });

      if (!refreshRes.ok) {
        throw new Error('Refresh failed');
      }

      const refreshData = (await refreshRes.json()) as {
        token: string;
        refreshToken: string;
        tokenExpires: number;
      };

      setAccessToken(refreshData.token);
      setRefreshToken(refreshData.refreshToken);
      processQueue(null, refreshData.token);

      headers.set('Authorization', `Bearer ${refreshData.token}`);
      return apiClient<T>(endpoint, { ...options, headers });
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      setAccessToken(null);
      setRefreshToken(null);
      throw AppError.unauthenticated('Sesi telah berakhir. Silakan masuk kembali.');
    } finally {
      isRefreshing = false;
    }
  }

  if (!response.ok) {
    let problemDetails: ProblemDetails | undefined;
    let fallbackMessage = `HTTP error ${response.status}`;

    try {
      const rawText = await response.text();
      if (rawText) {
        const json = JSON.parse(rawText);
        const parsed = problemDetailsSchema.safeParse(json);
        if (parsed.success) {
          problemDetails = parsed.data;
          fallbackMessage = problemDetails.detail || problemDetails.message || fallbackMessage;
        } else if (json.message) {
          fallbackMessage = json.message;
        }
      }
    } catch {
      // ignore json parse error
    }

    if (response.status === 422) {
      throw AppError.validation(fallbackMessage, problemDetails?.invalidParams, problemDetails);
    }
    if (response.status === 401) {
      throw AppError.unauthenticated(fallbackMessage, problemDetails);
    }
    if (response.status === 403) {
      throw AppError.forbidden(fallbackMessage, problemDetails);
    }
    if (response.status === 404) {
      throw AppError.notFound(fallbackMessage, problemDetails);
    }
    if (response.status === 429) {
      throw AppError.rateLimit(fallbackMessage, problemDetails?.retryAfter, problemDetails);
    }

    throw AppError.internal(fallbackMessage);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}
