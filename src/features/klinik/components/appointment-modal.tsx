'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { StepperProgress } from './stepper-progress';
import { BookingServiceCatalogStep } from './booking/booking-service-catalog-step';
import { BookingPatientSelectionStep } from './booking/booking-patient-selection-step';
import { BookingOnDemandPatientForm } from './booking/booking-on-demand-patient-form';
import { BookingScheduleSlotStep } from './booking/booking-schedule-slot-step';
import { QueueSuccessModal } from './queue-success-modal';
import { MedicalAppointmentModal } from './medical-appointment-modal';
import {
  patientAffiliationService,
  type PatientAffiliationProfile,
  type BackendAppointmentItem
} from '@/features/data-pasien/api/patient-affiliation-service';
import type { ServiceCatalogItem } from '../api/catalog.service';
import type { Appointment, AppointmentFormData } from '../api/types';
import { toast } from 'sonner';

export type BookingWizardStep = 'service' | 'patient_select' | 'patient_new' | 'schedule';

export interface AppointmentModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialAppointment?: Appointment | null;
  onClose: () => void;
  onSubmit: (formData: AppointmentFormData, appointmentId?: string) => void;
}

export function AppointmentModal({
  isOpen,
  mode,
  initialAppointment,
  onClose,
  onSubmit
}: AppointmentModalProps) {
  // Wizard state
  const [step, setStep] = useState<BookingWizardStep>('service');
  const [selectedService, setSelectedService] = useState<ServiceCatalogItem | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState('');
  const [customComplaint, setCustomComplaint] = useState('');
  const [visitType, setVisitType] = useState<'Pemeriksaan Baru' | 'Kontrol Ulang'>(
    'Pemeriksaan Baru'
  );

  // Patient profiles state
  const [patients, setPatients] = useState<PatientAffiliationProfile[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);

  // Specialized flow
  const [activeMedicalFlow, setActiveMedicalFlow] = useState<'pregnancy' | 'immunization' | null>(
    null
  );

  // Booking result & Queue modal
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQueueSuccessOpen, setIsQueueSuccessOpen] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  // Load patients
  const loadPatients = useCallback(async () => {
    try {
      setIsLoadingPatients(true);
      const data = await patientAffiliationService.getMyAffiliations();
      setPatients(data);
      if (data.length > 0 && !selectedPatientId) {
        setSelectedPatientId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load patient affiliations:', err);
    } finally {
      setIsLoadingPatients(false);
    }
  }, [selectedPatientId]);

  useEffect(() => {
    if (isOpen) {
      setStep(mode === 'edit' ? 'schedule' : 'service');
      loadPatients();
    } else {
      setSelectedService(null);
      setSelectedComplaint('');
      setCustomComplaint('');
      setActiveMedicalFlow(null);
      setIsQueueSuccessOpen(false);
      setCreatedAppointment(null);
    }
  }, [isOpen, mode, loadPatients]);

  if (!isOpen) return null;

  // Step calculations for progress bar
  const stepNumber =
    step === 'service' ? 1 : step === 'patient_select' || step === 'patient_new' ? 2 : 3;

  // 1. Service Selection Proceed Handler
  const handleServiceContinue = () => {
    if (!selectedService) return;

    // Specialized flows (Persalinan & Imunisasi are deferred clinical intake)
    if (
      selectedService.medicalFlow === 'pregnancy' ||
      selectedService.medicalFlow === 'immunization'
    ) {
      setActiveMedicalFlow(selectedService.medicalFlow);
      return;
    }

    // Regular services proceed to on-demand patient profile selection
    if (patients.length === 0) {
      setStep('patient_new');
    } else {
      setStep('patient_select');
    }
  };

  // 2. Patient Form Success
  const handlePatientCreated = (newPatient: PatientAffiliationProfile) => {
    setPatients((prev) => [newPatient, ...prev]);
    setSelectedPatientId(newPatient.id);
    setStep('schedule');
    toast.success('Data pasien berhasil didaftarkan');
  };

  // 3. Final Booking Submission to Backend
  const handleFinalBooking = async (bookingData: {
    poliklinikId: string;
    layananId: string;
    appointmentDate: string;
    session: string;
    visitType: string;
    complaint: string;
  }) => {
    if (!selectedPatientId) {
      toast.error('Silakan tentukan data pasien terlebih dahulu');
      setStep('patient_select');
      return;
    }

    try {
      setIsSubmitting(true);
      const res: BackendAppointmentItem = await patientAffiliationService.createAppointment({
        patientId: selectedPatientId,
        poliklinikId: bookingData.poliklinikId,
        layananId: bookingData.layananId,
        appointmentDate: bookingData.appointmentDate,
        session: bookingData.session,
        visitType: bookingData.visitType,
        complaint: bookingData.complaint
      });

      const selectedPatient = patients.find((p) => p.id === selectedPatientId);

      // Convert backend appointment into UI representation
      const uiApt: Appointment = {
        id: res.id,
        booking_code: res.id.slice(0, 8).toUpperCase(),
        patient_name: res.patientName || selectedPatient?.fullName || 'Pasien',
        patient_email: '',
        patient_avatar: '',
        doctor_name: res.doctorName || 'Dokter Jaga',
        date: res.appointmentDate,
        time: res.session,
        complaint: res.complaint || bookingData.complaint,
        status: 'Sudah Buat Janji',
        service: res.layananName || selectedService?.name || 'Poliklinik',
        created_at: res.createdAt || new Date().toISOString(),
        queue_number: res.queueNumber || 'P-001'
      };

      setCreatedAppointment(uiApt);
      setIsQueueSuccessOpen(true);

      // Notify parent to refetch dashboard
      onSubmit({
        service: uiApt.service || '',
        complaint: uiApt.complaint,
        visitType: bookingData.visitType as any,
        doctor: uiApt.doctor_name,
        dateStr: uiApt.date,
        timeSlot: uiApt.time
      });

      toast.success('Janji temu berhasil dibuat beserta tiket antrean resmi');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat janji temu';
      toast.error(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ModalWrapper
        isOpen={isOpen && !activeMedicalFlow && !isQueueSuccessOpen}
        onClose={onClose}
        maxWidth={step === 'service' ? 'max-w-3xl' : 'max-w-2xl'}
        backdropClassName='overflow-hidden'
        className='flex flex-col max-h-[92vh] max-h-[92dvh] w-full p-4 sm:p-6 overflow-hidden'
      >
        <div className='flex flex-col flex-auto min-h-0 justify-between gap-3 font-sans select-none'>
          {/* Header & Stepper */}
          <div className='flex flex-col shrink-0 gap-2 border-b border-border/50 pb-3'>
            <div className='flex items-center justify-between'>
              <h2 className='text-base sm:text-lg font-bold text-foreground'>
                {mode === 'create' ? 'Buat Janji Temu Pelayanan Klinik' : 'Ubah Jadwal Janji Temu'}
              </h2>
            </div>
            {mode === 'create' && <StepperProgress currentStep={stepNumber} totalSteps={3} />}
          </div>

          {/* Wizard Step Body */}
          <div className='flex-auto min-h-0 overflow-y-auto pr-1'>
            {step === 'service' && (
              <BookingServiceCatalogStep
                selectedService={selectedService}
                onSelectService={setSelectedService}
                selectedComplaint={selectedComplaint}
                onSelectComplaint={setSelectedComplaint}
                customComplaint={customComplaint}
                onChangeCustomComplaint={setCustomComplaint}
                visitType={visitType}
                onChangeVisitType={setVisitType}
                onContinue={handleServiceContinue}
              />
            )}

            {step === 'patient_select' && (
              <BookingPatientSelectionStep
                patients={patients}
                selectedPatientId={selectedPatientId}
                onSelectPatient={setSelectedPatientId}
                onAddNewPatient={() => setStep('patient_new')}
                onContinue={() => setStep('schedule')}
              />
            )}

            {step === 'patient_new' && (
              <BookingOnDemandPatientForm
                onSuccess={handlePatientCreated}
                onCancel={() =>
                  patients.length > 0 ? setStep('patient_select') : setStep('service')
                }
              />
            )}

            {step === 'schedule' && (
              <BookingScheduleSlotStep
                onBack={() =>
                  patients.length > 0 ? setStep('patient_select') : setStep('service')
                }
                onSubmitBooking={handleFinalBooking}
                isSubmitting={isSubmitting}
                initialVisitType={visitType}
                initialComplaint={customComplaint.trim() || selectedComplaint}
                poliklinikId={selectedService?.poliklinikId}
                layananId={selectedService?.id}
              />
            )}
          </div>
        </div>
      </ModalWrapper>

      {/* Real Queue Success Modal consuming DB queue tickets */}
      <QueueSuccessModal
        isOpen={isQueueSuccessOpen}
        isProcessing={isSubmitting}
        appointment={createdAppointment}
        queueItem={
          createdAppointment
            ? {
                id: createdAppointment.id,
                appointment_id: createdAppointment.id,
                queue_number: createdAppointment.queue_number || 'P-001',
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

      {/* Specialized Flow Modal (Persalinan & Imunisasi) */}
      {activeMedicalFlow ? (
        <MedicalAppointmentModal
          flow={activeMedicalFlow}
          isOpen={isOpen}
          onBackToService={() => {
            setActiveMedicalFlow(null);
            setStep('service');
          }}
          onClose={() => {
            setActiveMedicalFlow(null);
            onClose();
          }}
          onCreated={(medicalFormData) => onSubmit(medicalFormData)}
        />
      ) : null}
    </>
  );
}
export default AppointmentModal;
