'use client';

import * as React from 'react';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineSelect } from '@/features/data-pasien/components/registration/atoms/patient-line-select';
import { GENDER_OPTIONS, getGenderLabel } from '@/constants/gender.constants';
import { formatClinicDate } from '@/lib/date-format';
import type {
  ChildSex,
  ImmunizationIntakeRecord
} from '../../../types/immunization.types';

export interface ImmunizationChildIdentitySectionProps {
  intake?: ImmunizationIntakeRecord | null;
  isEditing?: boolean;
  onIntakeFieldChange?: (field: keyof ImmunizationIntakeRecord, value: any) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
}

export function ImmunizationChildIdentitySection({
  intake,
  isEditing = false,
  onIntakeFieldChange,
  validationErrors,
  onClearError
}: ImmunizationChildIdentitySectionProps) {
  if (isEditing && onIntakeFieldChange) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1 font-sans'>
        <div className='space-y-4'>
          <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40 uppercase tracking-wider'>
            Identitas Calon Pasien Anak
          </span>

          <PatientLineInput
            id='admin-child-name-input'
            label='Nama Lengkap Anak *'
            value={intake?.childName || ''}
            onChange={(val) => {
              onIntakeFieldChange('childName', val);
              if (validationErrors?.childName && val.trim().length > 0) {
                onClearError?.('childName');
              }
            }}
            error={validationErrors?.childName}
            invalid={Boolean(validationErrors?.childName)}
            placeholder='Nama lengkap anak...'
            required
          />

          <div className='grid grid-cols-2 gap-4'>
            <PatientLineInput
              id='admin-child-nik-input'
              label='NIK Anak (16 Digit)'
              value={intake?.childNik || ''}
              onChange={(val) => {
                const numeric = val.replace(/\D/g, '').slice(0, 16);
                onIntakeFieldChange('childNik', numeric);
                if (validationErrors?.childNik && numeric.length === 16) {
                  onClearError?.('childNik');
                }
              }}
              error={validationErrors?.childNik}
              invalid={Boolean(validationErrors?.childNik)}
              placeholder='16 digit NIK...'
              maxLength={16}
              isMonospace
            />

            <PatientLineSelect
              id='admin-child-sex-select'
              label='Jenis Kelamin'
              value={intake?.childSex || ''}
              onChange={(val) => onIntakeFieldChange('childSex', val as ChildSex)}
              options={GENDER_OPTIONS}
              placeholder='Pilih kelamin'
            />
          </div>
        </div>

        <div className='space-y-4'>
          <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40 uppercase tracking-wider'>
            Kelahiran & Usia
          </span>

          <div className='grid grid-cols-2 gap-4'>
            <CustomDatePicker
              id='admin-child-birthdate'
              label='Tanggal Lahir Anak'
              value={intake?.childBirthDate || ''}
              onChange={(val) => onIntakeFieldChange('childBirthDate', val)}
              placeholder='Pilih tgl lahir'
              disableFutureDates
              variant='underline'
            />

            <PatientLineInput
              id='admin-child-age'
              label='Usia Terhitung'
              value={intake?.childAgeFormatted || '-'}
              readOnly
            />
          </div>
        </div>
      </div>
    );
  }

  // READ ONLY MODE
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1 pointer-events-none select-text font-sans'>
      <div className='space-y-4'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40 uppercase tracking-wider'>
          Identitas Calon Pasien Anak
        </span>
        <PatientLineInput
          id='view-child-name'
          label='Nama Lengkap Anak'
          value={intake?.childName || '-'}
          readOnly
        />
        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='view-child-nik'
            label='NIK Anak (16 Digit)'
            value={intake?.childNik || '-'}
            isMonospace
            readOnly
          />
          <PatientLineInput
            id='view-child-sex'
            label='Jenis Kelamin'
            value={getGenderLabel(intake?.childSex)}
            readOnly
          />
        </div>
      </div>

      <div className='space-y-4'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40 uppercase tracking-wider'>
          Kelahiran & Usia
        </span>
        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='view-child-birthdate'
            label='Tanggal Lahir Anak'
            value={formatClinicDate(intake?.childBirthDate, { style: 'human_medium' })}
            isMonospace
            readOnly
          />
          <PatientLineInput
            id='view-child-age'
            label='Usia Terhitung'
            value={intake?.childAgeFormatted || '-'}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
