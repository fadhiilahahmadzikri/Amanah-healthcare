'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { getAppointmentStatusConfig } from '../constants/appointment-status.dictionary';
import { cn } from '@/lib/utils';
import type { AdminAppointment } from '../api/types';
import { AppointmentHistoryTimeline } from './appointment-history-timeline';
import { AppointmentCallAttemptsTimeline } from './appointment-call-attempts-timeline';
import { ChangeDoctorModal } from './change-doctor-modal';
import { ChangeRoomModal } from './change-room-modal';
import { isAppointmentTerminal } from '../constants/options';
import { useAuthContext } from '@/lib/rbac/auth-context';

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
  const { role, hasRole } = useAuthContext();
  const isAdmin = role === 'admin' || hasRole('admin');

  const [isChangeDoctorOpen, setIsChangeDoctorOpen] = React.useState(false);
  const [isChangeRoomOpen, setIsChangeRoomOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setIsChangeDoctorOpen(false);
      setIsChangeRoomOpen(false);
    }
  }, [isOpen]);

  if (!appointment) return null;

  const canReassign = isAdmin && !isAppointmentTerminal(appointment.status);

  const initials = appointment.patientName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const statusConfig = getAppointmentStatusConfig(appointment.status);

  return (
    <>
      <ModalWrapper
        isOpen={isOpen}
        onClose={onClose}
        maxWidth='max-w-[580px]'
        showCloseButton={false}
      >
        <div className='relative font-sans space-y-4'>
          <div className='flex items-start justify-between gap-4 pb-3.5 border-b border-border/40'>
            <div className='flex items-center gap-3.5 min-w-0 flex-1'>
              <div className='size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0 border border-primary/20 select-none'>
                {initials}
              </div>

              <div className='flex flex-col items-start min-w-0 flex-1 space-y-0.5'>
                <div className='flex items-center gap-2 max-w-full'>
                  <h3 className='text-base sm:text-lg font-bold text-foreground truncate tracking-tight'>
                    {appointment.patientName}
                  </h3>
                  {appointment.isAffiliated && (
                    <span className='inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 rounded leading-none shrink-0'>
                      Afiliasi
                    </span>
                  )}
                </div>
                <div className='flex items-center gap-1.5 text-xs text-muted-foreground font-medium truncate w-full'>
                  <span className='font-semibold text-primary'>{appointment.poliklinikName}</span>
                  <span>•</span>
                  <span>{appointment.visitType}</span>
                </div>
              </div>
            </div>

            <div className='shrink-0 flex items-center gap-2 pt-0.5'>
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
              <button
                type='button'
                onClick={onClose}
                aria-label='Tutup'
                className='rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors cursor-pointer'
              >
                <Icons.close className='size-4' />
              </button>
            </div>
          </div>

          <div className='bg-muted/30 rounded-xl p-3 border border-border/40 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs'>
            <div>
              <span className='text-[11px] text-muted-foreground/80 block'>No. Antrean</span>
              <span className='font-bold text-primary font-mono block text-sm'>
                {appointment.queueNumber}
              </span>
            </div>
            <div>
              <span className='text-[11px] text-muted-foreground/80 block'>Dokter Pemeriksa</span>
              <span className='font-semibold text-foreground truncate block'>
                {appointment.doctorName}
              </span>
            </div>
            <div>
              <span className='text-[11px] text-muted-foreground/80 block'>Jadwal Praktek</span>
              <span className='font-medium text-foreground font-mono block tabular-nums'>
                {appointment.scheduledDate} ({appointment.scheduledStartTime})
              </span>
            </div>
            {appointment.complaint && appointment.complaint !== '-' && (
              <div className='col-span-2 sm:col-span-3 pt-1 border-t border-border/30'>
                <span className='text-[11px] text-muted-foreground/80 block'>Keluhan Pasien</span>
                <p className='text-xs font-medium text-foreground line-clamp-2'>
                  {appointment.complaint}
                </p>
              </div>
            )}
          </div>

          <div className='py-1 border-y border-border/40'>
            <AppointmentHistoryTimeline appointment={appointment} />
          </div>

          <div className='pb-1'>
            <AppointmentCallAttemptsTimeline appointmentId={String(appointment.id)} />
          </div>

          <div className='pt-2 flex flex-wrap items-center justify-between gap-2.5 border-t border-border/40'>
            <div className='flex items-center gap-2'>
              {canReassign && (
                <>
                  <Button
                    type='button'
                    variant='outline'
                    shape='pill'
                    size='default'
                    onClick={() => setIsChangeDoctorOpen(true)}
                    className='px-3.5 font-medium text-xs'
                  >
                    <Icons.userCheck className='mr-1.5 size-3.5 text-muted-foreground' />
                    Ganti Dokter
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    shape='pill'
                    size='default'
                    onClick={() => setIsChangeRoomOpen(true)}
                    className='px-3.5 font-medium text-xs'
                  >
                    <Icons.mapPin className='mr-1.5 size-3.5 text-muted-foreground' />
                    Ganti Ruangan
                  </Button>
                </>
              )}
            </div>

            <div className='flex items-center gap-2'>
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
                  className='px-4 font-medium text-xs'
                >
                  <Icons.refresh className='mr-1.5 size-3.5' />
                  Update Status
                </Button>
              )}

              <Button
                type='button'
                variant='default'
                shape='pill'
                size='default'
                onClick={onClose}
                className='px-6 font-semibold text-xs'
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      </ModalWrapper>

      <ChangeDoctorModal
        isOpen={isChangeDoctorOpen}
        appointmentId={String(appointment.id)}
        patientName={appointment.patientName}
        patientId={appointment.patientId}
        queueNumber={appointment.queueNumber}
        currentDoctorName={appointment.doctorName}
        appointmentDate={appointment.scheduledDate}
        appointmentTime={appointment.scheduledStartTime}
        onClose={() => setIsChangeDoctorOpen(false)}
        onSuccess={() => {
          setIsChangeDoctorOpen(false);
          onClose();
        }}
      />

      <ChangeRoomModal
        isOpen={isChangeRoomOpen}
        appointmentId={String(appointment.id)}
        patientName={appointment.patientName}
        patientId={appointment.patientId}
        queueNumber={appointment.queueNumber}
        currentRoomName={appointment.poliklinikName}
        appointmentDate={appointment.scheduledDate}
        appointmentTime={appointment.scheduledStartTime}
        onClose={() => setIsChangeRoomOpen(false)}
        onSuccess={() => {
          setIsChangeRoomOpen(false);
          onClose();
        }}
      />
    </>
  );
}
