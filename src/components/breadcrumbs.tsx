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
import { Icons } from '@/components/icons';
import { Fragment } from 'react';

export function Breadcrumbs() {
  const items = useBreadcrumbs();
  if (items.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const hasLink = item.link && item.link !== '#';

          return (
            <Fragment key={`${item.title}-${index}`}>
              {!isLast ? (
                <BreadcrumbItem className='hidden md:block'>
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
                <BreadcrumbSeparator className='hidden md:block'>
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
