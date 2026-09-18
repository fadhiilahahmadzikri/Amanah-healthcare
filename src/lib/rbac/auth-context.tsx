'use client';

import * as React from 'react';
import type { NavGroup } from '@/types';
import { useSession } from '@/lib/auth-client';
import { filterNavGroupsByRole, type SupportedRole } from './navigation';

export type AuthStatus = 'unknown' | 'allow' | 'deny';

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  banned?: boolean | null;
}

export interface AuthContextValue {
  status: AuthStatus;
  isReady: boolean;
  user: AuthUser | null;
  role: SupportedRole | null;
  navGroups: NavGroup[];
  can: (permission: string) => boolean;
  hasRole: (role: SupportedRole) => boolean;
}

const PATIENT_ALLOWED_PERMISSIONS = new Set([
  'appointment.create',
  'appointment.read',
  'appointment.cancel',
  'queue.read',
  'queue.take-ticket'
]);

const AuthorizationContext = React.createContext<AuthContextValue | null>(null);

export interface AuthorizationProviderProps {
  children: React.ReactNode;
  initialUser: AuthUser | null;
  initialRole: SupportedRole | null;
  initialNavGroups: NavGroup[];
  allNavGroups?: NavGroup[];
}

/**
 * Authoritative Server-First Authorization Provider.
 * Hydrated on the server to achieve Zero-Flicker Navigation and enforce
 * the Three-State Authorization Model ('unknown', 'allow', 'deny').
 */
export function AuthorizationProvider({
  children,
  initialUser,
  initialRole,
  initialNavGroups,
  allNavGroups
}: AuthorizationProviderProps) {
  const [user, setUser] = React.useState<AuthUser | null>(initialUser);
  const [role, setRole] = React.useState<SupportedRole | null>(initialRole);
  const [navGroups, setNavGroups] = React.useState<NavGroup[]>(initialNavGroups);
  const [status, setStatus] = React.useState<AuthStatus>(initialUser ? 'allow' : 'unknown');

  // Passive background session synchronization to keep state fresh without causing hydration waterfalls
  const { data: clientSession, isPending } = useSession();

  React.useEffect(() => {
    if (isPending) return;

    if (clientSession?.user) {
      const clientRole: SupportedRole = clientSession.user.role === 'admin' ? 'admin' : 'patient';

      setUser((prev) => {
        if (
          prev?.id === clientSession.user.id &&
          prev?.role === clientSession.user.role &&
          prev?.name === clientSession.user.name &&
          prev?.email === clientSession.user.email &&
          prev?.image === clientSession.user.image
        ) {
          return prev;
        }
        return clientSession.user as AuthUser;
      });

      setRole((prev) => (prev === clientRole ? prev : clientRole));
      setStatus('allow');

      if (allNavGroups && allNavGroups.length > 0) {
        setNavGroups(filterNavGroupsByRole(allNavGroups, clientRole));
      }
    } else if (clientSession === null && !initialUser) {
      // Explicitly unauthenticated on client
      setUser(null);
      setRole(null);
      setStatus('deny');
      setNavGroups([]);
    }
  }, [clientSession, isPending, allNavGroups, initialUser]);

  const can = React.useCallback(
    (permission: string): boolean => {
      if (status !== 'allow' || !role) return false;
      if (role === 'admin') return true;
      return PATIENT_ALLOWED_PERMISSIONS.has(permission);
    },
    [status, role]
  );

  const hasRole = React.useCallback(
    (targetRole: SupportedRole): boolean => {
      return status === 'allow' && role === targetRole;
    },
    [status, role]
  );

  const value = React.useMemo<AuthContextValue>(
    () => ({
      status,
      isReady: status !== 'unknown',
      user,
      role,
      navGroups,
      can,
      hasRole
    }),
    [status, user, role, navGroups, can, hasRole]
  );

  return <AuthorizationContext.Provider value={value}>{children}</AuthorizationContext.Provider>;
}

/**
 * Hook to access the authoritative Authorization Context.
 */
export function useAuthContext(): AuthContextValue {
  const context = React.useContext(AuthorizationContext);
  if (!context) {
    // Fail-closed fallback if used outside AuthorizationProvider
    return {
      status: 'unknown',
      isReady: false,
      user: null,
      role: null,
      navGroups: [],
      can: () => false,
      hasRole: () => false
    };
  }
  return context;
}

/**
 * Returns the server-projected navigation groups with zero hydration flicker.
 */
export function useAuthorizedNav(): NavGroup[] {
  const { navGroups } = useAuthContext();
  return navGroups;
}

/**
 * Returns the current authenticated principal and role.
 */
export function useCurrentUser() {
  const { user, role, status, isReady } = useAuthContext();
  return { user, role, status, isReady };
}

/**
 * Checks whether the current principal has a specific permission.
 */
export function useCan(permission: string): boolean {
  const { can } = useAuthContext();
  return can(permission);
}

/**
 * Checks whether the current principal has a specific role.
 */
export function useHasRole(role: SupportedRole): boolean {
  const { hasRole } = useAuthContext();
  return hasRole(role);
}
