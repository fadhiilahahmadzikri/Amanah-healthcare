'use client';

import * as React from 'react';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineTextarea } from '@/features/data-pasien/components/registration/atoms/patient-line-textarea';
import {
  PatientRegionDropdown,
  type PatientRegionValues
} from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';
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
  const regionValues: PatientRegionValues = React.useMemo(
    () => ({
      provinceName: intake?.provinceName || '',
      provinceCode: intake?.provinceCode || '',
      regencyName: intake?.regencyName || '',
      regencyCode: intake?.regencyCode || '',
      districtName: intake?.districtName || '',
      districtCode: intake?.districtCode || '',
      villageName: intake?.villageName || '',
      villageCode: intake?.villageCode || '',
      line1: intake?.line1 || intake?.childAddress || ''
    }),
    [intake]
  );

  const handleRegionChange = React.useCallback(
    (updates: Partial<PatientRegionValues>) => {
      if (!onIntakeFieldChange) return;
      Object.entries(updates).forEach(([key, val]) => {
        onIntakeFieldChange(key as keyof ImmunizationIntakeRecord, val);
      });
      const merged = { ...regionValues, ...updates };
      const parts = [
        merged.line1,
        merged.villageName ? `Kel. ${merged.villageName}` : '',
        merged.districtName ? `Kec. ${merged.districtName}` : '',
        merged.regencyName,
        merged.provinceName ? `Prov. ${merged.provinceName}` : ''
      ].filter(Boolean);
      onIntakeFieldChange('childAddress', parts.join(', '));
      if (validationErrors?.childAddress) {
        onClearError?.('childAddress');
      }
    },
    [onIntakeFieldChange, regionValues, validationErrors?.childAddress, onClearError]
  );

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

        <div className='col-span-1 md:col-span-2 space-y-2 pt-2 pb-1 border-t border-border/30'>
          <span className='text-xs font-semibold text-muted-foreground block uppercase tracking-wider'>
            Alamat Domisili Pasien Anak
          </span>
          <PatientRegionDropdown values={regionValues} onChange={handleRegionChange} />
        </div>
      </div>
    );
  }

  // READ ONLY MODE
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1 select-text font-sans'>
      <div className='space-y-4 col-span-1 md:col-span-2'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40 uppercase tracking-wider'>
          Data Orang Tua / Wali
        </span>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
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
      </div>

      <div className='col-span-1 md:col-span-2 space-y-3 pt-2 pb-1 border-t border-border/30'>
        <div className='flex items-center justify-between pb-1'>
          <span className='text-xs font-semibold text-muted-foreground block uppercase tracking-wider'>
            Alamat Domisili Pasien Anak
          </span>
          <div className='inline-flex items-center gap-2 rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-primary'>
            <svg
              className='h-3 w-4 shrink-0 overflow-hidden rounded-[2px] border border-slate-300 shadow-xs'
              viewBox='0 0 3 2'
            >
              <rect width='3' height='1' fill='#E70011' />
              <rect y='1' width='3' height='1' fill='#FFFFFF' />
            </svg>
            <span>
              Negara: <strong className='font-semibold'>Indonesia</strong>
            </span>
            <span className='rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-normal text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'>
              Terverifikasi
            </span>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='col-span-1 sm:col-span-2'>
            <PatientLineInput
              id='read-child-province'
              label='Provinsi'
              value={regionValues.provinceName || '-'}
              readOnly
            />
          </div>
          <div className='col-span-1 sm:col-span-2'>
            <PatientLineInput
              id='read-child-regency'
              label='Kota / Kabupaten'
              value={regionValues.regencyName || '-'}
              readOnly
            />
          </div>
          <PatientLineInput
            id='read-child-district'
            label='Kecamatan'
            value={regionValues.districtName || '-'}
            readOnly
          />
          <PatientLineInput
            id='read-child-village'
            label='Kelurahan / Desa'
            value={regionValues.villageName || '-'}
            readOnly
          />
          <div className='col-span-1 sm:col-span-2'>
            <PatientLineTextarea
              id='read-child-line1'
              label='Alamat Detail (Jalan, RT/RW, No. Rumah)'
              value={regionValues.line1 || intake?.childAddress || '-'}
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}
