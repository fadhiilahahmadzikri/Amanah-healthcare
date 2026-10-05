'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';
import { clientFetch } from '@/lib/client-fetch';

export interface ViewerProfile {
  id: string;
  email?: string | null;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | { id?: number | string; name?: string } | null;
  systemRole?: string | null;
  [key: string]: unknown;
}

const CLINIC_ROLES = new Set([
  'admin',
  'superadmin',
  'dokter',
  'doctor',
  'bidan',
  'midwife',
  'perawat',
  'nurse',
  'staff_worker',
  'frontdesk',
  'staff'
]);

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
    meProfile ||
    (betterAuthSession?.user
      ? {
          id: betterAuthSession.user.id,
          email: betterAuthSession.user.email,
          name: betterAuthSession.user.name,
          role: betterAuthSession.user.role
        }
      : null);

  const rawRole =
    resolvedUser?.systemRole ||
    (typeof resolvedUser?.role === 'object' && resolvedUser?.role && 'name' in resolvedUser.role
      ? (resolvedUser.role as { name?: string }).name
      : resolvedUser?.role) ||
    'patient';

  const stringRole = String(rawRole);
  const normalizedRole = stringRole.toLowerCase();
  const audience: 'clinic' | 'patient' = CLINIC_ROLES.has(normalizedRole) ? 'clinic' : 'patient';

  return {
    viewer: resolvedUser,
    userId: resolvedUser?.id,
    role: stringRole,
    normalizedRole,
    audience,
    isLoading: isMeLoading && isBetterAuthPending && !resolvedUser
  };
}
