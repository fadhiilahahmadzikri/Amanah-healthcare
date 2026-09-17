import type { NavGroup, NavItem } from '@/types';

export type SupportedRole = 'admin' | 'patient';

/**
 * Pure synchronous navigation filter based on principal role.
 * Fail-Closed: If role is not provided or unknown, returns empty array.
 */
export function filterNavGroupsByRole(groups: NavGroup[], rawRole?: string | null): NavGroup[] {
  if (!rawRole) return [];

  const role: SupportedRole = rawRole === 'admin' ? 'admin' : 'patient';

  return groups
    .map((group) => {
      const items = filterNavItemsByRole(group.items, role);
      return { ...group, items };
    })
    .filter((group) => group.items.length > 0);
}

/**
 * Pure recursive filter for NavItem array based on role access rules.
 */
export function filterNavItemsByRole(items: NavItem[], role: SupportedRole): NavItem[] {
  return items
    .filter((item) => {
      if (!item.access?.role) return true;
      return item.access.role === role;
    })
    .map((item) => {
      if (item.items && item.items.length > 0) {
        const children = filterNavItemsByRole(item.items, role);
        return { ...item, items: children };
      }
      return item;
    })
    .filter((item) => {
      // If item originally had children but all were filtered out, hide parent
      if (item.items && item.items.length === 0) return false;
      return true;
    });
}
