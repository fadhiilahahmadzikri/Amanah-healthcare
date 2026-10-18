'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { DoctorDailySession } from '../../api/types';

export interface DoctorSessionsHeaderProps {
  formattedSelectedDate: string;
  isDayCuti: boolean;
  isDayClosed: boolean;
  activeSessions: DoctorDailySession[];
  isCurrentDayToday: boolean;
  readOnly: boolean;
  onToday: () => void;
  onPrevDay?: () => void;
  onNextDay?: () => void;
  isCalendarOpen: boolean;
  onToggleCalendar: () => void;
  onAddSchedule?: () => void;
}

export function DoctorSessionsHeader({
  formattedSelectedDate,
  isDayCuti,
  isDayClosed,
  activeSessions,
  isCurrentDayToday,
  readOnly,
  onToday,
  onPrevDay,
  onNextDay,
  isCalendarOpen,
  onToggleCalendar,
  onAddSchedule
}: DoctorSessionsHeaderProps) {
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
      <div className='flex items-center gap-1.5 shrink-0 flex-wrap justify-end'>
        {/* Date Stepper [ < | Hari Ini | > ] */}
        <div className='inline-flex items-center rounded-lg border border-border/60 bg-background shadow-2xs overflow-hidden h-7'>
          {onPrevDay && (
            <button
              type='button'
              onClick={onPrevDay}
              className='size-7 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
              title='Hari Sebelumnya'
              aria-label='Hari Sebelumnya'
            >
              <Icons.chevronLeft className='size-3.5' />
            </button>
          )}
          <button
            type='button'
            onClick={onToday}
            className={cn(
              'px-2.5 h-full text-xs font-semibold hover:bg-muted text-foreground/85 hover:text-foreground transition-colors cursor-pointer flex items-center',
              onPrevDay && 'border-l border-border/50',
              onNextDay && 'border-r border-border/50',
              isCurrentDayToday && 'bg-primary/10 text-primary font-bold'
            )}
            title='Kembali ke Hari Ini'
          >
            Hari Ini
          </button>
          {onNextDay && (
            <button
              type='button'
              onClick={onNextDay}
              className='size-7 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
              title='Hari Berikutnya'
              aria-label='Hari Berikutnya'
            >
              <Icons.chevronRight className='size-3.5' />
            </button>
          )}
        </div>

        {/* Calendar Toggle Button */}
        <button
          type='button'
          onClick={onToggleCalendar}
          className={cn(
            'size-7 flex items-center justify-center rounded-lg border border-border/60 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shadow-2xs cursor-pointer',
            isCalendarOpen && 'border-primary/50 bg-primary/10 text-primary font-bold shadow-xs'
          )}
          aria-label='Buka kalender tanggal'
          title='Buka kalender'
        >
          <Icons.calendar className='size-3.5' />
        </button>

        {/* Atur Sesi Button (Text-based with gear icon alongside calendar) */}
        {onAddSchedule && !readOnly && (
          <button
            type='button'
            onClick={onAddSchedule}
            className='h-7 inline-flex items-center gap-1.5 px-2.5 rounded-lg border border-border/60 bg-background hover:bg-muted text-foreground/90 hover:text-foreground text-xs font-semibold shadow-2xs transition-colors cursor-pointer select-none'
            title='Atur sesi jadwal kerja dokter'
          >
            <Icons.settings className='size-3.5 text-muted-foreground' />
            <span>Atur Sesi</span>
          </button>
        )}
      </div>
    </div>
  );
}
