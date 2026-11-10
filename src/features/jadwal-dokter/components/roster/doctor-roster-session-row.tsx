'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { DoctorRosterSessionItem } from '../../api/service';

export interface DoctorRosterSessionRowProps {
  dow: number;
  dayName: string;
  session: DoctorRosterSessionItem;
  isChecked: boolean;
  isOperatingDay: boolean;
  onToggleSession: (dow: number, sessionId: string) => void;
  className?: string;
}

/**
 * Pure Atomic Presentation Component: DoctorRosterSessionRow
 * Renders a single session checkbox row within a day card in the staff roster.
 */
export function DoctorRosterSessionRow({
  dow,
  dayName,
  session,
  isChecked,
  isOperatingDay,
  onToggleSession,
  className
}: DoctorRosterSessionRowProps) {
  const key = `${dow}_${session.sessionId}`;
  const isSessionDisabled = !isOperatingDay || !session.isTemplateActive;

  return (
    <label
      htmlFor={`session-chk-${key}`}
      className={cn(
        'flex items-center justify-between p-2 rounded-lg border text-xs transition-colors',
        isSessionDisabled
          ? 'bg-muted/10 border-border/30 text-muted-foreground/50 opacity-60 cursor-not-allowed'
          : isChecked
            ? 'bg-primary/5 border-primary/40 text-foreground font-semibold cursor-pointer'
            : 'bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/40 cursor-pointer',
        className
      )}
    >
      <div className='flex items-center gap-2.5 min-w-0 flex-1'>
        <input
          id={`session-chk-${key}`}
          type='checkbox'
          aria-label={`${dayName} ${session.sessionLabel}`}
          checked={!isSessionDisabled && isChecked}
          disabled={isSessionDisabled}
          onChange={() => onToggleSession(dow, session.sessionId)}
          className='size-4 rounded border-border text-primary focus:ring-primary/30 accent-primary disabled:cursor-not-allowed cursor-pointer shrink-0'
        />
        <div className='min-w-0 flex-1 flex flex-col'>
          <span
            className={cn(
              'font-semibold text-xs whitespace-nowrap',
              isSessionDisabled ? 'text-muted-foreground/60' : 'text-foreground'
            )}
          >
            {session.sessionLabel}
          </span>
          <span className='text-[10.5px] text-muted-foreground font-mono whitespace-nowrap'>
            {!session.isTemplateActive ? 'Shift Nonaktif' : session.timeRange}
          </span>
        </div>
      </div>
    </label>
  );
}
