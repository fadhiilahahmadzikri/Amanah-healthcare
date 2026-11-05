'use client';

import * as React from 'react';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineTextarea } from '@/features/data-pasien/components/registration/atoms/patient-line-textarea';
import type { ImmunizationIntakeRecord } from '../../../types/immunization.types';

export interface ImmunizationParentAddressSectionProps {
  intake?: ImmunizationIntakeRecord | null;
  isEditing?: boolean;
  onIntakeFieldChange?: (field: keyof ImmunizationIntakeRecord, value: any) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
}

export function ImmunizationParentAddressSection({
  intake,
  isEditing = false,
  onIntakeFieldChange,
  validationErrors,
  onClearError
}: ImmunizationParentAddressSectionProps) {
  if (isEditing && onIntakeFieldChange) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1 font-sans'>
        <div className='space-y-4'>
          <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40 uppercase tracking-wider'>
            Data Orang Tua / Wali
          </span>
          <PatientLineInput
            id='admin-father-name'
            label='Nama Ayah'
            value={intake?.fatherName || ''}
            onChange={(val) => onIntakeFieldChange('fatherName', val)}
            placeholder='Nama ayah...'
          />
          <PatientLineInput
            id='admin-mother-name'
            label='Nama Ibu'
            value={intake?.motherName || ''}
            onChange={(val) => onIntakeFieldChange('motherName', val)}
            placeholder='Nama ibu...'
          />
          <PatientLineInput
            id='admin-parent-phone'
            label='Nomor HP Orang Tua/Wali *'
            type='tel'
            value={intake?.parentPhone || ''}
            onChange={(val) => {
              onIntakeFieldChange('parentPhone', val);
              if (validationErrors?.parentPhone) {
                onClearError?.('parentPhone');
              }
            }}
            error={validationErrors?.parentPhone}
            invalid={Boolean(validationErrors?.parentPhone)}
            placeholder='08xxxxxxxxxx'
            isMonospace
            required
          />
        </div>

        <div className='space-y-4'>
          <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40 uppercase tracking-wider'>
            Domisili & Alamat
          </span>
          <PatientLineTextarea
            id='admin-child-address'
            label='Alamat Lengkap Domisili'
            value={intake?.childAddress || ''}
            onChange={(val) => onIntakeFieldChange('childAddress', val)}
            placeholder='Alamat lengkap domisili tempat tinggal anak...'
          />
        </div>
      </div>
    );
  }

  // READ ONLY MODE
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1 pointer-events-none select-text font-sans'>
      <div className='space-y-4'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40 uppercase tracking-wider'>
          Data Orang Tua / Wali
        </span>
        <PatientLineInput
          id='view-father-name'
          label='Nama Ayah'
          value={intake?.fatherName || '-'}
          readOnly
        />
        <PatientLineInput
          id='view-mother-name'
          label='Nama Ibu'
          value={intake?.motherName || '-'}
          readOnly
        />
        <PatientLineInput
          id='view-parent-phone'
          label='Nomor HP Orang Tua/Wali'
          value={intake?.parentPhone || '-'}
          isMonospace
          readOnly
        />
      </div>

      <div className='space-y-4'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40 uppercase tracking-wider'>
          Domisili & Alamat
        </span>
        <PatientLineTextarea
          id='view-child-address'
          label='Alamat Lengkap Domisili'
          value={intake?.childAddress || '-'}
          readOnly
        />
      </div>
    </div>
  );
}
