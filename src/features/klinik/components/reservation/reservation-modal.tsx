'use client';

import * as React from 'react';
import { isUUID } from 'class-validator';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { catalogService, type ServiceCatalogItem } from '../../api/catalog.service';
import {
  patientAffiliationService,
  type BackendAppointmentItem,
  type PatientAffiliationProfile
} from '@/features/data-pasien/api/patient-affiliation-service';
import {
  rescheduleAppointmentAction,
  bulkRescheduleAppointments,
  bulkProposeRescheduleAppointments,
  proposeRescheduleAppointment
} from '@/features/appointment-pasien/api/service';
import { appointmentKeys } from '@/features/appointment-pasien/api/queries';
import { BookingDateStep } from '../booking/booking-date-step';
import { BookingSessionStep } from '../booking/booking-session-step';
import { BookingConfirmationStep } from '../booking/booking-confirmation-step';
import { QueueSuccessModal } from '../queue-success-modal';
import {
  APPOINTMENT_STATUS,
  QUEUE_STATUS,
  type Appointment,
  type MedicalAppointmentFlow
} from '../../api/types';
import { VISIT_TYPE } from '@/constants/visit-type.constants';
import { formatClinicTime, getClinicTodayDateString } from '@/lib/date-format';
import { useClinicTimeConfig } from '@/features/klinik/model/useClinicTimeConfig';
import { requestImplicitWebPushRegistration } from '@/features/notifications';
import { useAuthContext } from '@/lib/rbac/auth-context';
import { AUDIENCE, PERMISSIONS, type AudienceType } from '@/core/auth/permissions.constants';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

export type ReservationStep = 'date' | 'session' | 'confirmation';

export interface ReservationContext {
  patientId?: string;
  patientName?: string;
  serviceId?: string;
  serviceName?: string;
  poliklinikId?: string;
  complaint?: string;
  sourceIntakeId?: string;
  medicalFlow?: MedicalAppointmentFlow;
  mode?: 'create' | 'reschedule';
  rescheduleStrategy?: 'proposal' | 'direct';
  appointmentId?: string;
  appointmentIds?: string[];
  appointmentCount?: number;
  audience?: AudienceType;
  currentDate?: string;
  currentSession?: string;
  queueNumber?: string;
}

export interface ReservationModalProps {
  isOpen: boolean;
  context: ReservationContext | null;
  onClose: () => void;
  onSuccess?: (appointment: Appointment) => void;
}

