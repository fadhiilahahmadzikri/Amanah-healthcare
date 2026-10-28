'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { ActiveTicketConflictInfo } from '@/features/data-pasien/api/patient-affiliation-service';

export interface BookingTicketConflictStepProps {
  activeTicket: ActiveTicketConflictInfo | null;
  onViewExistingAppointment?: (appointmentId: string) => void;
}

export function BookingTicketConflictStep({
  activeTicket,
  onViewExistingAppointment
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
        hari untuk kategori layanan yang sama. Kamu dapat menggunakan tiket yang sudah ada atau
        memilih tanggal lain.
      </p>

      {appointmentId && onViewExistingAppointment ? (
        <div className='pt-1'>
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
        </div>
      ) : null}
    </div>
  );
}
