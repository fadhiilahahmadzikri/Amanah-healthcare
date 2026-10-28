'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import type { SessionDefConfig } from '../../../api/admin-schedule-configuration.api';
import {
  calculateShiftDurationHours,
  getAdjacentShiftGapMinutes
} from '../../../utils/shift-time-validator';
import { formatFriendlySessionName } from '../../../constants/schedule-shift.constants';

interface StepSessionDefsProps {
  sessionDefs: SessionDefConfig[];
  conflictingDefIds?: string[];
  onToggleActive: (id: string) => void;
  onUpdateTime?: (id: string, field: 'defaultStartsAt' | 'defaultEndsAt', value: string) => void;
  onOpenOperatingDays?: () => void;
  onResetDefaults?: () => void;
}

const BASE_TIME_OPTIONS = [
  ...Array.from({ length: 48 }, (_, i) => {
    const h = String(Math.floor(i / 2)).padStart(2, '0');
    const m = i % 2 === 0 ? '00' : '30';
    return `${h}:${m}`;
  }),
  '24:00'
];

export function StepSessionDefs({
  sessionDefs,
  conflictingDefIds = [],
  onToggleActive,
  onUpdateTime,
  onResetDefaults
}: StepSessionDefsProps) {
  const getTimeOptions = (currentTime: string) => {
    if (!currentTime || BASE_TIME_OPTIONS.includes(currentTime)) {
      return BASE_TIME_OPTIONS;
    }
    return [...BASE_TIME_OPTIONS, currentTime].toSorted();
  };

  return (
    <div className='flex flex-col gap-3.5'>
      {onResetDefaults && (
        <div className='flex items-center justify-between pb-1 px-0.5'>
          <p className='text-xs text-muted-foreground'>
            Atur rentang jam kerja baku untuk setiap shift operasional.
          </p>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={onResetDefaults}
            className='h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5'
            title='Kembalikan seluruh jam shift ke standar baku klinik'
          >
            <Icons.refresh className='size-3 text-muted-foreground' />
            Reset Jam Baku
          </Button>
        </div>
      )}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        {sessionDefs.map((def) => {
          const startsAt = def.defaultStartsAt.slice(0, 5);
          const endsAt = def.defaultEndsAt.slice(0, 5);
          const isConflicted = conflictingDefIds.includes(def.id);
          const durationHours = calculateShiftDurationHours(startsAt, endsAt);
          const gapInfo = getAdjacentShiftGapMinutes(def, sessionDefs);

          return (
            <div
              key={def.id}
              className={`flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-150 ${
                isConflicted
                  ? 'border-destructive/80 bg-destructive/5 shadow-xs'
                  : def.isActive
                    ? 'border-border/90 bg-card shadow-xs'
                    : 'border-border/40 bg-muted/15 opacity-75'
              }`}
            >
              <div className='flex items-center justify-between pb-2 gap-2'>
                <div className='flex items-center gap-3 min-w-0'>
                  <div
                    className={`size-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isConflicted
                        ? 'bg-destructive/15 text-destructive border border-destructive/30'
                        : def.isActive
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-muted text-muted-foreground border border-border/50'
                    }`}
                  >
                    {def.codePrefix}
                  </div>
                  <div className='flex flex-col min-w-0'>
                    <div className='flex items-center gap-1.5'>
                      <span className='font-semibold text-sm text-foreground whitespace-nowrap truncate'>
                        {formatFriendlySessionName(def.label) || def.label}
                      </span>
                      {isConflicted && (
                        <span className='inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-destructive/15 text-destructive border border-destructive/25'>
                          <Icons.warning className='size-2.5 shrink-0' />
                          Tabrakan
                        </span>
                      )}
                    </div>
                    <div className='flex items-center gap-1.5 text-xs text-muted-foreground font-mono'>
                      <span>
                        {startsAt} - {endsAt}
                      </span>
                      {def.isActive && (
                        <span className='text-[10px] text-muted-foreground/80 font-sans'>
                          ({durationHours} Jam)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-2 shrink-0 ml-2'>
                  <Switch
                    checked={def.isActive}
                    onCheckedChange={() => onToggleActive(def.id)}
                    aria-label={`Aktifkan shift ${formatFriendlySessionName(def.label) || def.label}`}
                  />
                </div>
              </div>

              {def.isActive && onUpdateTime && (
                <div className='mt-2 pt-2 border-t border-border/40 flex flex-col gap-2'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    <div className='flex flex-col gap-1'>
                      <span className='text-[10px] font-medium text-muted-foreground'>
                        Jam Mulai
                      </span>
                      <Select
                        value={startsAt}
                        onValueChange={(val) =>
                          onUpdateTime(def.id, 'defaultStartsAt', `${val}:00`)
                        }
                      >
                        <SelectTrigger className='h-8 w-full text-xs font-mono px-2 bg-background shadow-2xs'>
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
                      <span className='text-[10px] font-medium text-muted-foreground'>
                        Jam Selesai
                      </span>
                      <Select
                        value={endsAt}
                        onValueChange={(val) => onUpdateTime(def.id, 'defaultEndsAt', `${val}:00`)}
                      >
                        <SelectTrigger className='h-8 w-full text-xs font-mono px-2 bg-background shadow-2xs'>
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

                  {/* Indikator jeda operasional sah ke shift berikutnya */}
                  {gapInfo && (
                    <div className='flex items-center gap-1.5 px-2 py-1 rounded bg-muted/40 border border-border/40 text-[11px] text-muted-foreground'>
                      <Icons.clock className='size-3 text-muted-foreground/70 shrink-0' />
                      <span>
                        Jeda operasional klinik:{' '}
                        {gapInfo.gapMinutes >= 60
                          ? `${(gapInfo.gapMinutes / 60).toFixed(1)} Jam`
                          : `${gapInfo.gapMinutes} Menit`}{' '}
                        sebelum {formatFriendlySessionName(gapInfo.nextDefLabel) || gapInfo.nextDefLabel}
                      </span>
                    </div>
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
