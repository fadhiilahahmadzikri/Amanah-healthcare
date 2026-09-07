'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { PatientStepDot } from '../atoms/patient-step-dot';

export interface PatientStepHeaderProps {
  currentStep: number;
  totalSteps?: number;
  onBack: () => void;
  className?: string;
}

export function PatientStepHeader({
  currentStep,
  totalSteps = 8,
  onBack,
  className
}: PatientStepHeaderProps) {
  const isBackDisabled = currentStep <= 1;

  return (
    <div
      data-slot='patient-step-header'
      className={cn('flex items-center justify-between mb-8', className)}
    >
      <button
        type='button'
        onClick={onBack}
        disabled={isBackDisabled}
        aria-label='Kembali ke langkah sebelumnya'
        className={cn(
          'flex items-center gap-1.5 text-xs font-normal transition-colors select-none',
          isBackDisabled
            ? 'opacity-40 cursor-not-allowed text-muted-foreground'
            : 'opacity-100 cursor-pointer text-muted-foreground hover:text-primary'
        )}
      >
        <Icons.arrowLeft className='size-3.5' />
        <span>kembali</span>
      </button>

      <div
        className='flex items-center gap-1.5'
        title='Langkah Pendaftaran'
        aria-label={`Langkah ${Math.min(currentStep, totalSteps)} dari ${totalSteps}`}
      >
        {Array.from({ length: totalSteps }).map((_, index) => (
          <PatientStepDot key={index} active={index < currentStep} />
        ))}
      </div>
    </div>
  );
}
