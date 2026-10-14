'use client';

import React from 'react';
import { PatientLineInput } from './registration/atoms/patient-line-input';
import { PatientBirthdatePicker } from './registration/molecules/patient-birthdate-picker';
import { PatientGenderSelector } from './registration/molecules/patient-gender-selector';
import { PatientBloodTypeSelector } from './registration/molecules/patient-blood-type-selector';
import type { PatientFormValues } from '../schemas/patient-schema';

export interface PatientModalIdentityFieldsProps {
  form: any;
  genders: Array<{ value: string; label: string }>;
  bloodTypes: Array<{ value: string; label: string }>;
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

export function PatientModalIdentityFields({
  form,
  genders,
  bloodTypes,
}: PatientModalIdentityFieldsProps) {
  return (
    <div className='space-y-4'>
      <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
        Identitas & Kelahiran
      </span>

      <div className='grid grid-cols-2 gap-4'>
        <form.AppField name='patient_id'>
          {(field: any) => (
            <PatientLineInput
              id='patient_id'
              label='No. Rekam Medis'
              placeholder='RM-2026-0001'
              value={field.state.value}
              onChange={() => {}}
              disabled
              isMonospace
            />
          )}
        </form.AppField>

        <form.AppField name='nik'>
          {(field: any) => {
            const error = field.state.meta.isTouched
              ? getErrorMessage(field.state.meta.errors)
              : undefined;
            return (
              <PatientLineInput
                id='nik'
                label='NIK KTP (16 Digit)'
                placeholder='3201xxxxxxxxxxxx'
                value={field.state.value ?? ''}
                onChange={(val: string) => {
                  const numericOnly = val.replace(/\D/g, '').slice(0, 16);
                  field.handleChange(numericOnly);
                }}
                onBlur={field.handleBlur}
                error={error}
                maxLength={16}
                inputMode='numeric'
                isMonospace
                autoComplete='off'
              />
            );
          }}
        </form.AppField>
      </div>

      <form.AppField name='name'>
        {(field: any) => {
          const error = field.state.meta.isTouched
            ? getErrorMessage(field.state.meta.errors)
            : undefined;
          return (
            <PatientLineInput
              id='name'
              label='Nama Lengkap Pasien'
              placeholder='Nama lengkap pasien sesuai KTP'
              value={field.state.value}
              onChange={(val: string) => field.handleChange(val)}
              onBlur={field.handleBlur}
              error={error}
              autoComplete='name'
            />
          );
        }}
      </form.AppField>

      <div className='grid grid-cols-2 gap-4'>
        <form.AppField name='nama_ibu_kandung'>
          {(field: any) => {
            const error = field.state.meta.isTouched
              ? getErrorMessage(field.state.meta.errors)
              : undefined;
            return (
              <PatientLineInput
                id='nama_ibu_kandung'
                label='Nama Ibu Kandung'
                placeholder='Nama ibu kandung'
                value={field.state.value ?? ''}
                onChange={(val: string) => field.handleChange(val)}
                onBlur={field.handleBlur}
                error={error}
                autoComplete='off'
              />
            );
          }}
        </form.AppField>

        <form.AppField name='tempat_lahir'>
          {(field: any) => {
            const error = field.state.meta.isTouched
              ? getErrorMessage(field.state.meta.errors)
              : undefined;
            return (
              <PatientLineInput
                id='tempat_lahir'
                label='Tempat Lahir (Sesuai KTP)'
                placeholder='Kota kelahiran'
                value={field.state.value ?? ''}
                onChange={(val: string) => field.handleChange(val)}
                onBlur={field.handleBlur}
                error={error}
                autoComplete='off'
              />
            );
          }}
        </form.AppField>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <form.AppField name='birth_date'>
          {(field: any) => {
            const error = field.state.meta.isTouched
              ? getErrorMessage(field.state.meta.errors)
              : undefined;
            return (
              <PatientBirthdatePicker
                id='birth_date'
                label='Tanggal Lahir'
                placeholder='Pilih tanggal lahir...'
                value={field.state.value}
                onChange={(iso: string) => {
                  field.handleChange(iso);
                  field.handleBlur();
                  if (iso) {
                    const birth = new Date(iso);
                    const now = new Date();
                    let calculatedAge = now.getFullYear() - birth.getFullYear();
                    const monthDiff = now.getMonth() - birth.getMonth();
                    if (
                      monthDiff < 0 ||
                      (monthDiff === 0 && now.getDate() < birth.getDate())
                    ) {
                      calculatedAge--;
                    }
                    if (!isNaN(calculatedAge) && calculatedAge >= 0) {
                      form.setFieldValue('age', calculatedAge);
                    }
                  }
                }}
                error={error}
              />
            );
          }}
        </form.AppField>

        <form.AppField name='age'>
          {(field: any) => (
            <PatientLineInput
              id='age'
              label='Usia (Tahun)'
              value={field.state.value !== undefined ? String(field.state.value) : ''}
              onChange={(val: string) => form.setFieldValue('age', Number(val) || 0)}
              type='number'
              placeholder='Otomatis dari tanggal lahir'
            />
          )}
        </form.AppField>
      </div>

      {/* Jenis Kelamin & Golongan Darah (Sejajar 2 Kolom) */}
      <div className='grid grid-cols-2 gap-4'>
        <form.AppField name='gender'>
          {(field: any) => {
            const error = field.state.meta.isTouched
              ? getErrorMessage(field.state.meta.errors)
              : undefined;
            return (
              <PatientGenderSelector
                id='patient_gender'
                label='Jenis Kelamin'
                required
                variant='dropdown'
                value={field.state.value}
                onChange={(val: string) => {
                  field.handleChange(val as PatientFormValues['gender']);
                  field.handleBlur();
                }}
                options={genders}
                error={error}
              />
            );
          }}
        </form.AppField>

        <form.AppField name='blood_type'>
          {(field: any) => {
            const error = field.state.meta.isTouched
              ? getErrorMessage(field.state.meta.errors)
              : undefined;
            return (
              <PatientBloodTypeSelector
                id='patient_blood_type'
                label='Golongan Darah'
                required
                placeholder='Pilih golongan darah...'
                value={field.state.value}
                onChange={(val: string) => {
                  field.handleChange(val);
                  field.handleBlur();
                }}
                options={bloodTypes}
                error={error}
              />
            );
          }}
        </form.AppField>
      </div>
    </div>
  );
}
