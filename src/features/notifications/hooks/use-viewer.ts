'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';
import { clientFetch } from '@/lib/client-fetch';
import { AUDIENCE, type AudienceType } from '@/core/auth/permissions.constants';

export interface ViewerRole {
  readonly id?: string;
  readonly code: string;
  readonly name: string;
  readonly tier?: 'macro' | 'micro';
  readonly audience?: AudienceType;
  readonly isClinical?: boolean;
}

export interface ViewerProfile {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: ViewerRole | null;
  permissions?: string[];
  [key: string]: unknown;
}

/**
 * Authoritative single source of identity (SSOT) on the client.
 * Harmonizes session data across:
 * 1. Canonical NestJS JWT session (via BFF /api/v1/auth/me)
 * 2. Better Auth session (via useSession)
 */
export function useViewer() {
  const { data: betterAuthSession, isPending: isBetterAuthPending } = useSession();

  const { data: meProfile, isLoading: isMeLoading } = useQuery<ViewerProfile | null>({
    queryKey: ['viewer', 'me'],
    queryFn: async (): Promise<ViewerProfile | null> => {
      try {
        const response = await clientFetch<Record<string, unknown>>('/api/v1/auth/me');
        if (!response) return null;
        const profile =
          'data' in response && response.data && typeof response.data === 'object'
            ? (response.data as ViewerProfile)
            : (response as unknown as ViewerProfile);

        if (profile && typeof profile.id === 'string') {
          return profile;
        }
        return null;
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false
  });

  const resolvedUser =
    meProfile ??
    (betterAuthSession?.user
      ? {
          id: betterAuthSession.user.id,
          email: betterAuthSession.user.email,
          name: betterAuthSession.user.name,
          role: {
            code: (betterAuthSession.user.role as string) || 'patient',
            name: (betterAuthSession.user.role as string) || 'patient',
            audience: AUDIENCE.EXTERNAL
          },
          permissions: []
        }
      : null);

  const role = resolvedUser?.role;
  const isInternal = role?.audience === AUDIENCE.INTERNAL;
  const audience: AudienceType = isInternal ? AUDIENCE.INTERNAL : AUDIENCE.EXTERNAL;
  const permissions = resolvedUser?.permissions || [];

  return {
    viewer: resolvedUser,
    userId: resolvedUser?.id,
    role,
    roleCode: role?.code || '',
    permissions,
    hasPermission: (perm: string) => permissions.includes(perm),
    audience,
    isLoading: isMeLoading && isBetterAuthPending && !resolvedUser
  };
}
