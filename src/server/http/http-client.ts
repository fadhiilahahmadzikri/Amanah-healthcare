import 'server-only';
import { z } from 'zod';
import { AppError } from '@/core/errors/app-error';
import {
  prepareRequestHeaders,
  logOutboundRequest,
  logOutboundResponse,
  logOutboundError,
  handleHttpErrorResponse
} from './interceptors';
import {
  resolveTimeoutMs,
  createTimeoutSignal,
  type TimeoutClass
} from './policies/timeout.policy';
import {
  isIdempotentMethod,
  isRetryableStatus,
  calculateBackoffWithJitter
} from './policies/retry.policy';
import { serializeQueryParams } from './serialization/query-string';
import { serializeRequestBody } from './serialization/body';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';

export interface HttpRequestOptions {
  method?: HttpMethod;
  headers?: HeadersInit;
  query?: Record<string, unknown>;
  body?: unknown;
  tokenOverride?: string | null;
  idempotencyKey?: string;
  timeoutClass?: TimeoutClass | number;
  cache?: RequestCache;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
  signal?: AbortSignal;
}

export class HttpClient {
  async request<T>(
    url: string,
    schema: z.ZodType<T>,
    options: HttpRequestOptions = {}
  ): Promise<T> {
    const method = (options.method ?? 'GET').toUpperCase() as HttpMethod;
    const queryString = serializeQueryParams(options.query);
    const fullUrl = `${url}${queryString}`;

    const headers = prepareRequestHeaders(options.headers, {
      tokenOverride: options.tokenOverride,
      idempotencyKey: options.idempotencyKey
    });

    const bodyInit = serializeRequestBody(options.body, headers);
    const timeoutMs = resolveTimeoutMs(options.timeoutClass);
    const isIdempotent = isIdempotentMethod(method) || Boolean(options.idempotencyKey);

    let attempt = 0;
    const maxAttempts = isIdempotent ? 3 : 1;

    while (attempt < maxAttempts) {
      attempt++;
      const startTime = Date.now();
      const { signal, cleanup } = createTimeoutSignal(timeoutMs, options.signal);

      try {
        logOutboundRequest(method, fullUrl, Boolean(bodyInit));

        const response = await fetch(fullUrl, {
          method,
          headers,
          body: bodyInit,
          cache: options.cache,
          next: options.next,
          signal
        });

        const durationMs = Date.now() - startTime;
        logOutboundResponse(method, fullUrl, response.status, durationMs);

        if (!response.ok) {
          if (attempt < maxAttempts && isRetryableStatus(response.status)) {
            const delay = calculateBackoffWithJitter(attempt);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
          await handleHttpErrorResponse(response, method, fullUrl);
        }

        // Handle 204 No Content or empty responses
        if (response.status === 204 || response.headers.get('content-length') === '0') {
          const parsed = schema.safeParse(null);
          if (parsed.success) {
            return parsed.data;
          }
          // Allow void/null schemas or return as undefined cast
          return undefined as unknown as T;
        }

        const rawData = await response.json();
        const parseResult = schema.safeParse(rawData);

        if (!parseResult.success) {
          const issues = parseResult.error.issues
            .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
            .join('; ');
          throw AppError.schemaParse(
            `Contract violation from ${method} ${fullUrl}: ${issues}`,
            parseResult.error
          );
        }

        return parseResult.data;
      } catch (err: unknown) {
        const durationMs = Date.now() - startTime;
        logOutboundError(method, fullUrl, err, durationMs);

        if (err instanceof AppError) {
          throw err;
        }

        if (err instanceof Error && err.name === 'AbortError') {
          throw AppError.timeout(
            `Request deadline of ${timeoutMs}ms exceeded for ${method} ${fullUrl}`
          );
        }

        if (attempt < maxAttempts) {
          const delay = calculateBackoffWithJitter(attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        throw AppError.network(`Network error during ${method} ${fullUrl}`, err);
      } finally {
        cleanup();
      }
    }

    throw AppError.network(`Exhausted ${maxAttempts} retry attempts for ${method} ${fullUrl}`);
  }
}

export const httpClient = new HttpClient();
