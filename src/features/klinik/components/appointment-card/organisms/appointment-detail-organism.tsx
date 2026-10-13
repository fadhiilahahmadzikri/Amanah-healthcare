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
import { ReservationModal } from '@/features/klinik/components/reservation/reservation-modal';
import {
  isAppointmentTerminal,
  isAppointmentInService,
  isAppointmentWaiting,
  isAppointmentBeforeCall
} from '@/features/appointment-pasien/constants/options';
import { useAuthContext } from '@/lib/rbac/auth-context';
import { useIsMobile } from '@/hooks/use-mobile';
import { PatientAppointmentActionDrawer } from '../../patient-appointment-action-drawer';

export interface AppointmentDetailOrganismProps {
  isOpen: boolean;
  appointment: Appointment | null;
  viewerRole?: 'patient' | 'internal';
  onClose: () => void;
  onCancel?: (appointment: Appointment, reason?: string) => Promise<void> | void;
  onRescheduled?: (appointment: Appointment) => Promise<void> | void;
  onCallPatient?: (appointment: Appointment) => Promise<void> | void;
  onCompletePatient?: (appointment: Appointment) => Promise<void> | void;
  onOpenCheckIn?: (appointment: Appointment) => void;
  isCallPending?: boolean;
  isCompletePending?: boolean;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
  onOpenActionDrawer?: () => void;
}

type ModalStep = 'details' | 'form' | 'cancel-confirm';

