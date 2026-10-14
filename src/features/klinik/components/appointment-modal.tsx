'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { QueueSuccessModal } from './queue-success-modal';
import { MedicalAppointmentModal } from './medical-appointment-modal';
import { ReservationModal, type ReservationContext } from './reservation/reservation-modal';
import { BookingCategoryStep } from './booking/booking-category-step';
import { BookingServiceStep } from './booking/booking-service-step';
import { BookingPatientSelectionStep } from './booking/booking-patient-selection-step';
import { BookingRegularPatientForm } from './booking/booking-regular-patient-form';
import { BookingDateStep } from './booking/booking-date-step';
import { BookingSessionStep } from './booking/booking-session-step';
import { BookingVisitTypeStep } from './booking/booking-visit-type-step';
import { BookingComplaintStep } from './booking/booking-complaint-step';
import { BookingConfirmationStep } from './booking/booking-confirmation-step';
import { BookingTicketConflictStep } from './booking/booking-ticket-conflict-step';
import { useAppointmentModal, type UseAppointmentModalProps } from '../model/useAppointmentModal';
import { type AppointmentFormData, QUEUE_STATUS } from '../api/types';

export interface AppointmentModalProps extends UseAppointmentModalProps {
  onViewExistingAppointment?: (appointmentId: string) => void;
}

