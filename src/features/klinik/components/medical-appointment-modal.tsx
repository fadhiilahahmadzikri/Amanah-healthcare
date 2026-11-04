'use client';

import * as React from 'react';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import type { ServiceCatalogItem } from '../api/catalog.service';
import type {
  PatientAffiliationProfile,
  PatientRelationshipType
} from '@/features/data-pasien/api/patient-affiliation-service';
import type { AppointmentFormData, MedicalAppointmentFlow } from '../api/types';
import { useMedicalAppointmentForm } from '../model/useMedicalAppointmentForm';
import { QueueSuccessModal } from './queue-success-modal';
import { ReservationModal, type ReservationContext } from './reservation/reservation-modal';
import { ImmunizationBookingStepper } from '@/features/immunization';
import { MaternityBookingStepper } from '@/features/maternity';

interface MedicalAppointmentModalProps {
  flow: MedicalAppointmentFlow;
  isOpen: boolean;
  formSchema?: Record<string, any> | null;
  selectedService?: ServiceCatalogItem | null;
  selectedPatient?: PatientAffiliationProfile | null;
  newPatientRelationship?: PatientRelationshipType | string;
  onClose: () => void;
  onCreated?: (appointment: AppointmentFormData) => void;
  onCompleteIntake?: (context: ReservationContext) => void;
  onBackToService?: () => void;
}

export function MedicalAppointmentModal({
  flow,
  isOpen,
  formSchema,
  selectedService,
  selectedPatient,
  newPatientRelationship,
  onClose,
  onCreated,
  onCompleteIntake,
  onBackToService
}: MedicalAppointmentModalProps) {
  const [internalReservationContext, setInternalReservationContext] =
    React.useState<ReservationContext | null>(null);

  const handleCompleteIntake = React.useCallback(
    (ctx: ReservationContext) => {
      if (onCompleteIntake) {
        onCompleteIntake(ctx);
      } else {
        setInternalReservationContext(ctx);
      }
    },
    [onCompleteIntake]
  );

  const medical = useMedicalAppointmentForm({
    flow,
    isOpen,
    formSchema,
    selectedService,
    selectedPatient,
    newPatientRelationship,
    onClose,
    onCreated,
    onCompleteIntake: handleCompleteIntake,
    onBackToService
  });

  const stepContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!stepContainerRef.current) {
      return;
    }

    const scrollableElements = stepContainerRef.current.querySelectorAll<HTMLElement>(
      '[data-radix-scroll-area-viewport], .overflow-y-auto'
    );
    scrollableElements.forEach((element) => {
      element.scrollTop = 0;
    });
    stepContainerRef.current.scrollTop = 0;
  }, [medical.currentStep]);

  if (!isOpen || (flow !== 'pregnancy' && flow !== 'immunization')) {
    return null;
  }

  const {
    isProcessing,
    isQueueSuccessOpen,
    createdAppointment,
    createdQueueItem,
    actions
  } = medical;

  const stepTitle =
    flow === 'immunization'
      ? 'Formulir Pendaftaran Imunisasi Anak'
      : 'Formulir Pemeriksaan Kehamilan (PMB)';

  const stepDescription =
    flow === 'immunization'
      ? 'Lengkapi identitas anak dan kontak orang tua untuk pendaftaran layanan imunisasi.'
      : 'Lengkapi data identitas ibu, suami, baseline fisik, dan riwayat obstetri.';

  return (
    <>
      <ModalWrapper
        isOpen={isOpen && !isQueueSuccessOpen && !internalReservationContext}
        onClose={onClose}
        maxWidth='w-full max-w-3xl lg:max-w-4xl'
        showCloseButton={false}
        className='flex flex-col overflow-hidden p-6 sm:p-7 md:p-8 shadow-2xl h-auto max-h-[88dvh]'
      >
        <div className='flex shrink-0 items-start justify-between gap-4 pb-2 mb-3 border-b border-border/40 sm:pb-3 sm:mb-4 select-none'>
          <div className='flex flex-1 min-w-0 flex-col gap-1'>
            <h3 className='text-base font-bold tracking-tight text-foreground sm:text-lg truncate'>
              {stepTitle}
            </h3>
            <p className='text-xs sm:text-sm text-muted-foreground leading-normal'>
              {stepDescription}
            </p>
          </div>
        </div>

        {flow === 'immunization' ? (
          <div className='flex-1 min-h-0 overflow-y-auto pr-1 pt-1'>
            <ImmunizationBookingStepper
              patientId={selectedPatient ? selectedPatient.id : ''}
              initialValues={{
                childName: selectedPatient?.fullName || '',
                childNik: selectedPatient?.nik || '',
                parentPhone: selectedPatient?.phoneNumber || '',
                childSex: selectedPatient?.gender === 'female' ? 'Perempuan' : 'Laki-laki',
                childBirthDate: selectedPatient?.birthDate || '',
                childAddress: selectedPatient?.address || ''
              }}
              onCancel={onClose}
              isSubmitting={isProcessing}
              onComplete={(payload) => {
                actions.submitMedicalAppointment({
                  childName: payload.childName,
                  childNik: payload.childNik || '',
                  childBirthDate: payload.childBirthDate,
                  childSex: payload.childSex,
                  parentPhone: payload.parentPhone,
                  fatherName: payload.fatherName || '',
                  motherName: payload.motherName || '',
                  childAddress: payload.childAddress || '',
                  previousVaccineHistory: payload.previousVaccineHistory || '',
                  childAllergyHistory: payload.childAllergyHistory || ''
                } as any);
              }}
            />
          </div>
        ) : (
          <div className='flex-1 min-h-0 overflow-y-auto pr-1 pt-1'>
            <MaternityBookingStepper
              patientId={selectedPatient ? selectedPatient.id : ''}
              initialValues={{
                motherName: selectedPatient?.fullName || '',
                motherNik: selectedPatient?.nik || '',
                motherBirthDate: selectedPatient?.birthDate || '',
                phoneNumber: selectedPatient?.phoneNumber || '',
                domicileAddress: selectedPatient?.address || '',
                motherBloodType: selectedPatient?.bloodType || 'Tidak Tahu'
              }}
              onCancel={onClose}
              isSubmitting={isProcessing}
              onComplete={(payload) => {
                actions.submitMedicalAppointment(payload as any);
              }}
            />
          </div>
        )}
      </ModalWrapper>

      {internalReservationContext ? (
        <ReservationModal
          isOpen={Boolean(internalReservationContext)}
          context={internalReservationContext}
          onClose={() => {
            setInternalReservationContext(null);
            onClose();
          }}
          onSuccess={(apt) => {
            onCreated?.(apt as unknown as AppointmentFormData);
          }}
        />
      ) : null}

      <QueueSuccessModal
        isOpen={isQueueSuccessOpen}
        isProcessing={isProcessing}
        appointment={createdAppointment}
        queueItem={createdQueueItem}
        onClose={actions.closeQueueSuccess}
      />
    </>
  );
}