export function AppointmentDetailOrganism({
  isOpen,
  appointment,
  viewerRole = 'internal',
  onClose,
  onCancel,
  onRescheduled,
  onCallPatient,
  onCompletePatient,
  onOpenCheckIn,
  isCallPending = false,
  isCompletePending = false,
  portalContainerRef,
  onOpenActionDrawer
}: AppointmentDetailOrganismProps) {
  const isMobile = useIsMobile();
  const [modalStep, setModalStep] = React.useState<ModalStep>('details');
  const [cancelReason, setCancelReason] = React.useState('');
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [isActionDrawerOpen, setIsActionDrawerOpen] = React.useState(false);
  const [isChangeDoctorOpen, setIsChangeDoctorOpen] = React.useState(false);
  const [isChangeRoomOpen, setIsChangeRoomOpen] = React.useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = React.useState(false);
  const { role, hasRole } = useAuthContext();

  React.useEffect(() => {
    if (!isOpen) {
      setModalStep('details');
      setCancelReason('');
      setIsCancelling(false);
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

  const canCancel = Boolean(
    appointment.allowedActions
      ? appointment.allowedActions.includes('CANCEL')
      : !isTerminal && !isInService
  );
  const canReassign = isAdmin && !isTerminal;
  const canReschedule = Boolean(
    appointment.allowedActions
      ? appointment.allowedActions.includes('RESCHEDULE')
      : !isTerminal && !isInService
  );
  const canCall = Boolean(appointment.allowedActions?.includes('CALL'));

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
        maxWidth='max-w-lg'
        showCloseButton={false}
        dismissible={!isCancelling}
        portalContainerRef={portalContainerRef}
        className='flex flex-col max-h-[90vh] overflow-hidden'
      >
        <div className='w-full flex flex-col font-sans select-none justify-between h-full min-h-0 min-w-0'>
          {/* STEP 1: Details View */}
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
                  {isMobile ? (
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => {
                        if (onOpenActionDrawer) {
                          onOpenActionDrawer();
                        } else {
                          setIsActionDrawerOpen(true);
                        }
                      }}
                      aria-label='Opsi tindakan janji temu'
                      className='size-7.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md transition-colors cursor-pointer shrink-0'
                    >
                      <Icons.ellipsis className='size-4' />
                    </Button>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          aria-label='Opsi tindakan janji temu'
                          className='size-7.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md transition-colors cursor-pointer shrink-0'
                        >
                          <Icons.ellipsis className='size-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align='end'
                        className='w-48 p-1.5 rounded-xl shadow-lg border border-border/60 bg-card font-sans text-xs'
                      >
                        <DropdownMenuItem
                          onClick={() => setModalStep('form')}
                          className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium hover:bg-muted/80 text-foreground transition-colors'
                        >
                          <Icons.forms className='size-4 text-primary shrink-0' />
                          <span>Lihat Formulir</span>
                        </DropdownMenuItem>

                        {onCallPatient && isWaiting && (
                          <DropdownMenuItem
                            onClick={() => onCallPatient(appointment)}
                            disabled={isCallPending || !canCall}
                            className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium hover:bg-muted/80 text-emerald-600 transition-colors'
                          >
                            {isCallPending ? (
                              <Icons.spinner className='size-4 animate-spin shrink-0' />
                            ) : (
                              <Icons.phone className='size-4 shrink-0' />
                            )}
                            <span>Panggil Pasien</span>
                          </DropdownMenuItem>
                        )}

                        {onCompletePatient && isInService && (
                          <DropdownMenuItem
                            onClick={() => onCompletePatient(appointment)}
                            disabled={isCompletePending}
                            className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium hover:bg-muted/80 text-blue-600 transition-colors'
                          >
                            {isCompletePending ? (
                              <Icons.spinner className='size-4 animate-spin shrink-0' />
                            ) : (
                              <Icons.check className='size-4 shrink-0' />
                            )}
                            <span>Selesai Periksa</span>
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
                  )}
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

              {/* Footer Modal: Hanya Tombol Tutup Sesuai User Request (Mencegah Overflow) */}
              <div className='pt-3.5 border-t border-border/40 flex items-center justify-end min-w-0 shrink-0'>
                <Button
                  type='button'
                  variant='outline'
                  shape='pill'
                  size='card-action'
                  onClick={onClose}
                  className='w-full sm:w-auto px-6 font-semibold cursor-pointer text-xs'
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Slide-in Step untuk Formulir Pendaftaran Pasien (Wizard Step) */}
          {modalStep === 'form' && (
            <div className='animate-in fade-in-50 slide-in-from-right-4 duration-200 flex flex-col h-full min-h-0 select-none font-sans'>
              <div className='flex items-center gap-2.5 pb-3 border-b border-border/40 shrink-0'>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() => setModalStep('details')}
                  className='size-8 rounded-full cursor-pointer'
                  aria-label='Kembali ke Detail'
                >
                  <Icons.arrowLeft className='size-4' />
                </Button>
                <div className='min-w-0 flex-1'>
                  <h3 className='text-base font-bold text-foreground tracking-tight truncate'>
                    Formulir Pendaftaran Pasien
                  </h3>
                  <p className='text-xs font-medium text-muted-foreground truncate'>
                    Data intake & kuesioner medis pasien
                  </p>
                </div>
              </div>

              <div className='flex-1 min-h-0 overflow-y-auto py-2.5 pr-1'>
                <AppointmentFormInspector
                  appointment={appointment}
                  hideHeader
                  onClose={() => setModalStep('details')}
                />
              </div>

              <div className='pt-3.5 border-t border-border/40 flex items-center justify-end shrink-0'>
                <Button
                  type='button'
                  variant='outline'
                  shape='pill'
                  size='card-action'
                  onClick={() => setModalStep('details')}
                  className='w-full sm:w-auto px-6 font-semibold text-xs cursor-pointer'
                >
                  Kembali ke Detail
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Slide-in Step untuk Konfirmasi Pembatalan */}
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

      <ReservationModal
        isOpen={isRescheduleOpen}
        context={{
          patientId: appointment.patient_id || '',
          patientName,
          serviceName,
          poliklinikId: appointment.poliklinik_id || appointment.layanan_id,
          mode: 'reschedule',
          appointmentId: String(appointment.id),
          currentDate: appointment.date,
          currentSession: appointment.session || appointment.session_name || undefined,
          queueNumber: appointment.queue_number || '-'
        }}
        onClose={() => setIsRescheduleOpen(false)}
        onSuccess={() => {
          setIsRescheduleOpen(false);
          onRescheduled?.(appointment);
          onClose();
        }}
      />

      <PatientAppointmentActionDrawer
        isOpen={isActionDrawerOpen}
        appointment={appointment}
        onClose={() => setIsActionDrawerOpen(false)}
        onViewForm={() => setModalStep('form')}
        onCheckIn={onOpenCheckIn ? () => onOpenCheckIn(appointment) : undefined}
        onReschedule={() => setIsRescheduleOpen(true)}
        onCancel={() => setModalStep('cancel-confirm')}
        onCallPatient={onCallPatient ? () => onCallPatient(appointment) : undefined}
        isCallPending={isCallPending}
      />
    </>
  );
}
