'use client';

import * as React from 'react';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineSelect } from '@/features/data-pasien/components/registration/atoms/patient-line-select';
import { ContraceptiveHistoryTable } from '../../molecules/contraceptive-history-table';
import type {
  MaternityIntake,
  MaternalContraceptiveHistory
} from '../../../types/maternity.types';

export interface MaternityClinicalKbSectionProps {
  intake?: MaternityIntake | null;
  isEditing?: boolean;
  onIntakeFieldChange?: (field: keyof MaternityIntake, value: any) => void;
  onContraceptiveHistoriesChange?: (updated: MaternalContraceptiveHistory[]) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
  tetanusOptions: readonly string[] | string[];
  bloodTypeOptions: string[];
}

export function MaternityClinicalKbSection({
  intake,
  isEditing = false,
  onIntakeFieldChange,
  onContraceptiveHistoriesChange,
  validationErrors,
  onClearError,
  tetanusOptions,
  bloodTypeOptions
}: MaternityClinicalKbSectionProps) {
  const contraceptiveHistories = intake?.contraceptiveHistories || [];

  if (isEditing && onIntakeFieldChange) {
    return (
      <div className='flex-1 min-h-0 flex flex-col space-y-5 pt-1 font-sans h-full'>
        {/* Pemeriksaan Fisik Awal Kehamilan */}
        <div className='space-y-3 pt-2 shrink-0'>
          <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
            Pemeriksaan Fisik & Antropometri Awal
          </span>

          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
            <PatientLineInput
              id='maternity-height'
              label='Tinggi Badan'
              type='number'
              step='0.1'
              value={intake?.heightCm ? String(intake.heightCm) : ''}
              onChange={(val) => onIntakeFieldChange('heightCm', Number(val) || null)}
              placeholder='155'
              trailingIcon={<span className='text-xs font-semibold text-muted-foreground select-none pointer-events-none'>cm</span>}
            />
            <PatientLineInput
              id='maternity-weight'
              label='Berat Badan Pra-Hamil'
              type='number'
              step='0.1'
              value={intake?.prePregnancyWeightKg ? String(intake.prePregnancyWeightKg) : ''}
              onChange={(val) => onIntakeFieldChange('prePregnancyWeightKg', Number(val) || null)}
              placeholder='50'
              trailingIcon={<span className='text-xs font-semibold text-muted-foreground select-none pointer-events-none'>kg</span>}
            />
            <PatientLineInput
              id='maternity-lila'
              label='Lingkar Lengan Atas (LiLA)'
              type='number'
              step='0.1'
              value={intake?.upperArmCircumferenceCm ? String(intake.upperArmCircumferenceCm) : ''}
              onChange={(val) => onIntakeFieldChange('upperArmCircumferenceCm', Number(val) || null)}
              placeholder='24'
              trailingIcon={<span className='text-xs font-semibold text-muted-foreground select-none pointer-events-none'>cm</span>}
            />
            <PatientLineInput
              id='maternity-bmi'
              label='IMT / BMI Terhitung'
              value={intake?.initialBmi ? String(intake.initialBmi) : '-'}
              trailingIcon={<span className='text-xs font-semibold text-muted-foreground select-none pointer-events-none'>kg/m²</span>}
              readOnly
            />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1'>
            <PatientLineSelect
              id='maternity-tetanus-status'
              label='Status Imunisasi TT'
              value={intake?.tetanusStatus || 'T2'}
              onChange={(val) => onIntakeFieldChange('tetanusStatus', val)}
              options={tetanusOptions}
            />

            <PatientLineSelect
              id='maternity-mother-bloodtype'
              label='Golongan Darah Ibu'
              value={intake?.motherBloodType || 'O'}
              onChange={(val) => onIntakeFieldChange('motherBloodType', val)}
              options={bloodTypeOptions}
            />
          </div>
        </div>

        {/* Riwayat KB Table */}
        <div className='pt-1 flex-1 min-h-0 flex flex-col'>
          <ContraceptiveHistoryTable
            items={contraceptiveHistories}
            isEditing={isEditing}
            onChange={onContraceptiveHistoriesChange}
          />
        </div>
      </div>
    );
  }

  // READ ONLY MODE
  return (
    <div className='flex-1 min-h-0 flex flex-col space-y-5 pt-1 pointer-events-none select-text font-sans h-full'>
      {/* Pemeriksaan Fisik Awal Kehamilan */}
      <div className='space-y-3 pt-2 shrink-0'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
          Pemeriksaan Fisik & Antropometri Awal
        </span>

        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
          <PatientLineInput
            id='view-height'
            label='Tinggi Badan (cm)'
            value={intake?.heightCm ? `${intake.heightCm} cm` : '-'}
            readOnly
          />
          <PatientLineInput
            id='view-weight'
            label='Berat Badan Pra-Hamil (kg)'
            value={intake?.prePregnancyWeightKg ? `${intake.prePregnancyWeightKg} kg` : '-'}
            readOnly
          />
          <PatientLineInput
            id='view-lila'
            label='Lingkar Lengan Atas / LILA (cm)'
            value={intake?.upperArmCircumferenceCm ? `${intake.upperArmCircumferenceCm} cm` : '-'}
            readOnly
          />
          <PatientLineInput
            id='view-bmi'
            label='IMT / BMI Terhitung'
            value={intake?.initialBmi ? String(intake.initialBmi) : '-'}
            readOnly
          />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1'>
          <PatientLineInput
            id='view-tetanus-status'
            label='Status Imunisasi TT'
            value={intake?.tetanusStatus || '-'}
            readOnly
          />

          <PatientLineInput
            id='view-mother-bloodtype'
            label='Golongan Darah Ibu'
            value={intake?.motherBloodType || '-'}
            readOnly
          />
        </div>
      </div>

      {/* Riwayat KB Table */}
      <div className='pt-1 flex-1 min-h-0 flex flex-col'>
        <ContraceptiveHistoryTable
          items={contraceptiveHistories}
          isEditing={false}
        />
      </div>
    </div>
  );
}
