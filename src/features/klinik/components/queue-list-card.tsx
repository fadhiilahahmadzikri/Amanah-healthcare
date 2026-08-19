'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { QueueItem } from '../api/types';
import { DoctorAvatar } from './doctor-avatar';
import { cn } from '@/lib/utils';

export interface QueueListCardProps {
  item: QueueItem;
  index?: number;
  className?: string;
}

export function QueueListCard({ item, index = 0, className }: QueueListCardProps) {
  const waitingCount = item.waiting_count || index + 2;

  return (
    <div
      className={cn(
        'rounded-2xl border border-border/50 bg-card text-card-foreground p-3 sm:p-3.5 flex items-center justify-between gap-3 sm:gap-4 shadow-none hover:border-primary/40 transition-colors select-none font-sans',
        item.is_user && 'border-primary/60 ring-1 ring-primary/20',
        className
      )}
    >
      {/* 1. Patient Avatar */}
      <div className='size-12 sm:size-14 min-w-[48px] sm:min-w-[56px] rounded-2xl overflow-hidden shrink-0 ring-1 ring-border/40 bg-muted aspect-square'>
        <DoctorAvatar name={item.patient_name} avatarUrl={item.patient_avatar} size={56} />
      </div>

      {/* 2. Middle Content (Queue Number, Name, Estimated Time) */}
      <div className='min-w-0 flex-1 space-y-0.5'>
        <div className='flex items-center gap-1.5'>
          <h4 className='text-sm sm:text-base font-bold text-foreground tracking-tight'>
            {item.queue_number}
          </h4>
          {item.is_user && <span className='text-[11px] font-semibold text-primary'>(Anda)</span>}
        </div>

        <p className='text-xs sm:text-sm font-medium text-muted-foreground truncate'>
          {item.patient_name}
        </p>

        <div className='flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground/80 pt-0.5'>
          <Icons.clock className='size-3 stroke-[1.8]' />
          <span>Estimasi {item.estimated_time}</span>
        </div>
      </div>

      {/* 3. Right Waiting Badge (Clean Uniform Pill) & More Action Menu */}
      <div className='flex items-center gap-2 shrink-0'>
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/40'>
          {waitingCount} Antrian
        </span>

        <Button
          type='button'
          variant='ghost'
          size='icon'
          aria-label={`Opsi antrean ${item.queue_number}`}
          className='size-7'
        >
          <Icons.ellipsis className='size-4' />
        </Button>
      </div>
    </div>
  );
}
