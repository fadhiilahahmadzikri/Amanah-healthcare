'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export const MONTH_NAMES = [
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
];

export const AVAILABLE_YEARS = [2024, 2025, 2026, 2027];

export interface DoctorCalendarHeaderProps {
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onToday: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function DoctorCalendarHeader({
  currentMonth,
  currentYear,
  onMonthChange,
  onYearChange,
  onToday,
  onPrevMonth,
  onNextMonth
}: DoctorCalendarHeaderProps) {
  return (
    <div className='p-3.5 sm:p-4 border-b border-border/40 flex flex-wrap items-center justify-between gap-3 bg-muted/10 shrink-0'>
      <div className='flex items-center gap-3'>
        <h2 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h2>
        <button
          type='button'
          onClick={onToday}
          className='px-3 py-1 text-xs font-semibold rounded-full border border-border/60 bg-background hover:bg-muted text-foreground/85 hover:text-foreground transition-colors shadow-2xs cursor-pointer'
        >
          Hari Ini
        </button>
      </div>

      <div className='flex items-center gap-2 flex-wrap'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type='button'
              className='inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-border/50 bg-background hover:bg-muted text-xs font-semibold text-foreground/90 shadow-2xs transition-colors cursor-pointer'
            >
              <span>{MONTH_NAMES[currentMonth]}</span>
              <Icons.chevronDown className='size-3 text-muted-foreground' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-36 max-h-56 overflow-y-auto'>
            {MONTH_NAMES.map((name, index) => (
              <DropdownMenuItem
                key={name}
                onClick={() => onMonthChange(index)}
                className={cn(
                  'text-xs font-medium cursor-pointer',
                  currentMonth === index && 'bg-primary/10 text-primary font-bold'
                )}
              >
                {name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type='button'
              className='inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-border/50 bg-background hover:bg-muted text-xs font-semibold text-foreground/90 shadow-2xs transition-colors cursor-pointer'
            >
              <span>{currentYear}</span>
              <Icons.chevronDown className='size-3 text-muted-foreground' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-28'>
            {AVAILABLE_YEARS.map((year) => (
              <DropdownMenuItem
                key={year}
                onClick={() => onYearChange(year)}
                className={cn(
                  'text-xs font-medium cursor-pointer',
                  currentYear === year && 'bg-primary/10 text-primary font-bold'
                )}
              >
                {year}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className='flex items-center border border-border/50 rounded-lg bg-background p-0.5 shadow-2xs'>
          <button
            type='button'
            onClick={onPrevMonth}
            className='size-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
            aria-label='Bulan Sebelumnya'
          >
            <Icons.chevronLeft className='size-4' />
          </button>
          <button
            type='button'
            onClick={onNextMonth}
            className='size-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
            aria-label='Bulan Berikutnya'
          >
            <Icons.chevronRight className='size-4' />
          </button>
        </div>
      </div>
    </div>
  );
}
