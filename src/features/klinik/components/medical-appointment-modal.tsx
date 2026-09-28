'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  patientAffiliationService,
  type PatientAffiliationProfile
} from '@/features/data-pasien/api/patient-affiliation-service';
import { BookingPatientSelectionStep } from './booking/booking-patient-selection-step';
import { BookingOnDemandPatientForm } from './booking/booking-on-demand-patient-form';
import { BookingScheduleSlotStep } from './booking/booking-schedule-slot-step';

export interface MedicalAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialService?: string;
  initialDoctor?: string;
  flow?: string;
  onBackToService?: () => void;
  onCreated?: (medicalFormData: unknown) => void;
}

type ModalBookingStep = 'select_patient' | 'new_patient_form' | 'select_schedule' | 'success';

export function MedicalAppointmentModal({
  isOpen,
  onClose,
  onSuccess
}: MedicalAppointmentModalProps) {
  const [step, setStep] = useState<ModalBookingStep>('select_patient');
  const [affiliations, setAffiliations] = useState<PatientAffiliationProfile[]>([]);
  const [isLoadingAffiliations, setIsLoadingAffiliations] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<PatientAffiliationProfile | null>(null);
  const [bookingSuccessResult, setBookingSuccessResult] = useState<{
    queueNumber?: string;
    appointmentDate?: string;
    patientName?: string;
    session?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAffiliations = useCallback(() => {
    setIsLoadingAffiliations(true);
    patientAffiliationService.getMyAffiliations().then((data) => {
      setAffiliations(data);
      if (data.length > 0) {
        setSelectedPatient((prev) => prev || data[0]);
      }
      setIsLoadingAffiliations(false);
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStep('select_patient');
      setBookingSuccessResult(null);
      fetchAffiliations();
    }
  }, [isOpen, fetchAffiliations]);

  const handlePatientSelected = (patient: PatientAffiliationProfile) => {
    setSelectedPatient(patient);
    setStep('select_schedule');
  };

  const handleNewPatientSuccess = (newPatient: PatientAffiliationProfile) => {
    setSelectedPatient(newPatient);
    fetchAffiliations();
    setStep('select_schedule');
  };

  const handleSubmitBooking = async (bookingData: {
    poliklinikId: string;
    layananId: string;
    appointmentDate: string;
    session: string;
    visitType: string;
    complaint: string;
  }) => {
    if (!selectedPatient) return;

    try {
      setIsSubmitting(true);
      const res = await patientAffiliationService.createAppointment({
        patientId: selectedPatient.id,
        poliklinikId: bookingData.poliklinikId,
        layananId: bookingData.layananId,
        appointmentDate: bookingData.appointmentDate,
        session: bookingData.session,
        visitType: bookingData.visitType,
        complaint: bookingData.complaint
      });

      const bookingResult = (res && typeof res === 'object' ? res : {}) as {
        queueNumber?: string;
        no_antrian?: string;
      };

      setBookingSuccessResult({
        queueNumber: bookingResult.queueNumber || bookingResult.no_antrian || '-',
        appointmentDate: bookingData.appointmentDate,
        patientName: selectedPatient.fullName,
        session: bookingData.session
      });
      setStep('success');
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[620px]'
      showCloseButton={step !== 'success'}
    >
      <div className='p-2 sm:p-3 font-sans'>
        {step === 'select_patient' && (
          <div>
            {isLoadingAffiliations ? (
              <div className='p-12 text-center'>
                <div className='size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3' />
                <p className='text-xs text-muted-foreground'>Memuat data profil pasien...</p>
              </div>
            ) : affiliations.length === 0 ? (
              <BookingOnDemandPatientForm onSuccess={handleNewPatientSuccess} onCancel={onClose} />
            ) : (
              <BookingPatientSelectionStep
                affiliations={affiliations}
                selectedPatientId={selectedPatient?.id ?? null}
                onSelectPatient={handlePatientSelected}
                onAddNewPatient={() => setStep('new_patient_form')}
              />
            )}
          </div>
        )}

        {step === 'new_patient_form' && (
          <BookingOnDemandPatientForm
            onSuccess={handleNewPatientSuccess}
            onCancel={() => setStep('select_patient')}
          />
        )}

        {step === 'select_schedule' && selectedPatient && (
          <BookingScheduleSlotStep
            onBack={() => setStep('select_patient')}
            onSubmitBooking={handleSubmitBooking}
            isSubmitting={isSubmitting}
          />
        )}

        {step === 'success' && bookingSuccessResult && (
          <div className='py-6 text-center space-y-4'>
            <div className='size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto ring-4 ring-primary/5'>
              <Icons.check className='size-8 stroke-[2.5]' />
            </div>

            <div>
              <h3 className='text-lg font-bold text-foreground'>Janji Temu Berhasil Dibuat!</h3>
              <p className='text-xs text-muted-foreground mt-1'>
                Nomor antrean dan reservasi Anda telah tercatat di sistem klinik
              </p>
            </div>

            <div className='p-4 rounded-2xl bg-muted/30 border border-border/60 max-w-sm mx-auto space-y-2 text-left'>
              <div className='flex justify-between items-center text-xs'>
                <span className='text-muted-foreground'>Pasien</span>
                <span className='font-bold text-foreground'>
                  {bookingSuccessResult.patientName}
                </span>
              </div>
              <div className='flex justify-between items-center text-xs'>
                <span className='text-muted-foreground'>Nomor Antrean</span>
                <span className='font-bold text-primary font-mono text-sm'>
                  {bookingSuccessResult.queueNumber}
                </span>
              </div>
              <div className='flex justify-between items-center text-xs'>
                <span className='text-muted-foreground'>Tanggal & Sesi</span>
                <span className='font-semibold text-foreground'>
                  {bookingSuccessResult.appointmentDate} ({bookingSuccessResult.session})
                </span>
              </div>
            </div>

            <div className='pt-2'>
              <Button
                type='button'
                variant='default'
                shape='pill'
                onClick={onClose}
                className='font-bold px-8'
              >
                Selesai
              </Button>
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}

export default MedicalAppointmentModal;
