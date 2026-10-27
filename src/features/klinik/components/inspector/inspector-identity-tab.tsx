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
const FALLBACK_TETANUS = ['T1', 'T2', 'T3', 'T4', 'T5', 'Belum pernah', 'Tidak tahu'];

export function InspectorIdentityTab({
  appointment,
  data,
  isEditing = false,
  formData,
  onFieldChange
}: InspectorTabProps) {
  const { catalogs } = useMaternalCatalogs();
  const { answers, maternal, patient } = data;

  const bloodTypes = catalogs.bloodTypeChoices?.length
    ? catalogs.bloodTypeChoices
    : FALLBACK_BLOOD_TYPES;
  const tetanusStatuses = catalogs.tetanusChoices?.length
    ? catalogs.tetanusChoices
    : FALLBACK_TETANUS;

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
        <span className='text-xs font-semibold text-primary block pb-1 border-b border-primary/20'>
          Edit Identitas & Biodata Ibu
        </span>

        <div className='space-y-1.5'>
          <Label htmlFor='edit-mother-name' className='text-xs font-medium text-foreground'>
            Nama Lengkap Ibu
          </Label>
          <Input
            id='edit-mother-name'
            value={formData?.motherName ?? ''}
            onChange={(e) => onFieldChange?.('motherName', e.target.value)}
            placeholder='Nama lengkap ibu'
            className='h-8.5 text-xs'
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1.5'>
            <Label htmlFor='edit-mother-nik' className='text-xs font-medium text-foreground'>
              NIK Ibu Hamil
            </Label>
            <Input
              id='edit-mother-nik'
              value={formData?.motherNik ?? ''}
              onChange={(e) => onFieldChange?.('motherNik', e.target.value)}
              placeholder='16 digit NIK'
              maxLength={16}
              className='h-8.5 text-xs font-mono'
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='edit-mother-blood' className='text-xs font-medium text-foreground'>
              Golongan Darah
            </Label>
            <Select
              value={formData?.motherBloodType || ''}
              onValueChange={(val) => onFieldChange?.('motherBloodType', val)}
            >
              <SelectTrigger id='edit-mother-blood' className='h-8.5 text-xs'>
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
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1.5'>
            <Label htmlFor='edit-mother-birthdate' className='text-xs font-medium text-foreground'>
              Tanggal Lahir
            </Label>
            <CustomDatePicker
              id='edit-mother-birthdate'
              value={formData?.motherBirthDate || ''}
              onChange={handleBirthDateChange}
              placeholder='YYYY-MM-DD'
              triggerClassName='h-8.5 text-xs'
              disableFutureDates
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='edit-mother-age' className='text-xs font-medium text-foreground'>
              Usia Ibu (Tahun)
            </Label>
            <Input
              id='edit-mother-age'
              type='number'
              value={formData?.motherAge ?? ''}
              onChange={(e) =>
                onFieldChange?.('motherAge', e.target.value ? parseInt(e.target.value, 10) : '')
              }
              placeholder='Contoh: 28'
              className='h-8.5 text-xs'
            />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1.5'>
            <Label htmlFor='edit-marriage-order' className='text-xs font-medium text-foreground'>
              Pernikahan Ke-
            </Label>
            <Input
              id='edit-marriage-order'
              type='number'
              min={1}
              value={formData?.marriageOrder ?? 1}
              onChange={(e) =>
                onFieldChange?.('marriageOrder', e.target.value ? parseInt(e.target.value, 10) : 1)
              }
              className='h-8.5 text-xs'
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='edit-marriage-date' className='text-xs font-medium text-foreground'>
              Tanggal Menikah
            </Label>
            <CustomDatePicker
              id='edit-marriage-date'
              value={formData?.marriageDate || ''}
              onChange={(val) => onFieldChange?.('marriageDate', val)}
              placeholder='YYYY-MM-DD'
              triggerClassName='h-8.5 text-xs'
              disableFutureDates
            />
          </div>
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='edit-tetanus-status' className='text-xs font-medium text-foreground'>
            Status Imunisasi Tetanus (TT)
          </Label>
          <Select
            value={formData?.tetanusStatus || ''}
            onValueChange={(val) => onFieldChange?.('tetanusStatus', val)}
          >
            <SelectTrigger id='edit-tetanus-status' className='h-8.5 text-xs'>
              <SelectValue placeholder='Pilih status TT' />
            </SelectTrigger>
            <SelectContent>
              {tetanusStatuses.map((t) => (
                <SelectItem key={t} value={t} className='text-xs'>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Kolom 2: Edit Parameter Klinis & Kehamilan */}
      <div className='space-y-4'>
        <span className='text-xs font-semibold text-primary block pb-1 border-b border-primary/20'>
          Edit Parameter Klinis & Masa Kehamilan
        </span>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1.5'>
            <Label htmlFor='edit-hpht' className='text-xs font-medium text-foreground'>
              HPHT (Hari Pertama Haid Terakhir)
            </Label>
            <CustomDatePicker
              id='edit-hpht'
              value={formData?.hpht || ''}
              onChange={handleHphtChange}
              placeholder='YYYY-MM-DD'
              triggerClassName='h-8.5 text-xs font-mono'
              disableFutureDates
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='edit-hpl' className='text-xs font-medium text-foreground'>
              HPL (Taksiran Persalinan)
            </Label>
            <Input
              id='edit-hpl'
              value={formData?.estimatedDueDate || ''}
              readOnly
              disabled
              placeholder='Otomatis dari HPHT'
              className='h-8.5 text-xs bg-muted/50 font-mono'
            />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1.5'>
            <Label htmlFor='edit-gestational-age' className='text-xs font-medium text-foreground'>
              Usia Kehamilan
            </Label>
            <Input
              id='edit-gestational-age'
              value={formData?.gestationalAgeFormatted || ''}
              readOnly
              disabled
              placeholder='Otomatis dari HPHT'
              className='h-8.5 text-xs bg-muted/50'
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='edit-initial-bmi' className='text-xs font-medium text-foreground'>
              IMT Awal (kg/m²)
            </Label>
            <Input
              id='edit-initial-bmi'
              value={formData?.initialBmi ? String(formData.initialBmi) : ''}
              readOnly
              disabled
              placeholder='Otomatis dari TB & BB'
              className='h-8.5 text-xs bg-muted/50'
            />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1.5'>
            <Label htmlFor='edit-height-cm' className='text-xs font-medium text-foreground'>
              Tinggi Badan (cm)
            </Label>
            <Input
              id='edit-height-cm'
              type='number'
              step='0.1'
              value={formData?.heightCm ?? ''}
              onChange={(e) => handleHeightOrWeightChange('heightCm', e.target.value)}
              placeholder='Contoh: 155'
              className='h-8.5 text-xs'
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='edit-weight-kg' className='text-xs font-medium text-foreground'>
              Berat Badan Pra-Hamil (kg)
            </Label>
            <Input
              id='edit-weight-kg'
              type='number'
              step='0.1'
              value={formData?.prePregnancyWeightKg ?? ''}
              onChange={(e) => handleHeightOrWeightChange('prePregnancyWeightKg', e.target.value)}
              placeholder='Contoh: 50'
              className='h-8.5 text-xs'
            />
          </div>
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='edit-lila' className='text-xs font-medium text-foreground'>
            Lingkar Lengan Atas (LiLA) (cm)
          </Label>
          <Input
            id='edit-lila'
            type='number'
            step='0.1'
            value={formData?.upperArmCircumferenceCm ?? ''}
            onChange={(e) => onFieldChange?.('upperArmCircumferenceCm', e.target.value)}
            placeholder='Contoh: 24.5'
            className='h-8.5 text-xs'
          />
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='edit-complaints' className='text-xs font-medium text-foreground'>
            Keluhan Yang Dirasakan Saat Ini
          </Label>
          <Textarea
            id='edit-complaints'
            value={formData?.currentComplaints ?? ''}
            onChange={(e) => onFieldChange?.('currentComplaints', e.target.value)}
            placeholder='Tuliskan keluhan atau kondisi pasien...'
            rows={2}
            className='text-xs resize-none'
          />
        </div>
      </div>
    </div>
  );
}
