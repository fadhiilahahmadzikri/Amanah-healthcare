'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { QueueItem } from '../api/types';
import { DoctorAvatar } from './doctor-avatar';
import { cn } from '@/lib/utils';

export interface QueueCallingCardProps {
  callingItem?: QueueItem;
  nextItem?: QueueItem;
  afterNextItem?: QueueItem;
  clinicRoomName?: string;
  timeRemaining?: string;
  bookingTime?: string;
  className?: string;
}

export function QueueCallingCard({
  callingItem,
  nextItem,
  afterNextItem,
  clinicRoomName,
  timeRemaining = '25 Menit',
  bookingTime,
  className
}: QueueCallingCardProps) {
  const isFinished = !callingItem || callingItem.status === 'SELESAI';
  const patientName = callingItem?.patient_name || 'Budi Santoso';
  const queueNumber = callingItem?.queue_number || 'A-01';
  const calledTime = callingItem?.called_time || callingItem?.estimated_time || '10:24 WIB';
  const patientAvatar = callingItem?.patient_avatar || 'https://i.pravatar.cc/250?img=68';
  const getVariedRoom = () => {
    if (callingItem?.room) return callingItem.room;
    if (clinicRoomName) return clinicRoomName;
    const num = parseInt(queueNumber.replace(/\D/g, '')) || 1;
    const rooms = [
      'Room 10',
      'Room 04',
      'Room 07',
      'Room 12',
      'Room 02',
      'Room 08',
      'Room 05',
      'Room 11',
      'Room 03',
      'Room 09'
    ];
    return rooms[(num - 1) % rooms.length];
  };
  const roomName = getVariedRoom();
  const patientBookingTime =
    bookingTime || callingItem?.estimated_time || calledTime || '10:30 WIB';

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
            {/* Patient Avatar with Prominent Optical Scale & Refined Soft Ring */}
            <div className='size-36 sm:size-44 lg:size-48 xl:size-52 min-w-[144px] sm:min-w-[176px] lg:min-w-[192px] xl:min-w-[208px] rounded-full overflow-hidden shrink-0 ring-4 sm:ring-8 ring-primary/10 bg-muted aspect-square'>
              <DoctorAvatar name={patientName} avatarUrl={patientAvatar} size={208} />
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
                <span>{callingItem?.doctor_name || 'Dokter Spesialis'}</span>
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
