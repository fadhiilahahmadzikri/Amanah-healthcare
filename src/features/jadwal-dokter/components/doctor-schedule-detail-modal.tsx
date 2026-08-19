'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getStatusConfig } from '@/styles/clinical-tokens';
import { DoctorCalendarGrid } from './doctor-calendar-grid';
import {
  useUpdateDoctorDayStatusMutation,
  useUpdateDoctorScheduleMutation
} from '../api/mutations';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { DoctorSchedule, ScheduleDayStatus } from '../api/types';

export interface DoctorScheduleDetailModalProps {
  doctor: DoctorSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEdit: (doctor: DoctorSchedule) => void;
}

export function DoctorScheduleDetailModal({
  doctor,
  isOpen,
  onClose,
  onOpenEdit
}: DoctorScheduleDetailModalProps) {
  const updateScheduleMutation = useUpdateDoctorScheduleMutation();
  const updateDayMutation = useUpdateDoctorDayStatusMutation();

  if (!doctor) return null;

  const doctorStatusConfig = getStatusConfig(doctor.status_dokter);
  const scheduleStatusConfig = getStatusConfig(doctor.status_jadwal);

  const initials = doctor.nama_dokter
    .replace('dr. ', '')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleToggleCuti = () => {
    updateScheduleMutation.mutate({
      id: doctor.id,
      payload: {
        is_cuti: !doctor.is_cuti,
        status_dokter: doctor.is_cuti ? 'Aktif' : 'Cuti',
        status_jadwal: doctor.is_cuti ? 'Aktif' : 'Cuti / Tutup'
      }
    });
  };

  const handleCloseToday = () => {
    updateScheduleMutation.mutate({
      id: doctor.id,
      payload: {
        status_jadwal: 'Tutup',
        slot_tersedia: 0
      }
    });
    toast.success(`Praktik hari ini untuk ${doctor.nama_dokter} telah ditutup.`);
  };

  const handleDayStatusChange = (day: number, status: ScheduleDayStatus) => {
    updateDayMutation.mutate({
      doctorId: doctor.id,
      day,
      status
    });
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[580px]'
      showCloseButton={false}
    >
      <div className='relative font-sans space-y-3.5'>
        {/* 1. Header Identitas Dokter & Status */}
        <div className='flex items-start justify-between gap-4 pb-3.5 border-b border-border/40'>
          <div className='flex items-center gap-4 min-w-0 flex-1'>
            <div className='size-16 min-w-[64px] min-h-[64px] rounded-full overflow-hidden shrink-0 ring-1 ring-border/40 bg-muted aspect-square'>
              <Avatar className='size-full rounded-full'>
                {doctor.avatar && <AvatarImage src={doctor.avatar} alt={doctor.nama_dokter} />}
                <AvatarFallback className='bg-primary/10 text-primary font-bold text-lg'>
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className='flex flex-col items-start min-w-0 flex-1 space-y-0.5'>
              <h3 className='text-base sm:text-lg font-bold text-foreground truncate w-full tracking-tight'>
                {doctor.nama_dokter}
              </h3>
              <p className='text-sm font-medium text-muted-foreground truncate w-full'>
                {doctor.spesialisasi}
              </p>
              <div className='pt-0.5 flex items-center gap-1.5'>
                <span className='inline-flex items-center px-2 py-0.5 bg-primary/10 text-primary rounded-md text-xs font-semibold leading-none'>
                  <span>{doctor.ruang_praktik}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge in Top-Right Position */}
          <div className='shrink-0 pt-0.5'>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm select-none shadow-none',
                doctorStatusConfig.pillBg,
                doctorStatusConfig.pillBorder
              )}
            >
              <span
                className={cn(
                  'size-2 rounded-full shrink-0 ring-1 ring-white/60 dark:ring-white/20',
                  doctorStatusConfig.dotGradient
                )}
              />
              <span
                className={cn(
                  'bg-clip-text text-transparent font-bold tracking-tight',
                  doctorStatusConfig.textGradient
                )}
              >
                {doctorStatusConfig.label}
              </span>
            </span>
          </div>
        </div>

        {/* 2. Informasi Kontak & Ruang Praktik */}
        <div className='pb-3 border-b border-border/40'>
          <span className='text-xs font-normal text-muted-foreground/80 block mb-2'>
            Informasi kontak & ruang praktik
          </span>
          <div className='grid grid-cols-2 gap-y-3 gap-x-5'>
            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Email dokter
              </span>
              <span className='text-sm font-medium text-muted-foreground block truncate font-mono select-text'>
                {doctor.email}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Nomor telepon
              </span>
              <span className='text-sm font-medium text-muted-foreground block truncate font-mono select-text'>
                {doctor.nomor_telepon}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Ruang praktik
              </span>
              <span className='text-sm font-medium text-muted-foreground block truncate select-text'>
                {doctor.ruang_praktik}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Status dokter
              </span>
              <span className='text-sm font-bold text-foreground block truncate select-text'>
                {doctor.status_dokter}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Ringkasan Jadwal & Kuota Hari Ini */}
        <div className='pb-3 border-b border-border/40'>
          <span className='text-xs font-normal text-muted-foreground/80 block mb-2'>
            Ringkasan jadwal & kuota hari ini
          </span>
          <div className='grid grid-cols-2 gap-y-3 gap-x-5'>
            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Jam praktik hari ini
              </span>
              <span className='text-sm font-bold text-foreground block truncate font-mono select-text'>
                {doctor.jadwal_hari_ini}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Status jadwal
              </span>
              <span className='text-sm font-medium text-muted-foreground block truncate select-text'>
                {scheduleStatusConfig.label}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Kapasitas pasien
              </span>
              <span className='text-sm font-medium text-muted-foreground block truncate select-text'>
                {doctor.kapasitas_per_hari} pasien / hari
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Sisa slot kuota
              </span>
              <span className='text-sm font-bold text-primary block truncate font-mono select-text'>
                {doctor.slot_tersedia} dari {doctor.kapasitas_per_hari} slot
              </span>
            </div>
          </div>
        </div>

        {/* 4. Jadwal Praktik Bulanan */}
        <div className='pb-3 border-b border-border/40'>
          <span className='text-xs font-normal text-muted-foreground/80 block mb-2'>
            Jadwal praktik bulanan ({doctor.bulan_jadwal})
          </span>
          <div className='p-3.5 rounded-xl border border-border/40 bg-muted/15'>
            <DoctorCalendarGrid
              days={doctor.monthly_schedule}
              onSelectDayStatus={handleDayStatusChange}
              readOnly={false}
            />
          </div>
        </div>

        {/* 5. Footer Actions */}
        <div className='flex items-center justify-between gap-3 pt-2'>
          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant={doctor.is_cuti ? 'outline' : 'destructive'}
              shape='pill'
              size='sm'
              onClick={handleToggleCuti}
              className='font-medium text-xs'
            >
              {doctor.is_cuti ? 'Aktifkan dokter' : 'Set dokter cuti'}
            </Button>

            <Button
              type='button'
              variant='outline'
              shape='pill'
              size='sm'
              onClick={handleCloseToday}
              disabled={doctor.status_jadwal === 'Tutup' || doctor.is_cuti}
              className='font-medium text-xs'
            >
              Tutup hari ini
            </Button>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              shape='pill'
              size='sm'
              onClick={onClose}
              className='font-medium text-xs'
            >
              Tutup
            </Button>

            <Button
              type='button'
              variant='default'
              shape='pill'
              size='sm'
              withTrailingCircleIcon
              onClick={() => {
                onClose();
                onOpenEdit(doctor);
              }}
              className='font-semibold text-xs'
            >
              Atur jadwal
            </Button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
