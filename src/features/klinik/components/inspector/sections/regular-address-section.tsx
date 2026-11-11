'use client';

import * as React from 'react';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineTextarea } from '@/features/data-pasien/components/registration/atoms/patient-line-textarea';
import {
  CountryBadge,
  PatientRegionDropdown,
  type PatientRegionValues
} from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';
import type { EditableRegularData, UnifiedInspectorData } from '../types';

export interface RegularAddressSectionProps {
  data: UnifiedInspectorData;
  isEditing?: boolean;
  regularFormData?: EditableRegularData;
  onRegularFieldChange?: (field: keyof EditableRegularData, val: any) => void;
}

export function RegularAddressSection({
  data,
  isEditing = false,
  regularFormData,
  onRegularFieldChange
}: RegularAddressSectionProps) {
  const { patient } = data;

  const regionValues: PatientRegionValues = React.useMemo(
    () => ({
      provinceName: regularFormData?.provinceName || patient?.provinceName || '',
      provinceCode: regularFormData?.provinceCode || patient?.provinceCode || '',
      regencyName: regularFormData?.regencyName || patient?.regencyName || '',
      regencyCode: regularFormData?.regencyCode || patient?.regencyCode || '',
      districtName: regularFormData?.districtName || patient?.districtName || '',
      districtCode: regularFormData?.districtCode || patient?.districtCode || '',
      villageName: regularFormData?.villageName || patient?.villageName || '',
      villageCode: regularFormData?.villageCode || patient?.villageCode || '',
      line1: regularFormData?.line1 ?? patient?.line1 ?? ''
    }),
    [regularFormData, patient]
  );

  const handleRegionChange = React.useCallback(
    (updates: Partial<PatientRegionValues>) => {
      if (!onRegularFieldChange) return;
      Object.entries(updates).forEach(([key, val]) => {
        onRegularFieldChange(key as keyof EditableRegularData, val);
      });
      const merged = { ...regionValues, ...updates };
      const parts = [
        merged.line1,
        merged.villageName ? `Kel. ${merged.villageName}` : '',
        merged.districtName ? `Kec. ${merged.districtName}` : '',
        merged.regencyName,
        merged.provinceName ? `Prov. ${merged.provinceName}` : ''
      ].filter(Boolean);
      onRegularFieldChange('address', parts.join(', '));
    },
    [onRegularFieldChange, regionValues]
  );

  return (
    <div className='rounded-2xl p-4 sm:p-5 bg-surface-subtle/80 dark:bg-muted/20 space-y-4 shadow-xs font-sans'>
      <div className='flex items-center justify-between pb-1 border-b border-border/40'>
        <span className='text-xs font-bold text-foreground block uppercase tracking-wider'>
          Alamat Domisili Pasien
        </span>
        <CountryBadge />
      </div>

      {isEditing && regularFormData && onRegularFieldChange ? (
        <div className='pt-1'>
          <PatientRegionDropdown values={regionValues} onChange={handleRegionChange} />
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 select-text pt-1'>
          <div className='col-span-1 sm:col-span-2'>
            <PatientLineInput
              id='read-province'
              label='Provinsi'
              value={regionValues.provinceName || ''}
              readOnly
            />
          </div>
          <div className='col-span-1 sm:col-span-2'>
            <PatientLineInput
              id='read-regency'
              label='Kota / Kabupaten'
              value={regionValues.regencyName || ''}
              readOnly
            />
          </div>
          <PatientLineInput
            id='read-district'
            label='Kecamatan'
            value={regionValues.districtName || ''}
            readOnly
          />
          <PatientLineInput
            id='read-village'
            label='Kelurahan / Desa'
            value={regionValues.villageName || ''}
            readOnly
          />
          <div className='col-span-1 sm:col-span-2'>
            <PatientLineTextarea
              id='read-line1'
              label='Alamat Detail (Jalan, RT/RW, No. Rumah)'
              value={regionValues.line1 || ''}
              readOnly
            />
          </div>
        </div>
      )}
    </div>
  );
}
