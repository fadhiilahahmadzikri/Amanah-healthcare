'use client';

import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineSelect } from '@/features/data-pasien/components/registration/atoms/patient-line-select';
import { PatientLineTextarea } from '@/features/data-pasien/components/registration/atoms/patient-line-textarea';
import {
  MATERNAL_SMOKING_HABIT_OPTIONS,
  getMaternalSmokingLabel
} from '../../../constants/maternity.constants';
import { MaternalConditionChecklist } from '../../molecules/maternal-condition-checklist';
import type {
  MaternityIntake,
  MaternalConditionResponse
} from '../../../types/maternity.types';

export interface MaternityScreeningSectionProps {
  intake?: MaternityIntake | null;
  isEditing?: boolean;
  onIntakeFieldChange?: (field: keyof MaternityIntake, value: any) => void;
  onConditionsChange?: (updated: MaternalConditionResponse[]) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
}

export function MaternityScreeningSection({
  intake,
  isEditing = false,
  onIntakeFieldChange,
  onConditionsChange,
  validationErrors,
  onClearError
}: MaternityScreeningSectionProps) {
  const conditionResponses = intake?.conditionResponses || [];

  if (isEditing && onIntakeFieldChange) {
    return (
      <div className='space-y-5 pt-1 font-sans'>
        {/* 14 Kondisi Checklist */}
        <MaternalConditionChecklist
          conditions={conditionResponses}
          isEditing={isEditing}
          motherBirthDate={intake?.motherBirthDate}
          onChange={onConditionsChange}
          validationErrors={validationErrors}
          onClearError={onClearError}
        />

        {/* Pola Hidup & Kebiasaan */}
        <div className='space-y-3.5 pt-2'>
          <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
            Pola Hidup & Kebiasaan Sebelum / Selama Hamil
          </span>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <PatientLineSelect
              id='maternity-smoke-habit'
              label='Kebiasaan Merokok'
              value={intake?.smokedBeforePregnancy}
              onChange={(val) => onIntakeFieldChange('smokedBeforePregnancy', val)}
              options={MATERNAL_SMOKING_HABIT_OPTIONS}
            />

            <div className='flex flex-col justify-center space-y-2 pt-2'>
              <div className='flex items-center gap-2'>
                <Checkbox
                  id='maternity-alcohol'
                  checked={Boolean(intake?.alcoholBeforePregnancy)}
                  onCheckedChange={(c) => onIntakeFieldChange('alcoholBeforePregnancy', Boolean(c))}
                />
                <Label htmlFor='maternity-alcohol' className='text-xs cursor-pointer'>
                  Konsumsi Alkohol / Minuman Keras
                </Label>
              </div>

              <div className='flex items-center gap-2'>
                <Checkbox
                  id='maternity-irregular-diet'
                  checked={Boolean(intake?.irregularDietBeforePregnancy)}
                  onCheckedChange={(c) => onIntakeFieldChange('irregularDietBeforePregnancy', Boolean(c))}
                />
                <Label htmlFor='maternity-irregular-diet' className='text-xs cursor-pointer'>
                  Pola Makan Kurang Gizi / Tidak Teratur
                </Label>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/40'>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='maternity-reduced-physical'
                checked={Boolean(intake?.reducedPhysicalActivityBeforePregnancy)}
                onCheckedChange={(c) => onIntakeFieldChange('reducedPhysicalActivityBeforePregnancy', Boolean(c))}
              />
              <Label htmlFor='maternity-reduced-physical' className='text-xs cursor-pointer'>
                Aktivitas Fisik Berkurang Drastis
              </Label>
            </div>

            <div className='flex items-center gap-2'>
              <Checkbox
                id='maternity-unprescribed-meds'
                checked={Boolean(intake?.unprescribedMedicationBeforePregnancy)}
                onCheckedChange={(c) => onIntakeFieldChange('unprescribedMedicationBeforePregnancy', Boolean(c))}
              />
              <Label htmlFor='maternity-unprescribed-meds' className='text-xs cursor-pointer'>
                Konsumsi Obat Tanpa Resep Dokter / Jamu Berbahaya
              </Label>
            </div>

            <div className='flex items-center gap-2'>
              <Checkbox
                id='maternity-cosmetics'
                checked={Boolean(intake?.concerningCosmeticUseBeforePregnancy)}
                onCheckedChange={(c) => onIntakeFieldChange('concerningCosmeticUseBeforePregnancy', Boolean(c))}
              />
              <Label htmlFor='maternity-cosmetics' className='text-xs cursor-pointer'>
                Penggunaan Kosmetik / Krim Berbahaya (Merkuri/Retinoid)
              </Label>
            </div>
          </div>
        </div>

        {/* Paparan Lingkungan Berbahaya */}
        <div className='space-y-3.5 pt-2'>
          <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
            Paparan Lingkungan Kerja & Rumah Tangga
          </span>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='maternity-smoke-exposure'
                checked={Boolean(intake?.smokeExposureBeforePregnancy)}
                onCheckedChange={(c) => onIntakeFieldChange('smokeExposureBeforePregnancy', Boolean(c))}
              />
              <Label htmlFor='maternity-smoke-exposure' className='text-xs cursor-pointer'>
                Paparan Asap Rokok (Perokok Pasif)
              </Label>
            </div>

            <div className='flex items-center gap-2'>
              <Checkbox
                id='maternity-pesticide'
                checked={Boolean(intake?.pesticideExposureBeforePregnancy)}
                onCheckedChange={(c) => onIntakeFieldChange('pesticideExposureBeforePregnancy', Boolean(c))}
              />
              <Label htmlFor='maternity-pesticide' className='text-xs cursor-pointer'>
                Paparan Pestisida / Insektisida
              </Label>
            </div>

            <div className='flex items-center gap-2'>
              <Checkbox
                id='maternity-chemical'
                checked={Boolean(intake?.chemicalExposureBeforePregnancy)}
                onCheckedChange={(c) => onIntakeFieldChange('chemicalExposureBeforePregnancy', Boolean(c))}
              />
              <Label htmlFor='maternity-chemical' className='text-xs cursor-pointer'>
                Paparan Zat Kimia Industri / Cat
              </Label>
            </div>
          </div>

          <PatientLineInput
            id='maternity-env-notes'
            label='Catatan Lingkungan Khusus'
            value={intake?.concerningEnvironmentNotes}
            onChange={(val) => onIntakeFieldChange('concerningEnvironmentNotes', val)}
            placeholder='Keterangan paparan lingkungan...'
          />
        </div>

        {/* Alergi & Catatan Khusus */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <PatientLineTextarea
            id='maternity-allergy'
            label='Riwayat Alergi (Obat / Makanan / Debu)'
            value={intake?.allergyInfo}
            onChange={(val) => onIntakeFieldChange('allergyInfo', val)}
            placeholder='cth: Alergi Amoksisilin, debu...'
          />

          <PatientLineTextarea
            id='maternity-other-notes'
            label='Catatan Medis Tambahan Bidan'
            value={intake?.otherNotes}
            onChange={(val) => onIntakeFieldChange('otherNotes', val)}
            placeholder='Catatan khusus pemeriksaan...'
          />
        </div>
      </div>
    );
  }

  // READ ONLY MODE
  return (
    <div className='space-y-5 pt-1 pointer-events-none select-text font-sans'>
      {/* 14 Kondisi Checklist */}
      <MaternalConditionChecklist
        conditions={conditionResponses}
        isEditing={false}
        motherBirthDate={intake?.motherBirthDate}
      />

      {/* Pola Hidup & Kebiasaan */}
      <div className='space-y-3.5 pt-2'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
          Pola Hidup & Kebiasaan Sebelum / Selama Hamil
        </span>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <PatientLineInput
            id='view-smoke-habit'
            label='Kebiasaan Merokok'
            value={getMaternalSmokingLabel(intake?.smokedBeforePregnancy)}
            readOnly
          />

          <div className='space-y-2 pt-1'>
            <span className='text-xs font-medium text-muted-foreground block'>
              Faktor Risiko Gaya Hidup:
            </span>
            <div className='flex flex-wrap gap-1.5'>
              {intake?.irregularDietBeforePregnancy && (
                <span className='text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium'>
                  Pola Makan Berisiko
                </span>
              )}
              {intake?.reducedPhysicalActivityBeforePregnancy && (
                <span className='text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium'>
                  Aktivitas Fisik Berkurang
                </span>
              )}
              {intake?.unprescribedMedicationBeforePregnancy && (
                <span className='text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium'>
                  Obat Tanpa Resep
                </span>
              )}
              {intake?.concerningCosmeticUseBeforePregnancy && (
                <span className='text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium'>
                  Kosmetik Berbahaya
                </span>
              )}
              {intake?.alcoholBeforePregnancy && (
                <span className='text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium'>
                  Alkohol
                </span>
              )}
              {!intake?.irregularDietBeforePregnancy &&
                !intake?.reducedPhysicalActivityBeforePregnancy &&
                !intake?.unprescribedMedicationBeforePregnancy &&
                !intake?.concerningCosmeticUseBeforePregnancy &&
                !intake?.alcoholBeforePregnancy && (
                  <span className='text-xs text-muted-foreground italic'>
                    Tidak ada faktor risiko gaya hidup yang dilaporkan.
                  </span>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Paparan Lingkungan Berbahaya */}
      <div className='space-y-3.5 pt-2'>
        <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
          Paparan Lingkungan Kerja & Rumah Tangga
        </span>

        <div className='flex flex-wrap gap-1.5'>
          {intake?.smokeExposureBeforePregnancy && (
            <span className='text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium'>
              Paparan Asap Rokok (Pasif)
            </span>
          )}
          {intake?.pesticideExposureBeforePregnancy && (
            <span className='text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium'>
              Paparan Pestisida
            </span>
          )}
          {intake?.chemicalExposureBeforePregnancy && (
            <span className='text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium'>
              Paparan Zat Kimia
            </span>
          )}
          {!intake?.smokeExposureBeforePregnancy &&
            !intake?.pesticideExposureBeforePregnancy &&
            !intake?.chemicalExposureBeforePregnancy && (
              <span className='text-xs text-muted-foreground italic'>
                Tidak ada paparan lingkungan berisiko yang dilaporkan.
              </span>
            )}
        </div>

        {intake?.concerningEnvironmentNotes && (
          <PatientLineInput
            id='view-env-notes'
            label='Catatan Lingkungan Khusus'
            value={intake.concerningEnvironmentNotes}
            readOnly
          />
        )}
      </div>

      {/* Alergi & Catatan Khusus */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <PatientLineTextarea
          id='view-allergy'
          label='Riwayat Alergi (Obat / Makanan / Debu)'
          value={intake?.allergyInfo || ''}
          readOnly
        />

        <PatientLineTextarea
          id='view-other-notes'
          label='Catatan Medis Tambahan Bidan'
          value={intake?.otherNotes || ''}
          readOnly
        />
      </div>
    </div>
  );
}
