'use client';

import * as React from 'react';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineSelect } from '@/features/data-pasien/components/registration/atoms/patient-line-select';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { useMaternalCatalogs } from '../../model/useMaternalCatalogs';
import type { InspectorTabProps } from './types';

export function InspectorIdentityTab({
  appointment,
  data,
  isEditing = false,
  formData,
  onFieldChange
}: InspectorTabProps) {
  const { catalogs } = useMaternalCatalogs();
  const { answers, maternal, patient } = data;

  const bloodTypes = catalogs.bloodTypeChoices ?? [];
  const tetanusStatuses = catalogs.tetanusChoices ?? [];

  // Read-only values from maternal or answers
  const motherName = formData?.motherName ?? (maternal?.motherName || '-');
  const motherNik = formData?.motherNik ?? (maternal?.motherNik || '-');
  const birthPlace = patient?.birthPlace || '-';
  const birthDate = formData?.motherBirthDate || maternal?.motherBirthDate || '-';
  const motherAge = formData?.motherAge
    ? `${formData.motherAge} Tahun`
    : maternal?.motherAge
      ? `${maternal.motherAge} Tahun`
      : '-';

  const motherBloodType = formData?.motherBloodType || maternal?.motherBloodType || '-';
  const tetanusStatus = formData?.tetanusStatus || maternal?.tetanusStatus || '-';

  const gestationalAge =
    formData?.gestationalAgeFormatted || maternal?.gestationalAgeFormatted || '-';
  const hpht = formData?.hpht || maternal?.hpht || '-';
  const hpl = formData?.estimatedDueDate || maternal?.estimatedDueDate || '-';

  const height = formData?.heightCm
    ? `${formData.heightCm} cm`
    : maternal?.heightCm
      ? `${maternal.heightCm} cm`
      : '-';
  const weight = formData?.prePregnancyWeightKg
    ? `${formData.prePregnancyWeightKg} kg`
    : maternal?.prePregnancyWeightKg
      ? `${maternal.prePregnancyWeightKg} kg`
      : '-';
  const arm = formData?.upperArmCircumferenceCm
    ? `${formData.upperArmCircumferenceCm} cm`
    : maternal?.upperArmCircumferenceCm
      ? `${maternal.upperArmCircumferenceCm} cm`
      : '-';
  const bmi = formData?.initialBmi
    ? String(formData.initialBmi)
    : maternal?.initialBmi
      ? String(maternal.initialBmi)
      : '-';

  const currentComplaints =
    formData?.currentComplaints || maternal?.currentComplaints || appointment.complaint || '-';

  const hasHealthInsurance = answers.hasHealthInsurance || '-';
  const healthInsuranceNumber = answers.healthInsuranceNumber || '-';
  const bpjsDisplay =
    healthInsuranceNumber !== '-'
      ? `${hasHealthInsurance} (No: ${healthInsuranceNumber})`
      : hasHealthInsurance;

  // Handlers for edit mode
  const handleBirthDateChange = (val: string) => {
    if (!onFieldChange) return;
    onFieldChange('motherBirthDate', val);
    if (val) {
      const birthYear = new Date(val).getFullYear();
      const currentYear = new Date().getFullYear();
      if (!isNaN(birthYear) && birthYear > 1920) {
        onFieldChange('motherAge', Math.max(0, currentYear - birthYear));
      }
    }
  };

  const handleHphtChange = (val: string) => {
    if (!onFieldChange) return;
    onFieldChange('hpht', val);
    if (val) {
      const hphtDate = new Date(val);
      if (!isNaN(hphtDate.getTime())) {
        // HPL = HPHT + 280 days
        const hplDate = new Date(hphtDate.getTime() + 280 * 24 * 60 * 60 * 1000);
        const yyyy = hplDate.getFullYear();
        const mm = String(hplDate.getMonth() + 1).padStart(2, '0');
        const dd = String(hplDate.getDate()).padStart(2, '0');
        onFieldChange('estimatedDueDate', `${yyyy}-${mm}-${dd}`);

        // Gestational age calculation
        const now = new Date();
        const diffMs = now.getTime() - hphtDate.getTime();
        const totalDays = Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));
        const weeks = Math.floor(totalDays / 7);
        const days = totalDays % 7;
        onFieldChange('gestationalAgeWeeks', weeks);
        onFieldChange('gestationalAgeFormatted', `${weeks} minggu ${days} hari`);
      }
    }
  };

  const handleHeightOrWeightChange = (
    fieldKey: 'heightCm' | 'prePregnancyWeightKg',
    val: string
  ) => {
    if (!onFieldChange) return;
    onFieldChange(fieldKey, val);

    const h =
      fieldKey === 'heightCm' ? parseFloat(val) : parseFloat(String(formData?.heightCm || 0));
    const w =
      fieldKey === 'prePregnancyWeightKg'
        ? parseFloat(val)
        : parseFloat(String(formData?.prePregnancyWeightKg || 0));

    if (h > 0 && w > 0) {
      const m = h / 100;
      const calculatedBmi = (w / (m * m)).toFixed(1);
      onFieldChange('initialBmi', calculatedBmi);
    }
  };

  if (!isEditing) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1 select-text'>
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
            <PatientLineInput
              id='identity-mother-age'
              label='Usia Ibu'
              value={motherAge}
              readOnly
            />
            <PatientLineInput
              id='identity-mother-tetanus'
              label='Status Imunisasi TT'
              value={tetanusStatus}
              readOnly
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <PatientLineInput
              id='identity-marriage-order'
              label='Pernikahan Ke'
              value={String(formData?.marriageOrder ?? maternal?.marriageOrder ?? 1)}
              readOnly
            />
            <PatientLineInput
              id='identity-marriage-date'
              label='Tanggal Menikah'
              value={formData?.marriageDate || maternal?.marriageDate || '-'}
              isMonospace
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

          <PatientLineInput
            id='identity-current-complaints'
            label='Keluhan Saat Ini'
            value={currentComplaints}
            readOnly
          />
        </div>
      </div>
    );
  }

  // Edit Mode
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1'>
      {/* Kolom 1: Edit Identitas Ibu */}
      <div className='space-y-4'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
          Edit Identitas & Biodata Ibu
        </span>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='edit-mother-mrn'
            label='No. Rekam Medis (RM)'
            value={formData?.medicalRecordNumber ?? (patient?.medicalRecordNumber || '')}
            onChange={(val) => onFieldChange?.('medicalRecordNumber', val)}
            placeholder='RM-XXXX-XXXX'
            isMonospace
          />

          <PatientLineInput
            id='edit-mother-birthplace'
            label='Tempat Lahir'
            value={formData?.birthPlace ?? (patient?.birthPlace || '')}
            onChange={(val) => onFieldChange?.('birthPlace', val)}
            placeholder='Kota tempat lahir'
          />
        </div>

        <PatientLineInput
          id='edit-mother-name'
          label='Nama Lengkap Ibu *'
          value={formData?.motherName ?? ''}
          onChange={(val) => onFieldChange?.('motherName', val)}
          placeholder='Nama lengkap ibu'
          required
        />

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='edit-mother-nik'
            label='NIK Ibu Hamil'
            value={formData?.motherNik ?? ''}
            onChange={(val) => onFieldChange?.('motherNik', val)}
            placeholder='16 digit NIK'
            maxLength={16}
            isMonospace
          />

          <PatientLineSelect
            id='edit-mother-blood'
            label='Golongan Darah'
            value={formData?.motherBloodType || ''}
            onChange={(val) => onFieldChange?.('motherBloodType', val)}
            options={bloodTypes}
            placeholder='Pilih gol. darah'
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <CustomDatePicker
            id='edit-mother-birthdate'
            label='Tanggal Lahir'
            value={formData?.motherBirthDate || ''}
            onChange={handleBirthDateChange}
            placeholder='YYYY-MM-DD'
            disableFutureDates
            variant='underline'
          />

          <PatientLineInput
            id='edit-mother-age'
            label='Usia Ibu (Tahun)'
            type='number'
            value={formData?.motherAge ? String(formData.motherAge) : ''}
            onChange={(val) => onFieldChange?.('motherAge', val ? parseInt(val, 10) : '')}
            placeholder='Contoh: 28'
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='edit-marriage-order'
            label='Pernikahan Ke-'
            type='number'
            min={1}
            value={String(formData?.marriageOrder ?? 1)}
            onChange={(val) => onFieldChange?.('marriageOrder', val ? parseInt(val, 10) : 1)}
          />

          <CustomDatePicker
            id='edit-marriage-date'
            label='Tanggal Menikah'
            value={formData?.marriageDate || ''}
            onChange={(val) => onFieldChange?.('marriageDate', val)}
            placeholder='YYYY-MM-DD'
            disableFutureDates
            variant='underline'
          />
        </div>

        <PatientLineSelect
          id='edit-tetanus-status'
          label='Status Imunisasi Tetanus (TT)'
          value={formData?.tetanusStatus || ''}
          onChange={(val) => onFieldChange?.('tetanusStatus', val)}
          options={tetanusStatuses}
          placeholder='Pilih status TT'
        />
      </div>

      {/* Kolom 2: Edit Parameter Klinis & Kehamilan */}
      <div className='space-y-4'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
          Edit Parameter Klinis & Masa Kehamilan
        </span>

        <div className='grid grid-cols-2 gap-4'>
          <CustomDatePicker
            id='edit-hpht'
            label='HPHT (Hari Pertama Haid Terakhir)'
            value={formData?.hpht || ''}
            onChange={handleHphtChange}
            placeholder='YYYY-MM-DD'
            disableFutureDates
            variant='underline'
          />

          <PatientLineInput
            id='edit-hpl'
            label='HPL (Taksiran Persalinan)'
            value={formData?.estimatedDueDate || ''}
            readOnly
            isMonospace
            placeholder='Otomatis dari HPHT'
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='edit-gestational-age'
            label='Usia Kehamilan'
            value={formData?.gestationalAgeFormatted || ''}
            readOnly
            placeholder='Otomatis dari HPHT'
          />

          <PatientLineInput
            id='edit-initial-bmi'
            label='IMT Awal (kg/m²)'
            value={formData?.initialBmi ? String(formData.initialBmi) : ''}
            readOnly
            placeholder='Otomatis dari TB & BB'
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <PatientLineInput
            id='edit-height-cm'
            label='Tinggi Badan (cm)'
            type='number'
            step='0.1'
            value={formData?.heightCm ? String(formData.heightCm) : ''}
            onChange={(val) => handleHeightOrWeightChange('heightCm', val)}
            placeholder='Contoh: 155'
          />

          <PatientLineInput
            id='edit-weight-kg'
            label='Berat Badan Pra-Hamil (kg)'
            type='number'
            step='0.1'
            value={formData?.prePregnancyWeightKg ? String(formData.prePregnancyWeightKg) : ''}
            onChange={(val) => handleHeightOrWeightChange('prePregnancyWeightKg', val)}
            placeholder='Contoh: 50'
          />
        </div>

        <PatientLineInput
          id='edit-lila'
          label='Lingkar Lengan Atas (LiLA) (cm)'
          type='number'
          step='0.1'
          value={formData?.upperArmCircumferenceCm ? String(formData.upperArmCircumferenceCm) : ''}
          onChange={(val) => onFieldChange?.('upperArmCircumferenceCm', val ? parseFloat(val) : '')}
          placeholder='Contoh: 24.5'
        />

        <PatientLineInput
          id='edit-complaints'
          label='Keluhan Yang Dirasakan Saat Ini'
          value={formData?.currentComplaints ?? ''}
          onChange={(val) => onFieldChange?.('currentComplaints', val)}
          placeholder='Tuliskan keluhan atau kondisi pasien...'
        />
      </div>
    </div>
  );
}
