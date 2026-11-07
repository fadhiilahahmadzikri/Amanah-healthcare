'use client';

import * as React from 'react';
import gsap from 'gsap';
import { Icons } from '@/components/icons';
import { CustomCalendar, INDO_MONTHS } from './custom-calendar';
import { cn } from '@/lib/utils';

export interface CustomDatePickerProps {
  value: string; // ISO date 'YYYY-MM-DD'
  onChange: (value: string, dateObj?: Date) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
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
  onBlur,
  id = 'customDatePickerTrigger',
  label,
  labelClassName,
  placeholder = 'DD/MM/YYYY',
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
  const inputRef = React.useRef<HTMLInputElement>(null);
  const cursorRef = React.useRef<number | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [typedValue, setTypedValue] = React.useState<string | null>(null);
  const isSelectOpenRef = React.useRef(false);

  // Convert ISO 'YYYY-MM-DD' to 'DD/MM/YYYY'
  const isoToSlash = React.useCallback((iso: string | undefined): string => {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length < 3) return '';
    const year = parts[0];
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
    return `${day}/${month}/${year}`;
  }, []);

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

  const effectivePlaceholder = React.useMemo(() => {
    if (placeholder && !placeholder.toLowerCase().startsWith('pilih tanggal')) {
      return placeholder;
    }
    return 'DD/MM/YYYY';
  }, [placeholder]);

  // While focused: show typedValue or slash format (DD/MM/YYYY) so user edits digits directly
  // While blurred: show humanLabel ('23 Agustus 2004')
  const inputValue = React.useMemo(() => {
    if (typedValue !== null) return typedValue;
    if (isFocused && value) return isoToSlash(value);
    return displayLabel;
  }, [typedValue, isFocused, value, displayLabel, isoToSlash]);

  // Synchronously restore cursor position after React updates DOM
  React.useLayoutEffect(() => {
    if (cursorRef.current !== null && inputRef.current) {
      const pos = Math.min(cursorRef.current, (inputRef.current.value || '').length);
      inputRef.current.setSelectionRange(pos, pos);
      cursorRef.current = null;
    }
  }, [inputValue]);

  const handleInputFocus = (_e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (value && typedValue === null) {
      setTypedValue(isoToSlash(value));
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (typedValue !== null) {
      const parts = typedValue.split('/');
      const day = parts[0] || '';
      const month = parts[1] || '';
      const year = parts[2] || '';
      if (day.length === 2 && month.length === 2 && year.length === 4) {
        // Complete date, already committed in handleInputChange
      } else if (typedValue.trim() === '') {
        onChange('', undefined);
      } else {
        // Incomplete partial date: reset to avoid invalid masked state
        onChange('', undefined);
      }
      setTypedValue(null);
    }
    onBlur?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const { selectionStart, selectionEnd, value: currentVal } = input;

    if (e.key === 'Enter') {
      e.preventDefault();
      input.blur();
      if (isOpen) {
        animateClose(() => setIsOpen(false));
      }
      return;
    }

    // Special Backspace handling right after slash: delete the digit before the slash
    if (e.key === 'Backspace' && selectionStart === selectionEnd && selectionStart !== null) {
      if (selectionStart === 3 && currentVal[2] === '/') {
        e.preventDefault();
        const remainder = currentVal.slice(3);
        const nextVal = remainder ? currentVal.slice(0, 1) + '/' + remainder : currentVal.slice(0, 2);
        cursorRef.current = remainder ? 1 : 2;
        setTypedValue(nextVal);
        return;
      }
      if (selectionStart === 6 && currentVal[5] === '/') {
        e.preventDefault();
        const remainder = currentVal.slice(6);
        const nextVal = remainder ? currentVal.slice(0, 4) + '/' + remainder : currentVal.slice(0, 5);
        cursorRef.current = remainder ? 4 : 5;
        setTypedValue(nextVal);
        return;
      }
    }

    // Special Delete handling right before slash: skip slash and delete next digit
    if (e.key === 'Delete' && selectionStart === selectionEnd && selectionStart !== null) {
      if (selectionStart === 2 && currentVal[2] === '/') {
        e.preventDefault();
        const nextVal = currentVal.slice(0, 3) + currentVal.slice(4);
        cursorRef.current = 3;
        setTypedValue(nextVal);
        return;
      }
      if (selectionStart === 5 && currentVal[5] === '/') {
        e.preventDefault();
        const nextVal = currentVal.slice(0, 6) + currentVal.slice(7);
        cursorRef.current = 6;
        setTypedValue(nextVal);
        return;
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const raw = input.value;
    const cursor = input.selectionStart ?? raw.length;

    if (raw.trim() === '') {
      cursorRef.current = 0;
      setTypedValue('');
      onChange('', undefined);
      return;
    }

    // Segment based parsing to preserve Day, Month, Year independence
    let parts = raw.split('/');
    let day = (parts[0] || '').replace(/\D/g, '').slice(0, 2);
    let month = (parts[1] || '').replace(/\D/g, '').slice(0, 2);
    let year = (parts[2] || '').replace(/\D/g, '').slice(0, 4);

    // If user pasted an ISO date (e.g. '2004-08-23')
    if (raw.includes('-')) {
      const isoParts = raw.split('-');
      if (isoParts.length === 3 && isoParts[0].length === 4) {
        day = isoParts[2].replace(/\D/g, '').slice(0, 2);
        month = isoParts[1].replace(/\D/g, '').slice(0, 2);
        year = isoParts[0].replace(/\D/g, '').slice(0, 4);
        parts = [day, month, year];
      }
    } else if (parts.length === 1 && raw.replace(/\D/g, '').length > 2) {
      // If user pasted or typed continuous digits without slashes (e.g. '23082004')
      const allDigits = raw.replace(/\D/g, '').slice(0, 8);
      day = allDigits.slice(0, 2);
      month = allDigits.slice(2, 4);
      year = allDigits.slice(4, 8);
    }

    let formatted = day;
    if (parts.length > 1 || day.length === 2) {
      if (month.length > 0 || parts.length > 1) {
        formatted += '/' + month;
      } else if (day.length === 2 && parts.length === 1) {
        formatted += '/';
      }
    }
    if (parts.length > 2 || (month.length === 2 && year.length > 0)) {
      if (year.length > 0 || parts.length > 2) {
        formatted += '/' + year;
      }
    } else if (month.length === 2 && parts.length === 2 && year.length === 0) {
      formatted += '/';
    }

    // Determine target cursor position
    let targetCursor = cursor;
    if (day.length === 2 && cursor === 2 && formatted.length > 2 && formatted[2] === '/') {
      targetCursor = 3;
    } else if (
      month.length === 2 &&
      cursor === 5 &&
      formatted.length > 5 &&
      formatted[5] === '/'
    ) {
      targetCursor = 6;
    }

    cursorRef.current = targetCursor;
    setTypedValue(formatted);

    // If complete date with 8 digits (DD/MM/YYYY), commit to form
    if (day.length === 2 && month.length === 2 && year.length === 4) {
      const d = parseInt(day, 10);
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1000) {
        const daysInMonth = new Date(y, m, 0).getDate();
        if (d <= daysInMonth) {
          const isoStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const dateObj = new Date(y, m - 1, d);
          onChange(isoStr, dateObj);
        }
      }
    }
  };

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
  const hasValue = Boolean(value && String(value).trim().length > 0) || Boolean(typedValue && typedValue.length > 0);
  const isFloating = isOpen || hasValue;

  if (variant === 'underline') {
    return (
      <div ref={containerRef} className={cn('relative pt-3', className)}>
        <div
          id={`${id}-trigger`}
          role='group'
          className={cn(
            'relative flex cursor-text items-center justify-between border-b-[1.5px] border-border pb-1.5 transition-colors duration-200',
            isOpen ? 'border-primary' : 'focus-within:border-primary',
            isInvalid && '!border-destructive',
            triggerClassName
          )}
          onClick={() => {
            if (!isOpen) {
              setIsOpen(true);
              requestAnimationFrame(() => animateOpen());
            }
          }}
        >
          <input
            ref={inputRef}
            id={id}
            type='text'
            aria-label={ariaLabel}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            onClick={(e) => {
              e.stopPropagation();
              if (!isOpen) {
                setIsOpen(true);
                requestAnimationFrame(() => animateOpen());
              }
            }}
            placeholder={isFloating ? effectivePlaceholder : ''}
            className='w-full min-w-0 border-0 bg-transparent px-0 py-1 text-sm font-medium text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground/50'
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
          <button
            type='button'
            aria-label='Buka kalender'
            onClick={(e) => {
              e.stopPropagation();
              toggleOpen();
            }}
            className='flex items-center justify-center p-1 text-muted-foreground hover:text-foreground transition-colors'
          >
            <Icons.calendar
              className={cn(
                'size-4 shrink-0 transition-colors',
                isOpen ? 'text-primary' : 'text-muted-foreground'
              )}
            />
          </button>
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
              setTypedValue(null);
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
        role='group'
        className={cn(
          'flex h-9 w-full cursor-text items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-1 shadow-xs transition-[color,box-shadow] outline-none dark:bg-input/30 hover:bg-accent/40 dark:hover:bg-input/50 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
          isOpen && 'border-ring ring-ring/50 ring-[3px]',
          isInvalid && '!border-destructive ring-destructive/20 dark:ring-destructive/40',
          triggerClassName
        )}
        onClick={() => {
          if (!isOpen) {
            setIsOpen(true);
            requestAnimationFrame(() => animateOpen());
          }
        }}
      >
        <input
          ref={inputRef}
          id={id}
          type='text'
          aria-label={ariaLabel}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          onClick={(e) => {
            e.stopPropagation();
            if (!isOpen) {
              setIsOpen(true);
              requestAnimationFrame(() => animateOpen());
            }
          }}
          placeholder={effectivePlaceholder}
          className='w-full min-w-0 border-0 bg-transparent p-0 text-sm font-normal outline-none placeholder:text-muted-foreground'
        />
        <button
          type='button'
          aria-label='Buka kalender'
          onClick={(e) => {
            e.stopPropagation();
            toggleOpen();
          }}
          className='flex items-center justify-center p-0.5 text-muted-foreground hover:text-foreground transition-colors'
        >
          <Icons.calendar className='size-4 shrink-0 text-muted-foreground' />
        </button>
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
            setTypedValue(null);
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
