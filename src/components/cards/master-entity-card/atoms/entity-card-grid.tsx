import React from 'react';
import { cn } from '@/lib/utils';
import type { EntityCardGridProps } from '../types';

export const ENTITY_CARD_GRID_CLASS =
  'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-3.5';

export function EntityCardGrid({ children, className }: EntityCardGridProps) {
  return <div className={cn(ENTITY_CARD_GRID_CLASS, className)}>{children}</div>;
}

export function EntityCardGridSkeleton({
  count = 10,
  className
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn(ENTITY_CARD_GRID_CLASS, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: placeholder skeleton cards
          key={index}
          className='h-[195px] sm:h-[188px] xl:h-[180px] rounded-[20px] bg-muted/20 animate-pulse border border-border/40'
        />
      ))}
    </div>
  );
}
