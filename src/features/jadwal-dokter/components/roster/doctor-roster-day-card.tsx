'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { DoctorRosterDayItem } from '../../api/service';
import { DoctorRosterSessionRow } from './doctor-roster-session-row';

export interface DoctorRosterDayCardProps {
  day: DoctorRosterDayItem;
  selectedAssignments: Record<string, boolean>;
  onToggleDay: (dow: number) => void;
  onToggleSession: (dow: number, sessionId: string) => void;
  onResetDayToTemplate: (dow: number) => void;
  className?: string;
}

/**
 * Pure Atomic Presentation Component: DoctorRosterDayCard
 * Renders a single day card in the staff roster grid with header, switches, and session rows.
 */
export function DoctorRosterDayCard({
  day,
  selectedAssignments,
  onToggleDay,
  onToggleSession,
  onResetDayToTemplate,
  className
}: DoctorRosterDayCardProps) {
  const isDoctorAssignedOnDay = day.sessions.some((s) =>
    Boolean(selectedAssignments[`${day.dow}_${s.sessionId}`])
  );
  const isToday = day.dow === new Date().getDay();

  return (
    <div
      className={cn(
        'p-3.5 rounded-xl border transition-colors flex flex-col justify-between min-w-0',
        !day.isOperatingDay
          ? 'bg-muted/15 border-dashed border-border/40 opacity-60'
          : isDoctorAssignedOnDay
            ? 'bg-card border-border/80 shadow-2xs'
            : 'bg-muted/30 border-border/60',
        isToday && 'ring-2 ring-primary border-primary bg-primary/[0.04]',
        className
      )}
    >
      {/* Header: Day Name, Today Badge, Reset Button, Status Switch */}
      <div className='flex items-center justify-between pb-2 mb-2.5 border-b border-border/40 gap-1.5'>
        <div className='flex items-center gap-1.5 min-w-0'>
          <span
            className={cn(
              'font-bold text-sm whitespace-nowrap',
              !day.isOperatingDay ? 'text-muted-foreground' : 'text-foreground'
            )}
          >
            {day.dayName}
          </span>
          {isToday && (
            <span className='text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-bold shrink-0'>
              Hari Ini
            </span>
          )}
        </div>

        <div className='flex items-center gap-1.5 shrink-0'>
          {day.isOperatingDay &&
            day.sessions.some(
              (s) =>
                Boolean(selectedAssignments[`${day.dow}_${s.sessionId}`]) !==
                Boolean(s.isTemplateActive)
            ) && (
              <button
                type='button'
                onClick={() => onResetDayToTemplate(day.dow)}
                title={`Sesuaikan jadwal hari ${day.dayName} ke template mingguan`}
                className='size-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer'
              >
                <Icons.refresh className='size-3' />
              </button>
            )}

          <span
            className={cn(
              'text-xs font-semibold',
              !day.isOperatingDay
                ? 'text-muted-foreground/60'
                : isDoctorAssignedOnDay
                  ? 'text-primary'
                  : 'text-muted-foreground'
            )}
          >
            {!day.isOperatingDay ? 'Tutup' : isDoctorAssignedOnDay ? 'Aktif' : 'Libur'}
          </span>

          <Switch
            checked={day.isOperatingDay && isDoctorAssignedOnDay}
            disabled={!day.isOperatingDay}
            onCheckedChange={() => onToggleDay(day.dow)}
            aria-label={`Aktifkan jadwal dokter hari ${day.dayName}`}
          />
        </div>
      </div>

      {/* Sessions Checkbox List */}
      <div className='space-y-1.5'>
        {day.sessions.map((s) => (
          <DoctorRosterSessionRow
            key={s.sessionId}
            dow={day.dow}
            dayName={day.dayName}
            session={s}
            isChecked={Boolean(selectedAssignments[`${day.dow}_${s.sessionId}`])}
            isOperatingDay={day.isOperatingDay}
            onToggleSession={onToggleSession}
          />
        ))}
      </div>
    </div>
  );
}
