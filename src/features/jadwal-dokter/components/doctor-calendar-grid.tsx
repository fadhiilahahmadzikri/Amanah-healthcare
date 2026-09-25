'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { MonthlyScheduleDay, ScheduleDayStatus } from '../api/types';

interface DoctorCalendarGridProps {
  days?: MonthlyScheduleDay[];
  onSelectDayStatus?: (day: number, status: ScheduleDayStatus) => void;
  readOnly?: boolean;
}

function getStatusPillClasses(status: ScheduleDayStatus, badgeVariant?: string): string {
  if (badgeVariant === 'success')
    return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
  if (badgeVariant === 'danger')
    return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30';
  if (badgeVariant === 'warning')
    return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30';
  if (badgeVariant === 'neutral') return 'bg-muted/40 text-muted-foreground border-border/60';

  const upper = (status || '').toUpperCase();
  if (upper === 'OPEN' || upper === 'BUKA') {
    return 'bg-success-subtle text-success border-success-border';
  }
  if (upper === 'OCCUPIED' || upper === 'TERISI') {
    return 'bg-warning-subtle text-warning border-warning-border';
  }
  if (upper === 'CUTI') {
    return 'bg-info-subtle text-info border-info-border';
  }
  return 'bg-muted/40 text-muted-foreground border-border/60';
}

function getStatusDot(status: ScheduleDayStatus, badgeVariant?: string): string {
  if (badgeVariant === 'success') return 'bg-emerald-500';
  if (badgeVariant === 'danger') return 'bg-rose-500';
  if (badgeVariant === 'warning') return 'bg-amber-500';
  if (badgeVariant === 'neutral') return 'bg-muted-foreground/40';

  const upper = (status || '').toUpperCase();
  if (upper === 'OPEN' || upper === 'BUKA') {
    return 'bg-success';
  }
  if (upper === 'OCCUPIED' || upper === 'TERISI') {
    return 'bg-warning';
  }
  if (upper === 'CUTI') {
    return 'bg-info';
  }
  return 'bg-muted-foreground/40';
}

export function DoctorCalendarGrid({
  days = [],
  onSelectDayStatus,
  readOnly = false
}: DoctorCalendarGridProps) {
  // Days of week in Indonesian starting from Monday: Sen, Sel, Rab, Kam, Jum, Sab, Min
  const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  const firstDateStr = days[0]?.date;
  const startOffset = React.useMemo(() => {
    if (firstDateStr) {
      const d = new Date(firstDateStr);
      if (!Number.isNaN(d.getTime())) {
        // Monday = 0, Sunday = 6
        return (d.getDay() + 6) % 7;
      }
    }
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return (firstDay.getDay() + 6) % 7;
  }, [firstDateStr]);

  const safeDays = React.useMemo(() => {
    if (days && days.length > 0) return days;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const monthStr = String(month + 1).padStart(2, '0');
    return Array.from({ length: totalDays }, (_, i) => ({
      day: i + 1,
      date: `${year}-${monthStr}-${String(i + 1).padStart(2, '0')}`,
      status: 'CLOSED' as ScheduleDayStatus
    }));
  }, [days]);

  return (
    <div className='w-full space-y-2.5 select-none'>
      {/* 1. Day of Week Header */}
      <div className='grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted-foreground/80 border-b border-border/40 pb-1.5'>
        {dayNames.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* 2. Month Calendar 7-Column Grid */}
      <div className='grid grid-cols-7 gap-1.5'>
        {/* Leading empty slots for starting day of month */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className='h-10 rounded-lg border border-dashed border-border/30 bg-muted/10 opacity-30'
          />
        ))}

        {/* Dynamic Calendar Days */}
        {safeDays.map((item) => {
          const badgeVariant =
            'badgeVariant' in item &&
            typeof (item as { badgeVariant?: unknown }).badgeVariant === 'string'
              ? (item as { badgeVariant: string }).badgeVariant
              : undefined;
          const dotColor = getStatusDot(item.status, badgeVariant);
          const cellClasses = cn(
            'h-10 rounded-lg border p-1 flex flex-col justify-between items-center transition-all text-xs',
            getStatusPillClasses(item.status, badgeVariant),
            !readOnly && 'hover:border-primary/50 hover:shadow-xs cursor-pointer'
          );

          if (readOnly) {
            return (
              <div key={item.day} className={cellClasses}>
                <span className='font-bold tabular-nums text-[11px]'>{item.day}</span>
                {dotColor && <span className={cn('size-1.5 rounded-full shrink-0', dotColor)} />}
              </div>
            );
          }

          return (
            <DropdownMenu key={item.day}>
              <DropdownMenuTrigger asChild>
                <button type='button' className={cellClasses}>
                  <span className='font-bold tabular-nums text-[11px]'>{item.day}</span>
                  {dotColor ? (
                    <span className={cn('size-1.5 rounded-full shrink-0', dotColor)} />
                  ) : (
                    <span className='text-[8.5px] opacity-40'>-</span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='center' className='w-36'>
                <div className='px-2 py-1 text-[10px] font-semibold text-muted-foreground'>
                  Set status tanggal {item.day}:
                </div>
                {[
                  { value: 'OPEN' as const, label: 'Buka' },
                  { value: 'CLOSED' as const, label: 'Tutup' }
                ].map((opt) => {
                  const upperStatus = (item.status || '').toUpperCase();
                  const isMatch = upperStatus === opt.value;
                  return (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => onSelectDayStatus?.(item.day, opt.value as ScheduleDayStatus)}
                      className='text-xs font-medium cursor-pointer'
                    >
                      <span className='mr-1.5'>{opt.label}</span>
                      {isMatch && <span className='text-primary ml-auto'>✓</span>}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}
      </div>

      {/* 3. Calendar Legend */}
      <div className='flex flex-wrap items-center justify-end gap-3.5 pt-1 text-[11px] font-medium text-muted-foreground'>
        <div className='flex items-center gap-1.5'>
          <span className='size-2 rounded-full bg-success' />
          <span className='text-success font-medium'>Buka / Tersedia</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <span className='size-2 rounded-full bg-warning' />
          <span className='text-warning font-medium'>Penuh</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <span className='size-2 rounded-full bg-info' />
          <span className='text-info font-medium'>Cuti</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <span className='size-2 rounded-full bg-muted-foreground/40' />
          <span className='text-muted-foreground font-medium'>Tutup</span>
        </div>
      </div>
    </div>
  );
}
