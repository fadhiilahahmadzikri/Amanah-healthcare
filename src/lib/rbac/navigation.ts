import type { NavGroup, NavItem } from '@/types';
import type { AudienceType } from '@/core/auth/permissions.constants';

/**
 * Pure synchronous navigation filter based on principal access context.
 * Fail-Closed: If audience is not provided or empty, returns empty array.
 */
export function filterNavGroupsByAccess(
  groups: NavGroup[],
  audience?: AudienceType | null,
  permissions?: string[],
  accessibleRoutes?: string[]
): NavGroup[] {
  if (!audience) return [];

  return groups
    .map((group) => {
      const items = filterNavItemsByAccess(group.items, audience, permissions, accessibleRoutes);
      return { ...group, items };
    })
    .filter((group) => group.items.length > 0);
}

/**
 * Pure recursive filter for NavItem array based on audience, granular permissions,
 * and dynamic CMS application page availability.
 */
export function filterNavItemsByAccess(
  items: NavItem[],
  audience: AudienceType,
  permissions?: string[],
  accessibleRoutes?: string[]
): NavItem[] {
  const userPerms = permissions ?? [];
  const hasWildcard = userPerms.includes('*');
  const allowedRouteSet = accessibleRoutes ? new Set(accessibleRoutes) : null;

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

      // 3. Dynamic CMS Application Page verification
      if (allowedRouteSet && item.url && item.url !== '#') {
        if (!allowedRouteSet.has(item.url)) {
          return false;
        }
      }

      return true;
    })
    .map((item) => {
      if (item.items && item.items.length > 0) {
        const children = filterNavItemsByAccess(
          item.items,
          audience,
          permissions,
          accessibleRoutes
        );
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
