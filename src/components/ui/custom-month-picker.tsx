'use client';

import * as React from 'react';
import gsap from 'gsap';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export const INDONESIAN_MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
] as const;

export interface CustomMonthPickerProps {
  /** Format: 'YYYY-MM' (e.g. '2026-10') */
  value: string;
  onChange: (value: string, monthIndex: number, year: number) => void;
  id?: string;
  label?: React.ReactNode;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  triggerClassName?: string;
  minYear?: number;
  maxYear?: number;
}

export function CustomMonthPicker({
  value,
  onChange,
  id = 'customMonthPickerTrigger',
  label,
  placeholder = 'Pilih bulan...',
  ariaLabel = 'Pilihan bulan',
  className,
  triggerClassName,
  minYear = 2020,
  maxYear = 2035
}: CustomMonthPickerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const popupRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isYearSelectOpen, setIsYearSelectOpen] = React.useState(false);
  const isSelectOpenRef = React.useRef(false);

  // Parse initial selected value ('YYYY-MM')
  const { selectedYear, selectedMonthIndex } = React.useMemo(() => {
    if (value && /^\d{4}-\d{2}$/.test(value)) {
      const parts = value.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      return { selectedYear: y, selectedMonthIndex: m };
    }
    const now = new Date();
    return { selectedYear: now.getFullYear(), selectedMonthIndex: now.getMonth() };
  }, [value]);

  // Active viewing year inside the month picker
  const [viewingYear, setViewingYear] = React.useState<number>(selectedYear);

  React.useEffect(() => {
    setViewingYear(selectedYear);
  }, [selectedYear]);

  // Year options for the Select dropdown
  const yearOptions = React.useMemo(() => {
    const years: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      years.push(y);
    }
    return years;
  }, [maxYear, minYear]);

  // Display label for the trigger input (e.g. "Oktober 2026")
  const displayLabel = React.useMemo(() => {
    if (selectedMonthIndex >= 0 && selectedMonthIndex < 12) {
      return `${INDONESIAN_MONTH_NAMES[selectedMonthIndex]} ${selectedYear}`;
    }
    return '';
  }, [selectedMonthIndex, selectedYear]);

  // Smooth GSAP open animation (in-flow expansion pushing down content)
  const animateOpen = React.useCallback(() => {
    if (!popupRef.current) return;
    gsap.killTweensOf(popupRef.current);
    gsap.fromTo(
      popupRef.current,
      { height: 0, opacity: 0, display: 'block' },
      { height: 'auto', opacity: 1, duration: 0.28, ease: 'power2.out' }
    );
  }, []);

  // Smooth GSAP close animation
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

  // Close when clicking outside (respecting year dropdown)
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }

      if (
        target.closest(
          '[data-slot="select-content"], [data-slot="select-item"], [data-slot="select-group"], [data-slot="select-scroll-up-button"], [data-slot="select-scroll-down-button"], [data-radix-popper-content-wrapper], [data-radix-select-viewport], [role="listbox"], [role="option"]'
        )
      ) {
        return;
      }

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

  const handleSelectMonth = (monthIndex: number) => {
    const mm = String(monthIndex + 1).padStart(2, '0');
    const newIsoMonth = `${viewingYear}-${mm}`;
    onChange(newIsoMonth, monthIndex, viewingYear);
    animateClose(() => setIsOpen(false));
  };

  const handlePrevYear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewingYear > minYear) {
      setViewingYear((prev) => prev - 1);
    }
  };

  const handleNextYear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewingYear < maxYear) {
      setViewingYear((prev) => prev + 1);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full font-sans select-none', className)}>
      {label && (
        <label htmlFor={id} className='block text-xs font-semibold text-foreground/80 mb-1.5'>
          {label}
        </label>
      )}

      {/* Input Trigger Button (Pola konsisten CustomDatePicker) */}
      <button
        id={id}
        type='button'
        onClick={toggleOpen}
        aria-haspopup='dialog'
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className={cn(
          'w-full h-10 px-3.5 flex items-center justify-between rounded-xl border border-border/70 bg-card text-foreground transition-all duration-200 cursor-pointer shadow-2xs hover:border-primary/50 focus:outline-hidden focus:ring-2 focus:ring-primary/20',
          isOpen && 'border-primary ring-2 ring-primary/20',
          triggerClassName
        )}
      >
        <span
          className={cn(
            'text-xs sm:text-sm font-medium truncate',
            !displayLabel && 'text-muted-foreground'
          )}
        >
          {displayLabel || placeholder}
        </span>
        <div className='flex items-center gap-1.5 text-muted-foreground shrink-0'>
          <Icons.calendar className='size-4' />
          <Icons.chevronDown
            className={cn(
              'size-3.5 transition-transform duration-200',
              isOpen && 'rotate-180 text-primary'
            )}
          />
        </div>
      </button>

      {/* In-Flow Dropdown Popup Kalender Bulan (Mendorong konten di bawahnya) */}
      <div
        ref={popupRef}
        style={{ display: 'none' }}
        className='mt-2 overflow-hidden rounded-xl border border-border bg-card p-3 sm:p-4 shadow-md'
      >
        <div className='space-y-3'>
          {/* Header Navigasi Tahun dengan Dropdown Select Tahun */}
          <div className='flex items-center justify-between pb-2 border-b border-border/40'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={handlePrevYear}
              disabled={viewingYear <= minYear}
              className='size-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer'
              aria-label='Tahun sebelumnya'
            >
              <Icons.chevronLeft className='size-4' />
            </Button>

            {/* Selectable Year Dropdown */}
            <Select
              value={String(viewingYear)}
              onValueChange={(val) => setViewingYear(parseInt(val, 10))}
              open={isYearSelectOpen}
              onOpenChange={(open) => {
                setIsYearSelectOpen(open);
                isSelectOpenRef.current = open;
              }}
            >
              <SelectTrigger
                aria-label='Pilih tahun'
                className='h-7 w-[96px] border border-border/50 bg-muted/40 px-2 text-xs font-bold text-foreground shadow-none hover:bg-muted cursor-pointer rounded-lg'
              >
                <SelectValue placeholder={String(viewingYear)} />
              </SelectTrigger>
              <SelectContent className='max-h-56 z-50'>
                <SelectGroup>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={String(y)} className='cursor-pointer text-xs'>
                      {y}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={handleNextYear}
              disabled={viewingYear >= maxYear}
              className='size-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer'
              aria-label='Tahun berikutnya'
            >
              <Icons.chevronRight className='size-4' />
            </Button>
          </div>

          {/* Grid 12 Bulan */}
          <div className='grid grid-cols-3 gap-1.5 sm:gap-2'>
            {INDONESIAN_MONTH_NAMES.map((monthName, idx) => {
              const isSelected = viewingYear === selectedYear && idx === selectedMonthIndex;
              const isCurrentMonth =
                viewingYear === new Date().getFullYear() && idx === new Date().getMonth();

              return (
                <button
                  key={monthName}
                  type='button'
                  onClick={() => handleSelectMonth(idx)}
                  className={cn(
                    'h-9 px-2 text-xs font-medium rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center relative',
                    isSelected
                      ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                      : isCurrentMonth
                        ? 'bg-muted/70 text-foreground font-semibold hover:bg-muted'
                        : 'text-foreground/80 hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  <span>{monthName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
