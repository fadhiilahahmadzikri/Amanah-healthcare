'use client';

import * as React from 'react';
import type { NavGroup } from '@/types';
import { useSession } from '@/lib/auth-client';
import { useQuery } from '@tanstack/react-query';
import {
  mapPageTreeToNavGroups,
  type DynamicPageNode
} from './navigation';
import { roleManagementApi } from '@/features/role-management/api/role-management.api';
import { roleManagementKeys } from '@/features/role-management/api/query-keys';
import type { AudienceType } from '@/core/auth/permissions.constants';

export type AuthStatus = 'unknown' | 'allow' | 'deny';

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  image?: string | null;
  role?: string | null;
  banned?: boolean | null;
  permissions?: string[];
  accessibleRoutes?: string[];
  audience?: AudienceType;
}

export interface AuthContextValue {
  status: AuthStatus;
  isReady: boolean;
  user: AuthUser | null;
  role: string | null;
  audience: AudienceType | null;
  navGroups: NavGroup[];
  can: (permission: string) => boolean;
}

const AuthorizationContext = React.createContext<AuthContextValue | null>(null);

export interface AuthorizationProviderProps {
  children: React.ReactNode;
  initialUser: AuthUser | null;
  initialRole?: string | null;
  initialAudience?: AudienceType | null;
  initialNavGroups: NavGroup[];
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
  initialAudience,
  initialNavGroups
}: AuthorizationProviderProps) {
  const [user, setUser] = React.useState<AuthUser | null>(initialUser);
  const [role, setRole] = React.useState<string | null>(initialRole ?? initialUser?.role ?? null);
  const [audience, setAudience] = React.useState<AudienceType | null>(initialAudience ?? null);
  const [navGroups, setNavGroups] = React.useState<NavGroup[]>(initialNavGroups);
  const [status, setStatus] = React.useState<AuthStatus>(initialUser ? 'allow' : 'unknown');

  // Reactively project dynamic database application pages (SSOT) into navGroups
  const { data: pageTree } = useQuery({
    queryKey: roleManagementKeys.pageTree(audience!),
    queryFn: () => roleManagementApi.getPageTree(audience!),
    enabled: Boolean(audience),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true
  });

  // Passive background session synchronization to keep state fresh without causing hydration waterfalls
  const { data: clientSession, isPending } = useSession();

  React.useEffect(() => {
    if (isPending) return;

    if (clientSession?.user) {
      const clientUser = clientSession.user as {
        id: string;
        name?: string | null;
        email?: string | null;
        phone?: string | null;
        image?: string | null;
        role?: string | null;
        banned?: boolean | null;
        audience?: AudienceType;
        permissions?: string[];
      };

      const resolvedAudience = clientUser.audience ?? initialAudience ?? null;
      const permissions =
        clientUser.permissions && clientUser.permissions.length > 0
          ? clientUser.permissions
          : (initialUser?.permissions ?? []);

      setUser((prev) => {
        if (
          prev?.id === clientUser.id &&
          prev?.role === clientUser.role &&
          prev?.name === clientUser.name &&
          prev?.email === clientUser.email &&
          prev?.image === clientUser.image &&
          prev?.audience === resolvedAudience
        ) {
          return prev;
        }
        return {
          id: clientUser.id,
          name: clientUser.name,
          email: clientUser.email,
          phone: clientUser.phone ?? null,
          image: clientUser.image,
          role: clientUser.role,
          banned: clientUser.banned,
          audience: resolvedAudience ?? undefined,
          permissions
        };
      });

      setRole(clientUser.role ?? null);
      setAudience(resolvedAudience);
      setStatus('allow');

      // Preserve dynamic database order SSOT: keep dynamic groups synchronized with latest permissions
      if (resolvedAudience && pageTree && pageTree.length > 0) {
        const dynamicGroups = mapPageTreeToNavGroups(
          pageTree as DynamicPageNode[],
          resolvedAudience,
          initialUser?.accessibleRoutes
        );
        if (dynamicGroups.length > 0) {
          setNavGroups(dynamicGroups);
        }
      }
    } else if (clientSession === null && !initialUser) {
      // Explicitly unauthenticated on client
      setUser(null);
      setRole(null);
      setAudience(null);
      setStatus('deny');
      setNavGroups([]);
    }
  }, [clientSession, isPending, initialUser, initialAudience, pageTree]);

  React.useEffect(() => {
    if (pageTree && pageTree.length > 0 && audience) {
      const dynamicGroups = mapPageTreeToNavGroups(
        pageTree as DynamicPageNode[],
        audience,
        user?.accessibleRoutes ?? initialUser?.accessibleRoutes
      );
      if (dynamicGroups.length > 0) {
        setNavGroups(dynamicGroups);
      }
    }
  }, [pageTree, audience, user?.accessibleRoutes, initialUser?.accessibleRoutes]);

  const can = React.useCallback(
    (permission: string): boolean => {
      if (status !== 'allow' || !user) return false;
      const perms = user.permissions ?? [];
      return perms.includes('*') || perms.includes(permission);
    },
    [status, user]
  );

  const value = React.useMemo<AuthContextValue>(
    () => ({
      status,
      isReady: status !== 'unknown',
      user,
      role,
      audience,
      navGroups,
      can
    }),
    [status, user, role, audience, navGroups, can]
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
      audience: null,
      navGroups: [],
      can: () => false
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
  const { user, role, audience, status, isReady } = useAuthContext();
  return { user, role, audience, status, isReady };
}

/**
 * Checks whether the current principal has a specific permission.
 */
export function useCan(permission: string): boolean {
  const { can } = useAuthContext();
  return can(permission);
}

/**
 * Returns current audience (internal or external).
 */
export function useAudience(): AudienceType | null {
  const { audience } = useAuthContext();
  return audience;
}
