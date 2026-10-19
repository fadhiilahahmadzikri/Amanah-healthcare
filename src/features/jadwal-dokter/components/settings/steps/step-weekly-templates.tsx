'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
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
import { formatFriendlySessionName } from '../../../constants/schedule-shift.constants';

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
  onToggleDayActive?: (dow: number) => void;
  onNavigateToOperatingDays?: () => void;
  onNavigateToSessionDefs?: () => void;
}

const BASE_TIME_OPTIONS = [
  ...Array.from({ length: 48 }, (_, i) => {
    const h = String(Math.floor(i / 2)).padStart(2, '0');
    const m = i % 2 === 0 ? '00' : '30';
    return `${h}:${m}`;
  }),
  '24:00'
];

function getNearestActiveDow(currentDow: number, daysList: DayInfoConfig[]): number {
  const activeDays = daysList.filter((d) => d.isActive);
  if (activeDays.length === 0) return currentDow;
  if (activeDays.some((d) => d.dow === currentDow)) return currentDow;

  let nearest = activeDays[0];
  let minDiff = Math.abs(nearest.dow - currentDow);
  for (const day of activeDays) {
    const diff = Math.abs(day.dow - currentDow);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = day;
    }
  }
  return nearest.dow;
}

export function StepWeeklyTemplates({
  days,
  sessionDefs,
  weeklyTemplates,
  onToggleShiftActive,
  onUpdateTime,
  onToggleDayActive,
  onNavigateToOperatingDays,
  onNavigateToSessionDefs
}: StepWeeklyTemplatesProps) {
  const [selectedDow, setSelectedDow] = useState<number>(() => {
    return getNearestActiveDow(days[0]?.dow ?? 1, days);
  });

  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Ensure selectedDow is always an active operating day
  useEffect(() => {
    if (days.length === 0) return;
    const currentConfig = days.find((d) => d.dow === selectedDow);
    if (!currentConfig || !currentConfig.isActive) {
      const nearest = getNearestActiveDow(selectedDow, days);
      if (nearest !== selectedDow) {
        setSelectedDow(nearest);
      }
    }
  }, [days, selectedDow]);

  // GSAP animation on day switch
  useEffect(() => {
    if (!gridContainerRef.current) return;
    gsap.fromTo(
      gridContainerRef.current,
      { y: 10, opacity: 0, scale: 0.99 },
      { y: 0, opacity: 1, scale: 1, duration: 0.22, ease: 'power3.out' }
    );
  }, [selectedDow]);

  const selectedDayConfig = days.find((d) => d.dow === selectedDow);
  const isSelectedDayActive = selectedDayConfig?.isActive ?? true;

  // Group templates by session for selected day
  const dayTemplates = weeklyTemplates.filter((t) => t.dow === selectedDow);

  const getTimeOptions = (currentTime: string) => {
    if (!currentTime || BASE_TIME_OPTIONS.includes(currentTime)) {
      return BASE_TIME_OPTIONS;
    }
    return [...BASE_TIME_OPTIONS, currentTime].toSorted();
  };

  return (
    <div className='flex flex-col gap-3.5'>
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
              disabled={!d.isActive}
              onClick={() => setSelectedDow(d.dow)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                !d.isActive
                  ? 'bg-muted/20 text-muted-foreground/40 border border-dashed border-border/40 cursor-not-allowed opacity-60'
                  : isSelected
                    ? 'bg-primary text-primary-foreground shadow-xs cursor-pointer'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer'
              }`}
            >
              <span>{d.label}</span>
              {!d.isActive ? (
                <span className='inline-flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded bg-muted text-muted-foreground/70 font-normal'>
                  <Icons.lock className='size-2.5' />
                  Terkunci
                </span>
              ) : (
                <span
                  className={`text-[10px] px-1 rounded-full ${
                    isSelected
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted-foreground/20'
                  }`}
                >
                  {activeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!isSelectedDayActive && (
        <div className='flex flex-wrap items-center justify-between px-3.5 py-2.5 rounded-xl border border-border/80 bg-muted/20 text-xs text-muted-foreground gap-2'>
          <div className='flex items-center gap-2 min-w-0'>
            <Icons.lock className='size-3.5 text-muted-foreground/70 shrink-0' />
            <span className='font-medium'>
              Hari {selectedDayConfig?.label} dinonaktifkan di Pengaturan Hari Klinik (Terkunci).
            </span>
          </div>
          <div className='flex items-center gap-1.5 shrink-0'>
            {onToggleDayActive && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => onToggleDayActive(selectedDow)}
                className='text-xs h-7.5 px-2.5 font-semibold'
              >
                Aktifkan Hari Ini
              </Button>
            )}
            {onNavigateToOperatingDays && (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={onNavigateToOperatingDays}
                className='text-xs h-7.5 px-2 font-semibold text-primary hover:text-primary'
              >
                Atur Hari
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Shifts on selected day - 4 Sessions Horizontal Kanban Grid */}
      <div ref={gridContainerRef} className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
        {sessionDefs
          .filter((def) => def.isActive)
          .map((def) => {
            const template = dayTemplates.find((t) => t.sessionId === def.id);
            if (!template || template.isMasterActive === false) return null;

            const isActive = template.isActive;
            const startsAt = template.startsAt.slice(0, 5);
            const endsAt = template.endsAt.slice(0, 5);
            const isInvalidTime = isActive && startsAt >= endsAt;
            const shiftLabel =
              formatFriendlySessionName(template.sessionLabel) || template.sessionLabel;

            return (
              <div
                key={def.id}
                className={cn(
                  'p-3.5 rounded-xl border flex flex-col justify-between transition-all min-w-0',
                  isActive
                    ? 'border-border/90 bg-card shadow-2xs'
                    : 'border-border/40 bg-muted/10 opacity-75'
                )}
              >
                <div>
                  {/* Row 1: Header (Shift Label on Left, Status Switch on Right) */}
                  <div className='flex items-center justify-between pb-2 mb-2.5 border-b border-border/40 gap-1.5'>
                    <span className='font-semibold text-xs sm:text-sm text-foreground truncate'>
                      {shiftLabel}
                    </span>

                    <div className='flex items-center gap-1.5 shrink-0'>
                      <span className='text-[11px] text-muted-foreground'>
                        {isActive ? 'Buka' : 'Tutup'}
                      </span>
                      <Switch
                        checked={isActive}
                        onCheckedChange={() => onToggleShiftActive(selectedDow, def.id)}
                        aria-label={`Aktifkan shift ${shiftLabel}`}
                      />
                    </div>
                  </div>

                  {/* Row 2: Master Operating Hours Badge */}
                  {isActive ? (
                    <div className='py-4 flex flex-col items-center justify-center gap-1.5'>
                      <span className='text-[10px] uppercase tracking-wider font-semibold text-muted-foreground'>
                        Jam Operasional Master
                      </span>
                      <div className='px-2.5 py-1 rounded-md bg-muted/60 border border-border/50 font-mono text-xs font-semibold text-foreground'>
                        {startsAt} - {endsAt}
                      </div>
                    </div>
                  ) : (
                    <div className='py-6 flex flex-col items-center justify-center text-center text-muted-foreground/60 text-xs'>
                      <span>Shift Libur</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {sessionDefs.some((d) => !d.isActive) && onNavigateToSessionDefs && (
        <div className='flex flex-wrap items-center justify-between px-3.5 py-2 rounded-xl border border-dashed border-border/60 bg-muted/15 text-xs text-muted-foreground gap-2 mt-0.5'>
          <div className='flex items-center gap-2 min-w-0'>
            <Icons.clock className='size-3.5 text-muted-foreground/70 shrink-0' />
            <span>Terdapat shift yang dinonaktifkan di Master Shift Operasional.</span>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={onNavigateToSessionDefs}
            className='text-xs h-7 px-2 font-semibold text-primary hover:text-primary'
          >
            Atur Shift
          </Button>
        </div>
      )}
    </div>
  );
}
