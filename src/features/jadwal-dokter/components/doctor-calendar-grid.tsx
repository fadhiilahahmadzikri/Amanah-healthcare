'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { getStatusConfig } from '@/styles/clinical-tokens';
import { cn } from '@/lib/utils';
import type { MonthlyScheduleDay, ScheduleDayStatus } from '../api/types';

interface DoctorCalendarGridProps {
  days?: MonthlyScheduleDay[];
  onSelectDayStatus?: (day: number, status: ScheduleDayStatus) => void;
  readOnly?: boolean;
}

export function DoctorCalendarGrid({
  days = [],
  onSelectDayStatus,
  readOnly = false
}: DoctorCalendarGridProps) {
  // Days of week in Indonesian starting from Friday (since 1 Mei 2026 was Friday)
  // 1 Mei 2026 was Friday: offset 4 empty spaces for Sen, Sel, Rab, Kam
  const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const startOffset = 4;

  const safeDays =
    days && days.length > 0
      ? days
      : Array.from({ length: 31 }, (_, i) => ({
          day: i + 1,
          date: `2026-05-${String(i + 1).padStart(2, '0')}`,
          status: 'Aktif' as ScheduleDayStatus
        }));

  const getStatusPillClasses = (status: ScheduleDayStatus) => {
    switch (status) {
      case 'Aktif':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
      case 'Sebagian':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30';
      case 'Cuti / Tutup':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30';
      case 'Tutup':
        return 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30';
      case 'Off':
      default:
        return 'bg-muted/30 text-muted-foreground/60 border-border/30';
    }
  };

  const getStatusDot = (status: ScheduleDayStatus) => {
    switch (status) {
      case 'Aktif':
        return 'bg-emerald-500';
      case 'Sebagian':
        return 'bg-amber-500';
      case 'Cuti / Tutup':
        return 'bg-purple-500';
      case 'Tutup':
        return 'bg-red-500';
      case 'Off':
      default:
        return null;
    }
  };

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
        {/* Leading empty slots for starting day of month (Friday) */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className='h-10 rounded-lg border border-dashed border-border/30 bg-muted/10 opacity-30'
          />
        ))}

        {/* 31 Calendar Days */}
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
                  Set tanggal {item.day} Mei:
                </div>
                {(['Aktif', 'Sebagian', 'Cuti / Tutup', 'Tutup', 'Off'] as ScheduleDayStatus[]).map(
                  (st) => {
                    const cfg = getStatusConfig(st);
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
                  }
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}
      </div>

      {/* 3. Legend Footer matching Dataset 3 & 4 */}
      <div className='flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-[11px]'>
        <div className='flex items-center gap-1.5 font-medium'>
          <span className='size-2 rounded-full bg-emerald-500' />
          <span className='text-muted-foreground'>Aktif</span>
        </div>
        <div className='flex items-center gap-1.5 font-medium'>
          <span className='size-2 rounded-full bg-amber-500' />
          <span className='text-muted-foreground'>Sebagian</span>
        </div>
        <div className='flex items-center gap-1.5 font-medium'>
          <span className='size-2 rounded-full bg-purple-500' />
          <span className='text-muted-foreground'>Cuti / Tutup</span>
        </div>
        <div className='flex items-center gap-1.5 font-medium'>
          <span className='size-2 rounded-full bg-red-500' />
          <span className='text-muted-foreground'>Tutup</span>
        </div>
        <div className='flex items-center gap-1.5 font-medium'>
          <span className='size-2 rounded-full bg-muted-foreground/40' />
          <span className='text-muted-foreground'>Libur</span>
        </div>
      </div>
    </div>
  );
}
