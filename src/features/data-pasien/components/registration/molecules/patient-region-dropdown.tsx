'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { PatientLineInput } from '../atoms/patient-line-input';
import { PatientLineTextarea } from '../atoms/patient-line-textarea';
import { PatientSearchableSelect } from './patient-searchable-select';
import { usePatientRegionCascader } from '@/features/data-pasien/model/usePatientRegionCascader';

export function CountryBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-primary',
        className
      )}
    >
      <svg
        className='h-3 w-4 shrink-0 overflow-hidden rounded-[2px] border border-slate-300 shadow-xs'
        viewBox='0 0 3 2'
      >
        <rect width='3' height='1' fill='#E70011' />
        <rect y='1' width='3' height='1' fill='#FFFFFF' />
      </svg>
      <strong className='font-semibold'>Indonesia</strong>
    </div>
  );
}

export interface PatientRegionValues {
  provinceName: string;
  provinceCode: string;
  regencyName: string;
  regencyCode: string;
  districtName: string;
  districtCode: string;
  villageName: string;
  villageCode: string;
  line1: string;
}

export interface PatientRegionDropdownProps {
  values: PatientRegionValues;
  onChange: (updates: Partial<PatientRegionValues>) => void;
  errors?: Partial<Record<keyof PatientRegionValues, string>>;
  className?: string;
  showCountryBadge?: boolean;
}

export function PatientRegionDropdown({
  values,
  onChange,
  errors,
  className,
  showCountryBadge = false
}: PatientRegionDropdownProps) {
  const {
    provinces,
    regencies,
    districts,
    villages,
    loading,
    selectProvince,
    selectRegency,
    selectDistrict,
    selectVillage
  } = usePatientRegionCascader({ values, onChange });

  return (
    <div data-slot='patient-region-dropdown' className={cn('space-y-4', className)}>
      {showCountryBadge ? (
        <div className='flex justify-end'>
          <CountryBadge />
        </div>
      ) : null}

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {/* PROVINSI (Span 2) */}
        <div className='col-span-1 sm:col-span-2'>
          <PatientSearchableSelect
            id='province'
            label='Provinsi'
            value={values.provinceName}
            placeholder='Pilih provinsi...'
            options={provinces}
            isLoading={loading.provinces}
            error={errors?.provinceName}
            onSelect={selectProvince}
            searchPlaceholder='Cari provinsi...'
            required
          />
        </div>

        {/* KOTA / KABUPATEN (Span 2) */}
        <div className='col-span-1 sm:col-span-2'>
          <PatientSearchableSelect
            id='regency'
            label='Kota / kabupaten'
            value={values.regencyName}
            placeholder={
              values.provinceCode
                ? 'Pilih kota / kabupaten...'
                : 'Pilih provinsi terlebih dahulu...'
            }
            disabled={!values.provinceCode}
            options={regencies}
            isLoading={loading.regencies}
            parentLabel='Provinsi'
            error={errors?.regencyName}
            onSelect={selectRegency}
            searchPlaceholder='Cari kota / kabupaten...'
            required
          />
        </div>

        {/* KECAMATAN */}
        <PatientSearchableSelect
          id='district'
          label='Kecamatan'
          value={values.districtName}
          placeholder={values.regencyCode ? 'Pilih kecamatan...' : 'Pilih kota...'}
          disabled={!values.regencyCode}
          options={districts}
          isLoading={loading.districts}
          parentLabel='Kota / kabupaten'
          error={errors?.districtName}
          onSelect={selectDistrict}
          searchPlaceholder='Cari kecamatan...'
          required
        />

        {/* KELURAHAN */}
        <PatientSearchableSelect
          id='village'
          label='Kelurahan / desa'
          value={values.villageName}
          placeholder={values.districtCode ? 'Pilih kelurahan...' : 'Pilih kecamatan...'}
          disabled={!values.districtCode}
          options={villages}
          isLoading={loading.villages}
          parentLabel='Kecamatan'
          error={errors?.villageName}
          onSelect={selectVillage}
          searchPlaceholder='Cari kelurahan...'
          required
        />

        {/* ALAMAT DETAIL (Span 2) */}
        <div className='col-span-1 sm:col-span-2'>
          <PatientLineTextarea
            id='line1'
            label='Alamat detail (jalan, RT/RW, no. rumah)'
            value={values.line1}
            placeholder='contoh: jl. mawar no. 12 rt 04/rw 02'
            error={errors?.line1}
            onChange={(val) => onChange({ line1: val })}
          />
        </div>
      </div>
    </div>
  );
}
