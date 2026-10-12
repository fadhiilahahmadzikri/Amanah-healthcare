'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { cn } from '@/lib/utils';
import { getDoctorByName } from '../../../api/service';
import type { Appointment, Doctor } from '../../../api/types';
import { AppointmentFormInspector } from '../../appointment-form-inspector';
import { CancelStepContent } from '../../cancel-step-content';
import { DoctorAvatar } from '../../doctor-avatar';
import { AppointmentStatusPill } from '../atoms/appointment-status-pill';
import { AppointmentTimeTrajectory } from '../atoms/appointment-time-trajectory';
import { normalizeAppointmentTimes } from '../utils/appointment-adapter';
import { formatClinicDate } from '@/lib/date-format';
import { ChangeDoctorModal } from '@/features/appointment-pasien/components/change-doctor-modal';
import { ChangeRoomModal } from '@/features/appointment-pasien/components/change-room-modal';
import { RescheduleAppointmentModal } from '@/features/appointment-pasien/components/reschedule-appointment-modal';
import {
  isAppointmentTerminal,
  isAppointmentInService,
  isAppointmentWaiting,
  isAppointmentBeforeCall
} from '@/features/appointment-pasien/constants/options';
import { useAuthContext } from '@/lib/rbac/auth-context';

export interface AppointmentDetailOrganismProps {
  isOpen: boolean;
  appointment: Appointment | null;
  viewerRole?: 'patient' | 'internal';
  onClose: () => void;
  onCancel?: (appointment: Appointment, reason?: string) => Promise<void> | void;
  onCallPatient?: (appointment: Appointment) => Promise<void> | void;
  onCompletePatient?: (appointment: Appointment) => Promise<void> | void;
  isCallPending?: boolean;
  isCompletePending?: boolean;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
}

type ModalStep = 'details' | 'cancel-confirm';

