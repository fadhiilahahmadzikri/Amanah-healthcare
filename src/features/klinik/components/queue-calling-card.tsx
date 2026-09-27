'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { QueueItem } from '../api/types';
import { cn } from '@/lib/utils';

export interface QueueCallingCardProps {
  callingItem?: QueueItem;
  nextItem?: QueueItem;
  afterNextItem?: QueueItem;
  clinicRoomName?: string;
  timeRemaining?: string;
  bookingTime?: string;
  className?: string;
  isActionLoading?: boolean;
  onCall?: (item: QueueItem) => void;
  onRespond?: (item: QueueItem) => void;
  onNoShow?: (item: QueueItem) => void;
  onComplete?: (item: QueueItem) => void;
}

export function QueueCallingCard({
  callingItem,
  nextItem,
  afterNextItem,
  clinicRoomName,
  timeRemaining = '-',
  bookingTime,
  className,
  isActionLoading = false,
  onCall,
  onRespond,
  onNoShow,
  onComplete
}: QueueCallingCardProps) {
  if (!callingItem) {
    return (
      <div
        className={cn('relative h-full flex flex-col pb-3 min-h-0 [perspective:1400px]', className)}
      >
        <div
          id='hero-front-card'
          className='relative z-10 rounded-[22px] border border-border/50 bg-card text-card-foreground p-6 sm:p-7 shadow-none font-sans select-none flex flex-col justify-center items-center flex-1 h-full min-h-0 overflow-hidden'
        >
          {nextItem ? (
            <div className='flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-sm'>
              <div className='size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center ring-4 ring-primary/5'>
                <Icons.notification className='size-8 animate-pulse' />
              </div>
              <div className='space-y-1.5'>
                <span className='text-[11px] font-bold uppercase tracking-wider text-primary'>
                  Antrean Siap Dipanggil
                </span>
                <div className='text-4xl font-black text-foreground tracking-tight'>
                  {nextItem.queue_number}
                </div>
                <h4 className='text-lg font-bold text-foreground truncate'>
                  {nextItem.patient_name}
                </h4>
                <p className='text-xs text-muted-foreground'>
                  {nextItem.poli} • {nextItem.doctor_name}
                </p>
              </div>
              <Button
                type='button'
                variant='default'
                disabled={isActionLoading}
                onClick={() => onCall?.(nextItem)}
                className='h-9 px-6 gap-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer'
              >
                <Icons.refresh className={cn('size-3.5', isActionLoading && 'animate-spin')} />
                <span>Panggil Antrean Ini</span>
              </Button>
            </div>
          ) : (
            <EmptyState
              icon={Icons.inbox}
              title='Belum ada antrean dipanggil'
              description='Pasien yang sedang dipanggil akan tampil di sini setelah antrean tersedia.'
              className='h-full min-h-[360px] border-0 bg-transparent'
            />
          )}
        </div>
      </div>
    );
  }

  const isFinished = callingItem.status === 'SELESAI';
  const patientName = callingItem.patient_name || '-';
  const queueNumber = callingItem.queue_number || '-';
  const calledTime = callingItem.called_time || callingItem.estimated_time || '-';
  const roomName = callingItem.room || clinicRoomName || '-';
  const patientBookingTime = bookingTime || callingItem.estimated_time || calledTime || '-';

  return (
    <div
      className={cn('relative h-full flex flex-col pb-3 min-h-0 [perspective:1400px]', className)}
    >
      {/* 1. Real Stacking Layer 3 (Deepest real queue ticket card) */}
      <div
        id='stack-layer-2'
        className={cn(
          'absolute inset-x-7 top-4 bottom-0 rounded-[22px] border border-border/30 bg-muted/40 pointer-events-none z-0 shadow-xs flex flex-col justify-between p-4 opacity-70 will-change-transform transition-opacity',
          !afterNextItem && 'opacity-0'
        )}
      >
        <div className='flex items-center justify-between text-xs text-muted-foreground'>
          <span className='font-semibold'>{afterNextItem?.queue_number || ''}</span>
          <span className='truncate max-w-[140px]'>{afterNextItem?.patient_name || ''}</span>
        </div>
      </div>

      {/* 2. Real Stacking Layer 2 (Middle real queue ticket card: The NEXT patient in line) */}
      <div
        id='stack-layer-1'
        className={cn(
          'absolute inset-x-3.5 top-2 bottom-1.5 rounded-[22px] border border-border/50 bg-card/90 text-card-foreground pointer-events-none z-[1] shadow-xs flex flex-col justify-between p-5 opacity-90 will-change-transform transition-opacity',
          !nextItem && 'opacity-0'
        )}
      >
        <div className='flex items-center justify-between text-xs font-semibold'>
          <span className='inline-flex items-center gap-1 text-primary'>
            <span className='size-1.5 rounded-full bg-primary' />
            {nextItem?.queue_number || ''} — {nextItem?.patient_name || ''}
          </span>
          <span className='text-[11px] text-muted-foreground font-normal'>Siap Dipanggil</span>
        </div>
      </div>

      {/* 3. Main Front Active Calling Card */}
      <div
        id='hero-front-card'
        className='relative z-10 rounded-[22px] border border-border/50 bg-card text-card-foreground p-6 sm:p-7 shadow-none font-sans select-none flex flex-col justify-between flex-1 h-full min-h-0 overflow-hidden space-y-4 transition-all origin-center will-change-transform'
      >
        {/* 0. 3D Isometric Perspective Floor Grid */}
        <div className='absolute inset-0 pointer-events-none overflow-hidden [perspective:1000px] -z-0 select-none'>
          <div
            className='absolute -top-[50%] -left-[50%] w-[200%] h-[220%] origin-center [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]'
            style={{
              transform: 'rotateX(62deg) rotateZ(-30deg) scale(1.35)',
              transformStyle: 'preserve-3d',
              backgroundImage: `
                linear-gradient(to right, currentColor 1px, transparent 1px),
                linear-gradient(to bottom, currentColor 1px, transparent 1px)
              `,
              backgroundSize: '36px 36px',
              color: 'var(--foreground)',
              opacity: 0.08
            }}
          />
        </div>

        {/* 1. Card Header: Status on Left, Call Time on Right */}
        <div className='relative z-10 flex items-center justify-between gap-3 shrink-0'>
          <div className='flex items-center gap-2'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              {isFinished ? 'Pemeriksaan Selesai' : 'Sedang Dipanggil'}
            </h3>
            <span
              className={cn(
                'size-2 rounded-full',
                isFinished ? 'bg-muted-foreground' : 'bg-primary animate-pulse'
              )}
            />
          </div>

          <Badge
            variant='secondary'
            className='text-xs font-medium px-2.5 py-0.5 gap-1.5 border border-border/40'
          >
            <Icons.clock className='size-3 stroke-[2]' />
            <span>{isFinished ? 'Semua Dilayani' : `Dipanggil ${calledTime}`}</span>
          </Badge>
        </div>

        {/* 2. Hero Calling Content (Avatar + Big Number + Name + Doctor) */}
        {!isFinished ? (
          <div className='relative z-10 flex flex-col sm:flex-row items-center sm:items-center gap-6 sm:gap-8 my-auto py-2'>
            {/* Patient Calling Identity Token (Zero Avatar) */}
            <div className='size-36 sm:size-44 lg:size-48 xl:size-52 min-w-[144px] sm:min-w-[176px] lg:min-w-[192px] xl:min-w-[208px] rounded-3xl overflow-hidden shrink-0 ring-4 sm:ring-8 ring-primary/10 bg-primary/5 border border-primary/20 flex flex-col items-center justify-center aspect-square shadow-inner'>
              <div className='size-14 sm:size-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mb-2.5'>
                <Icons.notification className='size-7 sm:size-8 animate-pulse' />
              </div>
              <span className='text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary/80'>
                Panggilan Pasien
              </span>
            </div>

            {/* Details */}
            <div className='flex-1 min-w-0 text-center sm:text-left space-y-1.5'>
              <div className='text-4xl sm:text-5xl font-black text-foreground tracking-tight leading-none'>
                {queueNumber}
              </div>

              <h4 className='text-xl sm:text-2xl font-bold text-foreground truncate'>
                {patientName}
              </h4>

              <p className='text-xs sm:text-sm text-muted-foreground font-normal whitespace-nowrap'>
                Harap segera menuju ke ruang dokter
              </p>

              <div className='pt-1 flex items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm font-medium text-foreground whitespace-nowrap'>
                <Icons.user className='size-4 text-primary shrink-0' strokeWidth={2} />
                <span>{callingItem.doctor_name || '-'}</span>
              </div>

              {/* Action Buttons Bar for Clinic Staff */}
              <div className='pt-3 flex flex-wrap items-center gap-2 justify-center sm:justify-start'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={
                    isActionLoading ||
                    (callingItem.call_count !== undefined && callingItem.call_count >= 3)
                  }
                  onClick={() => onCall?.(callingItem)}
                  className='h-8 text-xs font-semibold px-2.5 sm:px-3 gap-1.5 rounded-xl border-primary/30 hover:bg-primary/5 hover:border-primary cursor-pointer'
                  title='Panggil pasien kembali jika belum masuk (maksimal 3 kali)'
                >
                  <Icons.refresh className={cn('size-3.5', isActionLoading && 'animate-spin')} />
                  <span>
                    {callingItem.call_count
                      ? `Panggil (${callingItem.call_count}/3)`
                      : 'Panggil Ulang'}
                  </span>
                </Button>

                <Button
                  type='button'
                  variant='default'
                  size='sm'
                  disabled={isActionLoading}
                  onClick={() => onRespond?.(callingItem)}
                  className='h-8 text-xs font-semibold px-3 gap-1.5 rounded-xl shadow-xs cursor-pointer'
                  title='Konfirmasi kehadiran pasien dan mulai konsultasi'
                >
                  <Icons.userCheck className='size-3.5' />
                  <span>Pasien Hadir</span>
                </Button>

                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={isActionLoading}
                  onClick={() => onNoShow?.(callingItem)}
                  className='h-8 text-xs font-semibold px-2.5 sm:px-3 gap-1.5 rounded-xl border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer'
                  title='Pasien tidak merespons: geser antrean ke belakang (maksimal 3 kali, setelahnya status no-show)'
                >
                  <Icons.userX className='size-3.5' />
                  <span>Tidak Merespons</span>
                </Button>

                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={isActionLoading}
                  onClick={() => onComplete?.(callingItem)}
                  className='h-8 text-xs font-semibold px-2.5 sm:px-3 gap-1.5 rounded-xl border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer'
                  title='Selesaikan konsultasi dan tutup tiket antrean'
                >
                  <Icons.check className='size-3.5' />
                  <span>Selesai Periksa</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className='relative z-10 flex flex-col items-center justify-center text-center gap-3 my-auto py-6'>
            <div className='size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-4 ring-primary/5'>
              <Icons.check className='size-8 stroke-[2.5]' />
            </div>
            <div className='space-y-1'>
              <h4 className='text-xl font-bold text-foreground'>Semua Antrean Telah Selesai</h4>
              <p className='text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto'>
                Seluruh pasien dalam antrean {roomName} telah selesai dilayani. Sistem akan memuat
                antrean berikutnya secara otomatis.
              </p>
            </div>
          </div>
        )}

        {/* 3. Middle Separator */}
        <div className='relative z-10 border-t border-border/40 shrink-0' />

        {/* 4. Bottom 3-Column Stats Bar (Room | Time Tersisa | Jam Booking) */}
        <div className='relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 text-left shrink-0'>
          {/* Kolom 1: Room */}
          <div className='flex items-center gap-3'>
            <Icons.mapPin className='size-6 sm:size-7 text-primary shrink-0 stroke-[1.8]' />
            <div className='min-w-0 space-y-0.5'>
              <span className='text-[11px] font-medium text-muted-foreground block whitespace-nowrap'>
                Room
              </span>
              <span className='text-sm sm:text-base font-bold text-foreground block whitespace-nowrap truncate'>
                {roomName}
              </span>
            </div>
          </div>

          {/* Kolom 2: Time Tersisa */}
          <div className='flex items-center gap-3'>
            <Icons.clock className='size-6 sm:size-7 text-primary shrink-0 stroke-[1.8]' />
            <div className='min-w-0 space-y-0.5'>
              <span className='text-[11px] font-medium text-muted-foreground block whitespace-nowrap'>
                Time Tersisa
              </span>
              <span
                id='time-remaining-value'
                className='text-sm sm:text-base font-bold text-foreground block whitespace-nowrap'
              >
                {isFinished ? '0 Menit' : timeRemaining}
              </span>
            </div>
          </div>

          {/* Kolom 3: Jam Booking */}
          <div className='flex items-center gap-3'>
            <Icons.calendar className='size-6 sm:size-7 text-primary shrink-0 stroke-[1.8]' />
            <div className='min-w-0 space-y-0.5'>
              <span className='text-[11px] font-medium text-muted-foreground block whitespace-nowrap'>
                Jam Booking
              </span>
              <span className='text-sm sm:text-base font-bold text-foreground block whitespace-nowrap'>
                {isFinished ? '-' : patientBookingTime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
