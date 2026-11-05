'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { ActiveTicketConflictInfo } from '@/features/data-pasien/api/patient-affiliation-service';

export interface BookingTicketConflictStepProps {
  activeTicket: ActiveTicketConflictInfo | null;
  onViewExistingAppointment?: (appointmentId: string) => void;
  onCancelExistingAppointment?: (appointmentId: string) => void;
  isCancelling?: boolean;
}

export function BookingTicketConflictStep({
  activeTicket,
  onViewExistingAppointment,
  onCancelExistingAppointment,
  isCancelling = false
}: BookingTicketConflictStepProps) {
  const queueNumber = activeTicket?.queueNumber || '-';
  const appointmentId = activeTicket?.appointmentId;

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Kamu Sudah Memiliki Tiket Antrean
        </h3>
        <p className='text-xs text-muted-foreground mt-1 leading-relaxed'>
          Pasien sudah memiliki tiket antrean aktif (
          <strong className='text-foreground font-semibold'>{queueNumber}</strong>) untuk kategori
          layanan ini pada tanggal yang kamu pilih.
        </p>
      </div>

      <p className='text-xs text-muted-foreground leading-relaxed'>
        Demi ketertiban bersama di klinik, satu pasien hanya dapat memiliki satu tiket aktif per
        hari untuk kategori layanan yang sama. Kamu dapat menggunakan tiket yang sudah ada,
        membatalkan janji temu sebelumnya, atau memilih tanggal lain.
      </p>

      {appointmentId && (onViewExistingAppointment || onCancelExistingAppointment) ? (
        <div className='flex flex-wrap items-center gap-2 pt-1'>
          {onViewExistingAppointment ? (
            <Button
              type='button'
              variant='outline'
              size='sm'
              shape='pill'
              onClick={() => onViewExistingAppointment(appointmentId)}
              leadingIcon={<Icons.eye className='size-3.5' />}
              className='text-xs'
            >
              Lihat Detail Janji Temu ({queueNumber})
            </Button>
          ) : null}

          {onCancelExistingAppointment ? (
            <Button
              type='button'
              variant='destructive'
              size='sm'
              shape='pill'
              disabled={isCancelling}
              onClick={() => onCancelExistingAppointment(appointmentId)}
              leadingIcon={
                isCancelling ? (
                  <Icons.spinner className='size-3.5 animate-spin' />
                ) : (
                  <Icons.close className='size-3.5' />
                )
              }
              className='text-xs'
            >
              {isCancelling ? 'Membatalkan...' : 'Batalkan Janji Temu Ini'}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
