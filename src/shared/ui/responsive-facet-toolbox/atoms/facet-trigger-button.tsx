'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface FacetTriggerButtonProps {
  activeCount?: number;
  onClick: () => void;
  className?: string;
}

export function FacetTriggerButton({
  activeCount = 0,
  onClick,
  className
}: FacetTriggerButtonProps) {
  const isFiltered = activeCount > 0;

  return (
    <Button
      type='button'
      variant={isFiltered ? 'primary' : 'outline'}
      size='sm'
      onClick={onClick}
      className={cn(
        'h-8 text-xs font-medium border-dashed gap-1.5 px-3 select-none cursor-pointer',
        isFiltered && 'shadow-2xs font-semibold',
        className
      )}
      aria-label={`Buka panel filter (${activeCount} filter aktif)`}
    >
      <Icons.filter className='size-3.5 shrink-0' />
      <span>Filter</span>
      {isFiltered && (
        <Badge
          variant='secondary'
          className='size-4 rounded-full p-0 text-[10px] font-bold flex items-center justify-center shrink-0 leading-none'
        >
          {activeCount}
        </Badge>
      )}
    </Button>
  );
}
