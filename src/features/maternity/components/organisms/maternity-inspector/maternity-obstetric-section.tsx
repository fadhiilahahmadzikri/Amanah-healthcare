'use client';

import * as React from 'react';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineTextarea } from '@/features/data-pasien/components/registration/atoms/patient-line-textarea';
import { formatClinicDate } from '@/lib/date-format';
import { PregnancyHistoryTable } from '../../molecules/pregnancy-history-table';
import type {
  MaternityIntake,
  MaternalPreviousPregnancy
} from '../../../types/maternity.types';

export interface MaternityObstetricSectionProps {
  intake?: MaternityIntake | null;
  isEditing?: boolean;
  onIntakeFieldChange?: (field: keyof MaternityIntake, value: any) => void;
  onPreviousPregnanciesChange?: (updated: MaternalPreviousPregnancy[]) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
}

export function MaternityObstetricSection({
  intake,
  isEditing = false,
  onIntakeFieldChange,
  onPreviousPregnanciesChange,
  validationErrors,
  onClearError
}: MaternityObstetricSectionProps) {
  const previousPregnancies = intake?.previousPregnancies || [];

  if (isEditing && onIntakeFieldChange) {
    return (
      <div className='flex-1 min-h-0 flex flex-col space-y-5 pt-1 font-sans h-full'>
        {/* Usia Kehamilan & Tanggal Haid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0'>
          <CustomDatePicker
            id='maternity-hpht'
            label='HPHT (Hari Pertama Haid Terakhir) *'
            value={intake?.hpht || ''}
            onChange={(val) => {
              onIntakeFieldChange('hpht', val);
              if (validationErrors?.hpht && val) onClearError?.('hpht');
            }}
            placeholder='Pilih tgl HPHT'
            disableFutureDates
            variant='underline'
            error={validationErrors?.hpht}
            invalid={Boolean(validationErrors?.hpht)}
          />

          <CustomDatePicker
            id='maternity-hpl'
            label='Taksiran Persalinan (HPL) *'
            value={intake?.estimatedDueDate || ''}
            onChange={(val) => {
              onIntakeFieldChange('estimatedDueDate', val);
              if (validationErrors?.estimatedDueDate && val) onClearError?.('estimatedDueDate');
            }}
            placeholder='Pilih tgl HPL'
            variant='underline'
            error={validationErrors?.estimatedDueDate}
            invalid={Boolean(validationErrors?.estimatedDueDate)}
          />

          <PatientLineInput
            id='maternity-gestational-age'
            label='Usia Kehamilan Terhitung'
            value={intake?.gestationalAgeFormatted || '-'}
            readOnly
          />
        </div>

        {/* Status Obstetri GPAH */}
        <div className='space-y-3 pt-2 shrink-0'>
          <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
            Status Obstetri (GPAH)
          </span>

          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
            <PatientLineInput
              id='maternity-gravida'
              label='Gravida (G) *'
              type='number'
              min={1}
              value={String(intake?.gravidaCount ?? 1)}
              onChange={(val) => onIntakeFieldChange('gravidaCount', Number(val) || 1)}
              placeholder='1'
              required
            />
            <PatientLineInput
              id='maternity-parity'
              label='Partus / Paritas (P)'
              type='number'
              min={0}
              value={String(intake?.parityCount ?? 0)}
              onChange={(val) => onIntakeFieldChange('parityCount', Number(val) || 0)}
              placeholder='0'
            />
            <PatientLineInput
              id='maternity-abortion'
              label='Abortus (A)'
              type='number'
              min={0}
              value={String(intake?.abortionCount ?? 0)}
              onChange={(val) => onIntakeFieldChange('abortionCount', Number(val) || 0)}
              placeholder='0'
            />
            <PatientLineInput
              id='maternity-living-children'
              label='Anak Hidup (H)'
              type='number'
              min={0}
              value={String(intake?.livingChildrenCount ?? 0)}
              onChange={(val) => onIntakeFieldChange('livingChildrenCount', Number(val) || 0)}
              placeholder='0'
            />
          </div>
        </div>

        {/* Riwayat Kehamilan Lalu Table */}
        <div className='pt-1 flex-1 min-h-0 flex flex-col'>
          <PregnancyHistoryTable
            items={previousPregnancies}
            isEditing={isEditing}
            onChange={onPreviousPregnanciesChange}
          />
        </div>

        {/* Keluhan Saat Ini */}
        <div className='shrink-0'>
          <PatientLineTextarea
            id='maternity-current-complaints'
            label='Keluhan Utama Saat Ini'
            value={intake?.currentComplaints || ''}
            onChange={(val) => onIntakeFieldChange('currentComplaints', val)}
            placeholder='Keluhan fisik atau masalah yang dirasakan ibu saat ini...'
          />
        </div>
      </div>
    );
  }

  // READ ONLY MODE
  return (
    <div className='flex-1 min-h-0 flex flex-col space-y-5 pt-1 pointer-events-none select-text font-sans h-full'>
      {/* Usia Kehamilan & Tanggal Haid */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0'>
        <PatientLineInput
          id='view-hpht'
          label='HPHT (Hari Pertama Haid Terakhir)'
          value={formatClinicDate(intake?.hpht, { style: 'human_medium' })}
          readOnly
        />
        <PatientLineInput
          id='view-hpl'
          label='Taksiran Persalinan (HPL)'
          value={formatClinicDate(intake?.estimatedDueDate, { style: 'human_medium' })}
          readOnly
        />
        <PatientLineInput
          id='view-gestational-age'
          label='Usia Kehamilan Terhitung'
          value={intake?.gestationalAgeFormatted || '-'}
          readOnly
        />
      </div>

      {/* Status Obstetri GPAH */}
      <div className='space-y-3 pt-2 shrink-0'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
          Status Obstetri (GPAH)
        </span>

        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
          <PatientLineInput
            id='view-gravida'
            label='Gravida (G)'
            value={String(intake?.gravidaCount ?? 1)}
            readOnly
          />
          <PatientLineInput
            id='view-parity'
            label='Partus / Paritas (P)'
            value={String(intake?.parityCount ?? 0)}
            readOnly
          />
          <PatientLineInput
            id='view-abortion'
            label='Abortus (A)'
            value={String(intake?.abortionCount ?? 0)}
            readOnly
          />
          <PatientLineInput
            id='view-living-children'
            label='Anak Hidup (H)'
            value={String(intake?.livingChildrenCount ?? 0)}
            readOnly
          />
        </div>
      </div>

      {/* Riwayat Kehamilan Lalu Table */}
      <div className='pt-1 flex-1 min-h-0 flex flex-col'>
        <PregnancyHistoryTable
          items={previousPregnancies}
          isEditing={false}
        />
      </div>

      {/* Keluhan Saat Ini */}
      <div className='shrink-0'>
        <PatientLineTextarea
          id='view-current-complaints'
          label='Keluhan Utama Saat Ini'
          value={intake?.currentComplaints || '-'}
          readOnly
        />
      </div>
    </div>
  );
}
