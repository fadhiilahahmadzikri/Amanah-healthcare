'use client';

import * as React from 'react';
import type { InspectorTabProps } from './types';

export function InspectorIdentityTab({ appointment, data }: InspectorTabProps) {
  const { answers, automatic, maternal } = data;

  const motherNik = answers.motherNik || '-';
  const birthPlace = answers.motherBirthPlace || '';
  const birthDate = answers.motherBirthDate || '';
  const motherBirth =
    birthPlace && birthDate ? `${birthPlace}, ${birthDate}` : birthPlace || birthDate || '-';
  const motherAge = answers.motherAge ? `${answers.motherAge} Tahun` : '-';
  const phoneNumber = answers.phoneNumber || '-';
  const motherJob = answers.motherJob || '-';
  const motherEducation = answers.motherEducation || '-';
  const motherBloodType = maternal?.motherBloodType || answers.motherBloodType || '-';
  const tetanusStatus = maternal?.tetanusStatus || answers.tetanusStatus || '-';
  const domicileAddress = answers.domicileAddress || '-';
  const hasHealthInsurance = answers.hasHealthInsurance || '-';
  const healthInsuranceNumber = answers.healthInsuranceNumber || '-';

  const partnerName = maternal?.husband?.fullName || answers.partnerName || '-';
  const partnerNik = maternal?.husband?.nik || answers.partnerNik || '-';
  const partnerAge = maternal?.husband?.age
    ? `${maternal.husband.age} Tahun`
    : answers.partnerAge
      ? `${answers.partnerAge} Tahun`
      : '-';
  const partnerJob = maternal?.husband?.job || answers.partnerJob || '-';
  const partnerEducation = maternal?.husband?.education || answers.partnerEducation || '-';
  const partnerBlood = maternal?.husband?.bloodType || answers.partnerBloodType || '-';

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

  const hpht = maternal?.hpht || answers.hpht || '-';
  const hpl =
    maternal?.estimatedDueDate || automatic.estimatedDueDate || answers.estimatedDueDate || '-';
  const gestationalAge =
    maternal?.gestationalAgeFormatted ||
    automatic.gestationalAgeAtSubmit ||
    answers.gestationalAge ||
    '-';

  return (
    <div className='grid grid-cols-2 gap-y-3 gap-x-5'>
      <div className='col-span-2 pt-1 border-b border-border/40 pb-1'>
        <span className='text-xs font-bold text-foreground'>Pengukuran Fisik & Kehamilan</span>
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
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>IMT Awal</span>
        <span className='text-sm font-bold font-mono text-primary block truncate'>{bmi}</span>
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
        <span className='text-sm font-semibold text-foreground block truncate'>{arm}</span>
      </div>

      <div className='col-span-2 pt-3 border-b border-border/40 pb-1'>
        <span className='text-xs font-bold text-foreground'>Identitas Ibu Hamil (Buku KIA)</span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>NIK Ibu</span>
        <span className='text-sm font-semibold font-mono text-foreground block truncate'>
          {motherNik}
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Tempat, Tgl Lahir / Usia
        </span>
        <span className='text-sm font-semibold text-foreground block truncate'>
          {motherBirth} ({motherAge})
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          No. WhatsApp / HP
        </span>
        <span className='text-sm font-semibold text-foreground block truncate'>{phoneNumber}</span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Pekerjaan / Pendidikan
        </span>
        <span className='text-sm font-semibold text-foreground block truncate'>
          {motherJob} / {motherEducation}
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Gol. Darah / Status TT
        </span>
        <span className='text-sm font-semibold text-foreground block truncate'>
          {motherBloodType} / {tetanusStatus}
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Jaminan Kesehatan
        </span>
        <span className='text-sm font-semibold text-foreground block truncate'>
          {hasHealthInsurance} {healthInsuranceNumber !== '-' ? `(${healthInsuranceNumber})` : ''}
        </span>
      </div>

      <div className='col-span-2 border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Alamat Domisili
        </span>
        <p className='text-sm font-medium text-foreground leading-relaxed'>{domicileAddress}</p>
      </div>

      <div className='col-span-2 pt-3 border-b border-border/40 pb-1'>
        <span className='text-xs font-bold text-foreground'>
          Identitas Suami / Pasangan Pendamping
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>Nama Suami</span>
        <span className='text-sm font-semibold text-foreground block truncate'>{partnerName}</span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>NIK Suami</span>
        <span className='text-sm font-semibold font-mono text-foreground block truncate'>
          {partnerNik}
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Usia / Gol. Darah
        </span>
        <span className='text-sm font-semibold text-foreground block truncate'>
          {partnerAge} / {partnerBlood}
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Pekerjaan / Pendidikan
        </span>
        <span className='text-sm font-semibold text-foreground block truncate'>
          {partnerJob} / {partnerEducation}
        </span>
      </div>
    </div>
  );
}
