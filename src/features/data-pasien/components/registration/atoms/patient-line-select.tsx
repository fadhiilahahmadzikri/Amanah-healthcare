'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type PatientLineSelectOption = string | { label: string; value: string };

export interface PatientLineSelectProps {
  id: string;
  label: React.ReactNode;
  value?: string | null;
  onChange: (value: string) => void;
  options: readonly PatientLineSelectOption[] | PatientLineSelectOption[];
  placeholder?: string;
  error?: string;
  invalid?: boolean;
  disabled?: boolean;
  containerClassName?: string;
  className?: string;
}

export function PatientLineSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  invalid,
  disabled,
  containerClassName,
  className
}: PatientLineSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const isInvalid = Boolean(invalid || error);
  const valString = value === null || value === undefined ? '' : String(value);
  const hasValue = Boolean(valString.trim().length > 0);
  const isFloating = isOpen || hasValue;

  return (
    <div className={cn('relative pt-3', containerClassName)}>
      <Select
        value={valString}
        disabled={disabled}
        open={isOpen}
        onOpenChange={setIsOpen}
        onValueChange={onChange}
      >
        <div
          data-slot='line-select-group'
          data-invalid={isInvalid}
          className={cn(
            'relative flex items-center justify-between border-b-[1.5px] border-border pb-1.5 transition-colors duration-200',
            isOpen ? 'border-primary' : 'focus-within:border-primary',
            isInvalid && '!border-destructive',
            disabled && 'opacity-60 pointer-events-none'
          )}
        >
          <SelectTrigger
            id={id}
            aria-invalid={isInvalid}
            className={cn(
              'w-full cursor-pointer rounded-none border-0 bg-transparent px-0 py-1 text-sm font-medium shadow-none outline-none focus:ring-0 focus-visible:ring-0 select-none [&>svg]:hidden',
              isFloating ? 'text-foreground' : 'text-transparent',
              className
            )}
          >
            <SelectValue placeholder={isFloating ? placeholder : ''} />
          </SelectTrigger>

          <label
            htmlFor={id}
            className={cn(
              'absolute left-0 pointer-events-none origin-left select-none transition-all duration-200 ease-out',
              isFloating
                ? '-top-3 text-[11px] font-semibold text-primary'
                : 'top-1 text-sm font-normal text-muted-foreground/70',
              isFloating && !isOpen && 'text-muted-foreground',
              isInvalid && '!text-destructive'
            )}
          >
            {label}
          </label>

          <div className='pointer-events-none flex shrink-0 items-center justify-center pl-2 text-muted-foreground transition-transform duration-200'>
            <Icons.chevronDown
              className={cn(
                'size-4 transition-transform duration-200',
                isOpen && 'rotate-180 text-primary'
              )}
            />
          </div>
        </div>

        <SelectContent>
          <SelectGroup>
            {options.map((option) => {
              const optValue = typeof option === 'string' ? option : option.value;
              const optLabel = typeof option === 'string' ? option : option.label;
              return (
                <SelectItem key={optValue} value={optValue} className='cursor-pointer'>
                  {optLabel}
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
      {error ? <p className='pt-0.5 text-[11px] font-normal text-destructive'>{error}</p> : null}
    </div>
  );
}
