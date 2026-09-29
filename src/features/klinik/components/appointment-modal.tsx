'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { QueueSuccessModal } from './queue-success-modal';
import { MedicalAppointmentModal } from './medical-appointment-modal';
import { BookingCategoryStep } from './booking/booking-category-step';
import { BookingServiceStep } from './booking/booking-service-step';
import { BookingPatientSelectionStep } from './booking/booking-patient-selection-step';
import { BookingRegularPatientForm } from './booking/booking-regular-patient-form';
import { BookingDateStep } from './booking/booking-date-step';
import { BookingSessionStep } from './booking/booking-session-step';
import { BookingVisitTypeStep } from './booking/booking-visit-type-step';
import { BookingComplaintStep } from './booking/booking-complaint-step';
import { BookingConfirmationStep } from './booking/booking-confirmation-step';
import { useAppointmentModal, type UseAppointmentModalProps } from '../model/useAppointmentModal';
import type { AppointmentFormData } from '../api/types';

export type AppointmentModalProps = UseAppointmentModalProps;

export function AppointmentModal({
  isOpen,
  mode,
  initialAppointment,
  onClose,
  onSubmit
}: AppointmentModalProps) {
  const {
    step,
    setStep,
    selectedCategoryId,
    setSelectedCategoryId,
    isLoadingCatalog,
    selectedService,
    activeCategoryList,
    serviceBentoItems,
    dateStr,
    setDateStr,
    timeSlot,
    setTimeSlot,
    setSelectedSessionId,
    visitType,
    setVisitType,
    complaint,
    setComplaint,
    isVisitTypeOpen,
    setIsVisitTypeOpen,
    visitTypeOptions,
    patients,
    selectedPatientId,
    setSelectedPatientId,
    selectedPatient,
    activeMedicalFlow,
    setActiveMedicalFlow,
    isSubmitting,
    isQueueSuccessOpen,
    setIsQueueSuccessOpen,
    createdAppointment,
    visitTypeDropdownRef,
    stepContainerRef,
    handleSelectServiceItem,
    handlePatientCreated,
    handleFinalSubmit
  } = useAppointmentModal({
    isOpen,
    mode,
    initialAppointment,
    onClose,
    onSubmit
  });

  if (!isOpen) return null;

  const isCompactStep =
    step === 'date' ||
    step === 'session' ||
    step === 'visit_type' ||
    step === 'complaint' ||
    step === 'patient_new' ||
    step === 'confirmation';

  return (
    <>
      <ModalWrapper
        isOpen={isOpen && !activeMedicalFlow && !isQueueSuccessOpen}
        onClose={onClose}
        maxWidth={
          step === 'category' || step === 'service'
            ? 'max-w-3xl'
            : isCompactStep
            ? 'max-w-[500px]'
            : 'max-w-xl'
        }
        backdropClassName='overflow-hidden'
        className={cn(
          'flex flex-col',
          isCompactStep
            ? 'h-auto max-h-none overflow-visible rounded-2xl border border-border bg-card p-5 sm:p-6 w-full max-w-[500px] my-auto shadow-2xl'
            : 'max-h-[92vh] max-h-[92dvh] w-full p-5 sm:p-6 overflow-hidden'
        )}
      >
        <div
          className={cn(
            'flex flex-col font-sans select-none',
            isCompactStep
              ? 'h-auto min-h-0 gap-4 justify-start'
              : 'flex-auto min-h-0 justify-between gap-3'
          )}
        >
          {/* Direct to Step Content - No Redundant Top Header, No Stepper Dots, No Header Separator Underline */}
          <div
            ref={stepContainerRef}
            className={cn(
              'pr-1',
              isCompactStep ? 'h-auto overflow-visible' : 'flex-auto min-h-0 overflow-y-auto'
            )}
          >
            {/* 1. STEP: KATEGORI LAYANAN */}
            {mode === 'create' && step === 'category' && (
              <BookingCategoryStep
                isLoadingCatalog={isLoadingCatalog}
                activeCategoryList={activeCategoryList}
                onSelectCategory={(catId) => {
                  setSelectedCategoryId(catId);
                  setStep('service');
                }}
              />
            )}

            {/* 2. STEP: DAFTAR LAYANAN SPESIFIK */}
            {mode === 'create' && step === 'service' && (
              <BookingServiceStep
                serviceBentoItems={serviceBentoItems}
                onSelectServiceItem={handleSelectServiceItem}
                onBackToCategory={() => setStep('category')}
              />
            )}

            {/* 3. STEP: DATA PASIEN (PROFILE SELECTION) */}
            {step === 'patient' && (
              <BookingPatientSelectionStep
                patients={patients}
                selectedPatientId={selectedPatientId}
                onSelectPatient={(p) => setSelectedPatientId(p.id)}
                onAddNewPatient={() => setStep('patient_new')}
                onContinue={() => setStep('date')}
              />
            )}

            {/* 3B. STEP: FORM PASIEN BARU REGULER (COMPACT, NO PROGRESS DOTS) */}
            {step === 'patient_new' && (
              <BookingRegularPatientForm
                onSuccess={handlePatientCreated}
                onCancel={() =>
                  patients.length > 0 ? setStep('patient') : setStep('service')
                }
              />
            )}

            {/* 4. STEP: TANGGAL KUNJUNGAN */}
            {step === 'date' && (
              <BookingDateStep dateStr={dateStr} setDateStr={setDateStr} />
            )}

            {/* 4B. STEP: SESI PRAKTIK DOKTER JAGA (DEDICATED SLIDE) */}
            {step === 'session' && (
              <BookingSessionStep
                selectedService={selectedService}
                dateStr={dateStr}
                timeSlot={timeSlot}
                setTimeSlot={setTimeSlot}
                onSelectSessionId={setSelectedSessionId}
              />
            )}

            {/* 4C. STEP: TIPE KUNJUNGAN (DEDICATED SLIDE) */}
            {step === 'visit_type' && (
              <BookingVisitTypeStep
                visitType={visitType}
                setVisitType={setVisitType}
              />
            )}

            {/* 4D. STEP: KELUHAN MEDIS (DEDICATED SLIDE) */}
            {step === 'complaint' && (
              <BookingComplaintStep
                complaint={complaint}
                setComplaint={setComplaint}
              />
            )}

            {/* 5. STEP: KONFIRMASI RINGKASAN */}
            {step === 'confirmation' && (
              <BookingConfirmationStep
                selectedService={selectedService}
                selectedPatient={selectedPatient}
                dateStr={dateStr}
                timeSlot={timeSlot}
                visitType={visitType}
                complaint={complaint}
                serviceName={selectedService?.name || initialAppointment?.service}
                patientName={selectedPatient?.fullName || initialAppointment?.patient_name}
              />
            )}
          </div>

          {/* Modal Bottom Actions - No Top Separator Border (Underline Removed) */}
          {step !== 'patient_new' && (
            <div className='flex items-center justify-between shrink-0 pt-2'>
              <div>
                {step === 'category' ? (
                  <Button type='button' variant='ghost' size='md' shape='pill' onClick={onClose}>
                    Batal
                  </Button>
                ) : step === 'service' ? (
                  <Button
                    type='button'
                    variant='ghost'
                    size='md'
                    shape='pill'
                    leadingIcon={<Icons.arrowLeft className='size-3.5' />}
                    onClick={() => setStep('category')}
                  >
                    Kembali
                  </Button>
                ) : step === 'patient' ? (
                  <Button
                    type='button'
                    variant='ghost'
                    size='md'
                    shape='pill'
                    leadingIcon={<Icons.arrowLeft className='size-3.5' />}
                    onClick={() => setStep('service')}
                  >
                    Kembali
                  </Button>
                ) : step === 'date' ? (
                  <Button
                    type='button'
                    variant='ghost'
                    size='md'
                    shape='pill'
                    leadingIcon={mode === 'edit' ? undefined : <Icons.arrowLeft className='size-3.5' />}
                    onClick={() => {
                      if (mode === 'edit') {
                        onClose();
                      } else {
                        setStep(patients.length > 0 ? 'patient' : 'service');
                      }
                    }}
                  >
                    {mode === 'edit' ? 'Batal' : 'Kembali'}
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
                ) : step === 'visit_type' ? (
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
                ) : step === 'complaint' ? (
                  <Button
                    type='button'
                    variant='ghost'
                    size='md'
                    shape='pill'
                    leadingIcon={<Icons.arrowLeft className='size-3.5' />}
                    onClick={() => setStep('visit_type')}
                  >
                    Kembali
                  </Button>
                ) : step === 'confirmation' ? (
                  <Button
                    type='button'
                    variant='ghost'
                    size='md'
                    shape='pill'
                    leadingIcon={<Icons.arrowLeft className='size-3.5' />}
                    onClick={() => (mode === 'edit' ? setStep('session') : setStep('complaint'))}
                  >
                    Kembali
                  </Button>
                ) : null}
              </div>

              <div>
                {step === 'patient' && patients.length > 0 ? (
                  <Button
                    type='button'
                    variant='primary'
                    size='md'
                    shape='pill'
                    onClick={() => setStep('date')}
                    withTrailingCircleIcon={true}
                    className='min-w-[140px]'
                    trailingIcon={<Icons.arrowRight className='size-3 stroke-[2.5]' />}
                  >
                    Lanjut
                  </Button>
                ) : step === 'date' ? (
                  <Button
                    type='button'
                    variant='primary'
                    size='md'
                    shape='pill'
                    onClick={() => setStep('session')}
                    withTrailingCircleIcon={true}
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
                    onClick={() => (mode === 'edit' ? setStep('confirmation') : setStep('visit_type'))}
                    withTrailingCircleIcon={true}
                    className='min-w-[140px]'
                    trailingIcon={<Icons.arrowRight className='size-3 stroke-[2.5]' />}
                  >
                    Lanjut
                  </Button>
                ) : step === 'visit_type' ? (
                  <Button
                    type='button'
                    variant='primary'
                    size='md'
                    shape='pill'
                    onClick={() => setStep('complaint')}
                    withTrailingCircleIcon={true}
                    className='min-w-[140px]'
                    trailingIcon={<Icons.arrowRight className='size-3 stroke-[2.5]' />}
                  >
                    Lanjut
                  </Button>
                ) : step === 'complaint' ? (
                  <Button
                    type='button'
                    variant='primary'
                    size='md'
                    shape='pill'
                    onClick={() => setStep('confirmation')}
                    withTrailingCircleIcon={true}
                    className='min-w-[140px]'
                    trailingIcon={<Icons.arrowRight className='size-3 stroke-[2.5]' />}
                  >
                    Lanjut
                  </Button>
                ) : step === 'confirmation' ? (
                  <Button
                    type='button'
                    variant='primary'
                    size='md'
                    shape='pill'
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                    onClick={handleFinalSubmit}
                    withTrailingCircleIcon={true}
                    className='min-w-[160px]'
                    trailingIcon={<Icons.arrowUpRight className='size-3 stroke-[2.5]' />}
                  >
                    {isSubmitting
                      ? 'Memproses antrean...'
                      : mode === 'edit'
                      ? 'Simpan Jadwal Baru'
                      : 'Buat Janji Temu'}
                  </Button>
                ) : null}
              </div>
            </div>
          )}
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
          onCreated={(medicalFormData) =>
            onSubmit(medicalFormData as unknown as AppointmentFormData)
          }
        />
      ) : null}
    </>
  );
}

export default AppointmentModal;
