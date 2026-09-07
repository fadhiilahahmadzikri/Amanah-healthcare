'use client';

import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { PATIENT_REGISTRATION_STEPS } from '../../constants/registration-options';
import { PatientRegistrationProgress } from './patient-registration-progress';
import { PatientRegistrationStepFields } from './patient-registration-fields';
import { usePatientRegistrationForm } from './use-patient-registration-form';

type PatientRegistrationViewProps = {
  initialName?: string;
};

export function PatientRegistrationView({ initialName }: PatientRegistrationViewProps) {
  const controller = usePatientRegistrationForm({ initialName });
  const { form, currentStep, step, handleNextStepOrSubmit } = controller;
  const stepMeta = PATIENT_REGISTRATION_STEPS[currentStep - 1] ?? PATIENT_REGISTRATION_STEPS[0];
  const isReviewStep = currentStep === step.count;

  return (
    <main className='min-h-screen bg-background px-4 py-6 text-foreground md:py-10'>
      <div className='mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-xl flex-col justify-center gap-6'>
        <div className='flex justify-center'>
          <Image
            src='/logo.svg'
            alt='Amanah Healthcare'
            width={154}
            height={45}
            className='h-10 w-auto object-contain'
            priority
          />
        </div>

        <Card className='gap-0 overflow-hidden py-0 shadow-sm'>
          <CardHeader className='gap-5 border-b p-6'>
            <PatientRegistrationProgress
              currentStep={currentStep}
              totalSteps={step.count}
              onBack={step.goToPrevStep}
            />
            <div className='flex flex-col gap-2'>
              <CardTitle className='text-xl leading-tight'>{stepMeta.title}</CardTitle>
              <p className='text-sm leading-relaxed text-muted-foreground'>
                {stepMeta.description}
              </p>
            </div>
          </CardHeader>

          <CardContent className='p-6'>
            <form.AppForm>
              <form.Form className='gap-6 p-0 md:p-0'>
                <PatientRegistrationStepFields controller={controller} />

                <form.Subscribe selector={(state) => state.isSubmitting}>
                  {(isSubmitting) => (
                    <Button
                      type='button'
                      className='w-full'
                      disabled={isSubmitting}
                      onClick={() => void handleNextStepOrSubmit(form)}
                    >
                      {isSubmitting ? (
                        <Icons.spinner data-icon='inline-start' className='animate-spin' />
                      ) : null}
                      {isReviewStep ? 'Simpan data pasien' : 'Lanjutkan'}
                      {!isSubmitting && !isReviewStep ? (
                        <Icons.arrowRight data-icon='inline-end' />
                      ) : null}
                      {!isSubmitting && isReviewStep ? (
                        <Icons.check data-icon='inline-end' />
                      ) : null}
                    </Button>
                  )}
                </form.Subscribe>
              </form.Form>
            </form.AppForm>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
