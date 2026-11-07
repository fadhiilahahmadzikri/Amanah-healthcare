'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { MaskedNik } from '@/components/ui/masked-nik';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineSelect } from '@/features/data-pasien/components/registration/atoms/patient-line-select';
import { PatientLineTextarea } from '@/features/data-pasien/components/registration/atoms/patient-line-textarea';
import {
  PatientRegionDropdown,
  type PatientRegionValues
} from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';
import { formatClinicDate } from '@/lib/date-format';
import type { MaternityIntake } from '../../../types/maternity.types';

export interface MaternityMotherIdentityFieldsProps {
  intake?: MaternityIntake | null;
  isEditing?: boolean;
  onIntakeFieldChange?: (field: keyof MaternityIntake, value: any) => void;
  regionValues?: PatientRegionValues;
  onRegionChange?: (updates: Partial<PatientRegionValues>) => void;
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
  regionValues,
  onRegionChange,
  validationErrors,
  onClearError,
  religionOptions,
  educationOptions,
  occupationOptions
}: MaternityMotherIdentityFieldsProps) {
  const [showNik, setShowNik] = React.useState(false);
  const resolvedRegionValues: PatientRegionValues = React.useMemo(
    () => ({
      provinceName: regionValues?.provinceName || intake?.provinceName || '',
      provinceCode: regionValues?.provinceCode || intake?.provinceCode || '',
      regencyName: regionValues?.regencyName || intake?.regencyName || '',
      regencyCode: regionValues?.regencyCode || intake?.regencyCode || '',
      districtName: regionValues?.districtName || intake?.districtName || '',
      districtCode: regionValues?.districtCode || intake?.districtCode || '',
      villageName: regionValues?.villageName || intake?.villageName || '',
      villageCode: regionValues?.villageCode || intake?.villageCode || '',
      line1: regionValues?.line1 || intake?.line1 || intake?.domicileAddress || ''
    }),
    [regionValues, intake]
  );
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
            isMasked={!showNik}
            trailingIcon={
              <button
                type='button'
                onClick={() => setShowNik((prev) => !prev)}
                className='text-muted-foreground hover:text-foreground transition-colors p-1'
                title={showNik ? 'Sembunyikan NIK' : 'Tampilkan NIK'}
                tabIndex={-1}
              >
                {showNik ? (
                  <Icons.eyeOff className='size-4 text-primary' />
                ) : (
                  <Icons.eye className='size-4 text-muted-foreground' />
                )}
              </button>
            }
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

        <div className='col-span-1 sm:col-span-2 space-y-2 pt-2 pb-1 border-t border-border/30'>
          <span className='text-xs font-semibold text-muted-foreground block uppercase tracking-wider'>
            Alamat Domisili Tempat Tinggal
          </span>
          <PatientRegionDropdown
            values={resolvedRegionValues}
            onChange={(updates) => {
              if (onRegionChange) {
                onRegionChange(updates);
              } else {
                Object.entries(updates).forEach(([k, v]) => {
                  onIntakeFieldChange(k as keyof MaternityIntake, v);
                });
                const merged = { ...resolvedRegionValues, ...updates };
                const parts = [
                  merged.line1,
                  merged.villageName ? `Kel. ${merged.villageName}` : '',
                  merged.districtName ? `Kec. ${merged.districtName}` : '',
                  merged.regencyName,
                  merged.provinceName ? `Prov. ${merged.provinceName}` : ''
                ].filter(Boolean);
                onIntakeFieldChange('domicileAddress', parts.join(', '));
              }
              if (validationErrors?.domicileAddress) {
                onClearError?.('domicileAddress');
              }
            }}
          />
        </div>

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
        <div className='space-y-1'>
          <span className='text-[11px] font-medium text-muted-foreground block'>
            NIK Ibu (16 Digit)
          </span>
          <MaskedNik
            nik={intake?.motherNik}
            patientId={intake?.patientId}
            allowUnmask={true}
          />
        </div>
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

      <div className='col-span-1 sm:col-span-2 space-y-3 pt-2 border-t border-border/40'>
        <div className='flex items-center justify-between'>
          <span className='text-xs font-semibold text-muted-foreground block uppercase tracking-wider'>
            Alamat Domisili Tempat Tinggal
          </span>
          {resolvedRegionValues.villageCode && (
            <span className='rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-normal text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'>
              Terverifikasi
            </span>
          )}
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='col-span-1 sm:col-span-2'>
            <PatientLineInput
              id='read-mother-province'
              label='Provinsi'
              value={resolvedRegionValues.provinceName || ''}
              readOnly
            />
          </div>
          <div className='col-span-1 sm:col-span-2'>
            <PatientLineInput
              id='read-mother-regency'
              label='Kota / Kabupaten'
              value={resolvedRegionValues.regencyName || ''}
              readOnly
            />
          </div>
          <PatientLineInput
            id='read-mother-district'
            label='Kecamatan'
            value={resolvedRegionValues.districtName || ''}
            readOnly
          />
          <PatientLineInput
            id='read-mother-village'
            label='Kelurahan / Desa'
            value={resolvedRegionValues.villageName || ''}
            readOnly
          />
          <div className='col-span-1 sm:col-span-2'>
            <PatientLineTextarea
              id='read-mother-line1'
              label='Alamat Detail (Jalan, RT/RW, No. Rumah)'
              value={resolvedRegionValues.line1 || intake?.domicileAddress || ''}
              readOnly
            />
          </div>
        </div>
      </div>

      <PatientLineTextarea
        id='view-ktp-address'
        label='Alamat Sesuai KTP'
        value={intake?.identityCardAddress || ''}
        readOnly
      />
    </div>
  );
}
