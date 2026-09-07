'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { PatientOptionCard } from '../atoms/patient-option-card';

export type BloodTypeValue = 'A' | 'B' | 'AB' | 'O' | 'Belum Tahu';

export interface PatientBloodTypeSelectorProps {
  value: string;
  onChange: (value: BloodTypeValue) => void;
  error?: string;
  className?: string;
}

const BLOOD_TYPES: BloodTypeValue[] = ['A', 'B', 'AB', 'O'];

export function PatientBloodTypeSelector({
  value,
  onChange,
  error,
  className
}: PatientBloodTypeSelectorProps) {
  return (
    <div data-slot='patient-blood-type-selector' className={cn('space-y-3', className)}>
      <div className='grid grid-cols-4 gap-2.5'>
        {BLOOD_TYPES.map((type) => (
          <PatientOptionCard
            key={type}
            isSelected={value === type}
            onClick={() => onChange(type)}
            className='min-h-[52px] p-3.5'
          >
            <span className='text-base font-bold'>{type}</span>
          </PatientOptionCard>
        ))}
      </div>

      <PatientOptionCard
        isSelected={value === 'Belum Tahu'}
        onClick={() => onChange('Belum Tahu')}
        className='w-full px-4 py-2.5'
      >
        <span className='text-xs font-medium'>belum tahu / belum periksa</span>
      </PatientOptionCard>

      {error ? (
        <p className='pt-0.5 text-center text-[11px] font-normal text-destructive'>{error}</p>
      ) : null}
    </div>
  );
}
