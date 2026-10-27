'use client';

import * as React from 'react';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useMaternalCatalogs } from '../../model/useMaternalCatalogs';
import type { InspectorTabProps } from './types';

const FALLBACK_BLOOD_TYPES = ['A', 'B', 'AB', 'O', 'Tidak tahu'];
const FALLBACK_EDUCATIONS = [
  'Tidak Sekolah',
  'SD / Sederajat',
  'SMP / Sederajat',
  'SMA/SMK',
  'Diploma (D1-D3)',
  'Sarjana (S1)',
  'Magister (S2)',
  'Doktor (S3)'
];
const FALLBACK_OCCUPATIONS = [
  'Ibu Rumah Tangga',
  'PNS / TNI / POLRI',
  'Karyawan Swasta',
  'Wiraswasta / Pengusaha',
  'Petani / Peternak',
  'Buruh / Pekerja Lepas',
  'Guru / Dosen',
  'Tenaga Kesehatan',
  'Pelajar / Mahasiswa',
  'Belum / Tidak Bekerja',
  'Lainnya'
];
const FALLBACK_RELIGIONS = [
  'Islam',
  'Kristen Protestan',
  'Katolik',
  'Hindu',
  'Buddha',
  'Khonghucu'
];

export function InspectorPartnerTab({
  data,
  isEditing = false,
  formData,
  onFieldChange
}: InspectorTabProps) {
  const { catalogs } = useMaternalCatalogs();
  const { maternal } = data;

  const bloodTypes = catalogs.bloodTypeChoices?.length
    ? catalogs.bloodTypeChoices
    : FALLBACK_BLOOD_TYPES;
  const educations = catalogs.educationChoices?.length
    ? catalogs.educationChoices
    : FALLBACK_EDUCATIONS;
  const occupations = catalogs.occupationChoices?.length
    ? catalogs.occupationChoices
    : FALLBACK_OCCUPATIONS;
  const religions = catalogs.religionChoices?.length
    ? catalogs.religionChoices
    : FALLBACK_RELIGIONS;

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
        <span className='text-xs font-semibold text-primary block pb-1 border-b border-primary/20'>
          Edit Data Suami / Pasangan
        </span>

        <div className='space-y-1.5'>
          <Label htmlFor='edit-partner-name' className='text-xs font-medium text-foreground'>
            Nama Lengkap Suami
          </Label>
          <Input
            id='edit-partner-name'
            value={formData?.partnerName ?? ''}
            onChange={(e) => onFieldChange?.('partnerName', e.target.value)}
            placeholder='Nama lengkap suami'
            className='h-8.5 text-xs'
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1.5'>
            <Label htmlFor='edit-partner-nik' className='text-xs font-medium text-foreground'>
              NIK Suami
            </Label>
            <Input
              id='edit-partner-nik'
              value={formData?.partnerNik ?? ''}
              onChange={(e) => onFieldChange?.('partnerNik', e.target.value)}
              placeholder='16 digit NIK suami'
              maxLength={16}
              className='h-8.5 text-xs font-mono'
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='edit-partner-phone' className='text-xs font-medium text-foreground'>
              No. WhatsApp / HP Suami
            </Label>
            <Input
              id='edit-partner-phone'
              value={formData?.partnerPhone ?? ''}
              onChange={(e) => onFieldChange?.('partnerPhone', e.target.value)}
              placeholder='08xxxxxxxx'
              className='h-8.5 text-xs font-mono'
            />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1.5'>
            <Label htmlFor='edit-partner-birthdate' className='text-xs font-medium text-foreground'>
              Tanggal Lahir Suami
            </Label>
            <CustomDatePicker
              id='edit-partner-birthdate'
              value={formData?.partnerBirthDate || ''}
              onChange={handlePartnerBirthDateChange}
              placeholder='YYYY-MM-DD'
              triggerClassName='h-8.5 text-xs'
              disableFutureDates
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='edit-partner-age' className='text-xs font-medium text-foreground'>
              Usia Suami (Tahun)
            </Label>
            <Input
              id='edit-partner-age'
              type='number'
              value={formData?.partnerAge ?? ''}
              onChange={(e) =>
                onFieldChange?.('partnerAge', e.target.value ? parseInt(e.target.value, 10) : '')
              }
              placeholder='Contoh: 30'
              className='h-8.5 text-xs'
            />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1.5'>
            <Label htmlFor='edit-partner-blood' className='text-xs font-medium text-foreground'>
              Golongan Darah Suami
            </Label>
            <Select
              value={formData?.partnerBloodType || ''}
              onValueChange={(val) => onFieldChange?.('partnerBloodType', val)}
            >
              <SelectTrigger id='edit-partner-blood' className='h-8.5 text-xs'>
                <SelectValue placeholder='Pilih gol. darah' />
              </SelectTrigger>
              <SelectContent>
                {bloodTypes.map((b) => (
                  <SelectItem key={b} value={b} className='text-xs'>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='edit-partner-job' className='text-xs font-medium text-foreground'>
              Pekerjaan Suami
            </Label>
            <Select
              value={formData?.partnerJob || ''}
              onValueChange={(val) => onFieldChange?.('partnerJob', val)}
            >
              <SelectTrigger id='edit-partner-job' className='h-8.5 text-xs'>
                <SelectValue placeholder='Pilih pekerjaan' />
              </SelectTrigger>
              <SelectContent>
                {occupations.map((job) => (
                  <SelectItem key={job} value={job} className='text-xs'>
                    {job}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='edit-partner-education' className='text-xs font-medium text-foreground'>
            Pendidikan Terakhir Suami
          </Label>
          <Select
            value={formData?.partnerEducation || ''}
            onValueChange={(val) => onFieldChange?.('partnerEducation', val)}
          >
            <SelectTrigger id='edit-partner-education' className='h-8.5 text-xs'>
              <SelectValue placeholder='Pilih pendidikan' />
            </SelectTrigger>
            <SelectContent>
              {educations.map((edu) => (
                <SelectItem key={edu} value={edu} className='text-xs'>
                  {edu}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Kolom 2: Edit Kontak Ibu & Alamat */}
      <div className='space-y-4'>
        <span className='text-xs font-semibold text-primary block pb-1 border-b border-primary/20'>
          Edit Kontak Ibu & Domisili
        </span>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1.5'>
            <Label htmlFor='edit-mother-phone' className='text-xs font-medium text-foreground'>
              No. WhatsApp / HP Ibu
            </Label>
            <Input
              id='edit-mother-phone'
              value={formData?.phoneNumber ?? ''}
              onChange={(e) => onFieldChange?.('phoneNumber', e.target.value)}
              placeholder='08xxxxxxxx'
              className='h-8.5 text-xs font-mono'
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='edit-mother-job' className='text-xs font-medium text-foreground'>
              Pekerjaan Ibu
            </Label>
            <Select
              value={formData?.motherJob || ''}
              onValueChange={(val) => onFieldChange?.('motherJob', val)}
            >
              <SelectTrigger id='edit-mother-job' className='h-8.5 text-xs'>
                <SelectValue placeholder='Pilih pekerjaan' />
              </SelectTrigger>
              <SelectContent>
                {occupations.map((job) => (
                  <SelectItem key={job} value={job} className='text-xs'>
                    {job}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1.5'>
            <Label htmlFor='edit-mother-education' className='text-xs font-medium text-foreground'>
              Pendidikan Terakhir Ibu
            </Label>
            <Select
              value={formData?.motherEducation || ''}
              onValueChange={(val) => onFieldChange?.('motherEducation', val)}
            >
              <SelectTrigger id='edit-mother-education' className='h-8.5 text-xs'>
                <SelectValue placeholder='Pilih pendidikan' />
              </SelectTrigger>
              <SelectContent>
                {educations.map((edu) => (
                  <SelectItem key={edu} value={edu} className='text-xs'>
                    {edu}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='edit-mother-religion' className='text-xs font-medium text-foreground'>
              Agama
            </Label>
            <Select
              value={formData?.religion || ''}
              onValueChange={(val) => onFieldChange?.('religion', val)}
            >
              <SelectTrigger id='edit-mother-religion' className='h-8.5 text-xs'>
                <SelectValue placeholder='Pilih agama' />
              </SelectTrigger>
              <SelectContent>
                {religions.map((rel) => (
                  <SelectItem key={rel} value={rel} className='text-xs'>
                    {rel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='edit-puskesmas' className='text-xs font-medium text-foreground'>
            Faskes Pembina / Puskesmas Domisili
          </Label>
          <Input
            id='edit-puskesmas'
            value={formData?.puskesmas ?? ''}
            onChange={(e) => onFieldChange?.('puskesmas', e.target.value)}
            placeholder='Nama puskesmas wilayah domisili'
            className='h-8.5 text-xs'
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1.5'>
            <Label htmlFor='edit-posyandu' className='text-xs font-medium text-foreground'>
              Nama Posyandu
            </Label>
            <Input
              id='edit-posyandu'
              value={formData?.posyandu ?? ''}
              onChange={(e) => onFieldChange?.('posyandu', e.target.value)}
              placeholder='Nama posyandu'
              className='h-8.5 text-xs'
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='edit-dasawisma' className='text-xs font-medium text-foreground'>
              Nama Dasawisma
            </Label>
            <Input
              id='edit-dasawisma'
              value={formData?.dasawisma ?? ''}
              onChange={(e) => onFieldChange?.('dasawisma', e.target.value)}
              placeholder='Kelompok dasawisma'
              className='h-8.5 text-xs'
            />
          </div>
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='edit-domicile' className='text-xs font-medium text-foreground'>
            Alamat Tempat Tinggal / Domisili
          </Label>
          <Textarea
            id='edit-domicile'
            value={formData?.domicileAddress ?? ''}
            onChange={(e) => onFieldChange?.('domicileAddress', e.target.value)}
            placeholder='Alamat tempat tinggal saat ini'
            rows={2}
            className='text-xs resize-none'
          />
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='edit-ktp-address' className='text-xs font-medium text-foreground'>
            Alamat Sesuai KTP
          </Label>
          <Textarea
            id='edit-ktp-address'
            value={formData?.identityCardAddress ?? ''}
            onChange={(e) => onFieldChange?.('identityCardAddress', e.target.value)}
            placeholder='Alamat identitas KTP'
            rows={2}
            className='text-xs resize-none'
          />
        </div>
      </div>
    </div>
  );
}
