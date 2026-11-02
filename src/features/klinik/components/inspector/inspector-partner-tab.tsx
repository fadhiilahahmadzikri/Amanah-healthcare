'use client';

import * as React from 'react';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineSelect } from '@/features/data-pasien/components/registration/atoms/patient-line-select';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { useMaternalCatalogs } from '../../model/useMaternalCatalogs';
import type { InspectorTabProps } from './types';

export function InspectorPartnerTab({
  data,
  isEditing = false,
  formData,
  onFieldChange
}: InspectorTabProps) {
  const { catalogs } = useMaternalCatalogs();
  const { maternal } = data;

  const bloodTypes = catalogs.bloodTypeChoices ?? [];
  const educations = catalogs.educationChoices ?? [];
  const occupations = catalogs.occupationChoices ?? [];
  const religions = catalogs.religionChoices ?? [];

  // Read-only values
  const partnerName = formData?.partnerName ?? (maternal?.partnerName || '-');
  const partnerNik = formData?.partnerNik ?? (maternal?.partnerNik || '-');
  const partnerBirthDate = formData?.partnerBirthDate || maternal?.partnerBirthDate || '-';
  const partnerAge = formData?.partnerAge
    ? `${formData.partnerAge} Tahun`
    : maternal?.partnerAge
      ? `${maternal.partnerAge} Tahun`
      : '-';
  const partnerJob = formData?.partnerJob || maternal?.partnerJob || '-';
  const partnerEducation = formData?.partnerEducation || maternal?.partnerEducation || '-';
  const partnerBlood = formData?.partnerBloodType || maternal?.partnerBloodType || '-';
  const partnerPhone = formData?.partnerPhone || maternal?.husband?.phoneNumber || '-';

  const motherPhone = formData?.phoneNumber || maternal?.phoneNumber || '-';
  const motherJob = formData?.motherJob || maternal?.motherJob || '-';
  const motherEducation = formData?.motherEducation || maternal?.motherEducation || '-';
  const religion = formData?.religion || maternal?.religion || '-';

  const puskesmas = formData?.puskesmas || maternal?.puskesmas || '-';
  const posyandu = formData?.posyandu || maternal?.posyandu || '-';
  const dasawisma = formData?.dasawisma || maternal?.dasawisma || '-';

  const domicileAddress = formData?.domicileAddress || maternal?.domicileAddress || '-';
  const identityCardAddress = formData?.identityCardAddress || maternal?.identityCardAddress || '-';

  const handlePartnerBirthDateChange = (val: string) => {
    if (!onFieldChange) return;
    onFieldChange('partnerBirthDate', val);
    if (val) {
      const birthYear = new Date(val).getFullYear();
      const currentYear = new Date().getFullYear();
      if (!isNaN(birthYear) && birthYear > 1920) {
        onFieldChange('partnerAge', Math.max(0, currentYear - birthYear));
      }
    }
  };

  if (!isEditing) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1 select-text'>
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
            <PatientLineInput
              id='partner-birthdate'
              label='Tanggal Lahir Suami'
              value={partnerBirthDate}
              isMonospace
              readOnly
            />
            <PatientLineInput id='partner-age' label='Usia Suami' value={partnerAge} readOnly />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <PatientLineInput
              id='partner-blood'
              label='Golongan Darah Suami'
              value={partnerBlood}
              readOnly
            />
            <PatientLineInput
              id='partner-job'
              label='Pekerjaan Suami'
              value={partnerJob}
              readOnly
            />
          </div>

          <PatientLineInput
            id='partner-education'
            label='Pendidikan Terakhir Suami'
            value={partnerEducation}
            readOnly
          />
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
            <PatientLineInput id='mother-religion' label='Agama' value={religion} readOnly />
          </div>

          <PatientLineInput
            id='partner-puskesmas'
            label='Faskes Pembina / Puskesmas'
            value={puskesmas}
            readOnly
          />

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

          <PatientLineInput
            id='partner-ktp-address'
            label='Alamat Sesuai KTP'
            value={identityCardAddress}
            readOnly
          />
        </div>
      </div>
    );
  }

  // Edit Mode
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1'>
      {/* Kolom 1: Edit Data Suami */}
      <div className='space-y-4'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
          Edit Data Suami / Pasangan
        </span>

        <PatientLineInput
          id='edit-partner-name'
          label='Nama Lengkap Suami'
          value={formData?.partnerName ?? ''}
          onChange={(val) => onFieldChange?.('partnerName', val)}
          placeholder='Nama lengkap suami'
        />

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='edit-partner-nik'
            label='NIK Suami'
            value={formData?.partnerNik ?? ''}
            onChange={(val) => onFieldChange?.('partnerNik', val)}
            placeholder='16 digit NIK suami'
            maxLength={16}
            isMonospace
          />

          <PatientLineInput
            id='edit-partner-phone'
            label='No. WhatsApp / HP Suami'
            value={formData?.partnerPhone ?? ''}
            onChange={(val) => onFieldChange?.('partnerPhone', val)}
            placeholder='08xxxxxxxx'
            isMonospace
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <CustomDatePicker
            id='edit-partner-birthdate'
            label='Tanggal Lahir Suami'
            value={formData?.partnerBirthDate || ''}
            onChange={handlePartnerBirthDateChange}
            placeholder='YYYY-MM-DD'
            disableFutureDates
            variant='underline'
          />

          <PatientLineInput
            id='edit-partner-age'
            label='Usia Suami (Tahun)'
            type='number'
            value={formData?.partnerAge ? String(formData.partnerAge) : ''}
            onChange={(val) => onFieldChange?.('partnerAge', val ? parseInt(val, 10) : '')}
            placeholder='Contoh: 30'
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineSelect
            id='edit-partner-blood'
            label='Golongan Darah Suami'
            value={formData?.partnerBloodType || ''}
            onChange={(val) => onFieldChange?.('partnerBloodType', val)}
            options={bloodTypes}
            placeholder='Pilih gol. darah'
          />

          <PatientLineSelect
            id='edit-partner-job'
            label='Pekerjaan Suami'
            value={formData?.partnerJob || ''}
            onChange={(val) => onFieldChange?.('partnerJob', val)}
            options={occupations}
            placeholder='Pilih pekerjaan'
          />
        </div>

        <PatientLineSelect
          id='edit-partner-education'
          label='Pendidikan Terakhir Suami'
          value={formData?.partnerEducation || ''}
          onChange={(val) => onFieldChange?.('partnerEducation', val)}
          options={educations}
          placeholder='Pilih pendidikan'
        />
      </div>

      {/* Kolom 2: Edit Kontak Ibu & Alamat */}
      <div className='space-y-4'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
          Edit Kontak Ibu & Domisili
        </span>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='edit-mother-phone'
            label='No. WhatsApp / HP Ibu'
            value={formData?.phoneNumber ?? ''}
            onChange={(val) => onFieldChange?.('phoneNumber', val)}
            placeholder='08xxxxxxxx'
            isMonospace
          />

          <PatientLineSelect
            id='edit-mother-job'
            label='Pekerjaan Ibu'
            value={formData?.motherJob || ''}
            onChange={(val) => onFieldChange?.('motherJob', val)}
            options={occupations}
            placeholder='Pilih pekerjaan'
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineSelect
            id='edit-mother-education'
            label='Pendidikan Terakhir Ibu'
            value={formData?.motherEducation || ''}
            onChange={(val) => onFieldChange?.('motherEducation', val)}
            options={educations}
            placeholder='Pilih pendidikan'
          />

          <PatientLineSelect
            id='edit-mother-religion'
            label='Agama'
            value={formData?.religion || ''}
            onChange={(val) => onFieldChange?.('religion', val)}
            options={religions}
            placeholder='Pilih agama'
          />
        </div>

        <PatientLineInput
          id='edit-puskesmas'
          label='Faskes Pembina / Puskesmas Domisili'
          value={formData?.puskesmas ?? ''}
          onChange={(val) => onFieldChange?.('puskesmas', val)}
          placeholder='Nama puskesmas wilayah domisili'
        />

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='edit-posyandu'
            label='Nama Posyandu'
            value={formData?.posyandu ?? ''}
            onChange={(val) => onFieldChange?.('posyandu', val)}
            placeholder='Nama posyandu'
          />

          <PatientLineInput
            id='edit-dasawisma'
            label='Nama Dasawisma'
            value={formData?.dasawisma ?? ''}
            onChange={(val) => onFieldChange?.('dasawisma', val)}
            placeholder='Kelompok dasawisma'
          />
        </div>

        <PatientLineInput
          id='edit-domicile'
          label='Alamat Tempat Tinggal / Domisili'
          value={formData?.domicileAddress ?? ''}
          onChange={(val) => onFieldChange?.('domicileAddress', val)}
          placeholder='Alamat tempat tinggal saat ini'
        />

        <PatientLineInput
          id='edit-ktp-address'
          label='Alamat Sesuai KTP'
          value={formData?.identityCardAddress ?? ''}
          onChange={(val) => onFieldChange?.('identityCardAddress', val)}
          placeholder='Alamat identitas KTP'
        />
      </div>
    </div>
  );
}
