'use client';

import * as React from 'react';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineSelect } from '@/features/data-pasien/components/registration/atoms/patient-line-select';
import { PatientLineTextarea } from '@/features/data-pasien/components/registration/atoms/patient-line-textarea';
import { formatClinicDate } from '@/lib/date-format';
import type { MaternityIntake } from '../../../types/maternity.types';

export interface MaternityMotherIdentityFieldsProps {
  intake?: MaternityIntake | null;
  isEditing?: boolean;
  onIntakeFieldChange?: (field: keyof MaternityIntake, value: any) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
  religionOptions: string[];
  educationOptions: string[];
  occupationOptions: string[];
}

export function MaternityMotherIdentityFields({
  intake,
  isEditing = false,
  onIntakeFieldChange,
  validationErrors,
  onClearError,
  religionOptions,
  educationOptions,
  occupationOptions
}: MaternityMotherIdentityFieldsProps) {
  if (isEditing && onIntakeFieldChange) {
    return (
      <div className='space-y-4'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
          Identitas Calon Ibu
        </span>

        <PatientLineInput
          id='maternity-mother-name'
          label='Nama Lengkap Ibu *'
          value={intake?.motherName}
          onChange={(val) => {
            onIntakeFieldChange('motherName', val);
            if (validationErrors?.motherName && val.trim().length > 0) {
              onClearError?.('motherName');
            }
          }}
          error={validationErrors?.motherName}
          invalid={Boolean(validationErrors?.motherName)}
          placeholder='cth: Ny. Siti Rahmawati'
          required
        />

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='maternity-mother-nik'
            label='NIK Ibu (16 Digit) *'
            value={intake?.motherNik}
            onChange={(val) => {
              const numeric = val.replace(/\D/g, '').slice(0, 16);
              onIntakeFieldChange('motherNik', numeric);
              if (validationErrors?.motherNik && numeric.length === 16) {
                onClearError?.('motherNik');
              }
            }}
            error={validationErrors?.motherNik}
            invalid={Boolean(validationErrors?.motherNik)}
            placeholder='16 digit NIK...'
            maxLength={16}
            isMonospace
            required
          />

          <CustomDatePicker
            id='maternity-mother-birthdate'
            label='Tanggal Lahir Ibu *'
            value={intake?.motherBirthDate || ''}
            onChange={(val) => {
              onIntakeFieldChange('motherBirthDate', val);
              if (validationErrors?.motherBirthDate && val) {
                onClearError?.('motherBirthDate');
              }
            }}
            placeholder='Pilih tgl lahir'
            disableFutureDates
            variant='underline'
            error={validationErrors?.motherBirthDate}
            invalid={Boolean(validationErrors?.motherBirthDate)}
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='maternity-phone-number'
            label='Nomor HP / WA *'
            type='tel'
            value={intake?.phoneNumber}
            onChange={(val) => {
              onIntakeFieldChange('phoneNumber', val);
              if (validationErrors?.phoneNumber && val.trim().length > 0) {
                onClearError?.('phoneNumber');
              }
            }}
            error={validationErrors?.phoneNumber}
            invalid={Boolean(validationErrors?.phoneNumber)}
            placeholder='08xxxxxxxxxx'
            isMonospace
            required
          />

          <PatientLineSelect
            id='maternity-religion'
            label='Agama'
            value={intake?.religion}
            onChange={(val) => onIntakeFieldChange('religion', val)}
            options={religionOptions}
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineSelect
            id='maternity-mother-education'
            label='Pendidikan Terakhir'
            value={intake?.motherEducation}
            onChange={(val) => onIntakeFieldChange('motherEducation', val)}
            options={educationOptions}
          />

          <PatientLineSelect
            id='maternity-mother-job'
            label='Pekerjaan'
            value={intake?.motherJob}
            onChange={(val) => onIntakeFieldChange('motherJob', val)}
            options={occupationOptions}
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='maternity-marriage-order'
            label='Pernikahan Ke-'
            type='number'
            value={intake?.marriageOrder}
            onChange={(val) => onIntakeFieldChange('marriageOrder', val === '' ? '' : val)}
            placeholder='1'
          />

          <CustomDatePicker
            id='maternity-marriage-date'
            label='Tanggal Pernikahan'
            value={intake?.marriageDate || ''}
            onChange={(val) => {
              onIntakeFieldChange('marriageDate', val);
              if (validationErrors?.marriageDate && val) {
                onClearError?.('marriageDate');
              }
            }}
            placeholder='Pilih tgl nikah'
            disableFutureDates
            variant='underline'
            error={validationErrors?.marriageDate}
            invalid={Boolean(validationErrors?.marriageDate)}
          />
        </div>

        <PatientLineTextarea
          id='maternity-domicile-address'
          label='Alamat Domisili Tempat Tinggal'
          value={intake?.domicileAddress}
          onChange={(val) => {
            onIntakeFieldChange('domicileAddress', val);
            if (validationErrors?.domicileAddress) {
              onClearError?.('domicileAddress');
            }
          }}
          error={validationErrors?.domicileAddress}
          invalid={Boolean(validationErrors?.domicileAddress)}
          placeholder='Alamat tempat tinggal saat ini...'
        />

        <PatientLineTextarea
          id='maternity-ktp-address'
          label='Alamat Sesuai KTP'
          value={intake?.identityCardAddress}
          onChange={(val) => {
            onIntakeFieldChange('identityCardAddress', val);
            if (validationErrors?.identityCardAddress) {
              onClearError?.('identityCardAddress');
            }
          }}
          error={validationErrors?.identityCardAddress}
          invalid={Boolean(validationErrors?.identityCardAddress)}
          placeholder='Alamat KTP...'
        />
      </div>
    );
  }

  // Read mode
  return (
    <div className='space-y-4'>
      <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
        Identitas Calon Ibu
      </span>

      <PatientLineInput
        id='view-mother-name'
        label='Nama Lengkap Ibu'
        value={intake?.motherName || ''}
        readOnly
      />

      <div className='grid grid-cols-2 gap-4'>
        <PatientLineInput
          id='view-mother-nik'
          label='NIK Ibu (16 Digit)'
          value={intake?.motherNik || ''}
          isMonospace
          readOnly
        />
        <PatientLineInput
          id='view-mother-birthdate'
          label='Tanggal Lahir Ibu'
          value={intake?.motherBirthDate ? formatClinicDate(intake.motherBirthDate, { style: 'human_medium' }) : ''}
          readOnly
        />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <PatientLineInput
          id='view-phone-number'
          label='Nomor HP / WA'
          value={intake?.phoneNumber || ''}
          isMonospace
          readOnly
        />
        <PatientLineInput
          id='view-religion'
          label='Agama'
          value={intake?.religion || ''}
          readOnly
        />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <PatientLineInput
          id='view-mother-education'
          label='Pendidikan Terakhir'
          value={intake?.motherEducation || ''}
          readOnly
        />
        <PatientLineInput
          id='view-mother-job'
          label='Pekerjaan'
          value={intake?.motherJob || ''}
          readOnly
        />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <PatientLineInput
          id='view-marriage-order'
          label='Pernikahan Ke-'
          value={intake?.marriageOrder ? String(intake.marriageOrder) : ''}
          readOnly
        />
        <PatientLineInput
          id='view-marriage-date'
          label='Tanggal Pernikahan'
          value={intake?.marriageDate ? formatClinicDate(intake.marriageDate, { style: 'human_medium' }) : ''}
          readOnly
        />
      </div>

      <PatientLineTextarea
        id='view-domicile-address'
        label='Alamat Domisili Tempat Tinggal'
        value={intake?.domicileAddress || ''}
        readOnly
      />

      <PatientLineTextarea
        id='view-ktp-address'
        label='Alamat Sesuai KTP'
        value={intake?.identityCardAddress || ''}
        readOnly
      />
    </div>
  );
}
