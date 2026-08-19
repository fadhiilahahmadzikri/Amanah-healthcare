'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getStatusConfig } from '@/styles/clinical-tokens';
import { cn } from '@/lib/utils';
import type { AdminAppointment } from '../api/types';

export interface AppointmentDetailModalProps {
  isOpen: boolean;
  appointment: AdminAppointment | null;
  onClose: () => void;
  onUpdateStatus?: (appointment: AdminAppointment) => void;
}

export function AppointmentDetailModal({
  isOpen,
  appointment,
  onClose,
  onUpdateStatus
}: AppointmentDetailModalProps) {
  if (!appointment) return null;

  const initials = appointment.pasien
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const statusConfig = getStatusConfig(appointment.live_status);

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[580px]'
      showCloseButton={false}
    >
      <div className='relative font-sans space-y-3.5'>
        {/* 1. Patient & Doctor Identity Header & Status in Top-Right Position */}
        <div className='flex items-start justify-between gap-4 pb-3.5 border-b border-border/40'>
          <div className='flex items-center gap-4 min-w-0 flex-1'>
            <div className='size-16 min-w-[64px] min-h-[64px] rounded-full overflow-hidden shrink-0 ring-1 ring-border/40 bg-muted aspect-square'>
              <Avatar className='size-full rounded-full'>
                {appointment.avatar && (
                  <AvatarImage src={appointment.avatar} alt={appointment.pasien} />
                )}
                <AvatarFallback className='bg-primary/10 text-primary font-bold text-lg'>
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className='flex flex-col items-start min-w-0 flex-1 space-y-0.5'>
              <h3 className='text-base sm:text-lg font-bold text-foreground truncate w-full tracking-tight'>
                {appointment.pasien}
              </h3>
              <p className='text-sm font-medium text-muted-foreground truncate w-full'>
                ID Pasien: {appointment.id_pasien}
              </p>
              <div className='pt-0.5 flex items-center gap-1.5'>
                <span className='inline-flex items-center px-2 py-0.5 bg-primary/10 text-primary rounded-md text-xs font-semibold leading-none'>
                  <span>Antrean: {appointment.no_antrian}</span>
                </span>
                <span className='text-xs text-muted-foreground font-medium'>
                  • {appointment.layanan_poli}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge in Top-Right Position */}
          <div className='shrink-0 pt-0.5'>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm select-none shadow-none',
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

        {/* 2. Informasi Janji Temu & Antrean */}
        <div className='pb-3 border-b border-border/40'>
          <span className='text-xs font-normal text-muted-foreground/80 block mb-2'>
            Informasi Janji Temu & Antrean
          </span>
          <div className='grid grid-cols-2 gap-y-3 gap-x-5'>
            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Nomor Antrean
              </span>
              <span className='text-sm font-bold text-foreground block truncate font-mono select-text'>
                {appointment.no_antrian}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Tipe Kunjungan
              </span>
              <span className='text-sm font-medium text-muted-foreground block truncate select-text'>
                {appointment.tipe_kunjungan}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Tanggal Reservasi
              </span>
              <span className='text-sm font-medium text-muted-foreground block truncate select-text'>
                {appointment.tanggal_booking}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Jam / Slot Booking
              </span>
              <span className='text-sm font-medium text-muted-foreground block truncate font-mono select-text'>
                {appointment.jam_booking}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Dokter & Layanan Poli */}
        <div className='py-2.5 border-b border-border/40'>
          <span className='text-xs font-normal text-muted-foreground/80 block mb-2'>
            Dokter & Layanan Poli
          </span>
          <div className='grid grid-cols-2 gap-y-3 gap-x-5'>
            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Dokter Tujuan
              </span>
              <span className='text-sm font-medium text-muted-foreground block truncate select-text'>
                {appointment.dokter}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Poliklinik & Layanan
              </span>
              <span className='text-sm font-medium text-muted-foreground block truncate select-text'>
                {appointment.layanan_poli}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Data Pasien, Identitas & Kontak */}
        <div className='py-2.5 border-b border-border/40'>
          <span className='text-xs font-normal text-muted-foreground/80 block mb-2'>
            Data Pasien & Kontak
          </span>
          <div className='grid grid-cols-2 gap-y-3 gap-x-5'>
            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Nama Lengkap
              </span>
              <span className='text-sm font-medium text-muted-foreground block truncate select-text'>
                {appointment.pasien} ({appointment.jenis_kelamin})
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                ID Pasien
              </span>
              <span className='text-sm font-medium text-muted-foreground block font-mono select-text'>
                {appointment.id_pasien}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Nomor Telepon / WhatsApp
              </span>
              <span className='text-sm font-medium text-muted-foreground block truncate select-text'>
                {appointment.nomor_telepon_wa}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Email Pasien
              </span>
              <span
                className='text-sm font-medium text-muted-foreground block truncate select-text'
                title={appointment.email_pasien}
              >
                {appointment.email_pasien}
              </span>
            </div>
          </div>
        </div>

        {/* 5. Keluhan Pasien */}
        <div className='py-2.5 border-b border-border/40'>
          <span className='text-xs font-normal text-muted-foreground/80 block mb-1'>
            Keluhan Pasien
          </span>
          <p className='text-sm font-medium text-muted-foreground leading-relaxed select-text'>
            {appointment.keluhan_pasien || '-'}
          </p>
        </div>

        {/* 6. Modal Action Buttons */}
        <div className='pt-2 flex items-center justify-end gap-3'>
          {onUpdateStatus && (
            <Button
              type='button'
              variant='outline'
              shape='pill'
              size='default'
              onClick={() => {
                onClose();
                onUpdateStatus(appointment);
              }}
              className='px-5 font-medium'
            >
              <Icons.refresh className='mr-1.5 size-3.5' />
              Update Status Live
            </Button>
          )}

          <Button
            type='button'
            variant='default'
            shape='pill'
            size='default'
            onClick={onClose}
            className='px-7 font-semibold'
          >
            Tutup
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