export function ReservationModal({ isOpen, context, onClose, onSuccess }: ReservationModalProps) {
  const queryClient = useQueryClient();
  const { audience: authAudience, can } = useAuthContext();
  const effectiveAudience = context?.audience ?? authAudience ?? AUDIENCE.EXTERNAL;
  const isInternalAdmin =
    effectiveAudience === AUDIENCE.INTERNAL && can(PERMISSIONS.APPOINTMENTS.MANAGE);
  const { config: clinicTimeConfig } = useClinicTimeConfig();
  const clinicTodayStr = React.useMemo(() => {
    return clinicTimeConfig?.today || getClinicTodayDateString();
  }, [clinicTimeConfig?.today]);

  const [step, setStep] = React.useState<ReservationStep>('date');
  const [serviceItem, setServiceItem] = React.useState<ServiceCatalogItem | null>(null);

  const [dateStr, setDateStr] = React.useState<string>(clinicTodayStr);
  const [session, setSession] = React.useState<string>('');
  const [sessionLabel, setSessionLabel] = React.useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = React.useState<string>('');
  const [reason, setReason] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [createdAppointment, setCreatedAppointment] = React.useState<Appointment | null>(null);
  const [isQueueSuccessOpen, setIsQueueSuccessOpen] = React.useState<boolean>(false);
  const [overcapacityDialog, setOvercapacityDialog] = React.useState<{
    isOpen: boolean;
    message?: string;
  }>({ isOpen: false });

  const isReschedule = context?.mode === 'reschedule';

  React.useEffect(() => {
    if (!isOpen) {
      setStep('date');
      setSession('');
      setSelectedSessionId('');
      setReason('');
      setCreatedAppointment(null);
      setIsQueueSuccessOpen(false);
      return;
    }

    setDateStr(clinicTodayStr);
    setSession(context?.mode === 'reschedule' ? context?.currentSession || '' : '');
    setSelectedSessionId('');
    setReason('');

    if (!context?.serviceId && !context?.serviceName) return;

    void catalogService.getServiceCatalog().then((categories) => {
      for (const cat of categories) {
        const found = cat.services.find(
          (s) =>
            (context.serviceId && (s.id === context.serviceId || s.code === context.serviceId)) ||
            (context.serviceName && s.name.toLowerCase() === context.serviceName.toLowerCase())
        );
        if (found) {
          setServiceItem(found);
          return;
        }
      }

      setServiceItem({
        id: context.serviceId || '',
        code: context.serviceId || '',
        name: context.serviceName || 'Layanan Pemeriksaan',
        prefix: 'A',
        poliklinikId: context.poliklinikId || '',
        poliklinikName: context.serviceName || '',
        displayOrder: 1,
        complaints: []
      });
    });
  }, [
    isOpen,
    context?.mode,
    context?.serviceId,
    context?.serviceName,
    context?.poliklinikId,
    context?.currentSession,
    clinicTodayStr
  ]);

  if (!isOpen || !context) return null;

  const effectivePoliklinikId = context.poliklinikId || serviceItem?.poliklinikId;

  const patientProfile: PatientAffiliationProfile = {
    id: context.patientId || '',
    fullName: context.patientName || 'Pasien',
    nik: '',
    gender: 'female',
    relationship: 'self'
  };

  const handleFinalSubmit = async (withOverCapacityConsent?: boolean | React.MouseEvent) => {
    const isConsent =
      typeof withOverCapacityConsent === 'boolean' ? withOverCapacityConsent : false;
    try {
      setIsSubmitting(true);

      if (isReschedule) {
        const effectiveIds =
          context.appointmentIds && context.appointmentIds.length > 0
            ? context.appointmentIds
            : context.appointmentId
              ? [context.appointmentId]
              : [];

        if (effectiveIds.length === 0) {
          throw new Error('ID Janji temu tidak ditemukan untuk penjadwalan ulang');
        }

        const validSessionId =
          selectedSessionId && isUUID(selectedSessionId.trim())
            ? selectedSessionId.trim()
            : undefined;

        if (!validSessionId) {
          throw new Error('Sesi dinas tujuan wajib dipilih');
        }

        const isProposal =
          context.rescheduleStrategy === 'proposal' ||
          (context.rescheduleStrategy === undefined && isInternalAdmin);

        const effectiveReason = reason.trim() || 'Penyesuaian jadwal operasional klinik';

        if (isProposal) {
          if (effectiveIds.length === 1) {
            const res = await proposeRescheduleAppointment(effectiveIds[0], {
              targetDate: dateStr,
              targetSessionId: validSessionId,
              reason: effectiveReason
            });
            toast.success(
              res?.message ||
                'Usulan perubahan jadwal berhasil diajukan ke pasien (menunggu persetujuan).'
            );
          } else {
            const res = await bulkProposeRescheduleAppointments({
              appointmentIds: effectiveIds,
              targetDate: dateStr,
              targetSessionId: validSessionId,
              reason: effectiveReason
            });
            const batchRes = res as unknown as {
              data?: Array<{ id: string; success: boolean; proposalId?: string; message?: string }>;
            };
            const results = Array.isArray(batchRes?.data) ? batchRes.data : [];
            const succeededCount =
              results.length > 0 ? results.filter((r) => r.success).length : effectiveIds.length;
            const failedCount = results.length > 0 ? results.filter((r) => !r.success).length : 0;

            if (failedCount === 0) {
              toast.success(
                `Berhasil mengajukan perubahan jadwal ke ${succeededCount} pasien (menunggu persetujuan).`
              );
            } else {
              toast.warning(
                `Selesai: ${succeededCount} berhasil diajukan, ${failedCount} gagal diproses.`
              );
            }
          }
        } else {
          // Direct Override (eksekusi langsung)
          if (effectiveIds.length === 1) {
            const res = await rescheduleAppointmentAction(effectiveIds[0], {
              target_date: dateStr,
              session: session,
              target_session: session,
              target_session_id: validSessionId
            });

            toast.success(res?.message || 'Janji temu berhasil dijadwalkan ulang');
            const appointmentData = res?.data;
            const uiApt: Appointment = {
              id: effectiveIds[0],
              booking_code: appointmentData?.bookingCode ?? '',
              patient_name: appointmentData?.patientName ?? '',
              patient_email: '',
              patient_avatar: '',
              doctor_name: appointmentData?.doctorName || '',
              doctor_specialty: appointmentData?.doctorSpecialty || '',
              poliklinik_name: appointmentData?.poliklinikName || '',
              room_name: appointmentData?.roomName || '',
              room_location: appointmentData?.roomLocation || '',
              scheduled_start_time: appointmentData?.scheduledStartTime || undefined,
              scheduled_end_time: appointmentData?.scheduledEndTime || undefined,
              date: appointmentData?.appointmentDate ?? '',
              time: session,
              complaint: appointmentData?.complaint || '',
              status: APPOINTMENT_STATUS.BOOKED,
              visit_type: VISIT_TYPE.NEW_VISIT,
              service: appointmentData?.layananName || '',
              created_at: appointmentData?.createdAt ? String(appointmentData.createdAt) : '',
              queue_number: appointmentData?.queueNumber
                ? String(appointmentData.queueNumber)
                : undefined
            };
            onSuccess?.(uiApt);
          } else {
            const res = await bulkRescheduleAppointments({
              appointmentIds: effectiveIds,
              targetDate: dateStr,
              session: session,
              reason: effectiveReason
            });
            const succeededCount = res?.data?.succeededCount ?? effectiveIds.length;
            const failedCount = res?.data?.failedCount ?? 0;
            if (failedCount === 0) {
              toast.success(`Berhasil menjadwalkan ulang ${succeededCount} antrean.`);
            } else {
              toast.warning(
                `Selesai: ${succeededCount} berhasil dijadwalkan ulang, ${failedCount} gagal.`
              );
            }
          }
        }

        void queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
        void queryClient.invalidateQueries({ queryKey: ['appointments'] });
        void queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
        void queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
        void queryClient.invalidateQueries({ queryKey: ['schedules'] });
        void queryClient.invalidateQueries({ queryKey: ['queue-navigation'] });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('clinic:appointment_updated'));
        }

        onClose();
        return;
      }

      const effectiveLayananId = serviceItem?.id ? serviceItem.id : context.serviceId || '';
      const res: BackendAppointmentItem = await patientAffiliationService.createAppointment({
        patientId: context.patientId || '',
        poliklinikId: effectivePoliklinikId || '',
        layananId: effectiveLayananId,
        appointmentDate: dateStr,
        session: session,
        visitType: VISIT_TYPE.NEW_VISIT,
        complaint: context.complaint || 'Pemeriksaan Kesehatan',
        sourceIntakeId: context.sourceIntakeId,
        consentOverCapacity: isConsent ? true : undefined
      });

      void requestImplicitWebPushRegistration();

      void queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['appointments'] });
      void queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
      void queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
      void queryClient.invalidateQueries({ queryKey: ['queue-navigation'] });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('clinic:appointment_updated'));
      }

      const startTime = res.scheduledStartTime ? formatClinicTime(res.scheduledStartTime) : '';
      const endTime = res.scheduledEndTime ? formatClinicTime(res.scheduledEndTime) : '';
      const timeDisplay =
        startTime && endTime ? `${startTime} - ${endTime}` : res.session || session;

      const uiApt: Appointment = {
        id: res.id,
        booking_code: res.bookingCode ?? '',
        patient_name: res.patientName || '',
        patient_email: '',
        patient_avatar: '',
        doctor_name: res.doctorName || '',
        doctor_specialty: res.doctorSpecialty || '',
        poliklinik_name: res.poliklinikName || '',
        room_name: res.roomName || '',
        room_location: res.roomLocation || '',
        scheduled_start_time: startTime || undefined,
        scheduled_end_time: endTime || undefined,
        date: res.appointmentDate,
        time: timeDisplay,
        complaint: res.complaint || '',
        status: APPOINTMENT_STATUS.BOOKED,
        visit_type: res.visitType || '',
        service: res.layananName || '',
        created_at: String(res.createdAt),
        queue_number: res.queueNumber
      };

      setCreatedAppointment(uiApt);
      setIsQueueSuccessOpen(true);
      onSuccess?.(uiApt);
      toast.success('Janji temu berhasil dibuat beserta tiket antrean resmi');
    } catch (err: unknown) {
      const isOvercapacityConsentRequired =
        (err as any)?.problemDetails?.code === 'OVERCAPACITY_CONSENT_REQUIRED' ||
        (err as any)?.code === 'OVERCAPACITY_CONSENT_REQUIRED' ||
        (typeof (err as any)?.message === 'string' &&
          (err as any).message.includes('OVERCAPACITY_CONSENT_REQUIRED'));

      if (isOvercapacityConsentRequired && !isConsent) {
        setOvercapacityDialog({
          isOpen: true,
          message:
            (err as any)?.problemDetails?.detail ||
            (err as any)?.message ||
            'Estimasi pelayanan melewati batas jam operasional sesi klinik.'
        });
        return;
      }

      const msg =
        err instanceof Error
          ? err.message
          : isReschedule
            ? 'Gagal menjadwalkan ulang'
            : 'Gagal membuat janji temu';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ModalWrapper
        isOpen={isOpen && !isQueueSuccessOpen}
        onClose={onClose}
        maxWidth='max-w-[500px]'
        backdropClassName='overflow-hidden'
        className='flex flex-col h-auto max-h-none overflow-visible rounded-2xl border border-border bg-card p-5 sm:p-6 w-full max-w-[500px] my-auto shadow-2xl'
      >
        <div className='flex flex-col font-sans select-none h-auto min-h-0 gap-4 justify-start'>
          <div className='pr-1 h-auto overflow-visible'>
            {step === 'date' && (
              <BookingDateStep
                dateStr={dateStr}
                setDateStr={setDateStr}
                title={
                  isReschedule
                    ? 'Pilih tanggal baru jadwal periksa'
                    : 'Kapan mau berkunjung ke klinik?'
                }
                subtitle={
                  isReschedule
                    ? 'Tentukan tanggal kunjungan baru untuk jadwal janji temu ini.'
                    : 'Pilih tanggal periksa yang paling cocok buat jadwal kamu.'
                }
              />
            )}

            {step === 'session' && (
              <BookingSessionStep
                selectedService={serviceItem}
                dateStr={dateStr}
                session={session}
                setSession={setSession}
                onSelectSessionId={setSelectedSessionId}
                onSelectSessionLabel={setSessionLabel}
                poliklinikId={effectivePoliklinikId}
              />
            )}

            {step === 'confirmation' && (
              <BookingConfirmationStep
                selectedService={serviceItem}
                selectedPatient={patientProfile}
                dateStr={dateStr}
                session={session}
                sessionLabel={sessionLabel}
                visitType={VISIT_TYPE.NEW_VISIT}
                complaint={context.complaint || ''}
                mode={context.mode || 'create'}
                strategy={context.rescheduleStrategy}
                audience={effectiveAudience}
                reason={reason}
                onReasonChange={setReason}
                appointmentCount={context.appointmentCount || context.appointmentIds?.length}
              />
            )}
          </div>

          <div className='flex items-center justify-between shrink-0 pt-2 border-t border-border/40'>
            <div>
              {step === 'date' ? (
                <Button type='button' variant='ghost' size='md' shape='pill' onClick={onClose}>
                  Batal
                </Button>
              ) : step === 'session' ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='md'
                  shape='pill'
                  leadingIcon={<Icons.arrowLeft className='size-3.5' />}
                  onClick={() => setStep('date')}
                >
                  Kembali
                </Button>
              ) : (
                <Button
                  type='button'
                  variant='ghost'
                  size='md'
                  shape='pill'
                  leadingIcon={<Icons.arrowLeft className='size-3.5' />}
                  onClick={() => setStep('session')}
                >
                  Kembali
                </Button>
              )}
            </div>

            <div>
              {step === 'date' ? (
                <Button
                  type='button'
                  variant='primary'
                  size='md'
                  shape='pill'
                  onClick={() => setStep('session')}
                  className='min-w-[120px]'
                >
                  Lanjut
                </Button>
              ) : step === 'session' ? (
                <Button
                  type='button'
                  variant='primary'
                  size='md'
                  shape='pill'
                  disabled={!session}
                  onClick={() => setStep('confirmation')}
                  className='min-w-[120px]'
                >
                  Lanjut
                </Button>
              ) : (
                <Button
                  type='button'
                  variant='primary'
                  size='md'
                  shape='pill'
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  onClick={handleFinalSubmit}
                  className='min-w-[140px]'
                >
                  {isSubmitting
                    ? isReschedule
                      ? 'Memproses...'
                      : 'Memproses antrean...'
                    : isReschedule
                      ? context?.rescheduleStrategy === 'direct'
                        ? 'Terapkan Jadwal Sekarang'
                        : isInternalAdmin
                          ? 'Ajukan Jadwal Ulang'
                          : 'Konfirmasi Jadwal Baru'
                      : 'Buat Janji Temu'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </ModalWrapper>

      <QueueSuccessModal
        isOpen={isQueueSuccessOpen}
        isProcessing={isSubmitting}
        appointment={createdAppointment}
        queueItem={
          createdAppointment
            ? {
                id: createdAppointment.id,
                appointment_id: createdAppointment.id,
                queue_number: createdAppointment.queue_number ?? '',
                service: createdAppointment.service || '',
                poli: createdAppointment.poliklinik_name || '',
                doctor_name: createdAppointment.doctor_name ?? '',
                patient_name: createdAppointment.patient_name,
                room: createdAppointment.room_name || '',
                status: QUEUE_STATUS.WAITING,
                called_at: null,
                created_at: createdAppointment.created_at
              }
            : null
        }
        onClose={() => {
          setIsQueueSuccessOpen(false);
          onClose();
        }}
      />

      <AlertDialog
        open={overcapacityDialog.isOpen}
        onOpenChange={(open) => setOvercapacityDialog((prev) => ({ ...prev, isOpen: open }))}
      >
        <AlertDialogContent className='rounded-2xl max-w-[420px]'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-base font-semibold'>
              Batas Jam Operasional
            </AlertDialogTitle>
            <AlertDialogDescription className='text-xs text-muted-foreground leading-relaxed'>
              {overcapacityDialog.message ||
                'Estimasi pelayanan diperkirakan selesai setelah jam operasional klinik berakhir. Tetap lanjutkan pendaftaran?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='mt-2 flex gap-2 sm:justify-end'>
            <AlertDialogCancel
              className='rounded-full text-xs h-9 px-4'
              onClick={() => {
                setOvercapacityDialog({ isOpen: false });
                setStep('session');
              }}
            >
              Pilih Jadwal Lain
            </AlertDialogCancel>
            <AlertDialogAction
              className='rounded-full text-xs h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90'
              onClick={() => {
                setOvercapacityDialog({ isOpen: false });
                void handleFinalSubmit(true);
              }}
            >
              Tetap Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
