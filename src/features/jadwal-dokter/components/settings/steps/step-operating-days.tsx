'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { DayInfoConfig } from '../../../api/admin-schedule-configuration.api';

interface StepOperatingDaysProps {
  days: DayInfoConfig[];
  onToggleDayActive: (dow: number) => void;
  onBackToSessionDefs?: () => void;
}

export function StepOperatingDays({ days, onToggleDayActive }: StepOperatingDaysProps) {
  return (
    <div className='flex flex-col gap-2.5'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5'>
        {days.map((day) => {
          const isWeekend = day.dow === 0 || day.dow === 6;

          return (
            <div
              key={day.dow}
              className={cn(
                'flex items-center justify-between p-3 rounded-xl border transition-all duration-150',
                day.isActive
                  ? 'border-border/90 bg-card shadow-2xs'
                  : 'border-border/40 bg-muted/15 opacity-75'
              )}
            >
              <div className='flex items-center gap-2 min-w-0'>
                <span className='font-semibold text-xs sm:text-sm text-foreground'>
                  {day.label}
                </span>
                {isWeekend && (
                  <span className='text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-normal'>
                    Akhir Pekan
                  </span>
                )}
              </div>

              <div className='flex items-center gap-2 shrink-0 ml-2'>
                <Switch
                  checked={day.isActive}
                  onCheckedChange={() => onToggleDayActive(day.dow)}
                  aria-label={`Aktifkan hari ${day.label}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
