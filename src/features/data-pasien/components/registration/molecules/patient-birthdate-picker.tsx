'use client';

import * as React from 'react';
import gsap from 'gsap';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export interface PatientBirthdatePickerProps {
  value: string; // ISO date 'YYYY-MM-DD'
  onChange: (value: string) => void;
  error?: string;
  invalid?: boolean;
  className?: string;
}

const INDO_MONTHS = [
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

export function PatientBirthdatePicker({
  value,
  onChange,
  error,
  invalid,
  className
}: PatientBirthdatePickerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const popupRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse initial date or default to 1998 (same as POC)
  const initialYear = React.useMemo(() => {
    if (value) {
      const parts = value.split('-');
      if (parts[0]) return parseInt(parts[0], 10);
    }
    return 1998;
  }, [value]);

  const initialMonth = React.useMemo(() => {
    if (value) {
      const parts = value.split('-');
      if (parts[1]) return parseInt(parts[1], 10) - 1;
    }
    return 0; // Januari
  }, [value]);

  const [viewDate, setViewDate] = React.useState(() => new Date(initialYear, initialMonth, 1));

  // Keep viewDate in sync if value changes externally
  React.useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      if (y && m && d) {
        setViewDate(new Date(y, m - 1, 1));
      }
    }
  }, [value]);

  const selectedDateParts = React.useMemo(() => {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return null;
    return { year: y, month: m - 1, day: d };
  }, [value]);

  const displayLabel = React.useMemo(() => {
    if (!selectedDateParts) return '';
    return `${selectedDateParts.day} ${INDO_MONTHS[selectedDateParts.month]?.toLowerCase()} ${selectedDateParts.year}`;
  }, [selectedDateParts]);

  const currentYear = new Date().getFullYear();
  const yearOptions = React.useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear; y >= 1930; y--) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  // Handle GSAP open / close animations
  const animateOpen = React.useCallback(() => {
    if (!popupRef.current) return;
    gsap.killTweensOf(popupRef.current);
    gsap.fromTo(
      popupRef.current,
      { height: 0, opacity: 0, display: 'block' },
      { height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out' }
    );
  }, []);

  const animateClose = React.useCallback((onComplete?: () => void) => {
    if (!popupRef.current) return;
    gsap.killTweensOf(popupRef.current);
    gsap.to(popupRef.current, {
      height: 0,
      opacity: 0,
      duration: 0.2,
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
      if (containerRef.current && !containerRef.current.contains(e.target as Node) && isOpen) {
        animateClose(() => setIsOpen(false));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, animateClose]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    setViewDate((prev) => new Date(newYear, prev.getMonth(), 1));
  };

  const handleSelectDay = (day: number) => {
    const y = viewDate.getFullYear();
    const m = String(viewDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const iso = `${y}-${m}-${d}`;

    onChange(iso);
    animateClose(() => setIsOpen(false));
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const isInvalid = Boolean(invalid || error);

  return (
    <div ref={containerRef} className={cn('relative space-y-1.5', className)}>
      <label
        htmlFor='tanggalLahirTrigger'
        className='block text-xs font-normal text-muted-foreground'
      >
        tanggal lahir*
      </label>

      {/* Underline trigger row matching POC */}
      <div
        id='field-group-tanggalLahir'
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
          'flex cursor-pointer items-center justify-between border-b-[1.5px] border-border pb-1 transition-colors duration-200 focus-within:border-primary select-none',
          isInvalid && '!border-destructive'
        )}
      >
        <input
          id='tanggalLahirTrigger'
          type='text'
          readOnly
          aria-label='Tanggal lahir'
          value={displayLabel}
          placeholder='pilih tanggal lahir...'
          className='w-full cursor-pointer border-0 bg-transparent px-0 py-1.5 text-sm font-medium text-primary outline-none placeholder:font-normal placeholder:text-muted-foreground/60 pointer-events-none'
        />
        <Icons.calendar className='size-4 shrink-0 text-primary' />
      </div>

      {error ? <p className='pt-0.5 text-[11px] font-normal text-destructive'>{error}</p> : null}

      {/* Embedded Custom Calendar Popup with GSAP */}
      <div
        ref={popupRef}
        style={{ display: 'none' }}
        className='mt-2 overflow-hidden rounded-xl border border-border bg-card p-4 shadow-md'
      >
        {/* Month & Year Navigation Header */}
        <div className='mb-3 flex items-center justify-between text-xs'>
          <button
            type='button'
            onClick={handlePrevMonth}
            aria-label='Bulan sebelumnya'
            className='cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
          >
            <Icons.chevronLeft className='size-4' />
          </button>

          <div className='flex items-center gap-1.5'>
            <span className='font-semibold text-primary'>{INDO_MONTHS[month]}</span>
            <select
              value={year}
              onChange={handleYearChange}
              aria-label='Pilih tahun lahir'
              className='cursor-pointer border-none bg-transparent text-xs font-medium text-primary outline-none'
            >
              {yearOptions.map((y) => (
                <option key={y} value={y} className='bg-card text-foreground'>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            type='button'
            onClick={handleNextMonth}
            aria-label='Bulan berikutnya'
            className='cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
          >
            <Icons.chevronRight className='size-4' />
          </button>
        </div>

        {/* Days of Week Row */}
        <div className='mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-normal text-muted-foreground'>
          <div>Min</div>
          <div>Sen</div>
          <div>Sel</div>
          <div>Rab</div>
          <div>Kam</div>
          <div>Jum</div>
          <div>Sab</div>
        </div>

        {/* Calendar Days Grid */}
        <div className='grid grid-cols-7 gap-1 text-center text-xs'>
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isSelected =
              selectedDateParts?.year === year &&
              selectedDateParts?.month === month &&
              selectedDateParts?.day === day;

            return (
              <button
                key={day}
                type='button'
                onClick={() => handleSelectDay(day)}
                className={cn(
                  'cursor-pointer rounded-lg p-1.5 text-center font-medium transition-colors select-none',
                  isSelected
                    ? 'bg-primary font-semibold text-primary-foreground hover:bg-primary/95'
                    : 'text-foreground hover:bg-accent'
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
