import type { NavGroup, NavItem } from '@/types';
import type { AudienceType } from '@/core/auth/permissions.constants';
import { navGroups as baselineNavGroups } from '@/config/nav-config';

const shortcutMap = new Map<string, [string, string]>();
for (const group of baselineNavGroups) {
  for (const item of group.items) {
    if (item.shortcut) shortcutMap.set(item.url, item.shortcut);
    for (const sub of item.items || []) {
      if (sub.shortcut) shortcutMap.set(sub.url, sub.shortcut);
    }
  }
}

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

export interface DynamicPageNode {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  routePath: string;
  parentPageId?: string | null;
  audience: string;
  isEnabled: boolean;
  icon?: string | null;
  displayOrder: number;
  children?: DynamicPageNode[];
}

/**
 * Projects the authoritative database Application Pages Tree into dynamic NavGroups.
 * Respects display_order, icons, dynamic names, and folder nesting.
 */
export function mapPageTreeToNavGroups(
  pageTree: DynamicPageNode[],
  audience: AudienceType,
  accessibleRoutes?: string[]
): NavGroup[] {
  if (!pageTree || pageTree.length === 0) return [];

  const allowedRouteSet = accessibleRoutes ? new Set(accessibleRoutes) : null;
  const filteredParents = pageTree
    .filter((p) => p.audience === audience && p.isEnabled)
    .toSorted((a, b) => a.displayOrder - b.displayOrder);

  const items: NavItem[] = [];

  for (const parent of filteredParents) {
    const rawChildren = parent.children || [];
    const validChildren = rawChildren
      .filter((c) => c.isEnabled)
      .filter((c) => !allowedRouteSet || c.routePath === '#' || allowedRouteSet.has(c.routePath))
      .toSorted((a, b) => a.displayOrder - b.displayOrder);

    if (validChildren.length > 0) {
      items.push({
        title: parent.name,
        url: parent.routePath || '#',
        icon: parent.icon || 'folder',
        shortcut: shortcutMap.get(parent.routePath),
        isActive: true,
        items: validChildren.map((c) => ({
          title: c.name,
          url: c.routePath,
          icon: c.icon || 'file',
          shortcut: shortcutMap.get(c.routePath),
          description: c.description || undefined
        }))
      });
    } else if (parent.routePath && parent.routePath !== '#') {
      if (!allowedRouteSet || allowedRouteSet.has(parent.routePath)) {
        items.push({
          title: parent.name,
          url: parent.routePath,
          icon: parent.icon || 'file',
          shortcut: shortcutMap.get(parent.routePath),
          description: parent.description || undefined
        });
      }
    }
  }

  return [
    {
      label: audience === 'internal' ? 'Amanah Admin' : 'Klinik',
      items
    }
  ];
}
