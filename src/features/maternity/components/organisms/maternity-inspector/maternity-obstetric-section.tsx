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
      <div className='flex-1 min-h-0 flex flex-col space-y-5 font-sans h-full'>
        {/* Pemeriksaan Obstetri & Keluhan Card */}
        <div className='rounded-2xl p-4 sm:p-5 bg-surface-subtle/80 dark:bg-muted/20 shadow-xs space-y-4 font-sans'>
          <span className='text-xs font-bold text-foreground block pb-1 border-b border-border/40 uppercase tracking-wider'>
            Pemeriksaan Obstetri & Keluhan
          </span>

          {/* Usia Kehamilan & Tanggal Haid */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0'>
            <CustomDatePicker
              id='maternity-hpht'
              label='HPHT (Hari Pertama Haid Terakhir)'
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
              label='Taksiran Persalinan (HPL)'
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
              value={intake?.gestationalAgeFormatted || ''}
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
                value={intake?.gravidaCount}
                onChange={(val) => {
                  onIntakeFieldChange('gravidaCount', val === '' ? '' : val);
                  if (validationErrors?.gravidaCount) onClearError?.('gravidaCount');
                }}
                error={validationErrors?.gravidaCount}
                invalid={Boolean(validationErrors?.gravidaCount)}
                placeholder='1'
                required
              />
              <PatientLineInput
                id='maternity-parity'
                label='Partus / Paritas (P)'
                type='number'
                min={0}
                value={intake?.parityCount}
                onChange={(val) => {
                  onIntakeFieldChange('parityCount', val === '' ? '' : val);
                  if (validationErrors?.parityCount) onClearError?.('parityCount');
                }}
                error={validationErrors?.parityCount}
                invalid={Boolean(validationErrors?.parityCount)}
                placeholder='0'
              />
              <PatientLineInput
                id='maternity-abortion'
                label='Abortus (A)'
                type='number'
                min={0}
                value={intake?.abortionCount}
                onChange={(val) => {
                  onIntakeFieldChange('abortionCount', val === '' ? '' : val);
                  if (validationErrors?.abortionCount) onClearError?.('abortionCount');
                }}
                error={validationErrors?.abortionCount}
                invalid={Boolean(validationErrors?.abortionCount)}
                placeholder='0'
              />
              <PatientLineInput
                id='maternity-living-children'
                label='Anak Hidup (H)'
                type='number'
                min={0}
                value={intake?.livingChildrenCount}
                onChange={(val) => {
                  onIntakeFieldChange('livingChildrenCount', val === '' ? '' : val);
                  if (validationErrors?.livingChildrenCount) onClearError?.('livingChildrenCount');
                }}
                error={validationErrors?.livingChildrenCount}
                invalid={Boolean(validationErrors?.livingChildrenCount)}
                placeholder='0'
              />
            </div>
          </div>

          {/* Keluhan Saat Ini */}
          <div className='shrink-0 pt-1'>
            <PatientLineTextarea
              id='maternity-current-complaints'
              label='Keluhan Utama Saat Ini *'
              value={intake?.currentComplaints}
              onChange={(val) => {
                onIntakeFieldChange('currentComplaints', val);
                if (validationErrors?.currentComplaints && val) onClearError?.('currentComplaints');
              }}
              error={validationErrors?.currentComplaints}
              invalid={Boolean(validationErrors?.currentComplaints)}
              placeholder='Keluhan fisik atau masalah yang dirasakan ibu saat ini...'
            />
          </div>
        </div>

        {/* Riwayat Kehamilan Lalu Table Card */}
        <div className='rounded-2xl p-4 sm:p-5 bg-surface-subtle/80 dark:bg-muted/20 shadow-xs space-y-4 font-sans flex-1 min-h-0 flex flex-col'>
          <span className='text-xs font-bold text-foreground block pb-1 border-b border-border/40 uppercase tracking-wider'>
            Riwayat Kehamilan & Persalinan Lalu
          </span>
          <div className='pt-1 flex-1 min-h-0 flex flex-col'>
            <PregnancyHistoryTable
              items={previousPregnancies}
              isEditing={isEditing}
              onChange={onPreviousPregnanciesChange}
              validationErrors={validationErrors}
              onClearError={onClearError}
              motherBirthDate={intake?.motherBirthDate}
            />
          </div>
        </div>
      </div>
    );
  }

  // READ ONLY MODE
  return (
    <div className='flex-1 min-h-0 flex flex-col space-y-5 pointer-events-none select-text font-sans h-full'>
      {/* Pemeriksaan Obstetri & Keluhan Card */}
      <div className='rounded-2xl p-4 sm:p-5 bg-surface-subtle/80 dark:bg-muted/20 shadow-xs space-y-4 font-sans'>
        <span className='text-xs font-bold text-foreground block pb-1 border-b border-border/40 uppercase tracking-wider'>
          Pemeriksaan Obstetri & Keluhan
        </span>

        {/* Usia Kehamilan & Tanggal Haid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0'>
          <PatientLineInput
            id='view-hpht'
            label='HPHT (Hari Pertama Haid Terakhir)'
            value={intake?.hpht ? formatClinicDate(intake.hpht, { style: 'human_medium' }) : ''}
            readOnly
          />
          <PatientLineInput
            id='view-hpl'
            label='Taksiran Persalinan (HPL)'
            value={intake?.estimatedDueDate ? formatClinicDate(intake.estimatedDueDate, { style: 'human_medium' }) : ''}
            readOnly
          />
          <PatientLineInput
            id='view-gestational-age'
            label='Usia Kehamilan Terhitung'
            value={intake?.gestationalAgeFormatted || ''}
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
              value={intake?.gravidaCount !== undefined && intake?.gravidaCount !== null ? String(intake.gravidaCount) : ''}
              readOnly
            />
            <PatientLineInput
              id='view-parity'
              label='Partus / Paritas (P)'
              value={intake?.parityCount !== undefined && intake?.parityCount !== null ? String(intake.parityCount) : ''}
              readOnly
            />
            <PatientLineInput
              id='view-abortion'
              label='Abortus (A)'
              value={intake?.abortionCount !== undefined && intake?.abortionCount !== null ? String(intake.abortionCount) : ''}
              readOnly
            />
            <PatientLineInput
              id='view-living-children'
              label='Anak Hidup (H)'
              value={intake?.livingChildrenCount !== undefined && intake?.livingChildrenCount !== null ? String(intake.livingChildrenCount) : ''}
              readOnly
            />
          </div>
        </div>

        {/* Keluhan Saat Ini */}
        <div className='shrink-0 pt-1'>
          <PatientLineTextarea
            id='view-current-complaints'
            label='Keluhan Utama Saat Ini'
            value={intake?.currentComplaints || ''}
            readOnly
          />
        </div>
      </div>

      {/* Riwayat Kehamilan Lalu Table Card */}
      <div className='rounded-2xl p-4 sm:p-5 bg-surface-subtle/80 dark:bg-muted/20 shadow-xs space-y-4 font-sans flex-1 min-h-0 flex flex-col'>
        <span className='text-xs font-bold text-foreground block pb-1 border-b border-border/40 uppercase tracking-wider'>
          Riwayat Kehamilan & Persalinan Lalu
        </span>
        <div className='pt-1 flex-1 min-h-0 flex flex-col'>
          <PregnancyHistoryTable
            items={previousPregnancies}
            isEditing={false}
          />
        </div>
      </div>
    </div>
  );
}
