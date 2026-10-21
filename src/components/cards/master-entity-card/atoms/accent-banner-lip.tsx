'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { CardThemeVisuals } from '../theme-tokens';

export interface AccentBannerLipProps {
  label: string;
  visuals?: CardThemeVisuals;
  icon?: React.ReactNode;
  iconName?: 'zap' | 'clock' | 'calendar' | 'none';
  className?: string;
}

/**
 * Molecule: AccentBannerLip
 * Bottom banner lip slot from card-stack-v2.
 * Renders inside StackedCardShelter underneath the floating SurfaceCoreOrganism.
 * Inherits the vibrant base gradient from the shelter.
 */
export function AccentBannerLip({
  label,
  visuals,
  icon,
  iconName = 'none',
  className
}: AccentBannerLipProps) {
  const renderedIcon = React.useMemo(() => {
    if (icon) return icon;
    switch (iconName) {
      case 'calendar':
        return <Icons.calendar className='size-3.5 shrink-0 opacity-85' />;
      case 'clock':
        return <Icons.clock className='size-3.5 shrink-0 opacity-85' />;
      case 'zap':
        return (
          <svg
            className='size-3.5 shrink-0'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2.2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2' />
          </svg>
        );
      default:
        return null;
    }
  }, [icon, iconName]);

  return (
    <div
      className={cn(
        'w-full h-8 sm:h-8.5 px-4 flex items-center justify-center gap-1.5 text-[12px] sm:text-[12.5px] font-bold tracking-tight select-none',
        className
      )}
      style={{
        color: visuals?.textColor
      }}
    >
      {renderedIcon}
      <span className='truncate drop-shadow-[0_0.5px_1px_rgba(0,0,0,0.06)]'>{label}</span>
    </div>
  );
}
