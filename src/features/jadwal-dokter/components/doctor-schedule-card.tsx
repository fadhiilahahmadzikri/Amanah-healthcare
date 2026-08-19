'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DoctorAvatar } from '@/features/klinik/components/doctor-avatar';
import { getStatusConfig } from '@/styles/clinical-tokens';
import { cn } from '@/lib/utils';
import type { DoctorSchedule } from '../api/types';

export interface DoctorScheduleCardProps {
  doctor: DoctorSchedule;
  onOpenDetail: (doctor: DoctorSchedule) => void;
  onOpenEdit: (doctor: DoctorSchedule) => void;
  className?: string;
}

export function DoctorScheduleCard({
  doctor,
  onOpenDetail,
  onOpenEdit,
  className
}: DoctorScheduleCardProps) {
  const statusConfig = getStatusConfig(doctor.status_dokter);
  const scheduleStatusConfig = getStatusConfig(doctor.status_jadwal);

  // Time parsing for card display
  const timeClean = doctor.jadwal_hari_ini.replace(/WIB/i, '').trim();
  const timeSplits = timeClean.includes('-') ? timeClean.split('-') : ['09.00', '16.00'];
  const startTime = timeSplits[0] ? timeSplits[0].trim() : '09.00';
  const endTime = timeSplits[1] ? timeSplits[1].trim() : '16.00';

  const percentage = doctor.is_cuti
    ? 0
    : Math.round((doctor.slot_tersedia / Math.max(doctor.kapasitas_per_hari, 1)) * 100);

  return (
    <div
      className={cn(
        'w-full bg-card text-card-foreground border border-border/60 hover:border-primary/40 rounded-[20px] shadow-none overflow-hidden font-sans flex flex-col justify-between h-full p-4 sm:p-5 gap-3.5 select-none transition-all hover:shadow-xs',
        className
      )}
    >
      {/* 1. Doctor Profile & Status Header */}
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-center gap-3.5 min-w-0 flex-1'>
          <div className='w-[64px] h-[64px] min-w-[64px] min-h-[64px] max-w-[64px] max-h-[64px] rounded-full overflow-hidden shrink-0 ring-1 ring-border/40 bg-muted aspect-square'>
            <DoctorAvatar name={doctor.nama_dokter} avatarUrl={doctor.avatar} size={64} />
          </div>

          <div className='min-w-0 flex-1 space-y-0.5'>
            <h3
              onClick={() => onOpenDetail(doctor)}
              className='text-[15px] font-bold tracking-tight text-foreground truncate hover:text-primary transition-colors cursor-pointer'
              title={doctor.nama_dokter}
            >
              {doctor.nama_dokter}
            </h3>
            <p className='text-[12.5px] font-medium text-muted-foreground truncate'>
              {doctor.spesialisasi}
            </p>

            <div className='pt-0.5 flex items-center gap-1.5'>
              <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-300 rounded-[6px] text-[11px] font-bold leading-none'>
                <Icons.star className='size-2.5 fill-amber-500 text-amber-500' />
                <span>4.9</span>
              </span>
              <span className='text-[10.5px] text-muted-foreground font-mono truncate'>
                {doctor.bulan_jadwal}
              </span>
            </div>
          </div>
        </div>

        {/* Gradient Status Pill */}
        <div className='shrink-0 self-start pt-0.5'>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-sm select-none shadow-none',
              statusConfig.pillBg,
              statusConfig.pillBorder
            )}
          >
            <span
              className={cn(
                'size-2 rounded-full shrink-0 ring-1 ring-white/60 dark:ring-white/20',
                statusConfig.dotGradient
              )}
            />
            <span
              className={cn(
                'bg-clip-text text-transparent font-bold tracking-tight',
                statusConfig.textGradient
              )}
            >
              {statusConfig.label}
            </span>
          </span>
        </div>
      </div>

      {/* 2. Metadata Section (Ruang Praktik & Status Jadwal) */}
      <div className='flex items-center justify-between text-[12px] px-0.5 py-0.5 border-t border-border/40'>
        <div className='flex items-center gap-1.5 min-w-0 py-1 text-foreground font-semibold'>
          <Icons.mapPin className='size-3.5 text-primary shrink-0' strokeWidth={1.8} />
          <span className='truncate'>{doctor.ruang_praktik}</span>
        </div>

        <div className='w-[1px] h-3.5 bg-border/40 shrink-0 mx-1.5' />

        <div className='flex items-center gap-1.5 min-w-0 py-1 text-muted-foreground font-medium shrink-0'>
          <span className='text-[11px] font-semibold text-muted-foreground'>
            Jadwal: {scheduleStatusConfig.label}
          </span>
        </div>
      </div>

      {/* 3. Slot & Jam Timeline */}
      <div className='py-1 px-1 flex items-center justify-between'>
        <div className='flex flex-col items-start min-w-[55px]'>
          <span className='text-[16px] sm:text-[17px] font-bold text-foreground leading-tight tracking-tight font-mono'>
            {startTime}
          </span>
          <span className='text-[10.5px] font-normal text-muted-foreground mt-0.5'>Mulai</span>
        </div>

        <div className='flex-1 flex flex-col items-center px-2 sm:px-3'>
          <div className='flex items-center justify-between w-full text-[11px] font-bold mb-1'>
            <span
              className={cn(
                'tabular-nums font-mono',
                doctor.is_cuti
                  ? 'text-destructive'
                  : percentage <= 20
                    ? 'text-destructive'
                    : 'text-primary'
              )}
            >
              {doctor.is_cuti
                ? 'Dokter Cuti'
                : `${doctor.slot_tersedia}/${doctor.kapasitas_per_hari} Slot`}
            </span>
            <span className='text-[10px] text-muted-foreground tabular-nums'>{percentage}%</span>
          </div>

          <div className='w-full flex items-center justify-center relative my-0.5'>
            <span className='size-2 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0' />
            <div className='flex-1 border-t border-dashed border-slate-300 dark:border-slate-600 mx-2' />
            <span className='size-2 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0' />
          </div>

          <Progress
            value={percentage}
            className={cn(
              'h-1.5 w-full mt-1',
              doctor.is_cuti || percentage <= 20
                ? '[&>div]:bg-destructive'
                : percentage <= 50
                  ? '[&>div]:bg-amber-500'
                  : '[&>div]:bg-primary'
            )}
          />
        </div>

        <div className='flex flex-col items-end min-w-[55px]'>
          <span className='text-[16px] sm:text-[17px] font-bold text-foreground leading-tight tracking-tight font-mono'>
            {endTime}
          </span>
          <span className='text-[10.5px] font-normal text-muted-foreground mt-0.5'>Selesai</span>
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div className='flex items-center justify-end gap-2 pt-2 border-t border-border/40'>
        <Button
          type='button'
          variant='outline'
          shape='pill'
          size='sm'
          onClick={() => onOpenEdit(doctor)}
          className='font-medium text-xs h-8 px-3.5'
        >
          Atur jadwal
        </Button>

        <Button
          type='button'
          variant='default'
          shape='pill'
          size='sm'
          withTrailingCircleIcon
          onClick={() => onOpenDetail(doctor)}
          className='font-semibold text-xs h-8 px-4'
        >
          Detail & kalender
        </Button>
      </div>
    </div>
  );
}
