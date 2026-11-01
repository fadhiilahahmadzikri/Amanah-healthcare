'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { SideTrayLayoutProps } from '../side-tray.types';

/**
 * Agnostic layout component that places main content and SideTray side-by-side.
 * When the SideTray opens or closes on desktop, the main content area smoothly adjusts its width.
 * The main content container provides vertical scrolling for cards/tables while keeping headers pinned.
 * On mobile/tablet (< 1024px), main content retains full width and the tray operates in floating mode.
 */
export function SideTrayLayout({
  children,
  tray,
  className,
  contentClassName
}: SideTrayLayoutProps) {
  return (
    <div
      className={cn(
        'relative flex flex-1 min-h-0 flex-col lg:flex-row items-start w-full gap-4 h-full',
        className
      )}
    >
      <div
        className={cn(
          'w-full lg:flex-1 min-w-0 h-full overflow-y-auto pr-1 sm:pr-2 pb-20 transition-all duration-300 ease-out scrollbar-thin',
          contentClassName
        )}
      >
        {children}
      </div>
      {tray}
    </div>
  );
}
