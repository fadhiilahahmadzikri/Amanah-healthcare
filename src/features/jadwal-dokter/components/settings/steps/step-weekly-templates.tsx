'use client';

import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type {
  WeeklyTemplateConfig,
  SessionDefConfig,
  DayInfoConfig
} from '../../../api/admin-schedule-configuration.api';

interface StepWeeklyTemplatesProps {
  days: DayInfoConfig[];
  sessionDefs: SessionDefConfig[];
  weeklyTemplates: WeeklyTemplateConfig[];
  onToggleShiftActive: (dow: number, sessionId: string) => void;
  onUpdateTime: (
    dow: number,
    sessionId: string,
    field: 'startsAt' | 'endsAt',
    value: string
  ) => void;
}

export function StepWeeklyTemplates({
  days,
  sessionDefs,
  weeklyTemplates,
  onToggleShiftActive,
  onUpdateTime
}: StepWeeklyTemplatesProps) {
  const [selectedDow, setSelectedDow] = useState<number>(days[0]?.dow ?? 1);

  // Group templates by session for selected day
  const dayTemplates = weeklyTemplates.filter((t) => t.dow === selectedDow);

  return (
    <div className='flex flex-col gap-3.5'>
      {/* Day Pills Bar */}
      <div className='flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none'>
        {days.map((d) => {
          const isSelected = selectedDow === d.dow;
          const activeCount = weeklyTemplates.filter(
            (t) => t.dow === d.dow && t.isActive
          ).length;

          return (
            <button
              key={d.dow}
              type='button'
              onClick={() => setSelectedDow(d.dow)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span>{d.label}</span>
              <span
                className={`text-[10px] px-1 rounded-full ${
                  isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted-foreground/20'
                }`}
              >
                {activeCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Shifts on selected day */}
      <div className='flex flex-col gap-2.5 mt-1'>
        {sessionDefs.map((def) => {
          const template = dayTemplates.find((t) => t.sessionId === def.id);
          if (!template) return null;

          const isActive = template.isActive;
          const isMasterActive = def.isActive && (template.isMasterActive ?? true);
          const startsAt = template.startsAt.slice(0, 5);
          const endsAt = template.endsAt.slice(0, 5);
          const isInvalidTime = isActive && startsAt >= endsAt;
          const shiftLabel = template.sessionLabel;

          return (
            <div
              key={def.id}
              className={`p-3 rounded-xl border transition-all ${
                !isMasterActive
                  ? 'border-border/40 bg-muted/20 opacity-60'
                  : isActive
                  ? 'border-border/90 bg-card shadow-xs'
                  : 'border-border/40 bg-muted/15 opacity-70'
              }`}
            >
              <div className='flex items-center justify-between gap-3'>
                <div className='flex items-center gap-2.5 min-w-0'>
                  <div className='size-7 rounded-md bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0'>
                    {def.codePrefix}
                  </div>
                  <div className='flex flex-col'>
                    <div className='flex items-center gap-1.5'>
                      <span className='font-semibold text-sm text-foreground'>
                        {shiftLabel}
                      </span>
                      <Badge variant='outline' className='text-[10px] px-1 py-0 h-3.5 font-mono'>
                        {template.sessionCode}
                      </Badge>
                      {!isMasterActive && (
                        <Badge
                          variant='outline'
                          className='text-[10px] px-1.5 py-0 h-4 font-normal bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        >
                          Nonaktif di Master Shift
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <span className='text-xs text-muted-foreground'>
                    {!isMasterActive ? 'Nonaktif (Master)' : isActive ? 'Aktif' : 'Libur'}
                  </span>
                  <Switch
                    checked={isActive}
                    disabled={!isMasterActive}
                    onCheckedChange={() => onToggleShiftActive(selectedDow, def.id)}
                    aria-label={`Aktifkan shift ${shiftLabel}`}
                  />
                </div>
              </div>

              {isActive && isMasterActive && (
                <div className='mt-2.5 pt-2.5 border-t border-border/50 flex flex-wrap items-center gap-3'>
                  <div className='flex items-center gap-1.5'>
                    <span className='text-xs text-muted-foreground'>Mulai:</span>
                    <Input
                      type='time'
                      value={startsAt}
                      onChange={(e) =>
                        onUpdateTime(selectedDow, def.id, 'startsAt', `${e.target.value}:00`)
                      }
                      className='h-7 w-24 text-xs font-mono px-2'
                    />
                  </div>

                  <span className='text-muted-foreground text-xs'>s/d</span>

                  <div className='flex items-center gap-1.5'>
                    <span className='text-xs text-muted-foreground'>Selesai:</span>
                    <Input
                      type='time'
                      value={endsAt}
                      onChange={(e) =>
                        onUpdateTime(selectedDow, def.id, 'endsAt', `${e.target.value}:00`)
                      }
                      className='h-7 w-24 text-xs font-mono px-2'
                    />
                  </div>

                  {isInvalidTime && (
                    <span className='text-[11px] text-destructive font-medium'>
                      Jam selesai harus lebih lambat dari jam mulai!
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
