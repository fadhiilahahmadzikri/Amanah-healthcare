import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { getCurrentUserQuery } from '../services/auth/get-current-user.query';
import type { User } from '../domain/auth/auth.model';

/**
 * RSC Auth Boundary Loader.
 * The authoritative symbol for Server Layouts/Components requiring an authenticated user.
 * If session is missing or expired, cleanly redirects to /auth/sign-in.
 * If backend experiences transient or unexpected error, throws to error.tsx boundary.
 */
export const authLoader = cache(async (): Promise<User> => {
  try {
    const result = await getCurrentUserQuery();
    if (!result.ok) {
      throw result.error;
    }
    if (result.value === null) {
      redirect('/auth/sign-in');
    }
    return result.value;
  } catch (err) {
    if (isRedirectError(err)) {
      throw err;
    }
    throw err;
  }
});

/**
 * RSC Read Port for optionally loading current authenticated user.
 * Request-memoized via React cache, zero store.
 * Returns null if unauthenticated; throws if unexpected infrastructure/server failure.
 */
export const loadCurrentUser = cache(async (): Promise<User | null> => {
  const result = await getCurrentUserQuery();
  if (result.ok) {
    return result.value;
  }
  if (!result.error.expected) {
    throw result.error;
  }
  return null;
});
