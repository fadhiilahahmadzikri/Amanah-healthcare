'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { QueueItem } from '../api/types';
import { cn } from '@/lib/utils';

export interface QueueSeatCardProps {
  item: QueueItem;
  isNext?: boolean;
  className?: string;
  onClick?: () => void;
}

export function QueueSeatCard({ item, isNext = false, className, onClick }: QueueSeatCardProps) {
  const cleanName = item.patient_name
    .replace(/^drg?\.?\s*/i, '')
    .split(',')[0]
    .trim();
  const nameParts = cleanName.split(' ').filter(Boolean);
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : cleanName.slice(0, 2).toUpperCase() || '-';

  return (
    <div
      id={`seat-card-${item.queue_number}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      title={`${item.queue_number || '-'} - ${item.patient_name || '-'} (${item.estimated_time || '-'})`}
      className={cn(
        'seat-grid-card relative group select-none w-full max-w-[66px] sm:max-w-[74px] flex flex-col items-center mx-auto will-change-transform',
        onClick ? 'cursor-pointer' : 'cursor-default',
        className
      )}
    >
      <div className='absolute -top-2 -right-1 z-20 pointer-events-none'>
        {isNext ? (
          <Badge
            variant='default'
            className='text-[8.5px] px-1 py-0 h-3.5 font-bold tracking-wider shadow-xs'
          >
            NEXT
          </Badge>
        ) : (
          <Badge
            variant='secondary'
            className='text-[8.5px] px-1 py-0 h-3.5 font-bold border border-border/50 text-foreground shadow-xs'
          >
            {item.queue_number}
          </Badge>
        )}
      </div>

      <div className='relative w-full aspect-square flex items-center justify-center'>
        <div className='absolute -bottom-1.5 w-[82%] h-full rounded-[10px] border border-border/30 bg-muted/40 pointer-events-none -z-20' />

        <div className='absolute -bottom-0.5 w-[91%] h-full rounded-[11px] border border-border/40 bg-muted/60 pointer-events-none -z-10' />

        <div
          className={cn(
            'w-full h-full rounded-[13px] p-0.5 border flex items-center justify-center shadow-none bg-card relative z-0',
            isNext
              ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
              : 'border-border/60 bg-muted/20'
          )}
        >
          <div className='w-full h-full rounded-[9px] overflow-hidden bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] select-none'>
            <span>{initials}</span>
          </div>
        </div>
      </div>

      <div className='w-full text-center mt-1 px-0.5'>
        <p className='text-[9.5px] sm:text-[10px] font-medium text-foreground truncate max-w-full leading-tight'>
          {item.patient_name || '-'}
        </p>
      </div>
    </div>
  );
}
