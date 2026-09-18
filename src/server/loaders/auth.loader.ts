import 'server-only';
import { cache } from 'react';
import { getCurrentUserQuery } from '../services/auth/get-current-user.query';
import type { User } from '../domain/auth/auth.model';

/**
 * RSC Read Port for loading current authenticated user.
 * Request-memoized via React cache, zero store.
 * The ONLY symbol a Server Component may call to retrieve the active user.
 */
export const loadCurrentUser = cache(async (): Promise<User | null> => {
  const result = await getCurrentUserQuery();
  if (result.ok) {
    return result.value;
  }
  return null;
});
