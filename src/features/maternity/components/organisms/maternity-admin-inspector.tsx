'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineSelect } from '@/features/data-pasien/components/registration/atoms/patient-line-select';
import { PatientLineTextarea } from '@/features/data-pasien/components/registration/atoms/patient-line-textarea';
import { PregnancyHistoryTable } from '../molecules/pregnancy-history-table';
import { ContraceptiveHistoryTable } from '../molecules/contraceptive-history-table';
import { MaternalConditionChecklist } from '../molecules/maternal-condition-checklist';
import { usePatientFormReferences } from '@/features/data-pasien/model/usePatientFormReferences';
import { TETANUS_STATUS_OPTIONS } from '../../constants/maternity.constants';
import type {
  MaternityIntake,
  MaternalHusbandProfile,
  MaternalPreviousPregnancy,
  MaternalContraceptiveHistory,
  MaternalConditionResponse
} from '../../types/maternity.types';

export interface MaternityAdminInspectorProps {
  intake?: MaternityIntake | null;
  isEditing?: boolean;
  onIntakeFieldChange?: (field: keyof MaternityIntake, value: any) => void;
  onHusbandFieldChange?: (field: keyof MaternalHusbandProfile, value: any) => void;
  onPreviousPregnanciesChange?: (updated: MaternalPreviousPregnancy[]) => void;
  onContraceptiveHistoriesChange?: (updated: MaternalContraceptiveHistory[]) => void;
  onConditionsChange?: (updated: MaternalConditionResponse[]) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
}

