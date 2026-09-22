import 'server-only';
import {
  AppError,
  AuthenticationError,
  ForbiddenError,
  TransientServerError,
  UnexpectedAppError
} from '@/core/errors/app-error';
import { problemDetailsSchema, type ProblemDetails } from '@/core/errors/problem-details';

export async function handleHttpErrorResponse(
  response: Response,
  _method: string,
  _url: string
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

  if (status === 401) {
    throw new AuthenticationError(message, problemDetails);
  }

  if (status === 403) {
    throw new ForbiddenError(message, problemDetails);
  }

  if (status === 422) {
    throw AppError.validation(message, problemDetails?.invalidParams, problemDetails);
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

  if (status >= 500) {
    throw new TransientServerError(message, status, problemDetails);
  }

  throw new UnexpectedAppError(message, status, problemDetails);
}
