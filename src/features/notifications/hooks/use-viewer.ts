'use client';

import { useQuery } from '@tanstack/react-query';
import { CANONICAL_ROLES, SYSTEM_ROLES, type SystemRole } from '@/constants/staff-types.constant';
import { useSession } from '@/lib/auth-client';
import { clientFetch } from '@/lib/client-fetch';

export interface ViewerRole {
  readonly id?: string | number;
  readonly code: string;
  readonly name?: string;
}

export interface ViewerProfile {
  id: string;
  email?: string | null;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  systemRole?: SystemRole | null;
  role?: ViewerRole | null;
  roleCode?: string | null;
  roles?: string[];
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
          systemRole: (betterAuthSession.user.role as SystemRole) ?? SYSTEM_ROLES.PATIENT,
          role: {
            code: (betterAuthSession.user.role as string) ?? CANONICAL_ROLES.PATIENT,
            name: (betterAuthSession.user.role as string) ?? CANONICAL_ROLES.PATIENT
          }
        }
      : null);

  const isStaff =
    resolvedUser?.systemRole === SYSTEM_ROLES.ADMIN ||
    resolvedUser?.systemRole === SYSTEM_ROLES.STAF;

  const audience: 'clinic' | 'patient' = isStaff ? 'clinic' : 'patient';
  const roleCode = resolvedUser?.role?.code ?? CANONICAL_ROLES.PATIENT;

  return {
    viewer: resolvedUser,
    userId: resolvedUser?.id,
    role: roleCode,
    normalizedRole: roleCode.toLowerCase(),
    systemRole: resolvedUser?.systemRole ?? null,
    audience,
    isLoading: isMeLoading && isBetterAuthPending && !resolvedUser
  };
}
