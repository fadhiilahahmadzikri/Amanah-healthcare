'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export interface QueueStatsBarProps {
  totalToday?: number | string;
  timeRemaining?: string;
  operationalHours?: string;
  className?: string;
}

export function QueueStatsBar({
  totalToday = '0 Pasien',
  timeRemaining = '0 Menit',
  operationalHours = '-',
  className
}: QueueStatsBarProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/50 bg-card text-card-foreground p-4 sm:p-5 shadow-none select-none transition-all font-sans',
        className
      )}
    >
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8'>
        {/* 1. Total Antrian Hari Ini */}
        <div className='flex items-center gap-3.5'>
          <Icons.teams className='size-6 sm:size-7 text-primary shrink-0 stroke-[1.8]' />
          <div className='min-w-0 flex-1 space-y-0.5'>
            <span className='text-[11.5px] sm:text-xs font-medium text-muted-foreground block truncate'>
              Total Antrian Hari Ini
            </span>
            <span className='text-base sm:text-[17px] font-bold text-foreground block truncate'>
              {totalToday}
            </span>
          </div>
        </div>

        {/* 2. Time Tersisa */}
        <div className='flex items-center gap-3.5'>
          <Icons.clock className='size-6 sm:size-7 text-primary shrink-0 stroke-[1.8]' />
          <div className='min-w-0 flex-1 space-y-0.5'>
            <span className='text-[11.5px] sm:text-xs font-medium text-muted-foreground block truncate'>
              Time Tersisa
            </span>
            <span className='text-base sm:text-[17px] font-bold text-foreground block truncate'>
              {timeRemaining}
            </span>
          </div>
        </div>

        {/* 3. Jam Operasional */}
        <div className='flex items-center gap-3.5'>
          <Icons.calendar className='size-6 sm:size-7 text-primary shrink-0 stroke-[1.8]' />
          <div className='min-w-0 flex-1 space-y-0.5'>
            <span className='text-[11.5px] sm:text-xs font-medium text-muted-foreground block truncate'>
              Jam Operasional
            </span>
            <span className='text-base sm:text-[17px] font-bold text-foreground block truncate'>
              {operationalHours}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
