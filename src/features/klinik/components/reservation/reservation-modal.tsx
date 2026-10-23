'use client';

import * as React from 'react';
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
import { rescheduleAppointmentAction } from '@/features/appointment-pasien/api/service';
import { appointmentKeys } from '@/features/appointment-pasien/api/queries';
import { BookingDateStep } from '../booking/booking-date-step';
import { BookingSessionStep } from '../booking/booking-session-step';
import { BookingConfirmationStep } from '../booking/booking-confirmation-step';
import { QueueSuccessModal } from '../queue-success-modal';
import { APPOINTMENT_STATUS, QUEUE_STATUS, type Appointment } from '../../api/types';
import { formatClinicTime, getClinicTodayDateString } from '@/lib/date-format';
import { useClinicTimeConfig } from '@/features/klinik/model/useClinicTimeConfig';
import { requestImplicitWebPushRegistration } from '@/features/notifications';

export type ReservationStep = 'date' | 'session' | 'confirmation';

export interface ReservationContext {
  patientId?: string;
  patientName?: string;
  serviceId?: string;
  serviceName?: string;
  poliklinikId?: string;
  complaint?: string;
  sourceIntakeId?: string;
  medicalFlow?: 'pregnancy' | 'immunization' | 'general';
  mode?: 'create' | 'reschedule';
  appointmentId?: string;
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
  const { config: clinicTimeConfig } = useClinicTimeConfig();
  const clinicTodayStr = React.useMemo(() => {
    return clinicTimeConfig?.today || getClinicTodayDateString();
  }, [clinicTimeConfig?.today]);

  const [step, setStep] = React.useState<ReservationStep>('date');
  const [serviceItem, setServiceItem] = React.useState<ServiceCatalogItem | null>(null);

  const [dateStr, setDateStr] = React.useState<string>(clinicTodayStr);
  const [session, setSession] = React.useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [createdAppointment, setCreatedAppointment] = React.useState<Appointment | null>(null);
  const [isQueueSuccessOpen, setIsQueueSuccessOpen] = React.useState<boolean>(false);

  const isReschedule = context?.mode === 'reschedule';

  React.useEffect(() => {
    if (!isOpen) {
      setStep('date');
      setSession('');
      setSelectedSessionId('');
      setCreatedAppointment(null);
      setIsQueueSuccessOpen(false);
      return;
    }

    setDateStr(clinicTodayStr);
    setSession(context?.mode === 'reschedule' ? context?.currentSession || '' : '');
    setSelectedSessionId('');

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
        poliklinikName: context.serviceName || 'Poli KIA',
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
    gender: 'P',
    relationship: 'self'
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (isReschedule) {
        if (!context.appointmentId) {
          throw new Error('ID Janji temu tidak ditemukan untuk penjadwalan ulang');
        }

        const res = await rescheduleAppointmentAction(context.appointmentId, {
          target_date: dateStr,
          session: session,
          target_session: session,
          target_session_id: selectedSessionId || undefined
        });

        toast.success(res?.message || 'Janji temu berhasil dijadwalkan ulang');
        queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
        queryClient.invalidateQueries({ queryKey: ['appointments'] });
        queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
        queryClient.invalidateQueries({ queryKey: ['schedules'] });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('clinic:appointment_updated'));
        }

        const appointmentData = res?.data;
        const resQueue = String(appointmentData?.queueNumber || context.queueNumber || '-');
        const uiApt: Appointment = {
          id: context.appointmentId,
          booking_code:
            appointmentData?.bookingCode || context.appointmentId.slice(0, 8).toUpperCase(),
          patient_name: context.patientName || 'Pasien',
          patient_email: '',
          patient_avatar: '',
          doctor_name: appointmentData?.doctorName || '',
          doctor_specialty: appointmentData?.doctorSpecialty || '',
          poliklinik_name: appointmentData?.poliklinikName || context.serviceName || '',
          room_name: appointmentData?.roomName || '',
          room_location: appointmentData?.roomLocation || '',
          scheduled_start_time: appointmentData?.scheduledStartTime || undefined,
          scheduled_end_time: appointmentData?.scheduledEndTime || undefined,
          date: dateStr,
          time: session,
          complaint: context.complaint || '',
          status: APPOINTMENT_STATUS.BOOKED,
          visit_type: 'Pemeriksaan Baru',
          service: context.serviceName || serviceItem?.name || '',
          created_at: new Date().toISOString(),
          queue_number: resQueue
        };

        onSuccess?.(uiApt);
        onClose();
        return;
      }