export function AppointmentDetailOrganism({
  isOpen,
  appointment,
  viewerRole = 'internal',
  onClose,
  onCancel,
  onCallPatient,
  onCompletePatient,
  isCallPending = false,
  isCompletePending = false,
  portalContainerRef
}: AppointmentDetailOrganismProps) {
  const [modalStep, setModalStep] = React.useState<ModalStep>('details');
  const [cancelReason, setCancelReason] = React.useState('');
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [isFormExpanded, setIsFormExpanded] = React.useState(false);
  const [isChangeDoctorOpen, setIsChangeDoctorOpen] = React.useState(false);
  const [isChangeRoomOpen, setIsChangeRoomOpen] = React.useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = React.useState(false);
  const { role, hasRole } = useAuthContext();

  React.useEffect(() => {
    if (!isOpen) {
      setModalStep('details');
      setCancelReason('');
      setIsCancelling(false);
      setIsFormExpanded(false);
      setIsChangeDoctorOpen(false);
      setIsChangeRoomOpen(false);
      setIsRescheduleOpen(false);
    }
  }, [isOpen]);

  if (!appointment) return null;

  const doctor: Doctor = getDoctorByName(appointment.doctor_name || '') || {
    name: appointment.doctor_name || '',
    spec: appointment.doctor_specialty || '',
    avatar: '',
    location: '',
    rating: '',
    tags: [],
    schedule: ''
  };

  const isTerminal = isAppointmentTerminal(appointment.status);
  const isInService = isAppointmentInService(appointment.status);
  const isWaiting = isAppointmentWaiting(appointment.status);
  const isBeforeCall = isAppointmentBeforeCall(appointment.status);

  const isInternalView = viewerRole === 'internal';
  const displayLocation =
    !isInternalView && isBeforeCall
      ? 'Menunggu panggilan klinik'
      : appointment.poliklinik_name && appointment.room_name
        ? `${appointment.poliklinik_name}, ${appointment.room_name}`
        : appointment.room_name || appointment.poliklinik_name || '-';

  const doctorSpecialty = appointment.doctor_specialty || doctor.spec || '-';
  const { startTime, endTime, durationText } = normalizeAppointmentTimes(appointment);

  const visitType = appointment.visit_type || '-';
  const patientName = appointment.patient_name || '-';
  const serviceName = appointment.service || doctor.spec || '-';
  const complaintText = appointment.complaint || '-';
  const isAdmin = role === 'admin' || hasRole('admin');

  const isCheckedIn = Boolean(appointment.checked_in_at || appointment.checkedInAt);
  const canCancel = !isTerminal && !isCheckedIn;
  const canReassign = isAdmin && !isTerminal;
  const canReschedule = !isTerminal && !isInService && (!isCheckedIn || isAdmin);
  const canCall = !appointment.allowedActions || appointment.allowedActions.includes('CALL');

  const handleConfirmCancel = async () => {
    if (!onCancel || !appointment) return;
    setIsCancelling(true);
    try {
      await onCancel(appointment, cancelReason.trim() || undefined);
      setCancelReason('');
      setModalStep('details');
    } catch {
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <ModalWrapper
        isOpen={isOpen}
        onClose={onClose}
        maxWidth={isFormExpanded ? 'max-w-5xl' : 'max-w-lg'}
        showCloseButton={false}
        dismissible={!isCancelling}
        portalContainerRef={portalContainerRef}
        className={cn(
          'transition-[max-width,height,max-height] duration-300 ease-out flex flex-col overflow-hidden',
          isFormExpanded ? 'h-[85vh] max-h-[85vh]' : 'max-h-[90vh]'
        )}
      >
        <div
          className={cn(
            'w-full flex items-stretch flex-1 min-h-0',
            isFormExpanded ? 'flex-col md:flex-row' : 'flex-col'
          )}
        >
          <div
            className={cn(
              'w-full flex flex-col font-sans select-none justify-between h-full min-h-0 min-w-0 transition-all duration-300 ease-out',
              isFormExpanded ? 'md:w-[420px] md:shrink-0 md:pr-8' : 'w-full'
            )}
          >
            {modalStep === 'details' && (
              <div className='flex flex-col h-full min-h-0 w-full justify-between'>
                <div className='flex items-center justify-between gap-3 pb-3 border-b border-border/40 min-h-[77px] shrink-0'>
                  <div className='flex items-center gap-3.5 min-w-0 flex-1'>
                    {doctor.name ? (
                      <>
                        <div className='size-14 min-w-[56px] min-h-[56px] rounded-full overflow-hidden shrink-0 ring-1 ring-border/40 bg-muted aspect-square'>
                          <DoctorAvatar name={doctor.name} avatarUrl={doctor.avatar} size={56} />
                        </div>
                        <div className='flex flex-col items-start min-w-0 flex-1 space-y-0.5'>
                          <h3 className='text-base sm:text-lg font-bold text-foreground truncate w-full tracking-tight'>
                            {doctor.name}
                          </h3>
                          <p className='text-sm font-medium text-muted-foreground truncate w-full'>
                            {doctorSpecialty}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className='flex flex-col items-start min-w-0 flex-1 space-y-0.5'>
                        <h3 className='text-base sm:text-lg font-bold text-foreground truncate w-full tracking-tight'>
                          {serviceName || appointment.poliklinik_name || 'Janji Temu Klinik'}
                        </h3>
                        {appointment.poliklinik_name &&
                          serviceName !== appointment.poliklinik_name && (
                            <p className='text-sm font-medium text-muted-foreground truncate w-full'>
                              {appointment.poliklinik_name}
                            </p>
                          )}
                      </div>
                    )}
                  </div>

                  <div className='shrink-0'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type='button'
                          className='p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer select-none'
                          aria-label='Opsi tindakan janji temu'
                        >
                          <Icons.ellipsis className='size-5' />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align='end'
                        className='w-48 p-1.5 rounded-xl shadow-lg border border-border/60 bg-card font-sans text-xs'
                      >
                        {!isFormExpanded && (
                          <DropdownMenuItem
                            onClick={() => setIsFormExpanded(true)}
                            className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium hover:bg-muted/80 text-foreground transition-colors'
                          >
                            <Icons.forms className='size-4 text-primary shrink-0' />
                            <span>Lihat Formulir</span>
                          </DropdownMenuItem>
                        )}

                        {canReassign && (
                          <>
                            <DropdownMenuItem
                              onClick={() => setIsChangeDoctorOpen(true)}
                              className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium hover:bg-muted/80 text-foreground transition-colors'
                            >
                              <Icons.userCheck className='size-4 text-muted-foreground shrink-0' />
                              <span>Ganti Dokter</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => setIsChangeRoomOpen(true)}
                              className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium hover:bg-muted/80 text-foreground transition-colors'
                            >
                              <Icons.mapPin className='size-4 text-muted-foreground shrink-0' />
                              <span>Ganti Ruangan</span>
                            </DropdownMenuItem>
                          </>
                        )}

                        {canReschedule && (
                          <DropdownMenuItem
                            onClick={() => setIsRescheduleOpen(true)}
                            className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium hover:bg-muted/80 text-foreground transition-colors'
                          >
                            <Icons.calendar className='size-4 text-muted-foreground shrink-0' />
                            <span>Jadwalkan Ulang</span>
                          </DropdownMenuItem>
                        )}

                        {canCancel && onCancel && (
                          <>
                            <DropdownMenuSeparator className='my-1 border-border/40' />
                            <DropdownMenuItem
                              onClick={() => setModalStep('cancel-confirm')}
                              className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive transition-colors'
                            >
                              <Icons.close className='size-4 text-destructive shrink-0' />
                              <span>Batalkan Janji Temu</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className='flex-1 min-h-0 overflow-y-auto pr-1 py-1'>
                  <div className='py-2.5 border-b border-border/40 flex items-center justify-between gap-3 text-sm min-w-0'>
                    <div className='flex items-center gap-2 text-foreground font-semibold min-w-0 shrink-0'>
                      <Icons.calendar className='size-4 text-primary shrink-0' strokeWidth={1.8} />
                      <span className='truncate'>{appointment.date ? formatClinicDate(appointment.date) : '-'}</span>
                    </div>
                    <div className='flex items-center gap-1.5 text-muted-foreground font-medium min-w-0 max-w-[55%] justify-end shrink'>
                      <Icons.mapPin className='size-4 text-primary shrink-0' strokeWidth={1.8} />
                      <span className='truncate text-right'>{displayLocation}</span>
                    </div>
                  </div>

                  <AppointmentTimeTrajectory
                    startTime={startTime}
                    endTime={endTime}
                    durationText={durationText}
                    visitType={visitType}
                    variant='modal'
                    startLabel={isBeforeCall || isWaiting ? 'Est. Mulai' : 'Mulai'}
                    endLabel={isBeforeCall || isWaiting ? 'Est. Selesai' : 'Selesai'}
                  />

                  <div className='pt-2 pb-1 grid grid-cols-2 gap-y-3 gap-x-5 min-w-0'>
                    <div className='border-b border-border/40 pb-2'>
                      <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                        Nama Pasien
                      </span>
                      <span className='text-sm font-semibold text-foreground block truncate'>
                        {patientName}
                      </span>
                    </div>

                    <div className='border-b border-border/40 pb-2'>
                      <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                        Status Janji Temu
                      </span>
                      <div className='pt-0.5'>
                        <AppointmentStatusPill status={appointment.status} size='sm' />
                      </div>
                    </div>

                    <div className='border-b border-border/40 pb-2'>
                      <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                        Nomor Antrean
                      </span>
                      <span className='text-sm font-bold font-mono text-primary block truncate'>
                        {appointment.queue_number || '-'}
                      </span>
                    </div>

                    <div className='border-b border-border/40 pb-2'>
                      <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                        Layanan Poliklinik
                      </span>
                      <span className='text-sm font-semibold text-foreground block truncate'>
                        {serviceName}
                      </span>
                    </div>

                    <div className='border-b border-border/40 pb-2'>
                      <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                        Ruang & Lokasi
                      </span>
                      <span className='text-sm font-semibold text-foreground block truncate'>
                        {displayLocation}
                      </span>
                    </div>

                    <div className='border-b border-border/40 pb-2'>
                      <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                        Tipe Kunjungan
                      </span>
                      <span className='text-sm font-semibold text-foreground block truncate'>
                        {visitType}
                      </span>
                    </div>
                  </div>

                  <div className='border-b border-border/40 pb-3 pt-2 min-w-0'>
                    <span className='text-xs font-normal text-muted-foreground block mb-1'>
                      Keluhan Medis
                    </span>
                    <p className='text-sm font-medium text-foreground leading-relaxed break-words'>
                      {complaintText}
                    </p>
                  </div>
                </div>

                <div className='pt-3 border-t border-border/40 flex items-center justify-between min-w-0 shrink-0 gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    shape='pill'
                    size='default'
                    onClick={onClose}
                    className='px-5 font-semibold cursor-pointer text-xs'
                  >
                    Tutup
                  </Button>

                  <div className='flex items-center gap-2'>
                    {onCallPatient && isWaiting && (
                      <Button
                        type='button'
                        variant='default'
                        shape='pill'
                        size='default'
                        disabled={isCallPending || !canCall}
                        onClick={() => onCallPatient(appointment)}
                        className={cn(
                          'text-xs font-semibold text-white transition-colors',
                          canCall
                            ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                            : 'bg-muted-foreground/40 cursor-not-allowed opacity-60'
                        )}
                        title={
                          canCall
                            ? 'Panggil Pasien'
                            : 'Menunggu giliran (antrean sebelumnya masih menunggu)'
                        }
                        leadingIcon={
                          isCallPending ? (
                            <Icons.spinner className='size-3.5 animate-spin' />
                          ) : (
                            <Icons.notification className='size-3.5' />
                          )
                        }
                      >
                        Panggil Pasien
                      </Button>
                    )}

                    {onCompletePatient && isInService && (
                      <Button
                        type='button'
                        variant='default'
                        shape='pill'
                        size='default'
                        disabled={isCompletePending}
                        onClick={() => onCompletePatient(appointment)}
                        className='text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                        leadingIcon={
                          isCompletePending ? (
                            <Icons.spinner className='size-3.5 animate-spin' />
                          ) : (
                            <Icons.check className='size-3.5' />
                          )
                        }
                      >
                        Selesai Periksa
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {modalStep === 'cancel-confirm' && (
              <CancelStepContent
                appointment={appointment}
                patientName={patientName}
                doctorName={doctor.name}
                queueNumber={appointment.queue_number || '-'}
                appointmentDate={appointment.date ? formatClinicDate(appointment.date) : '-'}
                cancelReason={cancelReason}
                setCancelReason={setCancelReason}
                isCancelling={isCancelling}
                onBack={() => setModalStep('details')}
                onConfirm={handleConfirmCancel}
              />
            )}
          </div>

          {isFormExpanded && modalStep === 'details' && (
            <div className='w-full flex-1 flex flex-col font-sans select-none h-full min-h-0 min-w-0 md:pl-8 md:border-l border-border/40 pt-6 md:pt-0 animate-in fade-in-0 slide-in-from-right-6 duration-300 ease-out'>
              <AppointmentFormInspector
                appointment={appointment}
                onClose={() => setIsFormExpanded(false)}
              />
            </div>
          )}
        </div>
      </ModalWrapper>

      <ChangeDoctorModal
        isOpen={isChangeDoctorOpen}
        appointmentId={String(appointment.id)}
        patientName={patientName}
        patientId={appointment.patient_id || String(appointment.id)}
        queueNumber={appointment.queue_number || '-'}
        currentDoctorName={doctor.name}
        appointmentDate={appointment.date ? formatClinicDate(appointment.date) : '-'}
        appointmentTime={`${startTime} - ${endTime}`}
        onClose={() => setIsChangeDoctorOpen(false)}
        onSuccess={() => {
          setIsChangeDoctorOpen(false);
          onClose();
        }}
      />

      <ChangeRoomModal
        isOpen={isChangeRoomOpen}
        appointmentId={String(appointment.id)}
        patientName={patientName}
        patientId={appointment.patient_id || String(appointment.id)}
        queueNumber={appointment.queue_number || '-'}
        currentRoomName={displayLocation}
        appointmentDate={appointment.date ? formatClinicDate(appointment.date) : '-'}
        appointmentTime={`${startTime} - ${endTime}`}
        onClose={() => setIsChangeRoomOpen(false)}
        onSuccess={() => {
          setIsChangeRoomOpen(false);
          onClose();
        }}
      />

      <RescheduleAppointmentModal
        isOpen={isRescheduleOpen}
        appointmentId={String(appointment.id)}
        patientName={patientName}
        queueNumber={appointment.queue_number || '-'}
        serviceName={serviceName}
        poliklinikId={appointment.poliklinik_id || appointment.layanan_id}
        currentDate={appointment.date}
        currentSession={appointment.session || appointment.session_name || undefined}
        onClose={() => setIsRescheduleOpen(false)}
        onSuccess={() => {
          setIsRescheduleOpen(false);
          onClose();
        }}
      />
    </>
  );
}
