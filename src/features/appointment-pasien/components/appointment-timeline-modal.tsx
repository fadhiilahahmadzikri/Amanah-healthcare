'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { AppointmentStatusPill } from '@/features/klinik/components/appointment-card';
import { AppointmentHistoryTimeline } from './appointment-history-timeline';
import type { AdminAppointment } from '../api/types';

export interface AppointmentTimelineModalProps {
  isOpen: boolean;
  appointment: AdminAppointment | null;
  onClose: () => void;
  onUpdateStatus?: () => void;
  onQrCheckIn?: () => void;
}

export function AppointmentTimelineModal({
  isOpen,
  appointment,
  onClose,
  onUpdateStatus,
  onQrCheckIn
}: AppointmentTimelineModalProps) {
  if (!appointment) return null;

  const { canUpdateStatus, canCheckIn } = appointment.capabilities;
  const subtitle = `Antrean ${appointment.queueNumber} dengan pasien ${appointment.patientName}${appointment.poliklinikName ? ` di ${appointment.poliklinikName}` : ''}${appointment.layananName ? ` • ${appointment.layananName}` : ''}`;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-2xl sm:max-w-3xl'
      showCloseButton={false}
      className='flex flex-col max-h-[90vh] overflow-hidden'
    >
      <div className='flex flex-col font-sans h-full min-h-0 select-none'>
        {/* Header Modal */}
        <div className='flex items-center justify-between gap-3 pb-3 border-b border-border/40 shrink-0'>
          <div className='flex flex-col min-w-0 flex-1 space-y-0.5'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight truncate'>
              Garis Waktu Operasional Pasien
            </h3>
            <p className='text-xs font-medium text-muted-foreground truncate'>{subtitle}</p>
          </div>

          <div className='flex items-center gap-2 shrink-0'>
            <AppointmentStatusPill status={appointment.status} size='sm' />
          </div>
        </div>

        {/* Scrollable Timeline Body */}
        <div className='flex-1 min-h-0 overflow-y-auto py-3.5 pr-1'>
          <AppointmentHistoryTimeline appointment={appointment} />
        </div>

        {/* Modal Footer with Consistent size='card-action' and shape='pill' */}
        <div className='pt-3.5 border-t border-border/40 flex items-center justify-between gap-4 shrink-0'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='card-action'
            onClick={onClose}
            className='px-6 font-semibold text-xs cursor-pointer'
          >
            Tutup
          </Button>

          <div className='flex items-center gap-2.5'>
            {canUpdateStatus && onUpdateStatus && (
              <Button
                type='button'
                variant='outline'
                shape='pill'
                size='card-action'
                onClick={onUpdateStatus}
                className='px-5 font-semibold text-xs cursor-pointer'
                leadingIcon={<Icons.refresh className='size-3.5' />}
              >
                Update Status
              </Button>
            )}

            {canCheckIn && onQrCheckIn && (
              <Button
                type='button'
                variant='default'
                shape='pill'
                size='card-action'
                onClick={onQrCheckIn}
                className='px-6 font-semibold text-xs cursor-pointer shadow-xs'
                leadingIcon={<Icons.qrCode className='size-3.5' />}
              >
                QR Check-In
              </Button>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
