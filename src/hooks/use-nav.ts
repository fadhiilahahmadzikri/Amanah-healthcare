'use client';

import { useMemo } from 'react';
import type { NavItem, NavGroup } from '@/types';
import { useAuthContext } from '@/lib/rbac/auth-context';
import { filterNavGroupsByAccess, filterNavItemsByAccess } from '@/lib/rbac/navigation';

/**
 * Filter navigation items using the authoritative Server-First Authorization Context.
 * Replaces the client-side hydration waterfall with instant zero-flicker projection.
 */
export function useFilteredNavItems(items: NavItem[]): NavItem[] {
  const { user, isReady } = useAuthContext();

  return useMemo(() => {
    if (!isReady || !user?.audience) {
      return [];
    }
    return filterNavItemsByAccess(items, user.audience, user.permissions, user.accessibleRoutes);
  }, [items, user, isReady]);
}

/**
 * Returns filtered navigation groups using the authoritative Server-First Authorization Context.
 * Guarantees zero hydration flicker and instant first paint.
 */
export function useFilteredNavGroups(groups: NavGroup[]): NavGroup[] {
  const { navGroups, user, isReady } = useAuthContext();

  return useMemo(() => {
    if (isReady && navGroups.length > 0) {
      return navGroups;
    }
    if (!isReady || !user?.audience) {
      return [];
    }
    return filterNavGroupsByAccess(groups, user.audience, user.permissions, user.accessibleRoutes);
  }, [groups, navGroups, user, isReady]);
}
