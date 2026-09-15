'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Pencarian...',
  ariaLabel = 'Pencarian',
  className
}: SearchInputProps) {
  return (
    <div className={cn('relative flex-1 min-w-[200px] max-w-[280px]', className)}>
      <Icons.search className='size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none' />
      <Input
        type='text'
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className='h-8 pl-8 pr-3 text-xs bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary shadow-2xs'
      />
    </div>
  );
}
