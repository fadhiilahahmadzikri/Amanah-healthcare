'use client';

import * as React from 'react';
import type { InspectorTabProps } from './types';

export function InspectorPartnerTab({ appointment, data }: InspectorTabProps) {
  const { answers, maternal, patient } = data;

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
  const partnerPhone = maternal?.husband?.phoneNumber || answers.partnerPhoneNumber || '-';

  const motherPhone =
    maternal?.phoneNumber ||
    answers.phoneNumber ||
    patient?.phone ||
    appointment.patient_phone ||
    '-';

  const motherJob = answers.motherJob || patient?.occupation || '-';
  const motherEducation = answers.motherEducation || '-';

  const puskesmas = maternal?.puskesmas || answers.puskesmas || '-';
  const posyandu = maternal?.posyandu || answers.posyandu || '-';
  const dasawisma = maternal?.dasawisma || answers.dasawisma || '-';

  const domicileAddress =
    maternal?.domicileAddress ||
    answers.domicileAddress ||
    patient?.address ||
    '-';

  return (
    <div className='grid grid-cols-2 gap-y-3 gap-x-5'>
      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Nama Suami / Pasangan
        </span>
        <span className='text-sm font-semibold text-foreground block truncate'>
          {partnerName}
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          NIK Suami
        </span>
        <span className='text-sm font-semibold font-mono text-foreground block truncate'>
          {partnerNik}
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Usia / Golongan Darah Suami
        </span>
        <span className='text-sm font-semibold text-foreground block truncate'>
          {partnerAge} / {partnerBlood}
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Pekerjaan / Pendidikan Suami
        </span>
        <span className='text-sm font-semibold text-foreground block truncate'>
          {partnerJob} / {partnerEducation}
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Nomor HP / WhatsApp Ibu
        </span>
        <span className='text-sm font-semibold text-foreground block truncate'>
          {motherPhone}
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Pekerjaan / Pendidikan Ibu
        </span>
        <span className='text-sm font-semibold text-foreground block truncate'>
          {motherJob} / {motherEducation}
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Faskes Pembina / Puskesmas
        </span>
        <span className='text-sm font-semibold text-foreground block truncate'>
          {puskesmas}
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Posyandu / Dasawisma
        </span>
        <span className='text-sm font-semibold text-foreground block truncate'>
          {posyandu} / {dasawisma}
        </span>
      </div>

      <div className='col-span-2 border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Alamat Tempat Tinggal / Domisili
        </span>
        <p className='text-sm font-medium text-foreground leading-relaxed'>
          {domicileAddress}
        </p>
      </div>
    </div>
  );
}
