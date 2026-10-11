'use client';

import React, { useState, useMemo } from 'react';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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

const BASE_TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});

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

  const getTimeOptions = (currentTime: string) => {
    if (!currentTime || BASE_TIME_OPTIONS.includes(currentTime)) {
      return BASE_TIME_OPTIONS;
    }
    return [...BASE_TIME_OPTIONS, currentTime].sort();
  };

  return (
    <div className='flex flex-col gap-3'>
      {/* Day Pills Bar */}
      <div className='flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none'>
        {days.map((d) => {
          const isSelected = selectedDow === d.dow;
          const activeCount = weeklyTemplates.filter((t) => {
            if (t.dow !== d.dow || !t.isActive) return false;
            const def = sessionDefs.find((s) => s.id === t.sessionId);
            return def ? def.isActive && (t.isMasterActive ?? true) : false;
          }).length;

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

      {/* Shifts on selected day - Single Row Hug Layout, Zero Blank Space, Custom UI Select */}
      <div className='flex flex-col gap-2 max-h-[58vh] overflow-y-auto pr-1'>
        {sessionDefs
          .filter((def) => def.isActive)
          .map((def) => {
            const template = dayTemplates.find((t) => t.sessionId === def.id);
            if (!template || template.isMasterActive === false) return null;

            const isActive = template.isActive;
            const startsAt = template.startsAt.slice(0, 5);
            const endsAt = template.endsAt.slice(0, 5);
            const isInvalidTime = isActive && startsAt >= endsAt;
            const shiftLabel = template.sessionLabel;

            return (
              <div
                key={def.id}
                className={`p-3 rounded-xl border space-y-2.5 transition-all ${
                  isActive
                    ? 'border-border/90 bg-card shadow-2xs'
                    : 'border-border/40 bg-muted/10 opacity-75'
                }`}
              >
                {/* Row 1: Header (Shift Label on Left, Status Switch on Right) */}
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-2 min-w-0'>
                    <span className='font-semibold text-xs sm:text-sm text-foreground truncate'>
                      {shiftLabel}
                    </span>
                  </div>

                  <div className='flex items-center gap-2 shrink-0'>
                    <span className='text-xs text-muted-foreground'>
                      {isActive ? 'Buka' : 'Tutup'}
                    </span>
                    <Switch
                      checked={isActive}
                      onCheckedChange={() => onToggleShiftActive(selectedDow, def.id)}
                      aria-label={`Aktifkan shift ${shiftLabel}`}
                    />
                  </div>
                </div>

                {/* Row 2: Timing Selectors (Di bawah, 2 kolom setara) */}
                {isActive && (
                <div className='grid grid-cols-2 gap-2.5 pt-2 border-t border-border/50'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-[10px] font-medium text-muted-foreground'>Jam Mulai</span>
                    <Select
                      value={startsAt}
                      onValueChange={(val) =>
                        onUpdateTime(selectedDow, def.id, 'startsAt', `${val}:00`)
                      }
                    >
                      <SelectTrigger className='h-8 w-full text-xs font-mono px-2.5 bg-background shadow-2xs'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='max-h-48'>
                        {getTimeOptions(startsAt).map((t) => (
                          <SelectItem key={t} value={t} className='text-xs font-mono'>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='flex flex-col gap-1'>
                    <span className='text-[10px] font-medium text-muted-foreground'>Jam Selesai</span>
                    <Select
                      value={endsAt}
                      onValueChange={(val) =>
                        onUpdateTime(selectedDow, def.id, 'endsAt', `${val}:00`)
                      }
                    >
                      <SelectTrigger
                        className={`h-8 w-full text-xs font-mono px-2.5 bg-background shadow-2xs ${
                          isInvalidTime ? 'border-destructive text-destructive' : ''
                        }`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='max-h-48'>
                        {getTimeOptions(endsAt).map((t) => (
                          <SelectItem key={t} value={t} className='text-xs font-mono'>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {isInvalidTime && (
                <div className='text-[11px] text-destructive font-medium text-right pr-1'>
                  Jam selesai harus lebih lambat dari jam mulai!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
