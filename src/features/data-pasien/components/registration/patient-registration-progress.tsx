'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Icons } from '@/components/icons';

type PatientRegistrationProgressProps = {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
};

export function PatientRegistrationProgress({
  currentStep,
  totalSteps,
  onBack
}: PatientRegistrationProgressProps) {
  const isFirstStep = currentStep === 1;
  const progressValue = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between gap-4'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={onBack}
          disabled={isFirstStep}
          className='px-0 text-muted-foreground'
        >
          <Icons.chevronLeft data-icon='inline-start' />
          Kembali
        </Button>
        <span className='text-xs font-medium text-muted-foreground'>
          Langkah {currentStep} dari {totalSteps}
        </span>
      </div>
      <Progress value={progressValue} />
    </div>
  );
}
