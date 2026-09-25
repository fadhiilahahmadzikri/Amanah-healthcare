'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'default' | 'md' | 'lg' | 'xl';
}

export function Spinner({ className, size = 'md', ...props }: SpinnerProps) {
  return (
    <div
      role='status'
      aria-label='Loading'
      className={cn(
        'relative inline-block shrink-0 select-none',
        size === 'xs' && 'size-3',
        size === 'sm' && 'size-3.5',
        (size === 'md' || size === 'default') && 'size-4',
        size === 'lg' && 'size-6',
        size === 'xl' && 'size-8',
        className
      )}
      {...props}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className='spinner-blade' />
      ))}
    </div>
  );
}
