'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { navGroups } from '@/config/nav-config';

export type BreadcrumbItem = {
  title: string;
  link: string;
};

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    if (!pathname) return [];

    // 1. Search in navGroups (Single Source of Truth)
    for (const group of navGroups) {
      for (const parentItem of group.items) {
        if (parentItem.items && parentItem.items.length > 0) {
          for (const subItem of parentItem.items) {
            if (pathname === subItem.url || pathname.startsWith(`${subItem.url}/`)) {
              const result: BreadcrumbItem[] = [
                {
                  title: parentItem.title,
                  link: parentItem.url !== '#' ? parentItem.url : ''
                },
                {
                  title: subItem.title,
                  link: subItem.url
                }
              ];

              // Handle detail/nested subpaths (e.g. /admin/data-pasien/[id])
              if (pathname.length > subItem.url.length) {
                const subPath = pathname.slice(subItem.url.length).replace(/^\//, '');
                if (subPath) {
                  result.push({
                    title: decodeURIComponent(subPath),
                    link: pathname
                  });
                }
              }

              return result;
            }
          }
        } else if (parentItem.url && parentItem.url !== '#') {
          if (pathname === parentItem.url || pathname.startsWith(`${parentItem.url}/`)) {
            return [
              {
                title: parentItem.title,
                link: parentItem.url
              }
            ];
          }
        }
      }
    }

    // 2. Specific Standalone Routes
    if (pathname === '/admin/profile' || pathname.startsWith('/admin/profile/')) {
      return [
        { title: 'Amanah Admin', link: '' },
        { title: 'Profil Saya', link: '/admin/profile' }
      ];
    }

    if (pathname === '/klinik/profile' || pathname.startsWith('/klinik/profile/')) {
      return [
        { title: 'Klinik', link: '' },
        { title: 'Profil Pasien', link: '/klinik/profile' }
      ];
    }

    if (pathname === '/admin/settings' || pathname.startsWith('/admin/settings/')) {
      return [
        { title: 'Amanah Admin', link: '' },
        { title: 'Pengaturan Sistem', link: '/admin/settings' }
      ];
    }

    // 3. Fallback: Split segments gracefully
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        link: path
      };
    });
  }, [pathname]);

  return breadcrumbs;
}
