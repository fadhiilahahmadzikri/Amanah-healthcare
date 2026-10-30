import type { NavGroup, NavItem } from '@/types';
import type { AudienceType } from '@/core/auth/permissions.constants';

/**
 * Pure synchronous navigation filter based on principal access context.
 * Fail-Closed: If audience is not provided or empty, returns empty array.
 */
export function filterNavGroupsByAccess(
  groups: NavGroup[],
  audience?: AudienceType | null,
  permissions?: string[]
): NavGroup[] {
  if (!audience) return [];

  return groups
    .map((group) => {
      const items = filterNavItemsByAccess(group.items, audience, permissions);
      return { ...group, items };
    })
    .filter((group) => group.items.length > 0);
}

/**
 * Pure recursive filter for NavItem array based on audience and granular permissions.
 */
export function filterNavItemsByAccess(
  items: NavItem[],
  audience: AudienceType,
  permissions?: string[]
): NavItem[] {
  const userPerms = permissions ?? [];
  const hasWildcard = userPerms.includes('*');

  return items
    .filter((item) => {
      // 1. Audience verification
      if (item.access?.audience && item.access.audience !== audience) {
        return false;
      }

      // 2. Granular permission verification
      if (item.access?.permission) {
        if (!hasWildcard && !userPerms.includes(item.access.permission)) {
          return false;
        }
      }

      return true;
    })
    .map((item) => {
      if (item.items && item.items.length > 0) {
        const children = filterNavItemsByAccess(item.items, audience, permissions);
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
