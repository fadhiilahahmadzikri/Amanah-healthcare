'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { PatientOptionCard } from '../atoms/patient-option-card';

import type { ReferenceOptionItem } from '@/features/data-pasien/api/patient-reference-service';
import { usePatientFormReferences } from '@/features/data-pasien/model/usePatientFormReferences';

export interface PatientGenderSelectorProps {
  value: string;
  onChange: (value: 'Laki-laki' | 'Perempuan' | 'L' | 'P' | string) => void;
  error?: string;
  className?: string;
  options?: ReferenceOptionItem[];
}

export function PatientGenderSelector({
  value,
  onChange,
  error,
  className,
  options
}: PatientGenderSelectorProps) {
  const references = usePatientFormReferences();
  const availableOptions: ReferenceOptionItem[] = options ?? references.genders;

  return (
    <div data-slot='patient-gender-selector' className={cn('space-y-3', className)}>
      <div className='grid grid-cols-2 gap-3'>
        {availableOptions.map((item) => {
          const isLaki = item.label.toLowerCase().includes('laki') || item.value === 'L';
          const isSelected = value === item.value || value === item.label;

          return (
            <PatientOptionCard
              key={item.value}
              isSelected={isSelected}
              onClick={() => onChange(item.value)}
              className='min-h-[80px] flex-col gap-2 p-4 text-xs font-medium'
            >
              {isLaki ? (
                <Icons.user className='size-5' />
              ) : (
                <Icons.userCheck className='size-5' />
              )}
              <span>{item.label.toLowerCase()}</span>
            </PatientOptionCard>
          );
        })}
      </div>

      {error ? (
        <p className='pt-0.5 text-center text-[11px] font-normal text-destructive'>{error}</p>
      ) : null}
    </div>
  );
}
