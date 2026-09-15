'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export interface YearInputControlProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  size?: 'sm' | 'md';
  onEnter?: () => void;
  className?: string;
  error?: string;
  ariaLabel?: string;
  id?: string;
}

export function YearInputControl({
  value,
  onChange,
  placeholder = 'Contoh: 2021',
  autoFocus = false,
  size = 'md',
  onEnter,
  className,
  error,
  ariaLabel = 'Tahun kejadian atau diagnosis',
  id
}: YearInputControlProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numeric digits up to 4 characters
    const numeric = e.target.value.replace(/\D/g, '').slice(0, 4);
    onChange(numeric);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnter?.();
    }
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div
        className={cn(
          'flex items-center gap-2 rounded-md border border-input bg-background/80 px-2.5 shadow-2xs transition-[color,box-shadow,border-color]',
          size === 'sm' ? 'h-8 text-xs' : 'h-9 text-sm',
          'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/40',
          error &&
            'border-destructive focus-within:border-destructive focus-within:ring-destructive/30'
        )}
      >
        <Icons.calendar className='size-3.5 shrink-0 text-muted-foreground/70' />
        <input
          ref={inputRef}
          id={id}
          type='text'
          inputMode='numeric'
          pattern='[0-9]*'
          maxLength={4}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className='w-full min-w-0 border-0 bg-transparent p-0 font-medium text-foreground placeholder:font-normal placeholder:text-muted-foreground/60 outline-none'
        />
        {value ? (
          <button
            type='button'
            onClick={() => onChange('')}
            aria-label='Hapus tahun'
            className='size-4 rounded-full text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center'
          >
            <Icons.close className='size-3' />
          </button>
        ) : null}
      </div>
      {error ? <p className='mt-1 text-[11px] text-destructive'>{error}</p> : null}
    </div>
  );
}
