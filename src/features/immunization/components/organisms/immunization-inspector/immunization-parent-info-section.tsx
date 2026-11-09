'use client';

import * as React from 'react';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import type { ImmunizationIntakeRecord } from '../../../types/immunization.types';

export interface ImmunizationParentInfoSectionProps {
  intake?: ImmunizationIntakeRecord | null;
  isEditing?: boolean;
  onIntakeFieldChange?: (field: keyof ImmunizationIntakeRecord, value: any) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
}

export function ImmunizationParentInfoSection({
  intake,
  isEditing = false,
  onIntakeFieldChange,
  validationErrors,
  onClearError
}: ImmunizationParentInfoSectionProps) {
  return (
    <div className='rounded-xl border border-border/60 p-4 bg-card shadow-2xs font-sans'>
      <span className='text-xs font-bold text-foreground block mb-3 pb-1 border-b border-border/40 uppercase tracking-wider'>
        Informasi Tambahan Orang Tua
      </span>

      {isEditing && onIntakeFieldChange ? (
        <PatientLineInput
          id='imun-father-name'
          label='Nama Ayah Kandung'
          value={intake?.fatherName || ''}
          onChange={(val) => {
            onIntakeFieldChange('fatherName', val);
            if (validationErrors?.fatherName) {
              onClearError?.('fatherName');
            }
          }}
          placeholder='Nama lengkap ayah...'
        />
      ) : (
        <PatientLineInput
          id='view-imun-father-name'
          label='Nama Ayah Kandung'
          value={intake?.fatherName || ''}
          readOnly
        />
      )}
    </div>
  );
}
