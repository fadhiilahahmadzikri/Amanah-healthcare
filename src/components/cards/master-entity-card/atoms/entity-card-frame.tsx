'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { EntityCardFrameProps } from '../types';

export function EntityCardFrame({
  isSelected,
  isPending,
  variant = 'default',
  className,
  children,
  onCardClick,
  cardRef
}: EntityCardFrameProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCardClick?.();
    }
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: card container contains interactive action buttons
    <div
      ref={cardRef}
      role='button'
      tabIndex={0}
      onClick={onCardClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'group relative font-sans flex flex-col rounded-[20px] sm:rounded-[18px] border border-border bg-card text-card-foreground shadow-xs transition-all duration-200 hover:border-primary/60 hover:shadow-md overflow-hidden select-none cursor-pointer',
        isPending && 'opacity-75 border-dashed bg-muted/20',
        isSelected &&
          'ring-2 ring-primary/40 ring-offset-2 ring-offset-background border-primary/50 shadow-md',
        variant === 'elevated' && 'shadow-sm',
        variant === 'flat' && 'border-transparent shadow-none',
        className
      )}
    >
      {children}
    </div>
  );
}

export function EntityCardInnerStitchFrame({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-[15px] sm:rounded-[13px] border border-dashed border-border/80 dark:border-white/10 p-3.5 sm:p-4 flex flex-col justify-between flex-1 min-h-[162px] sm:min-h-[158px] bg-card dark:bg-card/40 transition-colors',
        className
      )}
    >
      {children}
    </div>
  );
}