      const res: BackendAppointmentItem = await patientAffiliationService.createAppointment({
        patientId: context.patientId || '',
        poliklinikId: effectivePoliklinikId || '',
        layananId: serviceItem?.id || context.serviceId || '',
        appointmentDate: dateStr,
        session: session,
        visitType: 'Pemeriksaan Baru',
        complaint: context.complaint || 'Pemeriksaan Kesehatan',
        sourceIntakeId: context.sourceIntakeId
      });

      void requestImplicitWebPushRegistration();

      const startTime = res.scheduledStartTime ? formatClinicTime(res.scheduledStartTime) : '';
      const endTime = res.scheduledEndTime ? formatClinicTime(res.scheduledEndTime) : '';
      const timeDisplay =
        startTime && endTime ? `${startTime} - ${endTime}` : res.session || session;

      const uiApt: Appointment = {
        id: res.id,
        booking_code: res.id.slice(0, 8).toUpperCase(),
        patient_name: res.patientName || context.patientName || 'Pasien',
        patient_email: '',
        patient_avatar: '',
        doctor_name: res.doctorName || '',
        doctor_specialty: res.doctorSpecialty || '',
        poliklinik_name: res.poliklinikName || '',
        room_name: res.roomName || '',
        room_location: res.roomLocation || '',
        scheduled_start_time: startTime || undefined,
        scheduled_end_time: endTime || undefined,
        date: res.appointmentDate || dateStr,
        time: timeDisplay,
        complaint: res.complaint || context.complaint || '',
        status: APPOINTMENT_STATUS.BOOKED,
        visit_type: res.visitType || 'Pemeriksaan Baru',
        service: res.layananName || context.serviceName || '',
        created_at: res.createdAt || new Date().toISOString(),
        queue_number: res.queueNumber || '-'
      };

      setCreatedAppointment(uiApt);
      setIsQueueSuccessOpen(true);
      onSuccess?.(uiApt);
      toast.success('Janji temu berhasil dibuat beserta tiket antrean resmi');
    } catch (err: unknown) {
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
                poliklinikId={effectivePoliklinikId}
              />
            )}

            {step === 'confirmation' && (
              <BookingConfirmationStep
                selectedService={serviceItem}
                selectedPatient={patientProfile}
                dateStr={dateStr}
                session={session}
                visitType='Pemeriksaan Baru'
                complaint={context.complaint || ''}
                serviceName={context.serviceName || serviceItem?.name}
                patientName={context.patientName}
                mode={context.mode || 'create'}
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
                  withTrailingCircleIcon
                  className='min-w-[140px]'
                  trailingIcon={<Icons.arrowRight className='size-3 stroke-[2.5]' />}
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
                  withTrailingCircleIcon
                  className='min-w-[140px]'
                  trailingIcon={<Icons.arrowRight className='size-3 stroke-[2.5]' />}
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
                  withTrailingCircleIcon
                  className='min-w-[160px]'
                  trailingIcon={
                    isReschedule ? (
                      <Icons.check className='size-3 stroke-[2.5]' />
                    ) : (
                      <Icons.arrowUpRight className='size-3 stroke-[2.5]' />
                    )
                  }
                >
                  {isSubmitting
                    ? isReschedule
                      ? 'Memproses...'
                      : 'Memproses antrean...'
                    : isReschedule
                      ? 'Konfirmasi Reschedule'
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
                queue_number: createdAppointment.queue_number || '-',
                service: createdAppointment.service || '',
                poli: createdAppointment.service || '',
                doctor_name: createdAppointment.doctor_name || '',
                patient_name: createdAppointment.patient_name,
                room: createdAppointment.room_name || '-',
                status: QUEUE_STATUS.WAITING,
                called_at: null,
                created_at: createdAppointment.created_at || new Date().toISOString()
              }
            : null
        }
        onClose={() => {
          setIsQueueSuccessOpen(false);
          onClose();
        }}
      />
    </>
  );
}
