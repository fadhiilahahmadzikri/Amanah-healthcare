'use client';

import * as React from 'react';
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
import { BookingDateStep } from '../booking/booking-date-step';
import { BookingSessionStep } from '../booking/booking-session-step';
import { BookingConfirmationStep } from '../booking/booking-confirmation-step';
import { QueueSuccessModal } from '../queue-success-modal';
import type { Appointment } from '../../api/types';

function formatTimeString(t?: string) {
  if (!t) return '';
  const match = t.match(/^(\d{1,2}):(\d{2})/);
  return match ? `${match[1].padStart(2, '0')}.${match[2]}` : t;
}

export type ReservationStep = 'date' | 'session' | 'confirmation';

export interface ReservationContext {
  patientId: string;
  patientName: string;
  serviceId?: string;
  serviceName?: string;
  poliklinikId?: string;
  complaint?: string;
  sourceIntakeId?: string;
  medicalFlow?: 'pregnancy' | 'immunization' | 'general';
}

export interface ReservationModalProps {
  isOpen: boolean;
  context: ReservationContext | null;
  onClose: () => void;
  onSuccess?: (appointment: Appointment) => void;
}

export function ReservationModal({ isOpen, context, onClose, onSuccess }: ReservationModalProps) {
  const [step, setStep] = React.useState<ReservationStep>('date');
  const [serviceItem, setServiceItem] = React.useState<ServiceCatalogItem | null>(null);

  const tomorrow = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const [dateStr, setDateStr] = React.useState<string>(tomorrow);
  const [timeSlot, setTimeSlot] = React.useState<string>('PAGI');
  const [_selectedSessionId, setSelectedSessionId] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [createdAppointment, setCreatedAppointment] = React.useState<Appointment | null>(null);
  const [isQueueSuccessOpen, setIsQueueSuccessOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!isOpen) {
      setStep('date');
      setCreatedAppointment(null);
      setIsQueueSuccessOpen(false);
      return;
    }

    if (!context?.serviceId) return;

    void catalogService.getServiceCatalog().then((categories) => {
      for (const cat of categories) {
        const found = cat.services.find(
          (s) => s.id === context.serviceId || s.code === context.serviceId
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
        poliklinikName: 'Poli KIA',
        displayOrder: 1,
        complaints: []
      });
    });
  }, [isOpen, context?.serviceId, context?.serviceName, context?.poliklinikId]);

  if (!isOpen || !context) return null;

  const effectivePoliklinikId = context.poliklinikId || serviceItem?.poliklinikId;

  const patientProfile: PatientAffiliationProfile = {
    id: context.patientId,
    fullName: context.patientName,
    nik: '',
    gender: 'P',
    relationship: 'self'
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      const res: BackendAppointmentItem = await patientAffiliationService.createAppointment({
        patientId: context.patientId,
        poliklinikId: effectivePoliklinikId || '',
        layananId: serviceItem?.id || context.serviceId || '',
        appointmentDate: dateStr,
        session: timeSlot,
        visitType: 'Pemeriksaan Baru',
        complaint: context.complaint || 'Pemeriksaan Kesehatan'
      });

      const startTime = formatTimeString(res.scheduledStartTime);
      const endTime = formatTimeString(res.scheduledEndTime);
      const timeDisplay =
        startTime && endTime ? `${startTime} - ${endTime} WIB` : res.session || timeSlot;

      const uiApt: Appointment = {
        id: res.id,
        booking_code: res.id.slice(0, 8).toUpperCase(),
        patient_name: res.patientName || context.patientName,
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
        status: 'Sudah Buat Janji',
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
      const msg = err instanceof Error ? err.message : 'Gagal membuat janji temu';
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
            {step === 'date' && <BookingDateStep dateStr={dateStr} setDateStr={setDateStr} />}

            {step === 'session' && (
              <BookingSessionStep
                selectedService={serviceItem}
                dateStr={dateStr}
                timeSlot={timeSlot}
                setTimeSlot={setTimeSlot}
                onSelectSessionId={setSelectedSessionId}
                poliklinikId={effectivePoliklinikId}
              />
            )}

            {step === 'confirmation' && (
              <BookingConfirmationStep
                selectedService={serviceItem}
                selectedPatient={patientProfile}
                dateStr={dateStr}
                timeSlot={timeSlot}
                visitType='Pemeriksaan Baru'
                complaint={context.complaint || ''}
                serviceName={context.serviceName || serviceItem?.name}
                patientName={context.patientName}
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
                  disabled={!timeSlot}
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
                  trailingIcon={<Icons.arrowUpRight className='size-3 stroke-[2.5]' />}
                >
                  {isSubmitting ? 'Memproses antrean...' : 'Buat Janji Temu'}
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
                doctor_name: createdAppointment.doctor_name,
                patient_name: createdAppointment.patient_name,
                status: 'waiting',
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