export function AppointmentModal({
  isOpen,
  onClose,
  onSubmit,
  onViewExistingAppointment
}: AppointmentModalProps) {
  const {
    step,
    setStep,
    setSelectedCategoryId,
    isLoadingCatalog,
    selectedService,
    activeCategoryList,
    serviceBentoItems,
    dateStr,
    setDateStr,
    session,
    setSession,
    setSelectedSessionId,
    visitType,
    setVisitType,
    complaint,
    setComplaint,
    patients,
    selectedPatientId,
    setSelectedPatientId,
    selectedPatient,
    selectedRelationship,
    bookingContext,
    activeMedicalFlow,
    setActiveMedicalFlow,
    isResolvingMedicalFlow,
    isSubmitting,
    isQueueSuccessOpen,
    setIsQueueSuccessOpen,
    createdAppointment,
    activeTicketConflict,
    stepContainerRef,
    handleSelectServiceItem,
    handlePatientCreated,
    handleAddNewPatient,
    handleRelationshipSubmitForMedicalFlow,
    handlePatientContinue,
    handleSessionContinue,
    handleFinalSubmit
  } = useAppointmentModal({
    isOpen,
    onClose,
    onSubmit
  });

  const [reservationContext, setReservationContext] = React.useState<ReservationContext | null>(
    null
  );
  const [isCompleted, setIsCompleted] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setReservationContext(null);
      setIsCompleted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isCompactStep =
    step === 'date' ||
    step === 'session' ||
    step === 'visit_type' ||
    step === 'complaint' ||
    step === 'patient_new' ||
    step === 'confirmation' ||
    step === 'ticket_conflict';

  const targetFlow =
    bookingContext?.formType ||
    (selectedService?.medicalFlow === 'pregnancy'
      ? 'pregnancy'
      : selectedService?.medicalFlow === 'immunization'
        ? 'immunization'
        : 'regular');

  return (
    <>
      <ModalWrapper
        isOpen={
          isOpen && !activeMedicalFlow && !isQueueSuccessOpen && !reservationContext && !isCompleted
        }
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
          <div
            ref={stepContainerRef}
            className={cn(
              'pr-1',
              isCompactStep ? 'h-auto overflow-visible' : 'flex-auto min-h-0 overflow-y-auto'
            )}
          >
            {step === 'category' && (
              <BookingCategoryStep
                isLoadingCatalog={isLoadingCatalog}
                activeCategoryList={activeCategoryList}
                onSelectCategory={(catId) => {
                  setSelectedCategoryId(catId);
                  setStep('service');
                }}
              />
            )}

            {step === 'service' && (
              <BookingServiceStep
                serviceBentoItems={serviceBentoItems}
                onSelectServiceItem={handleSelectServiceItem}
                onBackToCategory={() => setStep('category')}
              />
            )}

            {step === 'patient' && (
              <BookingPatientSelectionStep
                patients={patients}
                selectedPatientId={selectedPatientId}
                onSelectPatient={(p) => setSelectedPatientId(p.id)}
                onAddNewPatient={handleAddNewPatient}
                onContinue={handlePatientContinue}
              />
            )}

            {step === 'patient_new' && (
              <BookingRegularPatientForm
                onSuccess={handlePatientCreated}
                onCancel={() => (patients.length > 0 ? setStep('patient') : setStep('service'))}
                allowedRelationships={bookingContext?.allowedRelationships}
                hasExistingSelf={patients.some((p) => p.relationship === 'self' || p.isSelf)}
                targetFlow={targetFlow}
                onRelationshipSubmit={handleRelationshipSubmitForMedicalFlow}
              />
            )}

            {step === 'date' && <BookingDateStep dateStr={dateStr} setDateStr={setDateStr} />}

            {step === 'session' && (
              <BookingSessionStep
                selectedService={selectedService}
                dateStr={dateStr}
                session={session}
                setSession={setSession}
                onSelectSessionId={setSelectedSessionId}
              />
            )}

            {step === 'visit_type' && (
              <BookingVisitTypeStep visitType={visitType} setVisitType={setVisitType} />
            )}

            {step === 'complaint' && (
              <BookingComplaintStep complaint={complaint} setComplaint={setComplaint} />
            )}

            {step === 'confirmation' && (
              <BookingConfirmationStep
                selectedService={selectedService}
                selectedPatient={selectedPatient}
                dateStr={dateStr}
                session={session}
                visitType={visitType}
                complaint={complaint}
                serviceName={selectedService?.name || ''}
                patientName={selectedPatient?.fullName || ''}
              />
            )}

            {step === 'ticket_conflict' && (
              <BookingTicketConflictStep
                activeTicket={activeTicketConflict}
                onViewExistingAppointment={onViewExistingAppointment}
              />
            )}
          </div>

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
                    leadingIcon={<Icons.arrowLeft className='size-3.5' />}
                    onClick={() => {
                      setStep(patients.length > 0 ? 'patient' : 'service');
                    }}
                  >
                    Kembali
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
                    onClick={() => setStep('complaint')}
                  >
                    Kembali
                  </Button>
                ) : step === 'ticket_conflict' ? (
                  <Button
                    type='button'
                    variant='ghost'
                    size='md'
                    shape='pill'
                    leadingIcon={<Icons.arrowLeft className='size-3.5' />}
                    onClick={() => setStep('date')}
                  >
                    Ganti Tanggal
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
                    disabled={!selectedPatientId || isResolvingMedicalFlow}
                    onClick={handlePatientContinue}
                    withTrailingCircleIcon={true}
                    className='min-w-[140px]'
                    trailingIcon={
                      isResolvingMedicalFlow ? (
                        <Icons.spinner className='size-3 animate-spin stroke-[2.5]' />
                      ) : (
                        <Icons.arrowRight className='size-3 stroke-[2.5]' />
                      )
                    }
                  >
                    {isResolvingMedicalFlow ? 'Menyiapkan...' : 'Lanjut'}
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
                    disabled={!session}
                    onClick={handleSessionContinue}
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
                ) : step === 'ticket_conflict' ? (
                  <Button
                    type='button'
                    variant='primary'
                    size='md'
                    shape='pill'
                    onClick={onClose}
                    withTrailingCircleIcon={true}
                    className='min-w-[140px]'
                    trailingIcon={<Icons.check className='size-3 stroke-[2.5]' />}
                  >
                    Saya Mengerti
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
                    {isSubmitting ? 'Memproses antrean...' : 'Buat Janji Temu'}
                  </Button>
                ) : null}
              </div>
            </div>
          )}
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
                doctor_name: createdAppointment.doctor_name || '',
                patient_name: createdAppointment.patient_name,
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

      {activeMedicalFlow ? (
        <MedicalAppointmentModal
          flow={activeMedicalFlow}
          isOpen={isOpen}
          selectedService={selectedService}
          selectedPatient={selectedPatient}
          newPatientRelationship={selectedRelationship}
          onBackToService={() => {
            setActiveMedicalFlow(null);
            setStep('patient');
          }}
          onClose={() => {
            setActiveMedicalFlow(null);
            onClose();
          }}
          onCompleteIntake={(ctx) => {
            setActiveMedicalFlow(null);
            setReservationContext(ctx);
          }}
          onCreated={(medicalFormData) =>
            onSubmit(medicalFormData as unknown as AppointmentFormData)
          }
        />
      ) : null}

      {reservationContext ? (
        <ReservationModal
          isOpen={Boolean(reservationContext)}
          context={reservationContext}
          onClose={() => {
            setReservationContext(null);
            setIsCompleted(false);
            onClose();
          }}
          onSuccess={(apt) => {
            setIsCompleted(true);
            onSubmit(apt as unknown as AppointmentFormData);
          }}
        />
      ) : null}
    </>
  );
}
