'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { EmptyState } from '@/components/ui/empty-state';
import { QueueItem } from '../api/types';
import { DoctorAvatar } from './doctor-avatar';
import { cn } from '@/lib/utils';

export interface QueueCallingHeroProps {
  callingItem?: QueueItem;
  clinicRoomName?: string;
  className?: string;
}

export function QueueCallingHero({
  callingItem,
  clinicRoomName,
  className
}: QueueCallingHeroProps) {
  if (!callingItem) {
    return (
      <div
        className={cn(
          'rounded-3xl border border-border/50 bg-card text-card-foreground p-6 sm:p-8 md:p-10 shadow-none font-sans select-none transition-all',
          className
        )}
      >
        <EmptyState
          icon={Icons.inbox}
          title='Belum ada antrean dipanggil'
          description='Pasien yang sedang dipanggil akan tampil di sini setelah tersedia.'
          className='min-h-[280px] border-0 bg-transparent'
        />
      </div>
    );
  }

  const patientName = callingItem.patient_name || '-';
  const queueNumber = callingItem.queue_number || '-';
  const calledTime = callingItem.called_time || callingItem.estimated_time || '-';
  const patientAvatar = callingItem.patient_avatar || '';

  return (
    <div
      className={cn(
        'rounded-3xl border border-border/50 bg-card text-card-foreground p-6 sm:p-8 md:p-10 shadow-none font-sans select-none transition-all',
        className
      )}
    >
      <div className='flex flex-col sm:flex-row items-center sm:items-center gap-6 sm:gap-8 md:gap-10'>
        {/* Large Patient Avatar with Soft Ring */}
        <div className='size-36 sm:size-44 md:size-48 min-w-[144px] sm:min-w-[176px] md:min-w-[192px] rounded-full overflow-hidden shrink-0 ring-4 ring-primary/10 bg-muted aspect-square'>
          <DoctorAvatar name={patientName} avatarUrl={patientAvatar} size={192} />
        </div>

        {/* Queue Calling Content */}
        <div className='flex-1 text-center sm:text-left space-y-2 min-w-0'>
          <div className='text-4xl sm:text-5xl md:text-6xl font-black text-foreground tracking-tight leading-none'>
            {queueNumber}
          </div>

          <h3 className='text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate'>
            {patientName}
          </h3>

          <p className='text-sm sm:text-base text-muted-foreground font-normal'>
            Harap menuju ke {clinicRoomName || 'ruang dokter'}
          </p>

          <div className='pt-2'>
            <span className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold'>
              <Icons.clock className='size-3.5 sm:size-4 stroke-[2.2]' />
              <span>Dipanggil pada {calledTime}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
