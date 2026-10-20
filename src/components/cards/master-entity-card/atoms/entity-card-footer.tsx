'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { EntityCardFooterProps } from '../types';

export function EntityCardFooter({
  secondaryAction,
  primaryAction,
  className
}: EntityCardFooterProps) {
  if (!secondaryAction && !primaryAction) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2 sm:gap-1.5 pt-2.5 sm:pt-2 mt-auto border-t border-border/40 relative z-20',
        className
      )}
    >
      {secondaryAction}
      {primaryAction}
    </div>
  );
}

export function EntityCardPrimaryAction({
  label,
  onClick,
  title,
  icon,
  className
}: {
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <Button
      type='button'
      variant='default'
      onClick={onClick}
      title={title || label}
      aria-label={title || label}
      className={cn(
        'h-10 sm:h-8.5 xl:h-8 pl-3.5 pr-1.5 sm:pl-3 sm:pr-1.5 xl:pl-2.5 xl:pr-1 rounded-lg sm:rounded-md text-xs sm:text-[11.5px] xl:text-[11px] font-bold shrink-0 gap-2 sm:gap-1.5 shadow-xs',
        className
      )}
    >
      <span>{label}</span>
      <span className='size-6 sm:size-5.5 xl:size-5 rounded-[6px] sm:rounded-[5px] bg-primary-foreground text-primary flex items-center justify-center shrink-0 shadow-2xs'>
        {icon || <Icons.arrowUpRight className='size-3.5 sm:size-3 xl:size-2.5 stroke-[2.5]' />}
      </span>
    </Button>
  );
}

export function EntityCardSecondaryAction({
  label,
  shortLabel,
  onClick,
  title,
  icon,
  className
}: {
  label: string;
  shortLabel?: string;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <Button
      type='button'
      variant='outline'
      onClick={onClick}
      title={title || label}
      aria-label={title || label}
      className={cn(
        'h-10 sm:h-8.5 xl:h-8 px-3.5 sm:px-2.5 xl:px-2 rounded-lg sm:rounded-md text-xs sm:text-[11.5px] xl:text-[11px] font-semibold text-muted-foreground hover:text-foreground shrink-0 gap-1.5 shadow-2xs',
        className
      )}
    >
      {icon || (
        <Icons.calendar className='size-3.5 sm:size-3.5 xl:size-3 text-muted-foreground shrink-0' />
      )}
      <span className='inline xl:hidden'>{label}</span>
      <span className='hidden xl:inline'>{shortLabel || label}</span>
    </Button>
  );
}
