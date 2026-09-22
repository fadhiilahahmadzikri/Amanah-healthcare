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

function getStatusPillClasses(status: ScheduleDayStatus): string {
  switch (status) {
    case 'Buka':
      return 'bg-success-subtle text-success border-success-border';
    case 'Penuh':
      return 'bg-warning-subtle text-warning border-warning-border';
    case 'Tutup':
      return 'bg-muted/40 text-muted-foreground border-border/60';
    case 'Cuti':
    default:
      return 'bg-info-subtle text-info border-info-border';
  }
}

function getStatusDot(status: ScheduleDayStatus): string {
  switch (status) {
    case 'Buka':
      return 'bg-success';
    case 'Penuh':
      return 'bg-warning';
    case 'Tutup':
      return 'bg-muted-foreground/40';
    case 'Cuti':
    default:
      return 'bg-info';
  }
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
      status: 'Tutup' as ScheduleDayStatus
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
          const dotColor = getStatusDot(item.status);
          const cellClasses = cn(
            'h-10 rounded-lg border p-1 flex flex-col justify-between items-center transition-all text-xs',
            getStatusPillClasses(item.status),
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
                {(['Buka', 'Penuh', 'Cuti', 'Tutup'] as ScheduleDayStatus[]).map((st) => {
                  return (
                    <DropdownMenuItem
                      key={st}
                      onClick={() => onSelectDayStatus?.(item.day, st)}
                      className='text-xs font-medium cursor-pointer'
                    >
                      <span className='mr-1.5'>{st}</span>
                      {item.status === st && <span className='text-primary ml-auto'>✓</span>}
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
