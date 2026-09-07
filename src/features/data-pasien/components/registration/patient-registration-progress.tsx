'use client';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

type PatientRegistrationStepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
};

export function PatientRegistrationStepIndicator({
  currentStep,
  totalSteps,
  onBack
}: PatientRegistrationStepIndicatorProps) {
  const isFirstStep = currentStep === 1;
  const activeStep = Math.min(currentStep, totalSteps);

  return (
    <div className='flex items-center justify-between gap-4'>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={onBack}
        disabled={isFirstStep}
        className='h-auto px-0 py-0 text-xs font-normal text-muted-foreground opacity-80 hover:bg-transparent hover:text-primary disabled:opacity-40'
      >
        <Icons.chevronLeft data-icon='inline-start' className='size-3.5' />
        kembali
      </Button>
      <div
        className='flex items-center gap-1.5'
        aria-label={`Langkah ${activeStep} dari ${totalSteps}`}
      >
        {Array.from({ length: totalSteps }).map((_, index) => (
          <span
            key={index}
            className={cn(
              'h-[2.5px] w-4 rounded-full transition-colors duration-300',
              index < activeStep ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  );
}
