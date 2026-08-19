'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { QueueItem } from '../api/types';
import { cn } from '@/lib/utils';

export interface QueueHighlightBannerProps {
  queues: QueueItem[];
  className?: string;
}

export function QueueHighlightBanner({ queues, className }: QueueHighlightBannerProps) {
  const currentCalling = queues.find((q) => q.status === 'DIPANGGIL') || queues[0];
  const userQueue = queues.find((q) => q.is_user);
  const totalCount = queues.length;
  const waitingCount = queues.filter((q) => q.status === 'MENUNGGU').length;
  const completedCount = queues.filter((q) => q.status === 'SELESAI').length;

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans select-none', className)}>
      {/* 1. Currently Calling Banner */}
      <div className='bg-primary text-primary-foreground rounded-2xl p-5 relative overflow-hidden shadow-none border border-primary/20 flex flex-col justify-between'>
        <div className='flex items-center justify-between'>
          <div className='text-[11px] font-medium text-primary-foreground/80'>
            Sedang Dipanggil saat ini
          </div>
          <span className='flex size-2 rounded-full bg-emerald-400 animate-ping' />
        </div>

        <div className='text-3xl font-extrabold tracking-tight my-2 text-primary-foreground'>
          {currentCalling ? currentCalling.queue_number : 'A-002'}
        </div>

        <div className='space-y-0.5'>
          <div className='text-xs text-primary-foreground/90 font-medium truncate flex items-center gap-1.5'>
            <Icons.user className='size-3.5 text-primary-foreground/70 shrink-0' />
            <span>
              Pasien:{' '}
              <strong className='font-semibold text-primary-foreground'>
                {currentCalling ? currentCalling.patient_name : 'Dinda Kartika'}
              </strong>
            </span>
          </div>
          <div className='text-[11px] text-primary-foreground/70 truncate'>
            {currentCalling
              ? `${currentCalling.poli} • ${currentCalling.doctor_name}`
              : 'Poli Umum • dr. Sarah Putri, Sp.PD'}
          </div>
        </div>
      </div>

      {/* 2. User's Queue Card */}
      <div className='bg-card text-card-foreground rounded-2xl p-5 border border-primary/40 shadow-none flex flex-col justify-between relative'>
        <span className='absolute top-4 right-4 bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-primary/20'>
          Antrean Anda
        </span>

        <div>
          <div className='text-[11px] font-semibold text-muted-foreground'>Nomor Antrean Anda</div>
          <div className='text-3xl font-extrabold text-foreground tracking-tight my-2'>
            {userQueue ? userQueue.queue_number : 'A-003'}
          </div>
          <div className='text-xs text-primary font-bold'>
            {userQueue ? `${userQueue.patient_name} (Urutan ke-3)` : 'Hida cantik (Urutan ke-3)'}
          </div>
        </div>

        <div className='text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/40 flex items-center justify-between'>
          <span className='flex items-center gap-1'>
            <Icons.clock className='size-3 text-muted-foreground' />
            <span>Estimasi dipanggil:</span>
          </span>
          <strong className='text-emerald-600 dark:text-emerald-400 font-semibold'>
            ~10 menit lagi
          </strong>
        </div>
      </div>

      {/* 3. Total Patients Stats Card */}
      <div className='bg-card text-card-foreground rounded-2xl p-5 border border-border/50 shadow-none flex flex-col justify-between'>
        <div>
          <div className='text-[11px] font-semibold text-muted-foreground'>
            Total Pasien Hari Ini
          </div>
          <div className='text-3xl font-extrabold text-foreground tracking-tight my-2'>
            {totalCount} Pasien
          </div>
          <div className='text-xs text-muted-foreground font-medium'>
            Layanan Praktik Berjalan Normal
          </div>
        </div>

        <div className='text-[11px] text-muted-foreground flex items-center gap-3 mt-2 pt-2 border-t border-border/40'>
          <span className='flex items-center gap-1'>
            <span className='size-2 rounded-full bg-indigo-500' /> 1 Dipanggil
          </span>
          <span className='flex items-center gap-1'>
            <span className='size-2 rounded-full bg-amber-500' /> {waitingCount} Menunggu
          </span>
          <span className='flex items-center gap-1'>
            <span className='size-2 rounded-full bg-purple-500' /> {completedCount} Selesai
          </span>
        </div>
      </div>
    </div>
  );
}
