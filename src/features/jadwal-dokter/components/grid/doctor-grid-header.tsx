'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { DoctorDailySession } from '../../api/types';

export interface DoctorGridHeaderProps {
  formattedSelectedDate: string;
  isDayCuti: boolean;
  isDayClosed: boolean;
  activeSessions: DoctorDailySession[];
  isCurrentDayToday: boolean;
  activeDay: number;
  activeMonth: number;
  totalDaysInMonth: number;
  readOnly: boolean;
  onToday: () => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  onOpenAddSession: () => void;
}

export function DoctorGridHeader({
  formattedSelectedDate,
  isDayCuti,
  isDayClosed,
  activeSessions,
  isCurrentDayToday,
  activeDay,
  activeMonth,
  totalDaysInMonth,
  readOnly,
  onToday,
  onPrevDay,
  onNextDay,
  onOpenAddSession
}: DoctorGridHeaderProps) {
  return (
    <div className='p-3.5 sm:p-4 border-b border-border/40 flex items-center justify-between gap-3 bg-muted/10 font-sans'>
      {/* Left: Clear Typographic Hierarchy (Date + Operational Context) */}
      <div className='min-w-0'>
        <h2 className='text-sm sm:text-base font-bold text-foreground tracking-tight truncate'>
          {formattedSelectedDate}
        </h2>
        {(isDayCuti ||
          (isDayClosed && activeSessions.length === 0) ||
          activeSessions.length === 0) && (
          <div className='text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 font-normal'>
            {isDayCuti ? (
              <span className='text-sky-600 dark:text-sky-400 font-semibold'>
                Praktik Ditutup (Cuti)
              </span>
            ) : isDayClosed && activeSessions.length === 0 ? (
              <span className='text-destructive dark:text-destructive font-semibold'>
                Praktik Ditutup pada tanggal ini
              </span>
            ) : (
              <span className='text-muted-foreground font-medium'>
                Belum ada jadwal praktik diatur pada tanggal ini
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right: Grouped Navigation & Action Controls */}
      <div className='flex items-center gap-2 shrink-0 flex-wrap justify-end'>
        <button
          type='button'
          onClick={onToday}
          className={cn(
            'px-2.5 py-1 text-xs font-semibold rounded-lg border border-border/60 bg-background hover:bg-muted text-foreground/85 hover:text-foreground transition-colors shadow-2xs cursor-pointer',
            isCurrentDayToday && 'border-primary/50 bg-primary/10 text-primary font-bold'
          )}
        >
          Hari Ini
        </button>

        <div className='flex items-center border border-border/50 rounded-lg bg-background p-0.5 shadow-2xs'>
          <button
            type='button'
            onClick={onPrevDay}
            disabled={activeDay <= 1 && activeMonth <= 0}
            className='size-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer'
            aria-label='Hari Sebelumnya'
            title='Hari Sebelumnya'
          >
            <Icons.chevronLeft className='size-4' />
          </button>
          <button
            type='button'
            onClick={onNextDay}
            disabled={activeDay >= totalDaysInMonth && activeMonth >= 11}
            className='size-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer'
            aria-label='Hari Berikutnya'
            title='Hari Berikutnya'
          >
            <Icons.chevronRight className='size-4' />
          </button>
        </div>

        {!readOnly && !isDayCuti && !isDayClosed && (
          <button
            type='button'
            onClick={onOpenAddSession}
            className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-dashed border-border/80 hover:border-primary/70 bg-background hover:bg-primary/5 text-foreground/80 hover:text-primary transition-all shadow-2xs cursor-pointer select-none shrink-0'
          >
            <Icons.add className='size-3.5' />
            <span>Tambah jadwal</span>
          </button>
        )}
      </div>
    </div>
  );
}
