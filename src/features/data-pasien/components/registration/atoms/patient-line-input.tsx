'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PatientLineInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  label: React.ReactNode;
  id: string;
  value: string;
  onChange?: (value: string) => void;
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
      readOnly,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const isInvalid = Boolean(invalid || error);
    const hasValue = Boolean(value && String(value).trim().length > 0);
    const isFloating = isFocused || hasValue;

    return (
      <div className={cn('relative pt-3', containerClassName)}>
        <div
          data-slot='line-input-group'
          data-invalid={isInvalid}
          className={cn(
            'relative flex items-center justify-between border-b-[1.5px] border-border pb-1.5 transition-colors duration-200',
            !readOnly && 'focus-within:border-primary',
            isInvalid && '!border-destructive',
            disabled && 'opacity-60 pointer-events-none'
          )}
        >
          <input
            ref={ref}
            id={id}
            value={value}
            disabled={disabled}
            readOnly={readOnly}
            tabIndex={readOnly ? -1 : rest.tabIndex}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={isFloating ? placeholder : ''}
            aria-invalid={isInvalid}
            className={cn(
              'w-full border-0 bg-transparent px-0 py-1 text-sm font-medium text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground/50',
              isMonospace && 'font-mono tracking-wide',
              readOnly && 'cursor-default select-all caret-transparent',
              className
            )}
            {...rest}
          />

          <label
            htmlFor={id}
            className={cn(
              'absolute left-0 pointer-events-none origin-left select-none transition-all duration-200 ease-out',
              isFloating
                ? '-top-3 text-[11px] font-semibold text-primary'
                : 'top-1 text-sm font-normal text-muted-foreground/70 line-clamp-1 w-full pr-2',
              isFloating && (!isFocused || readOnly) && 'text-muted-foreground',
              isInvalid && '!text-destructive'
            )}
          >
            {label}
          </label>

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
