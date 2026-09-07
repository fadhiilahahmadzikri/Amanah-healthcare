'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PatientLineInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  invalid?: boolean;
  isMonospace?: boolean;
  trailingIcon?: React.ReactNode;
  containerClassName?: string;
}

export const PatientLineInput = React.forwardRef<HTMLInputElement, PatientLineInputProps>(
  (
    {
      label,
      id,
      value,
      onChange,
      error,
      invalid,
      isMonospace,
      trailingIcon,
      containerClassName,
      className,
      placeholder,
      disabled,
      ...rest
    },
    ref
  ) => {
    const isInvalid = Boolean(invalid || error);

    return (
      <div className={cn('space-y-1.5', containerClassName)}>
        <label htmlFor={id} className='block text-xs font-normal text-muted-foreground'>
          {label}*
        </label>
        <div
          data-slot='line-input-group'
          data-invalid={isInvalid}
          className={cn(
            'relative flex items-center justify-between border-b-[1.5px] border-border pb-1 transition-colors duration-200 focus-within:border-primary',
            isInvalid && '!border-destructive',
            disabled && 'opacity-60 pointer-events-none'
          )}
        >
          <input
            ref={ref}
            id={id}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-invalid={isInvalid}
            className={cn(
              'w-full border-0 bg-transparent px-0 py-1.5 text-sm font-medium text-primary outline-none placeholder:font-normal placeholder:text-muted-foreground/60',
              isMonospace && 'font-mono tracking-wide',
              className
            )}
            {...rest}
          />
          {trailingIcon ? (
            <div className='flex shrink-0 items-center justify-center pl-2'>{trailingIcon}</div>
          ) : null}
        </div>
        {error ? <p className='pt-0.5 text-[11px] font-normal text-destructive'>{error}</p> : null}
      </div>
    );
  }
);

PatientLineInput.displayName = 'PatientLineInput';
