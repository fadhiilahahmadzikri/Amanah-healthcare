'use client';

import { useMemo } from 'react';
import type { NavItem, NavGroup } from '@/types';
import { useAuthContext } from '@/lib/rbac/auth-context';
import { filterNavGroupsByRole, filterNavItemsByRole } from '@/lib/rbac/navigation';

/**
 * Filter navigation items using the authoritative Server-First Authorization Context.
 * Replaces the client-side hydration waterfall with instant zero-flicker projection.
 */
export function useFilteredNavItems(items: NavItem[]): NavItem[] {
  const { role, isReady } = useAuthContext();

  return useMemo(() => {
    if (!isReady || !role) {
      return [];
    }
    return filterNavItemsByRole(items, role);
  }, [items, role, isReady]);
}

/**
 * Returns filtered navigation groups using the authoritative Server-First Authorization Context.
 * Guarantees zero hydration flicker and instant first paint.
 */
export function useFilteredNavGroups(groups: NavGroup[]): NavGroup[] {
  const { navGroups, role, isReady } = useAuthContext();

  return useMemo(() => {
    if (isReady && navGroups.length > 0) {
      return navGroups;
    }
    if (!isReady || !role) {
      return [];
    }
    return filterNavGroupsByRole(groups, role);
  }, [groups, navGroups, role, isReady]);
}