export function MaternityAdminInspector({
  intake,
  isEditing = false,
  onIntakeFieldChange,
  onHusbandFieldChange,
  onPreviousPregnanciesChange,
  onContraceptiveHistoriesChange,
  onConditionsChange,
  validationErrors,
  onClearError
}: MaternityAdminInspectorProps) {
  const husband = intake?.husbandProfile;
  const previousPregnancies = intake?.previousPregnancies || [];
  const contraceptiveHistories = intake?.contraceptiveHistories || [];
  const conditionResponses = intake?.conditionResponses || [];

  const references = usePatientFormReferences();
  const bloodTypeOptions = React.useMemo(
    () => references.bloodTypes.map((b) => b.label || b.value),
    [references.bloodTypes]
  );
  const occupationOptions = React.useMemo(
    () => references.occupations.map((o) => o.name),
    [references.occupations]
  );
  const educationOptions = React.useMemo(
    () => references.educationLevels.map((e) => e.label || e.value),
    [references.educationLevels]
  );
  const religionOptions = React.useMemo(
    () => references.religions.map((r) => r.label || r.value),
    [references.religions]
  );
  const tetanusOptions = TETANUS_STATUS_OPTIONS;

  return (
    <Tabs defaultValue='identitas' className='w-full flex flex-col h-full min-h-0'>
      <TabsList className='grid grid-cols-4 w-full h-9 mb-3 shrink-0'>
        <TabsTrigger value='identitas' className='text-xs font-semibold cursor-pointer truncate'>
          Identitas
        </TabsTrigger>
        <TabsTrigger value='obstetri' className='text-xs font-semibold cursor-pointer truncate'>
          Riwayat Kehamilan
        </TabsTrigger>
        <TabsTrigger value='klinis' className='text-xs font-semibold cursor-pointer truncate'>
          Pemeriksaan Fisik & KB
        </TabsTrigger>
        <TabsTrigger value='skrining' className='text-xs font-semibold cursor-pointer truncate'>
          Skrining Penyakit
        </TabsTrigger>
      </TabsList>

      <div className='flex-1 overflow-y-auto min-h-0 pr-1'>
        {/* TAB 1: IDENTITAS IBU & SUAMI */}
        <TabsContent value='identitas' className='m-0 outline-none space-y-5'>
          {isEditing && onIntakeFieldChange ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1'>
              {/* Kolom Kiri: Identitas Ibu */}
              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Identitas Calon Ibu
                </span>

                <PatientLineInput
                  id='maternity-mother-name'
                  label='Nama Lengkap Ibu *'
                  value={intake?.motherName || ''}
                  onChange={(val) => {
                    onIntakeFieldChange('motherName', val);
                    if (validationErrors?.motherName && val.trim().length > 0) {
                      onClearError?.('motherName');
                    }
                  }}
                  error={validationErrors?.motherName}
                  invalid={Boolean(validationErrors?.motherName)}
                  placeholder='cth: Ny. Siti Rahmawati'
                  required
                />

                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineInput
                    id='maternity-mother-nik'
                    label='NIK Ibu (16 Digit) *'
                    value={intake?.motherNik || ''}
                    onChange={(val) => {
                      const numeric = val.replace(/\D/g, '').slice(0, 16);
                      onIntakeFieldChange('motherNik', numeric);
                      if (validationErrors?.motherNik && numeric.length === 16) {
                        onClearError?.('motherNik');
                      }
                    }}
                    error={validationErrors?.motherNik}
                    invalid={Boolean(validationErrors?.motherNik)}
                    placeholder='16 digit NIK...'
                    maxLength={16}
                    isMonospace
                    required
                  />

                  <CustomDatePicker
                    id='maternity-mother-birthdate'
                    label='Tanggal Lahir Ibu *'
                    value={intake?.motherBirthDate || ''}
                    onChange={(val) => {
                      onIntakeFieldChange('motherBirthDate', val);
                      if (validationErrors?.motherBirthDate && val) {
                        onClearError?.('motherBirthDate');
                      }
                    }}
                    placeholder='Pilih tgl lahir'
                    disableFutureDates
                    variant='underline'
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineInput
                    id='maternity-phone-number'
                    label='Nomor HP / WA *'
                    type='tel'
                    value={intake?.phoneNumber || ''}
                    onChange={(val) => {
                      onIntakeFieldChange('phoneNumber', val);
                      if (validationErrors?.phoneNumber && val.trim().length > 0) {
                        onClearError?.('phoneNumber');
                      }
                    }}
                    error={validationErrors?.phoneNumber}
                    invalid={Boolean(validationErrors?.phoneNumber)}
                    placeholder='08xxxxxxxxxx'
                    isMonospace
                    required
                  />

                  <PatientLineSelect
                    id='maternity-religion'
                    label='Agama'
                    value={intake?.religion || 'Islam'}
                    onChange={(val) => onIntakeFieldChange('religion', val)}
                    options={religionOptions}
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineSelect
                    id='maternity-mother-education'
                    label='Pendidikan Terakhir'
                    value={intake?.motherEducation || 'SMA/SMK'}
                    onChange={(val) => onIntakeFieldChange('motherEducation', val)}
                    options={educationOptions}
                  />

                  <PatientLineSelect
                    id='maternity-mother-job'
                    label='Pekerjaan'
                    value={intake?.motherJob || 'Ibu Rumah Tangga'}
                    onChange={(val) => onIntakeFieldChange('motherJob', val)}
                    options={occupationOptions}
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineInput
                    id='maternity-marriage-order'
                    label='Pernikahan Ke-'
                    type='number'
                    value={String(intake?.marriageOrder ?? 1)}
                    onChange={(val) => onIntakeFieldChange('marriageOrder', Number(val) || 1)}
                  />

                  <CustomDatePicker
                    id='maternity-marriage-date'
                    label='Tanggal Nikah'
                    value={intake?.marriageDate || ''}
                    onChange={(val) => onIntakeFieldChange('marriageDate', val)}
                    placeholder='Pilih tgl nikah'
                    disableFutureDates
                    variant='underline'
                  />
                </div>

                <PatientLineTextarea
                  id='maternity-domicile-address'
                  label='Alamat Domisili Tempat Tinggal'
                  value={intake?.domicileAddress || ''}
                  onChange={(val) => onIntakeFieldChange('domicileAddress', val)}
                  placeholder='Alamat lengkap tempat tinggal saat ini...'
                />

                <div className='grid grid-cols-3 gap-3'>
                  <PatientLineInput
                    id='maternity-dasawisma'
                    label='Dasawisma'
                    value={intake?.dasawisma || ''}
                    onChange={(val) => onIntakeFieldChange('dasawisma', val)}
                    placeholder='cth: Mawar 02'
                  />
                  <PatientLineInput
                    id='maternity-posyandu'
                    label='Posyandu'
                    value={intake?.posyandu || ''}
                    onChange={(val) => onIntakeFieldChange('posyandu', val)}
                    placeholder='cth: Posyandu Melati'
                  />
                  <PatientLineInput
                    id='maternity-puskesmas'
                    label='Puskesmas'
                    value={intake?.puskesmas || ''}
                    onChange={(val) => onIntakeFieldChange('puskesmas', val)}
                    placeholder='cth: Puskesmas Godean'
                  />
                </div>
              </div>

              {/* Kolom Kanan: Identitas Suami */}
              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Identitas Suami
                </span>

                <PatientLineInput
                  id='maternity-partner-name'
                  label='Nama Suami *'
                  value={husband?.fullName || intake?.partnerName || ''}
                  onChange={(val) => {
                    onHusbandFieldChange?.('fullName', val);
                    onIntakeFieldChange('partnerName', val);
                    if (validationErrors?.partnerName && val.trim().length > 0) {
                      onClearError?.('partnerName');
                    }
                  }}
                  error={validationErrors?.partnerName}
                  invalid={Boolean(validationErrors?.partnerName)}
                  placeholder='cth: Tn. Budi Santoso'
                  required
                />

                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineInput
                    id='maternity-partner-nik'
                    label='NIK Suami (16 Digit)'
                    value={husband?.nik || intake?.partnerNik || ''}
                    onChange={(val) => {
                      const numeric = val.replace(/\D/g, '').slice(0, 16);
                      onHusbandFieldChange?.('nik', numeric);
                      onIntakeFieldChange('partnerNik', numeric);
                    }}
                    placeholder='16 digit NIK suami...'
                    maxLength={16}
                    isMonospace
                  />

                  <CustomDatePicker
                    id='maternity-partner-birthdate'
                    label='Tanggal Lahir Suami'
                    value={husband?.birthDate || intake?.partnerBirthDate || ''}
                    onChange={(val) => {
                      onHusbandFieldChange?.('birthDate', val);
                      onIntakeFieldChange('partnerBirthDate', val);
                    }}
                    placeholder='Pilih tgl lahir'
                    disableFutureDates
                    variant='underline'
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineSelect
                    id='maternity-partner-education'
                    label='Pendidikan Suami'
                    value={husband?.education || intake?.partnerEducation || 'SMA/SMK'}
                    onChange={(val) => {
                      onHusbandFieldChange?.('education', val);
                      onIntakeFieldChange('partnerEducation', val);
                    }}
                    options={educationOptions}
                  />

                  <PatientLineSelect
                    id='maternity-partner-blood-type'
                    label='Golongan Darah Suami'
                    value={husband?.bloodType || intake?.partnerBloodType || ''}
                    onChange={(val) => {
                      onHusbandFieldChange?.('bloodType', val);
                      onIntakeFieldChange('partnerBloodType', val);
                    }}
                    options={bloodTypeOptions}
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineSelect
                    id='maternity-partner-job'
                    label='Pekerjaan Suami'
                    value={husband?.job || intake?.partnerJob || 'Wiraswasta'}
                    onChange={(val) => {
                      onHusbandFieldChange?.('job', val);
                      onIntakeFieldChange('partnerJob', val);
                    }}
                    options={occupationOptions}
                  />

                  <PatientLineInput
                    id='maternity-partner-phone'
                    label='Nomor HP Suami'
                    type='tel'
                    value={husband?.phoneNumber || ''}
                    onChange={(val) => onHusbandFieldChange?.('phoneNumber', val)}
                    placeholder='08xxxxxxxxxx'
                    isMonospace
                  />
                </div>

                <PatientLineTextarea
                  id='maternity-identity-card-address'
                  label='Alamat Sesuai KTP'
                  value={intake?.identityCardAddress || ''}
                  onChange={(val) => onIntakeFieldChange('identityCardAddress', val)}
                  placeholder='Alamat lengkap sesuai identitas KTP...'
                />
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1 pointer-events-none select-text'>
              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Identitas Calon Ibu
                </span>
                <PatientLineInput
                  id='view-mother-name'
                  label='Nama Lengkap Ibu'
                  value={intake?.motherName || '-'}
                  readOnly
                />
                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineInput
                    id='view-mother-nik'
                    label='NIK Ibu'
                    value={intake?.motherNik || '-'}
                    isMonospace
                    readOnly
                  />
                  <PatientLineInput
                    id='view-mother-birthdate'
                    label='Tanggal Lahir'
                    value={intake?.motherBirthDate || '-'}
                    readOnly
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineInput
                    id='view-mother-phone'
                    label='No. HP / WhatsApp'
                    value={intake?.phoneNumber || '-'}
                    isMonospace
                    readOnly
                  />
                  <PatientLineInput
                    id='view-mother-religion'
                    label='Agama'
                    value={intake?.religion || '-'}
                    readOnly
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineInput
                    id='view-mother-edu'
                    label='Pendidikan'
                    value={intake?.motherEducation || '-'}
                    readOnly
                  />
                  <PatientLineInput
                    id='view-mother-job'
                    label='Pekerjaan'
                    value={intake?.motherJob || '-'}
                    readOnly
                  />
                </div>
                <PatientLineTextarea
                  id='view-mother-domicile'
                  label='Alamat Domisili'
                  value={intake?.domicileAddress || '-'}
                  readOnly
                />
              </div>

              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Identitas Suami
                </span>
                <PatientLineInput
                  id='view-partner-name'
                  label='Nama Lengkap Suami'
                  value={husband?.fullName || intake?.partnerName || '-'}
                  readOnly
                />
                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineInput
                    id='view-partner-nik'
                    label='NIK Suami'
                    value={husband?.nik || intake?.partnerNik || '-'}
                    isMonospace
                    readOnly
                  />
                  <PatientLineInput
                    id='view-partner-birthdate'
                    label='Tanggal Lahir Suami'
                    value={husband?.birthDate || intake?.partnerBirthDate || '-'}
                    readOnly
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineInput
                    id='view-partner-edu'
                    label='Pendidikan'
                    value={husband?.education || intake?.partnerEducation || '-'}
                    readOnly
                  />
                  <PatientLineInput
                    id='view-partner-blood'
                    label='Golongan Darah'
                    value={husband?.bloodType || intake?.partnerBloodType || '-'}
                    readOnly
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineInput
                    id='view-partner-job'
                    label='Pekerjaan'
                    value={husband?.job || intake?.partnerJob || '-'}
                    readOnly
                  />
                  <PatientLineInput
                    id='view-partner-phone'
                    label='Nomor HP Suami'
                    value={husband?.phoneNumber || '-'}
                    isMonospace
                    readOnly
                  />
                </div>
                <PatientLineTextarea
                  id='view-partner-ktp'
                  label='Alamat KTP'
                  value={intake?.identityCardAddress || '-'}
                  readOnly
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB 2: OBSTETRI & HAMIL */}
        <TabsContent value='obstetri' className='m-0 outline-none space-y-5'>
          {isEditing && onIntakeFieldChange ? (
            <div className='space-y-5 pt-1'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
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
                />

                <PatientLineInput
                  id='maternity-hpl-computed'
                  label='HPL Terhitung (Naegele Backend)'
                  value={intake?.estimatedDueDate || 'Dihitung otomatis...'}
                  readOnly
                  isMonospace
                />

                <PatientLineInput
                  id='maternity-uk-computed'
                  label='Usia Kehamilan Terhitung (Backend)'
                  value={intake?.gestationalAgeFormatted || 'Dihitung otomatis...'}
                  readOnly
                />
              </div>

              <PatientLineTextarea
                id='maternity-complaints'
                label='Keluhan Utama Saat Ini *'
                value={intake?.currentComplaints || ''}
                onChange={(val) => {
                  onIntakeFieldChange('currentComplaints', val);
                  if (validationErrors?.currentComplaints && val.trim().length > 0) {
                    onClearError?.('currentComplaints');
                  }
                }}
                error={validationErrors?.currentComplaints}
                invalid={Boolean(validationErrors?.currentComplaints)}
                placeholder='cth: Mual muntah di pagi hari, pusing ringan...'
              />

              {/* Status Obstetri GPAh */}
              <div className='rounded-xl border border-border/70 bg-card p-3.5 space-y-2.5'>
                <span className='text-xs font-semibold text-foreground block'>
                  Status Obstetri (G - P - A - H)
                </span>
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                  <PatientLineInput
                    id='maternity-g-count'
                    label='Gravida (Hamil Ke-)'
                    type='number'
                    value={String(intake?.gravidaCount ?? 1)}
                    onChange={(val) => onIntakeFieldChange('gravidaCount', Number(val) || 1)}
                  />
                  <PatientLineInput
                    id='maternity-p-count'
                    label='Partus (Melahirkan)'
                    type='number'
                    value={String(intake?.parityCount ?? 0)}
                    onChange={(val) => onIntakeFieldChange('parityCount', Number(val) || 0)}
                  />
                  <PatientLineInput
                    id='maternity-a-count'
                    label='Abortus (Keguguran)'
                    type='number'
                    value={String(intake?.abortionCount ?? 0)}
                    onChange={(val) => onIntakeFieldChange('abortionCount', Number(val) || 0)}
                  />
                  <PatientLineInput
                    id='maternity-h-count'
                    label='Anak Hidup'
                    type='number'
                    value={String(intake?.livingChildrenCount ?? 0)}
                    onChange={(val) => onIntakeFieldChange('livingChildrenCount', Number(val) || 0)}
                  />
                </div>
              </div>

              {/* Riwayat Kehamilan Lalu Table */}
              <div className='border-t border-border/40 pt-3'>
                <PregnancyHistoryTable
                  items={previousPregnancies}
                  isEditing={true}
                  onChange={onPreviousPregnanciesChange}
                />
              </div>
            </div>
          ) : (
            <div className='space-y-5 pt-1'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 pointer-events-none select-text'>
                <PatientLineInput
                  id='view-hpht'
                  label='HPHT'
                  value={intake?.hpht || '-'}
                  readOnly
                  isMonospace
                />
                <PatientLineInput
                  id='view-hpl'
                  label='HPL Terhitung (Naegele)'
                  value={intake?.estimatedDueDate || '-'}
                  readOnly
                  isMonospace
                />
                <PatientLineInput
                  id='view-uk'
                  label='Usia Kehamilan Terhitung'
                  value={intake?.gestationalAgeFormatted || '-'}
                  readOnly
                />
              </div>

              <div className='pointer-events-none select-text'>
                <PatientLineTextarea
                  id='view-complaint'
                  label='Keluhan Utama Saat Ini'
                  value={intake?.currentComplaints || '-'}
                  readOnly
                />
              </div>

              <div className='rounded-xl border border-border/70 bg-card p-3.5 space-y-2.5 pointer-events-none select-text'>
                <span className='text-xs font-semibold text-foreground block'>
                  Status Obstetri (G - P - A - H)
                </span>
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                  <PatientLineInput
                    id='view-g'
                    label='Gravida (Hamil Ke-)'
                    value={String(intake?.gravidaCount ?? '-')}
                    readOnly
                  />
                  <PatientLineInput
                    id='view-p'
                    label='Partus (Melahirkan)'
                    value={String(intake?.parityCount ?? '-')}
                    readOnly
                  />
                  <PatientLineInput
                    id='view-a'
                    label='Abortus (Keguguran)'
                    value={String(intake?.abortionCount ?? '-')}
                    readOnly
                  />
                  <PatientLineInput
                    id='view-h'
                    label='Anak Hidup'
                    value={String(intake?.livingChildrenCount ?? '-')}
                    readOnly
                  />
                </div>
              </div>

              <div className='border-t border-border/40 pt-3'>
                <PregnancyHistoryTable
                  items={previousPregnancies}
                  isEditing={false}
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB 3: KLINIS & KB */}
        <TabsContent value='klinis' className='m-0 outline-none space-y-5'>
          {isEditing && onIntakeFieldChange ? (
            <div className='space-y-5 pt-1'>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                <PatientLineInput
                  id='maternity-height'
                  label='Tinggi Badan (cm)'
                  type='number'
                  step='0.1'
                  value={intake?.heightCm ? String(intake.heightCm) : ''}
                  onChange={(val) => onIntakeFieldChange('heightCm', val ? Number(val) : null)}
                  placeholder='cth: 158'
                />

                <PatientLineInput
                  id='maternity-weight'
                  label='BB Pra-Hamil (kg)'
                  type='number'
                  step='0.1'
                  value={intake?.prePregnancyWeightKg ? String(intake.prePregnancyWeightKg) : ''}
                  onChange={(val) => onIntakeFieldChange('prePregnancyWeightKg', val ? Number(val) : null)}
                  placeholder='cth: 52'
                />

                <PatientLineInput
                  id='maternity-bmi'
                  label='IMT Terhitung (Backend)'
                  value={intake?.initialBmi ? String(intake.initialBmi) : 'Dihitung otomatis'}
                  readOnly
                  isMonospace
                />

                <PatientLineInput
                  id='maternity-lila'
                  label='LiLA (cm)'
                  type='number'
                  step='0.1'
                  value={intake?.upperArmCircumferenceCm ? String(intake.upperArmCircumferenceCm) : ''}
                  onChange={(val) => onIntakeFieldChange('upperArmCircumferenceCm', val ? Number(val) : null)}
                  placeholder='cth: 24.5'
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <PatientLineSelect
                  id='maternity-tt-status'
                  label='Status Imunisasi TT'
                  value={intake?.tetanusStatus || ''}
                  onChange={(val) => onIntakeFieldChange('tetanusStatus', val)}
                  options={tetanusOptions}
                />

                <PatientLineSelect
                  id='maternity-blood-type'
                  label='Golongan Darah Ibu'
                  value={intake?.motherBloodType || ''}
                  onChange={(val) => onIntakeFieldChange('motherBloodType', val)}
                  options={bloodTypeOptions}
                />
              </div>

              {/* Riwayat KB Table */}
              <div className='border-t border-border/40 pt-3'>
                <ContraceptiveHistoryTable
                  items={contraceptiveHistories}
                  isEditing={true}
                  onChange={onContraceptiveHistoriesChange}
                />
              </div>
            </div>
          ) : (
            <div className='space-y-5 pt-1'>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 pointer-events-none select-text'>
                <PatientLineInput
                  id='view-height'
                  label='Tinggi Badan'
                  value={intake?.heightCm ? `${intake.heightCm} cm` : '-'}
                  readOnly
                />
                <PatientLineInput
                  id='view-weight'
                  label='BB Pra-Hamil'
                  value={intake?.prePregnancyWeightKg ? `${intake.prePregnancyWeightKg} kg` : '-'}
                  readOnly
                />
                <PatientLineInput
                  id='view-bmi'
                  label='IMT Terhitung'
                  value={intake?.initialBmi ? String(intake.initialBmi) : '-'}
                  readOnly
                  isMonospace
                />
                <PatientLineInput
                  id='view-lila'
                  label='LiLA (Lingkar Lengan)'
                  value={intake?.upperArmCircumferenceCm ? `${intake.upperArmCircumferenceCm} cm` : '-'}
                  readOnly
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pointer-events-none select-text'>
                <PatientLineInput
                  id='view-tt'
                  label='Status Imunisasi TT'
                  value={intake?.tetanusStatus || '-'}
                  readOnly
                />
                <PatientLineInput
                  id='view-blood'
                  label='Golongan Darah Ibu'
                  value={intake?.motherBloodType || '-'}
                  readOnly
                />
              </div>

              <div className='border-t border-border/40 pt-3'>
                <ContraceptiveHistoryTable
                  items={contraceptiveHistories}
                  isEditing={false}
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB 4: SKRINING PENYAKIT & POLA HIDUP */}
        <TabsContent value='skrining' className='m-0 outline-none space-y-5'>
          <div className='space-y-4 pt-1'>
            <MaternalConditionChecklist
              conditions={conditionResponses}
              isEditing={isEditing}
              motherBirthDate={intake?.motherBirthDate}
              onChange={onConditionsChange}
            />

            {isEditing && onIntakeFieldChange ? (
              <div className='rounded-xl border border-border/70 bg-card p-4 space-y-4'>
                <span className='text-xs font-semibold text-foreground block border-b border-border/40 pb-1.5'>
                  Gaya Hidup & Paparan Lingkungan
                </span>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <PatientLineSelect
                    id='maternity-smoking'
                    label='Riwayat Merokok'
                    value={intake?.smokedBeforePregnancy || ''}
                    onChange={(val) => onIntakeFieldChange('smokedBeforePregnancy', val)}
                    options={['Tidak', 'Pasif', 'Ya']}
                  />

                  <PatientLineInput
                    id='maternity-allergy'
                    label='Riwayat Alergi (Obat/Makanan)'
                    value={intake?.allergyInfo || ''}
                    onChange={(val) => onIntakeFieldChange('allergyInfo', val)}
                    placeholder='cth: Alergi amoksisilin'
                  />
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1'>
                  <label className='flex items-center gap-2 cursor-pointer select-none'>
                    <input
                      type='checkbox'
                      checked={Boolean(intake?.smokeExposureBeforePregnancy)}
                      onChange={(e) =>
                        onIntakeFieldChange('smokeExposureBeforePregnancy', e.target.checked)
                      }
                      className='rounded border-border text-primary size-4'
                    />
                    <span>Sering terpapar asap rokok</span>
                  </label>
                  <label className='flex items-center gap-2 cursor-pointer select-none'>
                    <input
                      type='checkbox'
                      checked={Boolean(intake?.pesticideExposureBeforePregnancy)}
                      onChange={(e) =>
                        onIntakeFieldChange('pesticideExposureBeforePregnancy', e.target.checked)
                      }
                      className='rounded border-border text-primary size-4'
                    />
                    <span>Terpapar pestisida pertanian</span>
                  </label>
                  <label className='flex items-center gap-2 cursor-pointer select-none'>
                    <input
                      type='checkbox'
                      checked={Boolean(intake?.chemicalExposureBeforePregnancy)}
                      onChange={(e) =>
                        onIntakeFieldChange('chemicalExposureBeforePregnancy', e.target.checked)
                      }
                      className='rounded border-border text-primary size-4'
                    />
                    <span>Terpapar zat kimia berbahaya</span>
                  </label>
                  <label className='flex items-center gap-2 cursor-pointer select-none'>
                    <input
                      type='checkbox'
                      checked={Boolean(intake?.alcoholBeforePregnancy)}
                      onChange={(e) =>
                        onIntakeFieldChange('alcoholBeforePregnancy', e.target.checked)
                      }
                      className='rounded border-border text-primary size-4'
                    />
                    <span>Konsumsi alkohol</span>
                  </label>
                </div>

                <PatientLineTextarea
                  id='maternity-notes'
                  label='Catatan Tambahan Bidan / Dokter'
                  value={intake?.otherNotes || ''}
                  onChange={(val) => onIntakeFieldChange('otherNotes', val)}
                  placeholder='Catatan khusus observasi pasien...'
                />
              </div>
            ) : (
              <div className='rounded-xl border border-border/70 bg-card p-4 space-y-3 pointer-events-none select-text'>
                <span className='text-xs font-semibold text-foreground block border-b border-border/40 pb-1.5'>
                  Gaya Hidup & Paparan Lingkungan
                </span>
                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineInput
                    id='view-smoke'
                    label='Riwayat Merokok'
                    value={intake?.smokedBeforePregnancy || '-'}
                    readOnly
                  />
                  <PatientLineInput
                    id='view-allergy'
                    label='Riwayat Alergi'
                    value={intake?.allergyInfo || '-'}
                    readOnly
                  />
                </div>
                <PatientLineTextarea
                  id='view-notes'
                  label='Catatan Tambahan'
                  value={intake?.otherNotes || '-'}
                  readOnly
                />
              </div>
            )}
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
