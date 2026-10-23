'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export interface SurfaceCoreOrganismProps {
  headerSlot?: React.ReactNode;
  identitySlot?: React.ReactNode;
  contentSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
  children?: React.ReactNode;
  shadowDirection?: 'down' | 'up';
  className?: string;
}

/**
 * Organism: SurfaceCoreOrganism
 * Stacked surface card from card-stack-v2.
 * Renders on top of StackedCardShelter (relative z-10) with full rounded corners
 * and downward drop-shadow, creating the pure floating stack effect.
 * Composes a deep matte radial overlay in Dark Mode and a luminous radial specular
 * gradient in Light Mode on top of the active theme's `var(--card)`.
 */
export function SurfaceCoreOrganism({
  headerSlot,
  identitySlot,
  contentSlot,
  actionsSlot,
  children,
  shadowDirection = 'down',
  className
}: SurfaceCoreOrganismProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : true;

  const surfaceStyle = isDark
    ? {
        backgroundImage: `
          radial-gradient(110% 90% at 50% 0%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 45%, transparent 100%),
          linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(0, 0, 0, 0.28) 100%)
        `,
        boxShadow:
          shadowDirection === 'up'
            ? '0 -8px 20px -4px rgba(0, 0, 0, 0.55), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)'
            : '0 10px 22px -4px rgba(0, 0, 0, 0.55), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)'
      }
    : {
        backgroundImage: `
          radial-gradient(110% 90% at 50% 0%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.45) 50%, transparent 100%),
          linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(0, 0, 0, 0.03) 100%)
        `,
        boxShadow:
          shadowDirection === 'up'
            ? '0 -6px 16px -3px rgba(0, 0, 0, 0.1), inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.95)'
            : '0 8px 18px -4px rgba(0, 0, 0, 0.12), inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.95)'
      };

  return (
    <div
      className={cn(
        'w-full rounded-[22px] p-3.5 sm:p-4 flex flex-col justify-between flex-1 relative z-10 transition-colors duration-300 overflow-hidden',
        'bg-card text-card-foreground',
        className
      )}
      style={surfaceStyle}
    >
      {children ? (
        children
      ) : (
        <>
          {headerSlot}
          {identitySlot}
          {contentSlot}
          {actionsSlot}
        </>
      )}
    </div>
  );
}
