'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { QueueItem } from '../api/types';
import { DoctorAvatar } from './doctor-avatar';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';

export interface QueueCardProps {
  item: QueueItem;
  className?: string;
}

export function QueueCard({ item, className }: QueueCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border bg-card text-card-foreground p-4 shadow-none flex flex-col justify-between space-y-3 font-sans transition-all',
        item.is_user ? 'border-primary/60 ring-1 ring-primary/15' : 'border-border/50',
        className
      )}
    >
      <div className='flex items-center justify-between pb-2 border-b border-border/40'>
        <span className='font-mono text-sm font-bold text-primary'>{item.queue_number}</span>
        <StatusBadge status={item.status} size='sm' />
      </div>

      <div className='space-y-1.5'>
        <div className='flex items-center gap-2.5'>
          <div className='size-8 rounded-full overflow-hidden shrink-0 ring-1 ring-border/40'>
            <DoctorAvatar name={item.patient_name} avatarUrl={item.patient_avatar} size={32} />
          </div>
          <div className='min-w-0 flex-1'>
            <h4 className='truncate text-xs font-bold text-foreground'>
              {item.patient_name}{' '}
              {item.is_user && <span className='text-primary font-semibold'>(Anda)</span>}
            </h4>
            <p className='truncate text-[11px] text-muted-foreground'>
              {item.poli} • {item.doctor_name}
            </p>
          </div>
        </div>
      </div>

      <div className='pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground'>
        <span className='flex items-center gap-1'>
          <Icons.clock className='size-3 text-muted-foreground' />
          <span>Estimasi: {item.estimated_time}</span>
        </span>
      </div>
    </div>
  );
}
