'use client';

import * as React from 'react';
import gsap from 'gsap';
import { Icons } from '@/components/icons';
import { CustomCalendar, INDO_MONTHS } from './custom-calendar';
import { cn } from '@/lib/utils';

export interface CustomDatePickerProps {
  value: string; // ISO date 'YYYY-MM-DD'
  onChange: (value: string, dateObj?: Date) => void;
  id?: string;
  label?: React.ReactNode;
  labelClassName?: string;
  placeholder?: string;
  ariaLabel?: string;
  error?: string;
  invalid?: boolean;
  className?: string;
  triggerClassName?: string;
  popupClassName?: string;
  variant?: 'outline' | 'underline';
  disablePastDates?: boolean;
  disableFutureDates?: boolean;
  isDateDisabled?: (date: Date, isoStr: string) => boolean;
  minYear?: number;
  maxYear?: number;
}

export function CustomDatePicker({
  value,
  onChange,
  id = 'customDatePickerTrigger',
  label,
  labelClassName,
  placeholder = 'Pilih tanggal...',
  ariaLabel = 'Tanggal',
  error,
  invalid,
  className,
  triggerClassName,
  popupClassName,
  variant = 'outline',
  disablePastDates = false,
  disableFutureDates = false,
  isDateDisabled,
  minYear,
  maxYear
}: CustomDatePickerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const popupRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const isSelectOpenRef = React.useRef(false);

  // Compute formatted label for input trigger
  const displayLabel = React.useMemo(() => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length < 3) return '';
    const day = parseInt(parts[2], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[0], 10);
    if (isNaN(day) || isNaN(monthIdx) || isNaN(year)) return '';
    return `${day} ${INDO_MONTHS[monthIdx] || ''} ${year}`;
  }, [value]);

  // Handle GSAP open / close animations
  const animateOpen = React.useCallback(() => {
    if (!popupRef.current) return;
    gsap.killTweensOf(popupRef.current);
    gsap.fromTo(
      popupRef.current,
      { height: 0, opacity: 0, display: 'block' },
      { height: 'auto', opacity: 1, duration: 0.28, ease: 'power2.out' }
    );
  }, []);

  const animateClose = React.useCallback((onComplete?: () => void) => {
    if (!popupRef.current) return;
    gsap.killTweensOf(popupRef.current);
    gsap.to(popupRef.current, {
      height: 0,
      opacity: 0,
      duration: 0.18,
      ease: 'power2.in',
      onComplete: () => {
        if (popupRef.current) {
          popupRef.current.style.display = 'none';
        }
        onComplete?.();
      }
    });
  }, []);

  const toggleOpen = () => {
    if (isOpen) {
      animateClose(() => setIsOpen(false));
    } else {
      setIsOpen(true);
      requestAnimationFrame(() => animateOpen());
    }
  };

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // If click is inside the container, do not close
      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }

      // If click is inside a Radix Select portal (dropdown menu, viewport, item, scroll buttons), do not close
      if (
        target.closest(
          '[data-slot="select-content"], [data-slot="select-item"], [data-slot="select-group"], [data-slot="select-scroll-up-button"], [data-slot="select-scroll-down-button"], [data-radix-popper-content-wrapper], [data-radix-select-viewport], [role="listbox"], [role="option"]'
        )
      ) {
        return;
      }

      // If either month or year select dropdown was open, this outside click only closes the dropdown
      if (isSelectOpenRef.current) {
        return;
      }

      if (isOpen) {
        animateClose(() => setIsOpen(false));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, animateClose]);

  const isInvalid = Boolean(invalid || error);
  const hasValue = Boolean(value && String(value).trim().length > 0);
  const isFloating = isOpen || hasValue;

  if (variant === 'underline') {
    return (
      <div ref={containerRef} className={cn('relative pt-3', className)}>
        <div
          id={`${id}-trigger`}
          role='button'
          tabIndex={0}
          aria-haspopup='dialog'
          aria-expanded={isOpen}
          onClick={toggleOpen}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleOpen();
            }
          }}
          className={cn(
            'relative flex cursor-pointer items-center justify-between border-b-[1.5px] border-border pb-1.5 transition-colors duration-200 select-none',
            isOpen ? 'border-primary' : 'focus-within:border-primary',
            isInvalid && '!border-destructive',
            triggerClassName
          )}
        >
          <input
            id={id}
            type='text'
            readOnly
            aria-label={ariaLabel}
            value={displayLabel}
            placeholder={isFloating ? placeholder : ''}
            className='w-full min-w-0 cursor-pointer border-0 bg-transparent px-0 py-1 text-sm font-medium text-foreground outline-none pointer-events-none placeholder:font-normal placeholder:text-muted-foreground/50'
          />
          {label ? (
            <label
              htmlFor={id}
              className={cn(
                'absolute left-0 pointer-events-none origin-left select-none transition-all duration-200 ease-out',
                isFloating
                  ? '-top-3 text-[11px] font-semibold text-primary'
                  : 'top-1 text-sm font-normal text-muted-foreground/70',
                isFloating && !isOpen && 'text-muted-foreground',
                isInvalid && '!text-destructive',
                labelClassName
              )}
            >
              {label}
            </label>
          ) : null}
          <Icons.calendar
            className={cn(
              'size-4 shrink-0 transition-colors',
              isOpen ? 'text-primary' : 'text-muted-foreground'
            )}
          />
        </div>

        {error ? <p className='pt-0.5 text-[11px] font-normal text-destructive'>{error}</p> : null}

        <div
          ref={popupRef}
          style={{ display: 'none' }}
          className={cn(
            'mt-2 overflow-hidden rounded-xl border border-border bg-card p-4 shadow-md',
            popupClassName
          )}
        >
          <CustomCalendar
            value={value}
            onChange={(isoStr, dateObj) => {
              onChange(isoStr, dateObj);
              animateClose(() => setIsOpen(false));
            }}
            minYear={minYear}
            maxYear={maxYear}
            disablePastDates={disablePastDates}
            disableFutureDates={disableFutureDates}
            isDateDisabled={isDateDisabled}
            onSelectDropdownChange={(open) => {
              isSelectOpenRef.current = open;
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative space-y-1.5', className)}>
      {label ? (
        <label
          htmlFor={id}
          className={cn(
            'flex w-fit items-center gap-1 text-sm font-medium leading-snug text-foreground',
            labelClassName
          )}
        >
          {label}
        </label>
      ) : null}

      <div
        id={`${id}-trigger`}
        role='button'
        tabIndex={0}
        aria-haspopup='dialog'
        aria-expanded={isOpen}
        onClick={toggleOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleOpen();
          }
        }}
        className={cn(
          'flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-1 shadow-xs transition-[color,box-shadow] outline-none select-none dark:bg-input/30 hover:bg-accent/40 dark:hover:bg-input/50 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
          isOpen && 'border-ring ring-ring/50 ring-[3px]',
          isInvalid && '!border-destructive ring-destructive/20 dark:ring-destructive/40',
          triggerClassName
        )}
      >
        <input
          id={id}
          type='text'
          readOnly
          aria-label={ariaLabel}
          value={displayLabel}
          placeholder={placeholder}
          className='w-full min-w-0 cursor-pointer border-0 bg-transparent p-0 text-sm font-normal outline-none placeholder:text-muted-foreground pointer-events-none'
        />
        <Icons.calendar className='size-4 shrink-0 text-muted-foreground' />
      </div>

      {error ? <p className='pt-0.5 text-[11px] font-normal text-destructive'>{error}</p> : null}

      <div
        ref={popupRef}
        style={{ display: 'none' }}
        className={cn(
          'mt-2 overflow-hidden rounded-xl border border-border bg-card p-4 shadow-md',
          popupClassName
        )}
      >
        <CustomCalendar
          value={value}
          onChange={(isoStr, dateObj) => {
            onChange(isoStr, dateObj);
            animateClose(() => setIsOpen(false));
          }}
          minYear={minYear}
          maxYear={maxYear}
          disablePastDates={disablePastDates}
          disableFutureDates={disableFutureDates}
          isDateDisabled={isDateDisabled}
          onSelectDropdownChange={(open) => {
            isSelectOpenRef.current = open;
          }}
        />
      </div>
    </div>
  );
}
