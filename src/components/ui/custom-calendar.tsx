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

export interface CustomCalendarProps {
  value: string;
  onChange: (isoDate: string, dateObj: Date) => void;
  disablePastDates?: boolean;
  disableFutureDates?: boolean;
  isDateDisabled?: (date: Date, isoStr: string) => boolean;
  minYear?: number;
  maxYear?: number;
  className?: string;
  activeDateClassName?: string;
  disabledDateClassName?: string;
  selectedDateClassName?: string;
  onSelectDropdownChange?: (isOpen: boolean) => void;
}

export const INDO_MONTHS = [
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

export function CustomCalendar({
  value,
  onChange,
  disablePastDates = false,
  disableFutureDates = false,
  isDateDisabled,
  minYear: customMinYear,
  maxYear: customMaxYear,
  className,
  activeDateClassName,
  disabledDateClassName,
  selectedDateClassName,
  onSelectDropdownChange
}: CustomCalendarProps) {
  const [isMonthSelectOpen, setIsMonthSelectOpen] = React.useState(false);
  const [isYearSelectOpen, setIsYearSelectOpen] = React.useState(false);

  const handleMonthOpenChange = React.useCallback(
    (open: boolean) => {
      setIsMonthSelectOpen(open);
      onSelectDropdownChange?.(open || isYearSelectOpen);
    },
    [onSelectDropdownChange, isYearSelectOpen]
  );

  const handleYearOpenChange = React.useCallback(
    (open: boolean) => {
      setIsYearSelectOpen(open);
      onSelectDropdownChange?.(open || isMonthSelectOpen);
    },
    [onSelectDropdownChange, isMonthSelectOpen]
  );

  // Parse initial date from value or fallback to current date
  const parsedValue = React.useMemo(() => {
    if (!value) return null;
    const parts = value.split('-');
    if (parts.length < 3) return null;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    return { year: y, month: m, day: d };
  }, [value]);

  const [viewDate, setViewDate] = React.useState<Date>(() => {
    if (parsedValue) {
      return new Date(parsedValue.year, parsedValue.month, 1);
    }
    return new Date();
  });

  // Keep viewDate in sync when value changes externally
  React.useEffect(() => {
    if (parsedValue) {
      setViewDate(new Date(parsedValue.year, parsedValue.month, 1));
    }
  }, [parsedValue]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const currentYear = new Date().getFullYear();
  const maxYear =
    customMaxYear ?? (disableFutureDates ? currentYear : Math.max(currentYear + 5, year));
  const minYear = customMinYear ?? Math.min(1930, year);

  const yearOptions = React.useMemo(() => {
    const years: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      years.push(y);
    }
    return years;
  }, [maxYear, minYear]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disableFutureDates && year >= currentYear && month >= today.getMonth()) {
      return;
    }
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleMonthChange = (nextMonth: string) => {
    const newMonth = parseInt(nextMonth, 10);
    setViewDate((prev) => new Date(prev.getFullYear(), newMonth, 1));
  };

  const handleYearChange = (nextYear: string) => {
    const newYear = parseInt(nextYear, 10);
    setViewDate((prev) => new Date(newYear, prev.getMonth(), 1));
  };

  const handleSelectDay = (day: number) => {
    const y = viewDate.getFullYear();
    const m = String(viewDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const isoStr = `${y}-${m}-${d}`;
    const dateObj = new Date(y, viewDate.getMonth(), day);
    onChange(isoStr, dateObj);
  };

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  return (
    <div className={cn('select-none', className)}>
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

        <div className='flex items-center gap-1'>
          <Select
            value={String(month)}
            onValueChange={handleMonthChange}
            open={isMonthSelectOpen}
            onOpenChange={handleMonthOpenChange}
          >
            <SelectTrigger
              aria-label='Pilih bulan'
              className='h-7 w-[108px] border-0 bg-transparent px-2 text-xs font-semibold text-primary shadow-none hover:bg-accent cursor-pointer'
            >
              <SelectValue placeholder={INDO_MONTHS[month]} />
            </SelectTrigger>
            <SelectContent className='max-h-56 z-50'>
              <SelectGroup>
                {INDO_MONTHS.map((mName, mIndex) => (
                  <SelectItem key={mName} value={String(mIndex)} className='cursor-pointer'>
                    {mName}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={String(year)}
            onValueChange={handleYearChange}
            open={isYearSelectOpen}
            onOpenChange={handleYearOpenChange}
          >
            <SelectTrigger
              aria-label='Pilih tahun'
              className='h-7 w-[78px] border-0 bg-transparent px-2 text-xs font-semibold text-primary shadow-none hover:bg-accent cursor-pointer'
            >
              <SelectValue placeholder={String(year)} />
            </SelectTrigger>
            <SelectContent className='max-h-56 z-50'>
              <SelectGroup>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)} className='cursor-pointer'>
                    {y}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <button
          type='button'
          disabled={disableFutureDates && year >= currentYear && month >= today.getMonth()}
          onClick={handleNextMonth}
          aria-label='Bulan berikutnya'
          className='cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-30'
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
          const currentDayObj = new Date(year, month, day);
          const currentDayIso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

          const isPast = currentDayObj.getTime() < todayStart;
          const isFuture = currentDayObj.getTime() > todayStart;
          const isSelesai =
            (disablePastDates && isPast) ||
            (disableFutureDates && isFuture) ||
            (isDateDisabled ? isDateDisabled(currentDayObj, currentDayIso) : false);

          const isSelected =
            parsedValue?.year === year && parsedValue?.month === month && parsedValue?.day === day;

          return (
            <button
              key={day}
              type='button'
              disabled={isSelesai}
              onClick={() => {
                if (!isSelesai) {
                  handleSelectDay(day);
                }
              }}
              className={cn(
                'w-full rounded-lg p-1.5 sm:py-2 text-center font-medium transition-colors select-none',
                isSelected
                  ? cn(
                      'bg-primary font-semibold text-primary-foreground hover:bg-primary/95 shadow-2xs',
                      selectedDateClassName
                    )
                  : isSelesai
                    ? cn(
                        'text-muted-foreground/35 cursor-not-allowed select-none pointer-events-none',
                        disabledDateClassName
                      )
                    : cn('text-foreground hover:bg-accent cursor-pointer', activeDateClassName)
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
