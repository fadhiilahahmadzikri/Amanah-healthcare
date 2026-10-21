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
        'flex items-center justify-end gap-2 sm:gap-1.5 mt-3 sm:mt-2.5 relative z-20',
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
      size='sm'
      onClick={onClick}
      title={title || label}
      aria-label={title || label}
      className={cn(
        'h-8 sm:h-8.5 py-0 pl-3 pr-1.5 rounded-lg sm:rounded-md text-xs sm:text-[11.5px] font-bold shrink-0 inline-flex items-center gap-1.5 shadow-xs',
        className
      )}
    >
      <span>{label}</span>
      <span className='size-5 rounded-[5px] bg-primary-foreground text-primary flex items-center justify-center shrink-0 shadow-2xs'>
        {icon || <Icons.arrowUpRight className='size-3 stroke-[2.5]' />}
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
      size='sm'
      onClick={onClick}
      title={title || label}
      aria-label={title || label}
      className={cn(
        'h-8 sm:h-8.5 py-0 px-3 rounded-lg sm:rounded-md text-xs sm:text-[11.5px] font-semibold text-muted-foreground hover:text-foreground shrink-0 inline-flex items-center gap-1.5 shadow-2xs',
        className
      )}
    >
      {icon || <Icons.calendar className='size-3.5 text-muted-foreground shrink-0' />}
      <span className='inline xl:hidden'>{label}</span>
      <span className='hidden xl:inline'>{shortLabel || label}</span>
    </Button>
  );
}
