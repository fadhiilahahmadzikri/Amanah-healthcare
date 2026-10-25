'use client';

import * as React from 'react';
import type { PatientRegistrationFormValues } from '../../schemas/patient-registration-schema';
import { PatientLineInput } from './atoms/patient-line-input';
import { PatientBirthdatePicker } from './molecules/patient-birthdate-picker';
import { PatientGenderSelector } from './molecules/patient-gender-selector';
import { PatientBloodTypeSelector } from './molecules/patient-blood-type-selector';
import {
  PatientRegionDropdown,
  type PatientRegionValues
} from './molecules/patient-region-dropdown';
import { PatientRegistrationSummary } from './patient-registration-summary';
import type { PatientRegistrationFormController } from './use-patient-registration-form';

export interface PatientRegistrationStepFieldsProps {
  controller: PatientRegistrationFormController;
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

export function PatientRegistrationStepFields({ controller }: PatientRegistrationStepFieldsProps) {
  const { form, currentStep } = controller;

  // STEP 1: NAMA LENGKAP
  if (currentStep === 1) {
    return (
      <form.AppField name='name'>
        {(field) => {
          const error = field.state.meta.isTouched
            ? getErrorMessage(field.state.meta.errors)
            : undefined;
          return (
            <PatientLineInput
              id='nama'
              label='nama lengkap'
              placeholder='contoh: budi santoso'
              value={field.state.value}
              onChange={(val) => field.handleChange(val)}
              onBlur={field.handleBlur}
              error={error}
              autoComplete='name'
            />
          );
        }}
      </form.AppField>
    );
  }

  // STEP 2: NIK KTP (16 DIGIT)
  if (currentStep === 2) {
    return (
      <form.AppField name='nik'>
        {(field) => {
          const error = field.state.meta.isTouched
            ? getErrorMessage(field.state.meta.errors)
            : undefined;
          return (
            <PatientLineInput
              id='nik'
              label='nik ktp (16 digit)'
              placeholder='3271012345670001'
              value={field.state.value}
              onChange={(val) => {
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
    );
  }

  // STEP 3: NAMA IBU KANDUNG
  if (currentStep === 3) {
    return (
      <form.AppField name='nama_ibu_kandung'>
        {(field) => {
          const error = field.state.meta.isTouched
            ? getErrorMessage(field.state.meta.errors)
            : undefined;
          return (
            <PatientLineInput
              id='namaIbuKandung'
              label='nama ibu kandung'
              placeholder='contoh: siti aminah'
              value={field.state.value}
              onChange={(val) => field.handleChange(val)}
              onBlur={field.handleBlur}
              error={error}
              autoComplete='off'
            />
          );
        }}
      </form.AppField>
    );
  }

  // STEP 4: TEMPAT & TANGGAL LAHIR
  if (currentStep === 4) {
    return (
      <div className='space-y-5'>
        <form.AppField name='tempat_lahir'>
          {(field) => {
            const error = field.state.meta.isTouched
              ? getErrorMessage(field.state.meta.errors)
              : undefined;
            return (
              <PatientLineInput
                id='tempatLahir'
                label='tempat lahir (sesuai KTP)'
                placeholder='contoh: jakarta'
                value={field.state.value}
                onChange={(val) => field.handleChange(val)}
                onBlur={field.handleBlur}
                error={error}
                autoComplete='off'
              />
            );
          }}
        </form.AppField>

        <form.AppField name='birth_date'>
          {(field) => {
            const error = field.state.meta.isTouched
              ? getErrorMessage(field.state.meta.errors)
              : undefined;
            return (
              <PatientBirthdatePicker
                value={field.state.value}
                onChange={(iso) => {
                  field.handleChange(iso);
                  field.handleBlur();
                }}
                error={error}
              />
            );
          }}
        </form.AppField>
      </div>
    );
  }

  // STEP 5: JENIS KELAMIN
  if (currentStep === 5) {
    return (
      <form.AppField name='gender'>
        {(field) => {
          const error = field.state.meta.isTouched
            ? getErrorMessage(field.state.meta.errors)
            : undefined;
          return (
            <PatientGenderSelector
              value={field.state.value}
              onChange={(val) => {
                field.handleChange(val as PatientRegistrationFormValues['gender']);
                field.handleBlur();
              }}
              error={error}
            />
          );
        }}
      </form.AppField>
    );
  }

  // STEP 6: GOLONGAN DARAH
  if (currentStep === 6) {
    return (
      <form.AppField name='blood_type'>
        {(field) => {
          const error = field.state.meta.isTouched
            ? getErrorMessage(field.state.meta.errors)
            : undefined;
          return (
            <PatientBloodTypeSelector
              id='registration_blood_type'
              label='Golongan Darah'
              required
              placeholder='Pilih golongan darah...'
              value={field.state.value}
              onChange={(val) => {
                field.handleChange(val as PatientRegistrationFormValues['blood_type']);
                field.handleBlur();
              }}
              error={error}
            />
          );
        }}
      </form.AppField>
    );
  }

  // STEP 7: DOMISILI
  if (currentStep === 7) {
    return (
      <form.Subscribe selector={(state) => state.values}>
        {(values) => {
          const regionValues: PatientRegionValues = {
            provinceName: values.provinsi,
            provinceCode: values.provinsi_id,
            regencyName: values.kabupaten,
            regencyCode: values.kabupaten_id,
            districtName: values.kecamatan,
            districtCode: values.kecamatan_id,
            villageName: values.kelurahan,
            villageCode: values.kelurahan_id,
            line1: values.alamat_detail
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
                if (updates.line1 !== undefined) form.setFieldValue('alamat_detail', updates.line1);
              }}
            />
          );
        }}
      </form.Subscribe>
    );
  }

  // STEP 8: PEKERJAAN
  if (currentStep === 8) {
    return (
      <form.AppField name='pekerjaan'>
        {(field) => {
          const error = field.state.meta.isTouched
            ? getErrorMessage(field.state.meta.errors)
            : undefined;
          return (
            <PatientLineInput
              id='pekerjaan'
              label='pekerjaan'
              placeholder='contoh: karyawan swasta / mahasiswa'
              value={field.state.value}
              onChange={(val) => field.handleChange(val)}
              onBlur={field.handleBlur}
              error={error}
              autoComplete='off'
            />
          );
        }}
      </form.AppField>
    );
  }

  // STEP 9: RINGKASAN
  return (
    <form.Subscribe selector={(state) => state.values}>
      {(values) => <PatientRegistrationSummary values={values as PatientRegistrationFormValues} />}
    </form.Subscribe>
  );
}
