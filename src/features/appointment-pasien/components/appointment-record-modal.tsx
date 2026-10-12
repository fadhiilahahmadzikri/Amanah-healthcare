'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { isAppointmentBooked, isAppointmentTerminal } from '../constants/options';
import { getAppointmentStatusConfig } from '../constants/appointment-status.dictionary';
import { AppointmentHistoryTimeline } from './appointment-history-timeline';
import type { AdminAppointment } from '../api/types';

export interface AppointmentRecordModalProps {
  isOpen: boolean;
  appointment: AdminAppointment | null;
  onClose: () => void;
  onViewPatientDetail: () => void;
  onUpdateStatus: () => void;
  onChangeDoctor?: () => void;
  onChangeRoom?: () => void;
  onQrCheckIn?: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;
}

export function AppointmentRecordModal({
  isOpen,
  appointment,
  onClose,
  onViewPatientDetail,
  onUpdateStatus,
  onChangeDoctor,
  onChangeRoom,
  onQrCheckIn,
  onReschedule,
  onCancel
}: AppointmentRecordModalProps) {
  if (!appointment) return null;

  const isTerminal = isAppointmentTerminal(appointment.status);
  const isBooked = isAppointmentBooked(appointment.status);
  const hasAssignments = Boolean(appointment.doctorName && appointment.roomName);
  const canReassign = !isTerminal;
  const canUpdateStatus = !isTerminal && (!isBooked || hasAssignments);
  const canReschedule = Boolean(appointment.allowedActions?.includes('RESCHEDULE'));
  const canCancel = Boolean(appointment.allowedActions?.includes('CANCEL'));

  const statusConfig = getAppointmentStatusConfig(appointment.status);
  const serviceName = appointment.layananName || appointment.poliklinikName;
  const subtitle = `Antrean ${appointment.queueNumber} pasien ${appointment.patientName}${serviceName ? ` dengan layanan ${serviceName}` : ''}`;
  const canCheckIn = Boolean(appointment.allowedActions?.includes('CHECK_IN'));

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-2xl sm:max-w-3xl'
      showCloseButton={false}
      className='flex flex-col max-h-[90vh] overflow-hidden'
    >
      <div className='flex flex-col font-sans h-full min-h-0 select-none'>
        <div className='flex items-center justify-between gap-3 pb-3.5 border-b border-border/40 shrink-0'>
          <div className='flex flex-col min-w-0 flex-1 space-y-0.5'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight truncate'>
              Riwayat Operasional Janji Temu
            </h3>
            <p className='text-xs font-medium text-muted-foreground truncate'>{subtitle}</p>
          </div>

          <div className='flex items-center gap-2 shrink-0'>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] sm:text-[11.5px] font-bold border backdrop-blur-sm select-none shadow-none',
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type='button'
                  className='p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer select-none'
                  aria-label='Opsi tindakan janji temu'
                >
                  <Icons.ellipsis className='size-5' />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-48 p-1.5 rounded-xl shadow-lg border border-border/60 bg-card font-sans text-xs'
              >
                <DropdownMenuItem
                  onClick={onViewPatientDetail}
                  className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium hover:bg-muted/80 text-foreground transition-colors'
                >
                  <Icons.user className='size-4 text-primary shrink-0' />
                  <span>Lihat Detail Pasien</span>
                </DropdownMenuItem>

                {canUpdateStatus && (
                  <DropdownMenuItem
                    onClick={onUpdateStatus}
                    className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium hover:bg-muted/80 text-foreground transition-colors'
                  >
                    <Icons.refresh className='size-4 text-muted-foreground shrink-0' />
                    <span>Update Status</span>
                  </DropdownMenuItem>
                )}

                {canReassign && onChangeDoctor && (
                  <DropdownMenuItem
                    onClick={onChangeDoctor}
                    className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium hover:bg-muted/80 text-foreground transition-colors'
                  >
                    <Icons.userCheck className='size-4 text-muted-foreground shrink-0' />
                    <span>{appointment.doctorName ? 'Ganti Dokter' : 'Tugaskan Dokter'}</span>
                  </DropdownMenuItem>
                )}

                {canReassign && onChangeRoom && (
                  <DropdownMenuItem
                    onClick={onChangeRoom}
                    className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium hover:bg-muted/80 text-foreground transition-colors'
                  >
                    <Icons.mapPin className='size-4 text-muted-foreground shrink-0' />
                    <span>{appointment.roomName ? 'Ganti Ruangan' : 'Tugaskan Ruangan'}</span>
                  </DropdownMenuItem>
                )}

                {canCheckIn && onQrCheckIn && (
                  <DropdownMenuItem
                    onClick={onQrCheckIn}
                    className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium hover:bg-muted/80 text-foreground transition-colors'
                  >
                    <Icons.qrCode className='size-4 text-muted-foreground shrink-0' />
                    <span>QR Check-In</span>
                  </DropdownMenuItem>
                )}

                {canReschedule && onReschedule && (
                  <DropdownMenuItem
                    onClick={onReschedule}
                    className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium hover:bg-muted/80 text-foreground transition-colors'
                  >
                    <Icons.calendar className='size-4 text-muted-foreground shrink-0' />
                    <span>Jadwalkan Ulang</span>
                  </DropdownMenuItem>
                )}

                {canCancel && onCancel && (
                  <DropdownMenuItem
                    onClick={onCancel}
                    className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium hover:bg-muted/80 text-destructive focus:text-destructive transition-colors'
                  >
                    <Icons.trash className='size-4 text-destructive shrink-0' />
                    <span>Batalkan Janji Temu</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className='flex-1 min-h-0 overflow-y-auto py-3.5 pr-1'>
          <AppointmentHistoryTimeline appointment={appointment} />
        </div>

        <div className='pt-3.5 border-t border-border/40 flex items-center justify-between gap-4 shrink-0'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='default'
            onClick={onClose}
            className='px-5 font-medium text-xs cursor-pointer'
          >
            Tutup
          </Button>

          <div className='flex items-center gap-2.5'>
            {canUpdateStatus && (
              <Button
                type='button'
                variant='outline'
                shape='pill'
                size='default'
                onClick={onUpdateStatus}
                className='px-4 font-semibold text-xs cursor-pointer'
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
                size='default'
                onClick={onQrCheckIn}
                className='px-5 font-semibold text-xs cursor-pointer shadow-xs'
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
