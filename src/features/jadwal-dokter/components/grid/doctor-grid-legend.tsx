'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { STATUS_CONFIG } from '../../utils/shift-slot-builder';
import { EFFECTIVE_SLOT_STATUS } from '../../constants/schedule-shift.constants';

const LEGEND_STATUSES = [
  EFFECTIVE_SLOT_STATUS.AVAILABLE,
  EFFECTIVE_SLOT_STATUS.OCCUPIED,
  EFFECTIVE_SLOT_STATUS.CLOSED,
  EFFECTIVE_SLOT_STATUS.UNSCHEDULED,
  EFFECTIVE_SLOT_STATUS.EXPIRED
] as const;

export function DoctorGridLegend() {
  return (
    <div className='px-4 py-3 border-t border-border/30 bg-muted/5 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-medium font-sans'>
      {LEGEND_STATUSES.map((status) => {
        const config = STATUS_CONFIG[status];
        return (
          <div key={status} className='flex items-center gap-1.5'>
            <span className={cn('size-2.5 rounded-full border shrink-0', config.border, config.dotBg)} />
            <span className={cn('font-semibold', config.text)}>{config.label}</span>
          </div>
        );
      })}
    </div>
  );
}
