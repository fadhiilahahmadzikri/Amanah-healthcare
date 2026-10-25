'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { PatientLineInput } from '../atoms/patient-line-input';
import { PatientSearchableSelect } from './patient-searchable-select';
import { usePatientRegionCascader } from '@/features/data-pasien/model/usePatientRegionCascader';

export interface PatientRegionValues {
  provinsi: string;
  provinsiId: string;
  kabupaten: string;
  kabupatenId: string;
  kecamatan: string;
  kecamatanId: string;
  kelurahan: string;
  kelurahanId: string;
  alamatDetail: string;
}

export interface PatientRegionDropdownProps {
  values: PatientRegionValues;
  onChange: (updates: Partial<PatientRegionValues>) => void;
  errors?: Partial<Record<keyof PatientRegionValues, string>>;
  className?: string;
}

export function PatientRegionDropdown({
  values,
  onChange,
  errors,
  className
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
      {/* Country pill badge matching POC */}
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

      {/* PROVINSI */}
      <PatientSearchableSelect
        id='provinsi'
        label='Provinsi'
        value={values.provinsi}
        placeholder='Pilih provinsi...'
        options={provinces}
        isLoading={loading.provinces}
        error={errors?.provinsi}
        onSelect={selectProvince}
        searchPlaceholder='Cari provinsi...'
        required
      />

      {/* KOTA / KABUPATEN */}
      <PatientSearchableSelect
        id='kabupaten'
        label='Kota / kabupaten'
        value={values.kabupaten}
        placeholder={
          values.provinsiId ? 'Pilih kota / kabupaten...' : 'Pilih provinsi terlebih dahulu...'
        }
        disabled={!values.provinsiId}
        options={regencies}
        isLoading={loading.regencies}
        parentLabel='Provinsi'
        error={errors?.kabupaten}
        onSelect={selectRegency}
        searchPlaceholder='Cari kota / kabupaten...'
        required
      />

      {/* KECAMATAN & KELURAHAN (Vertical on Mobile, 2 columns on Desktop) */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <PatientSearchableSelect
          id='kecamatan'
          label='Kecamatan'
          value={values.kecamatan}
          placeholder={values.kabupatenId ? 'Pilih kecamatan...' : 'Pilih kota...'}
          disabled={!values.kabupatenId}
          options={districts}
          isLoading={loading.districts}
          parentLabel='Kota / kabupaten'
          error={errors?.kecamatan}
          onSelect={selectDistrict}
          searchPlaceholder='Cari kecamatan...'
          required
        />

        <PatientSearchableSelect
          id='kelurahan'
          label='Kelurahan / desa'
          value={values.kelurahan}
          placeholder={values.kecamatanId ? 'Pilih kelurahan...' : 'Pilih kecamatan...'}
          disabled={!values.kecamatanId}
          options={villages}
          isLoading={loading.villages}
          parentLabel='Kecamatan'
          error={errors?.kelurahan}
          onSelect={selectVillage}
          searchPlaceholder='Cari kelurahan...'
          required
        />
      </div>

      {/* ALAMAT DETAIL */}
      <PatientLineInput
        id='alamatDetail'
        label='Alamat detail (jalan, RT/RW, no. rumah)'
        value={values.alamatDetail}
        placeholder='contoh: jl. mawar no. 12 rt 04/rw 02'
        error={errors?.alamatDetail}
        autoComplete='street-address'
        onChange={(val) => onChange({ alamatDetail: val })}
      />
    </div>
  );
}
