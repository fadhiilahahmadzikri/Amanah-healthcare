'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { CardThemeVisuals } from '../theme-tokens';

export interface StackedCardShelterProps {
  visuals: CardThemeVisuals;
  mainBodySlot?: React.ReactNode;
  children?: React.ReactNode;
  topLipSlot?: React.ReactNode;
  bottomLipSlot?: React.ReactNode;
  glowPosition?: 'bottom' | 'top';
  isSelected?: boolean;
  isPending?: boolean;
  onClick?: () => void;
  cardRef?: React.Ref<HTMLDivElement>;
  className?: string;
  interactiveClass?: string;
}

/**
 * Shelter: StackedCardShelter
 * Base plate / chassis wrapper from card-stack-v2.
 * Holds the vibrant theme gradient as its background, supporting stacked surface
 * and lip slots with clean neutral elevation (no colored neon glow).
 */
export function StackedCardShelter({
  visuals,
  mainBodySlot,
  children,
  topLipSlot,
  bottomLipSlot,
  glowPosition = 'bottom',
  isSelected,
  isPending,
  onClick,
  cardRef,
  className,
  interactiveClass
}: StackedCardShelterProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  // Clean neutral elevation shadows (zero neon glow as requested)
  const outerBoxShadow =
    glowPosition === 'top'
      ? '0 16px 32px -12px rgba(0, 0, 0, 0.22), 0 2px 8px -2px rgba(0, 0, 0, 0.06)'
      : '0 12px 28px -10px rgba(0, 0, 0, 0.18), 0 2px 6px -1px rgba(0, 0, 0, 0.06)';

  return (
    // biome-ignore lint/a11y/useSemanticElements: card container contains interactive action buttons
    <div
      ref={cardRef}
      role='button'
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'group relative font-sans flex flex-col w-full rounded-[22px] select-none cursor-pointer transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:scale-[0.99]',
        isPending && 'opacity-80',
        isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        interactiveClass,
        className
      )}
      style={{
        background: visuals.gradient,
        color: visuals.textColor,
        boxShadow: outerBoxShadow
      }}
    >
      {/* SLOT 1: Top Lip Slot (Optional) */}
      {topLipSlot && <div className='w-full shrink-0'>{topLipSlot}</div>}

      {/* SLOT 2: Main Core Body Slot (SurfaceCoreOrganism) */}
      {mainBodySlot || children}

      {/* SLOT 3: Bottom Lip / Drawer Slot (AccentBannerLip) */}
      {bottomLipSlot && <div className='w-full shrink-0'>{bottomLipSlot}</div>}
    </div>
  );
}
