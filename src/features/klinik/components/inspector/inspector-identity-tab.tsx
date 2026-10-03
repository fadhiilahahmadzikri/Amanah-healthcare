'use client';

import * as React from 'react';
import type { InspectorTabProps } from './types';

export function InspectorIdentityTab({ appointment, data }: InspectorTabProps) {
  const { answers, automatic, maternal, patient } = data;

  const motherName =
    maternal?.motherName ||
    answers.motherName ||
    patient?.fullName ||
    appointment.patient_name ||
    '-';

  const motherNik =
    maternal?.motherNik ||
    answers.motherNik ||
    patient?.nik ||
    '-';

  const birthPlace = answers.motherBirthPlace || patient?.birthPlace || '';
  const birthDate = maternal?.motherBirthDate || answers.motherBirthDate || patient?.birthDate || '';
  const motherBirth =
    birthPlace && birthDate ? `${birthPlace}, ${birthDate}` : birthPlace || birthDate || '-';
  const motherAge = maternal?.motherAge
    ? `${maternal.motherAge} Tahun`
    : answers.motherAge
      ? `${answers.motherAge} Tahun`
      : '-';

  const motherBloodType =
    maternal?.motherBloodType ||
    answers.motherBloodType ||
    patient?.bloodType ||
    '-';

  const tetanusStatus = maternal?.tetanusStatus || answers.tetanusStatus || '-';

  const gestationalAge =
    maternal?.gestationalAgeFormatted ||
    automatic.gestationalAgeAtSubmit ||
    answers.gestationalAge ||
    '-';

  const hpht = maternal?.hpht || answers.hpht || '-';
  const hpl =
    maternal?.estimatedDueDate ||
    automatic.estimatedDueDate ||
    answers.estimatedDueDate ||
    '-';

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

  const bmi =
    maternal?.initialBmi ||
    automatic.imtAtSubmit ||
    answers.initialBmi ||
    '-';

  const hasHealthInsurance = answers.hasHealthInsurance || '-';
  const healthInsuranceNumber = answers.healthInsuranceNumber || '-';

  return (
    <div className='grid grid-cols-2 gap-y-3 gap-x-5'>
      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Nama Lengkap Ibu
        </span>
        <span className='text-sm font-semibold text-foreground block truncate'>
          {motherName}
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          NIK Ibu Hamil
        </span>
        <span className='text-sm font-semibold font-mono text-foreground block truncate'>
          {motherNik}
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Tempat, Tanggal Lahir / Usia
        </span>
        <span className='text-sm font-semibold text-foreground block truncate'>
          {motherBirth} ({motherAge})
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Golongan Darah / Status TT
        </span>
        <span className='text-sm font-semibold text-foreground block truncate'>
          {motherBloodType} / {tetanusStatus}
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Usia Kehamilan
        </span>
        <span className='text-sm font-bold font-mono text-primary block truncate'>
          {gestationalAge}
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Indeks Massa Tubuh (IMT) Awal
        </span>
        <span className='text-sm font-bold font-mono text-primary block truncate'>
          {bmi}
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          HPHT (Haid Terakhir)
        </span>
        <span className='text-sm font-semibold font-mono text-foreground block truncate'>
          {hpht}
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          HPL (Taksiran Persalinan)
        </span>
        <span className='text-sm font-semibold font-mono text-foreground block truncate'>
          {hpl}
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Tinggi / Berat Badan Awal
        </span>
        <span className='text-sm font-semibold text-foreground block truncate'>
          {height} / {weight}
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Lingkar Lengan Atas (LiLA)
        </span>
        <span className='text-sm font-semibold text-foreground block truncate'>
          {arm}
        </span>
      </div>

      <div className='col-span-2 border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Jaminan Kesehatan
        </span>
        <span className='text-sm font-semibold text-foreground block truncate'>
          {hasHealthInsurance} {healthInsuranceNumber !== '-' ? `(No: ${healthInsuranceNumber})` : ''}
        </span>
      </div>
    </div>
  );
}
