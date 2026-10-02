'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PatientLineTextareaProps {
  id: string;
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  invalid?: boolean;
  disabled?: boolean;
  rows?: number;
  containerClassName?: string;
  className?: string;
}

export function PatientLineTextarea({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  invalid,
  disabled,
  rows = 1,
  containerClassName,
  className
}: PatientLineTextareaProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const isInvalid = Boolean(invalid || error);
  const hasValue = Boolean(value && String(value).trim().length > 0);
  const isFloating = isFocused || hasValue;

  const adjustHeight = React.useCallback(() => {
    const element = textareaRef.current;
    if (!element) {
      return;
    }
    element.style.height = 'auto';
    element.style.height = `${Math.max(28, element.scrollHeight)}px`;
  }, []);

  React.useEffect(() => {
    adjustHeight();
    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
  }, [value, adjustHeight]);

  return (
    <div className={cn('relative pt-3', containerClassName)}>
      <div
        data-slot='line-textarea-group'
        data-invalid={isInvalid}
        className={cn(
          'relative flex flex-col border-b-[1.5px] border-border pb-1.5 transition-colors duration-200 focus-within:border-primary',
          isInvalid && '!border-destructive',
          disabled && 'opacity-60 pointer-events-none'
        )}
      >
        <textarea
          ref={textareaRef}
          id={id}
          aria-labelledby={`${id}-label`}
          value={value}
          rows={rows}
          placeholder={isFloating ? placeholder : ''}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          onChange={(e) => {
            onChange(e.target.value);
            adjustHeight();
          }}
          aria-invalid={isInvalid}
          className={cn(
            'w-full resize-none border-0 bg-transparent px-0 py-1 text-sm font-medium leading-normal text-foreground outline-none shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0 placeholder:font-normal placeholder:text-muted-foreground/50 overflow-hidden min-h-[28px]',
            className
          )}
        />

        <label
          id={`${id}-label`}
          htmlFor={id}
          className={cn(
            'absolute left-0 pointer-events-none origin-left select-none transition-all duration-200 ease-out',
            isFloating
              ? '-top-3 text-[11px] font-semibold text-primary'
              : 'top-1 text-sm font-normal text-muted-foreground/70',
            isFloating && !isFocused && 'text-muted-foreground',
            isInvalid && '!text-destructive'
          )}
        >
          {label}
        </label>
      </div>
      {error ? <p className='pt-0.5 text-[11px] font-normal text-destructive'>{error}</p> : null}
    </div>
  );
}
