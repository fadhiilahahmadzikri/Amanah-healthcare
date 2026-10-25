'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { PatientLineInput } from './registration/atoms/patient-line-input';
import { Switch } from '@/components/ui/switch';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  PatientRegionDropdown,
  type PatientRegionValues
} from './registration/molecules/patient-region-dropdown';
import {
  PatientSearchableSelect,
  type PatientSearchableSelectOption
} from './registration/molecules/patient-searchable-select';

export interface PatientModalContactFieldsProps {
  form: any;
  occupationOptions: PatientSearchableSelectOption[];
}

function getErrorMessage(errors: unknown[]): string | undefined {
  if (!errors || errors.length === 0) return undefined;
  const first = errors[0];
  if (typeof first === 'string') return first;
  if (first && typeof first === 'object' && 'message' in first) {
    return String((first as { message: unknown }).message);
  }
  return undefined;
}

export function PatientModalContactFields({
  form,
  occupationOptions
}: PatientModalContactFieldsProps) {
  return (
    <div className='space-y-4'>
      <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
        Pekerjaan, Domisili & Kontak
      </span>

      {/* Pekerjaan */}
      <form.AppField name='pekerjaan'>
        {(field: any) => {
          const error = field.state.meta.isTouched
            ? getErrorMessage(field.state.meta.errors)
            : undefined;
          return (
            <PatientSearchableSelect
              id='pekerjaan'
              label='Pekerjaan'
              value={field.state.value ?? ''}
              placeholder='Pilih pekerjaan...'
              options={occupationOptions}
              onSelect={(item) => {
                field.handleChange(item.name);
                field.handleBlur();
              }}
              searchPlaceholder='Cari pekerjaan...'
              error={error}
            />
          );
        }}
      </form.AppField>

      {/* Domisili / Regional Cascader */}
      <div className='space-y-2 pt-1'>
        <span className='text-xs font-medium text-foreground block'>Domisili & Alamat</span>
        <form.Subscribe selector={(state: any) => state.values}>
          {(values: any) => {
            const regionValues: PatientRegionValues = {
              provinceName: values.provinsi ?? '',
              provinceCode: values.provinsi_id ?? '',
              regencyName: values.kabupaten ?? '',
              regencyCode: values.kabupaten_id ?? '',
              districtName: values.kecamatan ?? '',
              districtCode: values.kecamatan_id ?? '',
              villageName: values.kelurahan ?? '',
              villageCode: values.kelurahan_id ?? '',
              line1: values.alamat_detail ?? ''
            };

            return (
              <PatientRegionDropdown
                values={regionValues}
                onChange={(updates) => {
                  if (updates.provinceName !== undefined)
                    form.setFieldValue('provinsi', updates.provinceName);
                  if (updates.provinceCode !== undefined)
                    form.setFieldValue('provinsi_id', updates.provinceCode);
                  if (updates.regencyName !== undefined)
                    form.setFieldValue('kabupaten', updates.regencyName);
                  if (updates.regencyCode !== undefined)
                    form.setFieldValue('kabupaten_id', updates.regencyCode);
                  if (updates.districtName !== undefined)
                    form.setFieldValue('kecamatan', updates.districtName);
                  if (updates.districtCode !== undefined)
                    form.setFieldValue('kecamatan_id', updates.districtCode);
                  if (updates.villageName !== undefined)
                    form.setFieldValue('kelurahan', updates.villageName);
                  if (updates.villageCode !== undefined)
                    form.setFieldValue('kelurahan_id', updates.villageCode);
                  if (updates.line1 !== undefined) {
                    form.setFieldValue('alamat_detail', updates.line1);
                    form.setFieldValue('address', updates.line1);
                  }
                }}
              />
            );
          }}
        </form.Subscribe>
      </div>

      {/* Kontak: Telepon & Email */}
      <div className='grid grid-cols-2 gap-4'>
        <form.AppField name='phone'>
          {(field: any) => {
            const error = field.state.meta.isTouched
              ? getErrorMessage(field.state.meta.errors)
              : undefined;
            return (
              <PatientLineInput
                id='phone'
                label='No. Telepon / WhatsApp'
                type='tel'
                placeholder='0812-3456-7890'
                value={field.state.value ?? ''}
                onChange={(val: string) => field.handleChange(val)}
                onBlur={field.handleBlur}
                error={error}
                autoComplete='tel'
              />
            );
          }}
        </form.AppField>

        <form.AppField name='email'>
          {(field: any) => {
            const error = field.state.meta.isTouched
              ? getErrorMessage(field.state.meta.errors)
              : undefined;
            return (
              <PatientLineInput
                id='email'
                label='Email Pasien'
                type='email'
                placeholder='pasien@email.com'
                value={field.state.value ?? ''}
                onChange={(val: string) => field.handleChange(val)}
                onBlur={field.handleBlur}
                error={error}
                autoComplete='email'
              />
            );
          }}
        </form.AppField>
      </div>

      {/* Kontak Darurat */}
      <form.AppField name='emergency_contact'>
        {(field: any) => {
          const error = field.state.meta.isTouched
            ? getErrorMessage(field.state.meta.errors)
            : undefined;
          return (
            <PatientLineInput
              id='emergency_contact'
              label='Kontak Darurat (Nama & Nomor Kerabat)'
              placeholder='Contoh: Siti (Ibu) - 08123456789'
              value={field.state.value ?? ''}
              onChange={(val: string) => field.handleChange(val)}
              onBlur={field.handleBlur}
              error={error}
            />
          );
        }}
      </form.AppField>

      {/* Status Akun Pasien (Switch Minimalist Tanpa Wrap) */}
      <form.AppField name='account_status'>
        {(field: any) => {
          const isActive = field.state.value !== 'inactive';
          return (
            <div className='flex items-center justify-between pt-2 select-none'>
              <div className='space-y-0.5'>
                <label
                  htmlFor='account_status_switch'
                  className='text-xs font-medium text-foreground flex items-center gap-2 cursor-pointer'
                >
                  <span>Status Akun Pasien</span>
                  <StatusBadge status={isActive ? 'active' : 'inactive'} size='sm' />
                </label>
                <p className='text-[11px] text-muted-foreground'>
                  {isActive
                    ? 'Akun aktif untuk janji temu dan pelayanan klinik.'
                    : 'Akun dinonaktifkan sementara dari sistem.'}
                </p>
              </div>
              <Switch
                id='account_status_switch'
                checked={isActive}
                onCheckedChange={(checked) => field.handleChange(checked ? 'active' : 'inactive')}
                aria-label='Status Akun Pasien'
              />
            </div>
          );
        }}
      </form.AppField>
    </div>
  );
}
