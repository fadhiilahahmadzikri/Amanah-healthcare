'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface MonthGridCalendarProps {
  value?: string;
  onChange: (monthValue: string) => void;
  className?: string;
  minYear?: number;
  maxYear?: number;
}

export const INDO_MONTH_NAMES = [
  { short: 'Jan', full: 'Januari', index: 0 },
  { short: 'Feb', full: 'Februari', index: 1 },
  { short: 'Mar', full: 'Maret', index: 2 },
  { short: 'Apr', full: 'April', index: 3 },
  { short: 'Mei', full: 'Mei', index: 4 },
  { short: 'Jun', full: 'Juni', index: 5 },
  { short: 'Jul', full: 'Juli', index: 6 },
  { short: 'Ags', full: 'Agustus', index: 7 },
  { short: 'Sep', full: 'September', index: 8 },
  { short: 'Okt', full: 'Oktober', index: 9 },
  { short: 'Nov', full: 'November', index: 10 },
  { short: 'Des', full: 'Desember', index: 11 }
] as const;

export function MonthGridCalendar({
  value = 'ALL',
  onChange,
  className,
  minYear = 2020,
  maxYear = 2035
}: MonthGridCalendarProps) {
  const today = React.useMemo(() => new Date(), []);
  const todayYear = today.getFullYear();
  const todayMonthIndex = today.getMonth();

  // Parse initial year from value string (e.g. "Okt 2026")
  const parsedYear = React.useMemo(() => {
    if (!value || value === 'ALL') return todayYear;
    const parts = value.trim().split(' ');
    if (parts.length >= 2) {
      const yr = parseInt(parts[1], 10);
      if (!Number.isNaN(yr)) return yr;
    }
    return todayYear;
  }, [value, todayYear]);

  const [currentYear, setCurrentYear] = React.useState<number>(parsedYear);

  React.useEffect(() => {
    if (parsedYear && parsedYear !== currentYear) {
      setCurrentYear(parsedYear);
    }
  }, [parsedYear]);

  const isAllSelected = !value || value === 'ALL';

  const handlePrevYear = () => {
    setCurrentYear((prev) => Math.max(minYear, prev - 1));
  };

  const handleNextYear = () => {
    setCurrentYear((prev) => Math.min(maxYear, prev + 1));
  };

  const handleSelectMonth = (shortName: string) => {
    onChange(`${shortName} ${currentYear}`);
  };

  const handleSelectAll = () => {
    onChange('ALL');
  };

  return (
    <div className={cn('w-full select-none font-sans space-y-3', className)}>
      {/* 1. Year Header Navigation & All Months Quick Button */}
      <div className='flex items-center justify-between gap-2 px-1'>
        <div className='flex items-center gap-1.5'>
          <button
            type='button'
            onClick={handlePrevYear}
            disabled={currentYear <= minYear}
            aria-label='Tahun sebelumnya'
            className='size-7 rounded-lg border border-border/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer'
          >
            <Icons.chevronLeft className='size-3.5' />
          </button>

          <span className='text-sm font-bold text-foreground font-mono px-1.5'>
            {currentYear}
          </span>

          <button
            type='button'
            onClick={handleNextYear}
            disabled={currentYear >= maxYear}
            aria-label='Tahun berikutnya'
            className='size-7 rounded-lg border border-border/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer'
          >
            <Icons.chevronRight className='size-3.5' />
          </button>
        </div>

        <Button
          type='button'
          variant={isAllSelected ? 'primary' : 'outline'}
          size='sm'
          shape='pill'
          onClick={handleSelectAll}
          className='text-xs h-7 px-3 font-semibold cursor-pointer'
        >
          Semua Bulan
        </Button>
      </div>

      {/* 2. 12-Month Calendar Grid */}
      <div className='grid grid-cols-3 sm:grid-cols-4 gap-2'>
        {INDO_MONTH_NAMES.map((m) => {
          const formattedValue = `${m.short} ${currentYear}`;
          const isSelected = value === formattedValue;
          const isCurrentMonth = currentYear === todayYear && m.index === todayMonthIndex;

          return (
            <button
              key={m.short}
              type='button'
              onClick={() => handleSelectMonth(m.short)}
              className={cn(
                'flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer select-none',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                  : isCurrentMonth
                    ? 'bg-card text-primary border-primary/50 font-semibold ring-1 ring-primary/30 hover:bg-muted/60'
                    : 'bg-card text-foreground border-border/60 hover:bg-muted/60 font-medium'
              )}
            >
              <span className='text-xs tracking-tight'>{m.full}</span>
              <span
                className={cn(
                  'text-[10px] opacity-75 font-mono pt-0.5',
                  isSelected ? 'text-primary-foreground/90' : 'text-muted-foreground'
                )}
              >
                {m.short}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
