import { AUTH_ERROR_MESSAGES } from '@/constants/auth-errors';
import type { ProblemDetails, InvalidParam } from '@/core/errors/problem-details';

export interface FormFieldError {
  fieldName: string;
  message: string;
}

export function extractFormFieldErrors(error: unknown): FormFieldError[] {
  const result: FormFieldError[] = [];

  const invalidParams: InvalidParam[] | undefined =
    error && typeof error === 'object' && 'invalidParams' in error
      ? (error as { invalidParams?: InvalidParam[] }).invalidParams
      : error && typeof error === 'object' && 'problemDetails' in error
        ? (error as { problemDetails?: ProblemDetails }).problemDetails?.invalidParams
        : undefined;

  if (invalidParams && Array.isArray(invalidParams)) {
    invalidParams.forEach(({ name, reason }) => {
      const message = AUTH_ERROR_MESSAGES[reason] || 'Nilai yang dimasukkan tidak valid.';
      result.push({
        fieldName: name,
        message
      });
    });
  }

  return result;
}
