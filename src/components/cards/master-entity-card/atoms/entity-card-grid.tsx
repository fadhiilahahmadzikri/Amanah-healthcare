import React from 'react';
import { cn } from '@/lib/utils';
import type { EntityCardGridProps } from '../types';

/**
 * Responsive Grid Layout for Master Cards:
 * - Mobile (<640px): 1 column
 * - Small tablet / portrait (640px - 1023px): 2 columns
 * - Tablet landscape & laptop half-screen split view (1024px - 1279px): exactly 3 columns
 * - Full desktop (1280px - 1535px): 4 columns
 * - Ultra-wide monitors (1536px+): 5 columns
 */
export const ENTITY_CARD_GRID_CLASS =
  'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4';

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
          className='h-[195px] sm:h-[188px] rounded-[22px] bg-muted/20 animate-pulse border border-border/40'
        />
      ))}
    </div>
  );
}
