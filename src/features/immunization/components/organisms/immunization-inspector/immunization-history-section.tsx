'use client';

import * as React from 'react';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import type { ImmunizationIntakeRecord } from '../../../types/immunization.types';

export interface ImmunizationHistorySectionProps {
  intake?: ImmunizationIntakeRecord | null;
  isEditing?: boolean;
  onIntakeFieldChange?: (field: keyof ImmunizationIntakeRecord, value: any) => void;
}

export function ImmunizationHistorySection({
  intake,
  isEditing = false,
  onIntakeFieldChange
}: ImmunizationHistorySectionProps) {
  if (isEditing && onIntakeFieldChange) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1 font-sans'>
        <div className='space-y-4'>
          <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40 uppercase tracking-wider'>
            Riwayat Vaksinasi Sebelumnya
          </span>
          <PatientLineInput
            id='admin-previous-vaccines'
            label='Riwayat Vaksin Sebelumnya (Teks)'
            value={intake?.previousVaccineHistory || ''}
            onChange={(val) => onIntakeFieldChange('previousVaccineHistory', val)}
            placeholder='cth: HB 0 sudah di RS setelah lahir'
          />
        </div>

        <div className='space-y-4'>
          <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40 uppercase tracking-wider'>
            Riwayat Alergi Anak
          </span>
          <PatientLineInput
            id='admin-child-allergy'
            label='Riwayat Alergi (Teks)'
            value={intake?.childAllergyHistory || ''}
            onChange={(val) => onIntakeFieldChange('childAllergyHistory', val)}
            placeholder='cth: Tidak ada alergi yang diketahui / Alergi penisilin'
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
          Riwayat Vaksinasi Sebelumnya
        </span>
        <PatientLineInput
          id='view-previous-vaccines'
          label='Riwayat Vaksinasi Sebelumnya'
          value={intake?.previousVaccineHistory || '-'}
          readOnly
        />
      </div>

      <div className='space-y-4'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40 uppercase tracking-wider'>
          Riwayat Alergi Anak
        </span>
        <PatientLineInput
          id='view-child-allergy'
          label='Riwayat Alergi Anak'
          value={intake?.childAllergyHistory || '-'}
          readOnly
        />
      </div>
    </div>
  );
}
