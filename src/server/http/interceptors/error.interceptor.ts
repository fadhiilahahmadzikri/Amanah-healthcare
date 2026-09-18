import 'server-only';
import { AppError } from '@/core/errors/app-error';
import { problemDetailsSchema, type ProblemDetails } from '@/core/errors/problem-details';
import { HttpTransportError } from '../http-error';

export async function handleHttpErrorResponse(
  response: Response,
  method: string,
  url: string
): Promise<never> {
  const status = response.status;
  let rawBody: unknown;
  try {
    const text = await response.text();
    rawBody = text ? JSON.parse(text) : null;
  } catch {
    rawBody = null;
  }

  let problemDetails: ProblemDetails | undefined;
  if (rawBody && typeof rawBody === 'object') {
    const parsed = problemDetailsSchema.safeParse(rawBody);
    if (parsed.success) {
      problemDetails = parsed.data;
    }
  }

  const message =
    problemDetails?.message ||
    problemDetails?.detail ||
    (typeof rawBody === 'object' &&
    rawBody !== null &&
    'message' in rawBody &&
    typeof (rawBody as Record<string, unknown>).message === 'string'
      ? ((rawBody as Record<string, unknown>).message as string)
      : `HTTP request failed with status ${status}`);

  if (status === 422) {
    throw AppError.validation(message, problemDetails?.invalidParams, problemDetails);
  }

  if (status === 401) {
    throw AppError.unauthenticated(message, problemDetails);
  }

  if (status === 403) {
    throw AppError.forbidden(message, problemDetails);
  }

  if (status === 404) {
    throw AppError.notFound(message, problemDetails);
  }

  if (status === 429) {
    const retryAfterHeader = response.headers.get('Retry-After');
    const retryAfter = retryAfterHeader
      ? parseInt(retryAfterHeader, 10)
      : problemDetails?.retryAfter;
    throw AppError.rateLimit(message, retryAfter, problemDetails);
  }

  throw new HttpTransportError({
    message,
    status,
    url,
    method,
    problemDetails
  });
}
