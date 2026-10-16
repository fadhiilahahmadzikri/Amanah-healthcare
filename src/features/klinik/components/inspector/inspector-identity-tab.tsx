'use client';

import * as React from 'react';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import type { InspectorTabProps } from './types';

export function InspectorIdentityTab({ appointment, data }: InspectorTabProps) {
  const { answers, automatic, maternal, patient } = data;

  const motherName =
    maternal?.motherName ||
    answers.motherName ||
    patient?.fullName ||
    appointment.patient_name ||
    '-';

  const motherNik = maternal?.motherNik || answers.motherNik || patient?.nik || '-';

  const birthPlace = answers.motherBirthPlace || patient?.birthPlace || '-';
  const birthDate =
    maternal?.motherBirthDate || answers.motherBirthDate || patient?.birthDate || '-';
  const motherAge = maternal?.motherAge
    ? `${maternal.motherAge} Tahun`
    : answers.motherAge
      ? `${answers.motherAge} Tahun`
      : '-';

  const motherBloodType =
    maternal?.motherBloodType || answers.motherBloodType || patient?.bloodType || '-';

  const tetanusStatus = maternal?.tetanusStatus || answers.tetanusStatus || '-';

  const gestationalAge =
    maternal?.gestationalAgeFormatted ||
    automatic.gestationalAgeAtSubmit ||
    answers.gestationalAge ||
    '-';

  const hpht = maternal?.hpht || answers.hpht || '-';
  const hpl =
    maternal?.estimatedDueDate || automatic.estimatedDueDate || answers.estimatedDueDate || '-';

  const height = maternal?.heightCm
    ? `${maternal.heightCm} cm`
    : answers.heightCm
      ? `${answers.heightCm} cm`
      : '-';

  const weight = maternal?.prePregnancyWeightKg
    ? `${maternal.prePregnancyWeightKg} kg`
    : answers.prePregnancyWeightKg
      ? `${answers.prePregnancyWeightKg} kg`
      : '-';

  const arm = maternal?.upperArmCircumferenceCm
    ? `${maternal.upperArmCircumferenceCm} cm`
    : answers.upperArmCircumferenceCm
      ? `${answers.upperArmCircumferenceCm} cm`
      : '-';

  const bmi = maternal?.initialBmi || automatic.imtAtSubmit || answers.initialBmi || '-';

  const hasHealthInsurance = answers.hasHealthInsurance || '-';
  const healthInsuranceNumber = answers.healthInsuranceNumber || '-';
  const bpjsDisplay =
    healthInsuranceNumber !== '-'
      ? `${hasHealthInsurance} (No: ${healthInsuranceNumber})`
      : hasHealthInsurance;

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1 pointer-events-none select-text'>
      {/* Kolom 1: Identitas & Biodata Ibu */}
      <div className='space-y-4'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
          Identitas & Biodata Ibu
        </span>

        <PatientLineInput
          id='identity-mother-name'
          label='Nama Lengkap Ibu'
          value={motherName}
          readOnly
        />

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='identity-mother-nik'
            label='NIK Ibu Hamil'
            value={motherNik}
            isMonospace
            readOnly
          />
          <PatientLineInput
            id='identity-mother-blood'
            label='Golongan Darah'
            value={motherBloodType}
            readOnly
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='identity-mother-birthplace'
            label='Tempat Lahir'
            value={birthPlace}
            readOnly
          />
          <PatientLineInput
            id='identity-mother-birthdate'
            label='Tanggal Lahir'
            value={birthDate}
            isMonospace
            readOnly
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput id='identity-mother-age' label='Usia Ibu' value={motherAge} readOnly />
          <PatientLineInput
            id='identity-mother-tetanus'
            label='Status Imunisasi TT'
            value={tetanusStatus}
            readOnly
          />
        </div>

        <PatientLineInput
          id='identity-mother-bpjs'
          label='Jaminan Kesehatan / BPJS'
          value={bpjsDisplay}
          readOnly
        />
      </div>

      {/* Kolom 2: Parameter Klinis & Masa Kehamilan */}
      <div className='space-y-4'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
          Parameter Klinis & Masa Kehamilan
        </span>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='identity-gestational-age'
            label='Usia Kehamilan'
            value={gestationalAge}
            readOnly
          />
          <PatientLineInput
            id='identity-initial-bmi'
            label='IMT Awal Kehamilan'
            value={String(bmi)}
            readOnly
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='identity-hpht'
            label='HPHT (Haid Terakhir)'
            value={hpht}
            isMonospace
            readOnly
          />
          <PatientLineInput
            id='identity-hpl'
            label='HPL (Taksiran Persalinan)'
            value={hpl}
            isMonospace
            readOnly
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='identity-mother-height'
            label='Tinggi Badan (TB)'
            value={height}
            readOnly
          />
          <PatientLineInput
            id='identity-mother-weight'
            label='Berat Badan Pra-Hamil'
            value={weight}
            readOnly
          />
        </div>

        <PatientLineInput
          id='identity-mother-lila'
          label='Lingkar Lengan Atas (LiLA)'
          value={arm}
          readOnly
        />
      </div>
    </div>
  );
}
