'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';
import { useSidebar } from '@/components/ui/sidebar';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Icons } from '@/components/icons';
import { Fragment } from 'react';

export function Breadcrumbs() {
  const items = useBreadcrumbs();
  const { state: sidebarState } = useSidebar();
  const { isOpen: isUnder1024 } = useMediaQuery('(max-width: 1024px)');
  const { isOpen: isUnder1280 } = useMediaQuery('(max-width: 1280px)');

  if (items.length === 0) return null;

  const isSidebarExpanded = sidebarState === 'expanded';
  const isCompact = isUnder1024 || (isUnder1280 && isSidebarExpanded);

  // Jika tampilan compact (misal layar kecil atau sidebar terbuka), prioritaskan parent
  if (isCompact && items.length > 1) {
    const parent = items[0];
    const hasLink = parent.link && parent.link !== '#';

    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {hasLink ? (
              <BreadcrumbLink href={parent.link}>{parent.title}</BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{parent.title}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const hasLink = item.link && item.link !== '#';

          return (
            <Fragment key={`${item.title}-${index}`}>
              {!isLast ? (
                <BreadcrumbItem>
                  {hasLink ? (
                    <BreadcrumbLink href={item.link}>{item.title}</BreadcrumbLink>
                  ) : (
                    <span className='font-normal text-muted-foreground select-none'>
                      {item.title}
                    </span>
                  )}
                </BreadcrumbItem>
              ) : (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              )}
              {!isLast && (
                <BreadcrumbSeparator>
                  <Icons.slash />
                </BreadcrumbSeparator>
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
