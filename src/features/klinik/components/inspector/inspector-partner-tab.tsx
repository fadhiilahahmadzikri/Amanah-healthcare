'use client';

import * as React from 'react';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import type { InspectorTabProps } from './types';

export function InspectorPartnerTab({ data }: InspectorTabProps) {
  const { maternal } = data;

  const partnerName = maternal?.partnerName || '-';
  const partnerNik = maternal?.partnerNik || '-';
  const partnerAge = maternal?.partnerAge ? `${maternal.partnerAge} Tahun` : '-';
  const partnerJob = maternal?.partnerJob || '-';
  const partnerEducation = maternal?.partnerEducation || '-';
  const partnerBlood = maternal?.partnerBloodType || '-';
  const partnerPhone = maternal?.husband?.phoneNumber || '-';

  const motherPhone = maternal?.phoneNumber || '-';
  const motherJob = maternal?.motherJob || '-';
  const motherEducation = maternal?.motherEducation || '-';

  const puskesmas = maternal?.puskesmas || '-';
  const posyandu = maternal?.posyandu || '-';
  const dasawisma = maternal?.dasawisma || '-';

  const domicileAddress = maternal?.domicileAddress || '-';

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1 pointer-events-none select-text'>
      {/* Kolom 1: Data Suami / Pasangan */}
      <div className='space-y-4'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
          Data Suami / Pasangan
        </span>

        <PatientLineInput
          id='partner-name'
          label='Nama Lengkap Suami'
          value={partnerName}
          readOnly
        />

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='partner-nik'
            label='NIK Suami'
            value={partnerNik}
            isMonospace
            readOnly
          />
          <PatientLineInput
            id='partner-phone'
            label='Nomor HP / WhatsApp Suami'
            value={partnerPhone}
            readOnly
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput id='partner-age' label='Usia Suami' value={partnerAge} readOnly />
          <PatientLineInput
            id='partner-blood'
            label='Golongan Darah Suami'
            value={partnerBlood}
            readOnly
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput id='partner-job' label='Pekerjaan Suami' value={partnerJob} readOnly />
          <PatientLineInput
            id='partner-education'
            label='Pendidikan Terakhir Suami'
            value={partnerEducation}
            readOnly
          />
        </div>
      </div>

      {/* Kolom 2: Kontak Ibu & Wilayah Domisili */}
      <div className='space-y-4'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
          Kontak Ibu & Wilayah Domisili
        </span>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='mother-phone'
            label='Nomor HP / WhatsApp Ibu'
            value={motherPhone}
            readOnly
          />
          <PatientLineInput id='mother-job' label='Pekerjaan Ibu' value={motherJob} readOnly />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='mother-education'
            label='Pendidikan Terakhir Ibu'
            value={motherEducation}
            readOnly
          />
          <PatientLineInput
            id='partner-puskesmas'
            label='Faskes Pembina / Puskesmas'
            value={puskesmas}
            readOnly
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput id='partner-posyandu' label='Posyandu' value={posyandu} readOnly />
          <PatientLineInput id='partner-dasawisma' label='Dasawisma' value={dasawisma} readOnly />
        </div>

        <PatientLineInput
          id='partner-domicile'
          label='Alamat Tempat Tinggal / Domisili'
          value={domicileAddress}
          readOnly
        />
      </div>
    </div>
  );
}
