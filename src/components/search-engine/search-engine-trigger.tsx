'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SearchEngineTriggerProps } from './types';

export function SearchEngineTrigger({
  config,
  isOpen: _isOpen,
  onOpen,
  className,
  ariaLabel,
  variant = 'icon',
  showBadge = true
}: SearchEngineTriggerProps) {
  const isQueryActive = Boolean(config.query && config.query.trim().length > 0);

  if (variant === 'pill') {
    return (
      <Button
        type='button'
        variant={isQueryActive ? 'primary' : 'outline'}
        onClick={onOpen}
        aria-label={ariaLabel || `Pencarian ${config.title}`}
        className={cn(
          'h-8.5 px-3 rounded-xl gap-2 text-xs font-medium relative cursor-pointer transition-colors',
          isQueryActive && 'shadow-2xs font-semibold',
          className
        )}
      >
        <Icons.search className='size-3.5 shrink-0' />
        <span className='truncate max-w-[120px]'>
          {isQueryActive ? config.query : config.placeholder || 'Cari...'}
        </span>
        {isQueryActive && showBadge && (
          <span className='size-2 rounded-full bg-primary-foreground ring-2 ring-primary animate-pulse' />
        )}
      </Button>
    );
  }

  // Default: Icon-based button for minimalist dock toolbars
  return (
    <Button
      type='button'
      variant={isQueryActive ? 'primary' : 'outline'}
      size='icon'
      onClick={onOpen}
      aria-label={ariaLabel || `Pencarian ${config.title}`}
      title={isQueryActive ? `Filter pencarian aktif: "${config.query}"` : config.title}
      className={cn(
        'size-8.5 rounded-xl relative cursor-pointer transition-colors shrink-0',
        isQueryActive && 'shadow-2xs font-bold',
        className
      )}
    >
      <Icons.search className='size-4' />
      {isQueryActive && showBadge && (
        <span className='absolute -top-1 -right-1 size-2.5 rounded-full bg-primary-foreground ring-2 ring-primary animate-pulse' />
      )}
    </Button>
  );
}
