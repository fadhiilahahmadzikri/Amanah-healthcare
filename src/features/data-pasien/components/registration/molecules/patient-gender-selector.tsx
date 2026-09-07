'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { PatientOptionCard } from '../atoms/patient-option-card';

export interface PatientGenderSelectorProps {
  value: string;
  onChange: (value: 'Laki-laki' | 'Perempuan') => void;
  error?: string;
  className?: string;
}

export function PatientGenderSelector({
  value,
  onChange,
  error,
  className
}: PatientGenderSelectorProps) {
  return (
    <div data-slot='patient-gender-selector' className={cn('space-y-3', className)}>
      <div className='grid grid-cols-2 gap-3'>
        <PatientOptionCard
          isSelected={value === 'Laki-laki'}
          onClick={() => onChange('Laki-laki')}
          className='min-h-[80px] flex-col gap-2 p-4 text-xs font-medium'
        >
          <Icons.user className='size-5' />
          <span>laki-laki</span>
        </PatientOptionCard>

        <PatientOptionCard
          isSelected={value === 'Perempuan'}
          onClick={() => onChange('Perempuan')}
          className='min-h-[80px] flex-col gap-2 p-4 text-xs font-medium'
        >
          <Icons.userCheck className='size-5' />
          <span>perempuan</span>
        </PatientOptionCard>
      </div>

      {error ? (
        <p className='pt-0.5 text-center text-[11px] font-normal text-destructive'>{error}</p>
      ) : null}
    </div>
  );
}
