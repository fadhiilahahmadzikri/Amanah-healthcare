'use client';

import * as React from 'react';
import gsap from 'gsap';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { cn } from '@/lib/utils';
import {
  PATIENT_REGISTRATION_INPUT_STEP_COUNT,
  PATIENT_REGISTRATION_STEPS
} from '../../constants/registration-options';
import { triggerPatientRegistrationConfetti } from '../../lib/registration-confetti';
import type { PatientRegistrationFormValues } from '../../schemas/patient-registration-schema';
import { PatientStepHeader } from './molecules/patient-step-header';
import { PatientRegistrationStepFields } from './patient-registration-fields';
import { usePatientRegistrationForm } from './use-patient-registration-form';

export interface PatientRegistrationModalProps {
  isOpen?: boolean;
  initialName?: string;
  onComplete?: () => void;
}

export function PatientRegistrationModal({
  isOpen = true,
  initialName,
  onComplete
}: PatientRegistrationModalProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = React.useState(isOpen);
  const stepContainerRef = React.useRef<HTMLDivElement>(null);
  const directionRef = React.useRef<'forward' | 'backward'>('forward');
  const isAnimatingRef = React.useRef(false);

  const handleSuccess = React.useCallback(() => {
    triggerPatientRegistrationConfetti();
    toast.success('🎉 horeee! data pasien berhasil disimpan!');

    setTimeout(() => {
      setModalOpen(false);
      onComplete?.();
      router.refresh();
    }, 1200);
  }, [onComplete, router]);

  const controller = usePatientRegistrationForm({
    initialName,
    onSuccess: handleSuccess
  });

  const { form, currentStep, step, handleNextStepOrSubmit, isCurrentStepValid } = controller;
  const stepMeta = PATIENT_REGISTRATION_STEPS[currentStep - 1] ?? PATIENT_REGISTRATION_STEPS[0];
  const isReviewStep = currentStep === step.count;

  // Animate incoming step with GSAP
  React.useEffect(() => {
    if (!stepContainerRef.current) return;
    const direction = directionRef.current;

    gsap.fromTo(
      stepContainerRef.current,
      { y: direction === 'forward' ? 12 : -12, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          isAnimatingRef.current = false;
        }
      }
    );
  }, [currentStep]);

  const handleBack = React.useCallback(() => {
    if (currentStep <= 1 || isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    directionRef.current = 'backward';

    if (stepContainerRef.current) {
      gsap.to(stepContainerRef.current, {
        y: 8,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          step.goToPrevStep();
        }
      });
    } else {
      step.goToPrevStep();
    }
  }, [currentStep, step]);

  const handleProceed = React.useCallback(
    async (canProceed: boolean) => {
      if (!canProceed || isAnimatingRef.current) return;

      if (isReviewStep) {
        // Final submit
        await handleNextStepOrSubmit(form);
      } else {
        // Step navigation forward
        isAnimatingRef.current = true;
        directionRef.current = 'forward';

        if (stepContainerRef.current) {
          gsap.to(stepContainerRef.current, {
            y: -8,
            opacity: 0,
            duration: 0.2,
            ease: 'power2.in',
            onComplete: () => {
              void handleNextStepOrSubmit(form);
            }
          });
        } else {
          void handleNextStepOrSubmit(form);
        }
      }
    },
    [form, handleNextStepOrSubmit, isReviewStep]
  );

  return (
    <ModalWrapper
      isOpen={modalOpen}
      onClose={() => undefined}
      showCloseButton={false}
      dismissible={false}
      maxWidth='max-w-[500px]'
      className='relative my-auto w-full max-w-[500px] overflow-visible rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8'
    >
      <form.AppForm>
        <form.Form className='gap-0 p-0 md:p-0'>
          {/* Header with back button and 8 dash dots */}
          <PatientStepHeader
            currentStep={currentStep}
            totalSteps={PATIENT_REGISTRATION_INPUT_STEP_COUNT}
            onBack={handleBack}
          />

          {/* Animated Step Container */}
          <div ref={stepContainerRef} className='space-y-6'>
            <div>
              <h1 className='text-lg font-semibold tracking-tight text-foreground sm:text-xl'>
                {stepMeta.title}
              </h1>
              <p className='mt-1 text-xs font-normal leading-relaxed text-muted-foreground'>
                {stepMeta.description}
              </p>
            </div>

            <PatientRegistrationStepFields controller={controller} />
          </div>

          {/* Action Button */}
          <form.Subscribe selector={(state) => [state.values, state.isSubmitting] as const}>
            {([values, isSubmitting]) => {
              const canProceed = isCurrentStepValid(values as PatientRegistrationFormValues);

              return (
                <div className='pt-6'>
                  <button
                    type='button'
                    disabled={isSubmitting || !canProceed}
                    onClick={() => void handleProceed(canProceed)}
                    className={cn(
                      'flex w-full select-none items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-center text-xs font-medium transition-all duration-200',
                      canProceed && !isSubmitting
                        ? 'cursor-pointer bg-primary text-primary-foreground shadow-sm hover:bg-primary/95 active:scale-[0.99]'
                        : 'cursor-not-allowed bg-muted text-muted-foreground/60 opacity-80'
                    )}
                  >
                    {isSubmitting ? <Icons.spinner className='size-3.5 animate-spin' /> : null}
                    <span>{isReviewStep ? 'simpan data pasien' : 'lanjutkan'}</span>
                    {!isSubmitting && !isReviewStep ? (
                      <Icons.arrowRight className='size-3.5' />
                    ) : null}
                    {!isSubmitting && isReviewStep ? <Icons.check className='size-3.5' /> : null}
                  </button>
                </div>
              );
            }}
          </form.Subscribe>
        </form.Form>
      </form.AppForm>
    </ModalWrapper>
  );
}
