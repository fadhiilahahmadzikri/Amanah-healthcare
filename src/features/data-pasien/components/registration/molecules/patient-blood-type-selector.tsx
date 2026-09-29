'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { PatientOptionCard } from '../atoms/patient-option-card';

import type { ReferenceOptionItem } from '@/features/data-pasien/api/patient-reference-service';
import { usePatientFormReferences } from '@/features/data-pasien/model/usePatientFormReferences';

export type BloodTypeValue = 'A' | 'B' | 'AB' | 'O' | 'Belum Tahu' | string;

export interface PatientBloodTypeSelectorProps {
  value: string;
  onChange: (value: BloodTypeValue) => void;
  error?: string;
  className?: string;
  options?: ReferenceOptionItem[];
}

export function PatientBloodTypeSelector({
  value,
  onChange,
  error,
  className,
  options
}: PatientBloodTypeSelectorProps) {
  const references = usePatientFormReferences();
  const availableOptions: ReferenceOptionItem[] = options ?? references.bloodTypes;

  const mainBloodTypes = availableOptions.filter(
    (opt) => opt.value !== 'Belum Tahu' && opt.value !== 'tidak_tahu'
  );
  const unknownOption = availableOptions.find(
    (opt) => opt.value === 'Belum Tahu' || opt.value === 'tidak_tahu'
  );

  return (
    <div data-slot='patient-blood-type-selector' className={cn('space-y-3', className)}>
      <div className='grid grid-cols-4 gap-2.5'>
        {mainBloodTypes.map((item) => (
          <PatientOptionCard
            key={item.value}
            isSelected={value === item.value || value === item.label}
            onClick={() => onChange(item.value)}
            className='min-h-[52px] p-3.5'
          >
            <span className='text-base font-bold'>{item.label}</span>
          </PatientOptionCard>
        ))}
      </div>

      {unknownOption && (
        <PatientOptionCard
          isSelected={value === unknownOption.value || value === unknownOption.label}
          onClick={() => onChange(unknownOption.value)}
          className='w-full px-4 py-2.5'
        >
          <span className='text-xs font-medium'>{unknownOption.label.toLowerCase()} / belum periksa</span>
        </PatientOptionCard>
      )}

      {error ? (
        <p className='pt-0.5 text-center text-[11px] font-normal text-destructive'>{error}</p>
      ) : null}
    </div>
  );
}
