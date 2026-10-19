'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import type { SessionDefConfig } from '../../../api/admin-schedule-configuration.api';

interface StepSessionDefsProps {
  sessionDefs: SessionDefConfig[];
  onToggleActive: (id: string) => void;
  onUpdateTime?: (id: string, field: 'defaultStartsAt' | 'defaultEndsAt', value: string) => void;
  onOpenOperatingDays?: () => void;
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
  onToggleActive,
  onUpdateTime
}: StepSessionDefsProps) {
  const getTimeOptions = (currentTime: string) => {
    if (!currentTime || BASE_TIME_OPTIONS.includes(currentTime)) {
      return BASE_TIME_OPTIONS;
    }
    return [...BASE_TIME_OPTIONS, currentTime].toSorted();
  };

  return (
    <div className='flex flex-col gap-3.5'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        {sessionDefs.map((def) => {
          const startsAt = (def.defaultStartsAt || '06:00').slice(0, 5);
          const endsAt = (def.defaultEndsAt || '12:00').slice(0, 5);

          return (
            <div
              key={def.id}
              className={`flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-150 ${
                def.isActive
                  ? 'border-border/90 bg-card shadow-xs'
                  : 'border-border/40 bg-muted/15 opacity-75'
              }`}
            >
              <div className='flex items-center justify-between pb-2 gap-2'>
                <div className='flex items-center gap-3 min-w-0'>
                  <div
                    className={`size-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      def.isActive
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'bg-muted text-muted-foreground border border-border/50'
                    }`}
                  >
                    {def.codePrefix}
                  </div>
                  <div className='flex flex-col min-w-0'>
                    <span className='font-semibold text-sm text-foreground whitespace-nowrap truncate'>
                      {def.label}
                    </span>
                    <span className='text-xs text-muted-foreground whitespace-nowrap font-mono'>
                      {startsAt} - {endsAt}
                    </span>
                  </div>
                </div>

                <div className='flex items-center gap-2 shrink-0 ml-2'>
                  <Switch
                    checked={def.isActive}
                    onCheckedChange={() => onToggleActive(def.id)}
                    aria-label={`Aktifkan shift ${def.label}`}
                  />
                </div>
              </div>

              {def.isActive && onUpdateTime && (
                <div className='mt-2 pt-2 border-t border-border/40 grid grid-cols-2 gap-2'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-[10px] font-medium text-muted-foreground'>Jam Mulai</span>
                    <Select
                      value={startsAt}
                      onValueChange={(val) => onUpdateTime(def.id, 'defaultStartsAt', `${val}:00`)}
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
