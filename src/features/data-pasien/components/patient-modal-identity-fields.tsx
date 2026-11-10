'use client';

import React from 'react';
import { Icons } from '@/components/icons';
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
  bloodTypes
}: PatientModalIdentityFieldsProps) {
  const [showNik, setShowNik] = React.useState(false);
  const [countdown, setCountdown] = React.useState<number | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const clearTimers = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCountdown(null);
  }, []);

  React.useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const toggleShowNik = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (showNik) {
      setShowNik(false);
      clearTimers();
    } else {
      setShowNik(true);
      clearTimers();
      setCountdown(15);
      intervalRef.current = setInterval(() => {
        setCountdown((prev) => (prev === null || prev <= 1 ? 0 : prev - 1));
      }, 1000);
      timerRef.current = setTimeout(() => {
        setShowNik(false);
        clearTimers();
      }, 15000);
    }
  };

  return (
    <div className='space-y-4'>
      <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
        Identitas & Kelahiran
      </span>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
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
            const error =
              field.state.meta.isTouched || field.state.meta.isDirty
                ? getErrorMessage(field.state.meta.errors)
                : undefined;
            return (
              <PatientLineInput
                id='nik'
                label='NIK KTP (16 Digit)'
                placeholder='3201xxxxxxxxxxxx'
                type='text'
                isMasked={!showNik}
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
                trailingIcon={
                  <div className='flex items-center gap-1 shrink-0'>
                    {showNik && countdown !== null && countdown > 0 && (
                      <span
                        className='text-[10px] font-mono px-1 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium select-none'
                        title={`NIK akan otomatis disensor dalam ${countdown} detik`}
                      >
                        {countdown}s
                      </span>
                    )}
                    <button
                      type='button'
                      onClick={toggleShowNik}
                      className='text-muted-foreground hover:text-foreground transition-colors p-1'
                      title={showNik ? 'Sembunyikan NIK' : 'Tampilkan NIK (Otomatis disensor setelah 15s)'}
                      aria-label={showNik ? 'Sembunyikan NIK' : 'Tampilkan NIK (Otomatis disensor setelah 15s)'}
                      tabIndex={-1}
                    >
                      {showNik ? (
                        <Icons.eyeOff className='size-4 text-primary' />
                      ) : (
                        <Icons.eye className='size-4' />
                      )}
                    </button>
                  </div>
                }
              />
            );
          }}
        </form.AppField>
      </div>

      <form.AppField name='name'>
        {(field: any) => {
          const error =
            field.state.meta.isTouched || field.state.meta.isDirty
              ? getErrorMessage(field.state.meta.errors)
              : undefined;
          return (
            <PatientLineInput
              id='name'
              label={
                <span>
                  Nama Lengkap Pasien <span className='text-destructive font-bold'>*</span>
                </span>
              }
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

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
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

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
        <form.AppField name='birth_date'>
          {(field: any) => {
            const error =
              field.state.meta.isTouched || field.state.meta.isDirty
                ? getErrorMessage(field.state.meta.errors)
                : undefined;
            return (
              <PatientBirthdatePicker
                id='birth_date'
                label={
                  <span>
                    Tanggal Lahir <span className='text-destructive font-bold'>*</span>
                  </span>
                }
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
                    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
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
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
        <form.AppField name='gender'>
          {(field: any) => {
            const error =
              field.state.meta.isTouched || field.state.meta.isDirty
                ? getErrorMessage(field.state.meta.errors)
                : undefined;
            return (
              <PatientGenderSelector
                id='patient_gender'
                label={
                  <span>
                    Jenis Kelamin <span className='text-destructive font-bold'>*</span>
                  </span>
                }
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
            const error =
              field.state.meta.isTouched || field.state.meta.isDirty
                ? getErrorMessage(field.state.meta.errors)
                : undefined;
            return (
              <PatientBloodTypeSelector
                id='patient_blood_type'
                label={
                  <span>
                    Golongan Darah <span className='text-destructive font-bold'>*</span>
                  </span>
                }
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
