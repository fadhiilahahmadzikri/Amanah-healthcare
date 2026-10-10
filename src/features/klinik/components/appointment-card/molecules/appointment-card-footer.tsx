'use client';

import type * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AppointmentQueueFocal } from '../atoms/appointment-queue-focal';

export interface AppointmentCardFooterProps {
  queueNumber: string;
  onViewDetails?: () => void;
  actionsSlot?: React.ReactNode;
  detailButtonLabel?: string;
  className?: string;
}

export function AppointmentCardFooter({
  queueNumber,
  onViewDetails,
  actionsSlot,
  detailButtonLabel = 'Detail',
  className
}: AppointmentCardFooterProps) {
  return (
    <div
      className={cn(
        'w-full flex items-center justify-between gap-3 pt-2.5 border-t border-border/40 select-none min-w-0',
        className
      )}
    >
      <AppointmentQueueFocal queueNumber={queueNumber} />

      <div className='flex items-center gap-2 shrink-0'>
        {actionsSlot}

        {!actionsSlot && onViewDetails && (
          <Button
            type='button'
            variant='default'
            shape='pill'
            size='card-action'
            withTrailingCircleIcon
            onClick={onViewDetails}
            className='font-bold shadow-2xs cursor-pointer'
          >
            {detailButtonLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
