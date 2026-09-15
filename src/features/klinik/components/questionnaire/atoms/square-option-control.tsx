'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export interface SquareOptionControlProps {
  label?: string;
  checked: boolean;
  onClick: () => void;
  variant?: 'negative' | 'positive' | 'default';
  ariaLabel: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export function SquareOptionControl({
  label,
  checked,
  onClick,
  variant = 'default',
  ariaLabel,
  size = 'md',
  className,
  disabled = false
}: SquareOptionControlProps) {
  const isPositive = variant === 'positive' || label?.toLowerCase() === 'ya';
  const isNegative = variant === 'negative' || label?.toLowerCase() === 'tidak';

  return (
    <button
      type='button'
      role='radio'
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'group inline-flex cursor-pointer items-center gap-2 select-none outline-none transition-all duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
    >
      <span
        className={cn(
          'relative flex shrink-0 items-center justify-center rounded-[5px] border border-input transition-all duration-150 shadow-2xs',
          size === 'sm' && 'size-4.5',
          size === 'md' && 'size-5.5',
          size === 'lg' && 'size-6.5',
          // Unchecked states
          !checked && 'bg-background hover:border-primary/60 hover:bg-accent/40',
          // Checked positive ('Ya')
          checked &&
            isPositive &&
            'border-primary bg-primary text-primary-foreground shadow-xs shadow-primary/20',
          // Checked negative ('Tidak')
          checked &&
            isNegative &&
            'border-foreground/80 bg-foreground text-background shadow-xs dark:border-foreground/90 dark:bg-foreground dark:text-background',
          // Checked default
          checked &&
            !isPositive &&
            !isNegative &&
            'border-primary bg-primary text-primary-foreground',
          // Focus ring
          'group-focus-visible:border-ring group-focus-visible:ring-[3px] group-focus-visible:ring-ring/40'
        )}
      >
        {checked ? (
          isNegative ? (
            <Icons.check
              className={cn(
                'stroke-[2.8]',
                size === 'sm' && 'size-3',
                size === 'md' && 'size-3.5',
                size === 'lg' && 'size-4'
              )}
            />
          ) : (
            <Icons.check
              className={cn(
                'stroke-[2.8]',
                size === 'sm' && 'size-3',
                size === 'md' && 'size-3.5',
                size === 'lg' && 'size-4'
              )}
            />
          )
        ) : null}
      </span>

      {label ? (
        <span
          className={cn(
            'text-xs font-medium transition-colors',
            checked
              ? 'text-foreground font-semibold'
              : 'text-muted-foreground group-hover:text-foreground'
          )}
        >
          {label}
        </span>
      ) : null}
    </button>
  );
}
