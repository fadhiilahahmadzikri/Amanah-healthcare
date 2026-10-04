'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import type { DoctorSchedule, ClinicRoom } from '../../api/types';
import {
  SCHEDULE_SHIFT_LABELS,
  type ScheduleShift
} from '../../constants/schedule-shift.constants';

export interface StepConfirmationProps {
  doctor: DoctorSchedule;
  formattedDisplayDate: string;
  selectedShift?: ScheduleShift | null;
  selectedSlot?: { time: string; endTime: string } | null;
  selectedRoom: ClinicRoom | null;
  showHeader?: boolean;
}

export function StepConfirmation({
  doctor,
  formattedDisplayDate,
  selectedShift,
  selectedSlot,
  selectedRoom,
  showHeader = true
}: StepConfirmationProps) {
  const isDataIncomplete = !selectedSlot || !selectedShift;

  return (
    <div className='space-y-4 font-sans select-none'>
      {showHeader && (
        <div>
          <h4 className='text-sm sm:text-base font-bold text-foreground tracking-tight'>
            Konfirmasi Jadwal Praktik
          </h4>
          <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
            Periksa kembali rincian sesi dokter {doctor.nama_dokter} sebelum menyimpan jadwal.
          </p>
        </div>
      )}

      {/* Summary Card */}
      {isDataIncomplete ? (
        <div className='p-4 rounded-2xl border border-border/70 bg-card/60 space-y-3 shadow-2xs'>
          <div className='flex items-center justify-between pb-3 border-b border-border/30'>
            <div className='space-y-1.5'>
              <Skeleton className='h-3 w-20' />
              <Skeleton className='h-4 w-36' />
              <Skeleton className='h-3 w-28' />
            </div>
            <Skeleton className='size-9 rounded-full shrink-0' />
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <Skeleton className='h-9 w-full rounded-lg' />
            <Skeleton className='h-9 w-full rounded-lg' />
            <Skeleton className='h-9 w-full rounded-lg' />
            <Skeleton className='h-9 w-full rounded-lg' />
          </div>
        </div>
      ) : (
        <div className='p-4 rounded-2xl border border-border/70 bg-card/60 space-y-3 shadow-2xs'>
          <div className='flex items-center justify-between pb-3 border-b border-border/30'>
            <div>
              <span className='text-[11px] font-semibold text-muted-foreground block'>
                Dokter Bertugas
              </span>
              <span className='text-sm font-bold text-foreground'>
                {doctor.nama_dokter}
              </span>
              <span className='text-xs text-muted-foreground block'>
                {doctor.spesialisasi}
              </span>
            </div>
            <div className='size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0'>
              <Icons.user className='size-4.5' />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3 text-xs'>
            <div>
              <span className='text-[11px] text-muted-foreground block'>Tanggal</span>
              <span className='font-semibold text-foreground block mt-0.5'>
                {formattedDisplayDate}
              </span>
            </div>

            <div>
              <span className='text-[11px] text-muted-foreground block'>Sesi Shift</span>
              <span className='font-semibold text-foreground block mt-0.5'>
                Sesi {SCHEDULE_SHIFT_LABELS[selectedShift]}
              </span>
            </div>

            <div>
              <span className='text-[11px] text-muted-foreground block'>Jam Praktik</span>
              <span className='font-mono font-bold text-primary block mt-0.5'>
                {selectedSlot.time} - {selectedSlot.endTime} WIB
              </span>
            </div>

            <div>
              <span className='text-[11px] text-muted-foreground block'>Ruang Praktik</span>
              <span className='font-semibold text-foreground block mt-0.5 truncate'>
                {selectedRoom?.name || doctor.ruang_praktik || 'Ruang Konsultasi'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
