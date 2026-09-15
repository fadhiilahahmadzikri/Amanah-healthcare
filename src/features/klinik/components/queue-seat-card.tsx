'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
  const [hasError, setHasError] = useState(false);

  // Extract initials for smart fallback
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
      onClick={onClick}
      title={`${item.queue_number || '-'} - ${item.patient_name || '-'} (${item.estimated_time || '-'})`}
      className={cn(
        'seat-grid-card relative group cursor-pointer select-none w-full max-w-[66px] sm:max-w-[74px] flex flex-col items-center mx-auto will-change-transform',
        className
      )}
    >
      {/* 1. Floating Top Badge */}
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

      {/* 2. Sonner-style Stacked Cards Container */}
      <div className='relative w-full aspect-square flex items-center justify-center'>
        {/* Sonner Layer 3 */}
        <div className='absolute -bottom-1.5 w-[82%] h-full rounded-[10px] border border-border/30 bg-muted/40 pointer-events-none -z-20' />

        {/* Sonner Layer 2 */}
        <div className='absolute -bottom-0.5 w-[91%] h-full rounded-[11px] border border-border/40 bg-muted/60 pointer-events-none -z-10' />

        {/* Main Squircle Front Card */}
        <div
          className={cn(
            'w-full h-full rounded-[13px] p-0.5 border flex items-center justify-center shadow-none bg-card relative z-0',
            isNext
              ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
              : 'border-border/60 bg-muted/20'
          )}
        >
          <div className='w-full h-full rounded-[9px] overflow-hidden bg-muted relative'>
            {!item.patient_avatar || hasError ? (
              <div className='w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[9.5px]'>
                <span>{initials}</span>
              </div>
            ) : (
              <Image
                src={item.patient_avatar}
                alt={item.patient_name || 'Pasien'}
                width={80}
                height={80}
                unoptimized
                onError={() => setHasError(true)}
                className='w-full h-full object-cover object-center rounded-[9px]'
              />
            )}
          </div>
        </div>
      </div>

      {/* 3. Patient Name Caption */}
      <div className='w-full text-center mt-1 px-0.5'>
        <p className='text-[9.5px] sm:text-[10px] font-medium text-foreground truncate max-w-full leading-tight'>
          {item.patient_name || '-'}
        </p>
      </div>
    </div>
  );
}
