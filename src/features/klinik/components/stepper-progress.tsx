import React from 'react';
import { cn } from '@/lib/utils';

export interface StepperProgressProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function StepperProgress({ currentStep, totalSteps, className }: StepperProgressProps) {
  return (
    <div
      className={cn('flex items-center justify-end gap-1.5 select-none', className)}
      title={`Langkah ${currentStep} dari ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= currentStep;

        return (
          <div
            key={stepNumber}
            className={cn(
              'h-[3px] rounded-full transition-all duration-300',
              isActive ? 'w-5 bg-primary dark:bg-indigo-400' : 'w-4 bg-slate-200 dark:bg-slate-700'
            )}
          />
        );
      })}
    </div>
  );
}
