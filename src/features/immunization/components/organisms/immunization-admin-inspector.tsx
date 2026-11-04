'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineSelect } from '@/features/data-pasien/components/registration/atoms/patient-line-select';
import { PatientLineTextarea } from '@/features/data-pasien/components/registration/atoms/patient-line-textarea';
import { MilestoneStatusBadge } from '../atoms/milestone-status-badge';
import { MilestoneRowEditor } from '../molecules/milestone-row-editor';
import { CANONICAL_IMMUNIZATION_ROWS } from '../../constants/immunization.constants';
import type {
  ChildSex,
  ImmunizationClinicalEntry,
  ImmunizationIntakeRecord
} from '../../types/immunization.types';

export interface ImmunizationAdminInspectorProps {
  intake?: ImmunizationIntakeRecord | null;
  entries: ImmunizationClinicalEntry[];
  isEditing?: boolean;
  onIntakeFieldChange?: (field: keyof ImmunizationIntakeRecord, value: any) => void;
  onEntriesChange?: (updated: ImmunizationClinicalEntry[]) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
}

export function ImmunizationAdminInspector({
  intake,
  entries,
  isEditing = false,
  onIntakeFieldChange,
  onEntriesChange,
  validationErrors,
  onClearError
}: ImmunizationAdminInspectorProps) {
  const [activeEditingIndex, setActiveEditingIndex] = React.useState<number | null>(null);

  // Map entries by rowIndex (0-14)
  const entriesMap = React.useMemo(() => {
    const map = new Map<number, ImmunizationClinicalEntry>();
    for (const e of entries) {
      map.set(e.rowIndex, e);
    }
    return map;
  }, [entries]);

  const handleUpdateEntry = (updated: ImmunizationClinicalEntry) => {
    if (!onEntriesChange) return;
    const newEntries = [...entries];
    const existingIndex = newEntries.findIndex((e) => e.rowIndex === updated.rowIndex);
    if (existingIndex >= 0) {
      newEntries[existingIndex] = updated;
    } else {
      newEntries.push(updated);
    }
    onEntriesChange(newEntries);
  };

  return (
    <Tabs defaultValue='identitas' className='w-full flex flex-col h-full min-h-0'>
      <TabsList className='grid grid-cols-4 w-full h-9 mb-3 shrink-0'>
        <TabsTrigger value='identitas' className='text-xs font-semibold cursor-pointer'>
          Identitas Anak
        </TabsTrigger>
        <TabsTrigger value='orang-tua' className='text-xs font-semibold cursor-pointer'>
          Orang Tua & Alamat
        </TabsTrigger>
        <TabsTrigger value='riwayat' className='text-xs font-semibold cursor-pointer'>
          Riwayat Pasien
        </TabsTrigger>
        <TabsTrigger value='trajektori' className='text-xs font-semibold cursor-pointer'>
          Trajektori 15 Vaksin
        </TabsTrigger>
      </TabsList>

      <div className='flex-1 overflow-y-auto min-h-0 pr-1'>
        {/* TAB 1: IDENTITAS ANAK */}
        <TabsContent value='identitas' className='m-0 outline-none'>
          {isEditing && onIntakeFieldChange ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1'>
              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Identitas Calon Pasien Anak
                </span>

                <PatientLineInput
                  id='admin-child-name-input'
                  label='Nama Lengkap Anak *'
                  value={intake?.childName || ''}
                  onChange={(val) => {
                    onIntakeFieldChange('childName', val);
                    if (validationErrors?.childName && val.trim().length > 0) {
                      onClearError?.('childName');
                    }
                  }}
                  error={validationErrors?.childName}
                  invalid={Boolean(validationErrors?.childName)}
                  placeholder='Nama lengkap anak...'
                  required
                />

                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineInput
                    id='admin-child-nik-input'
                    label='NIK Anak (16 Digit)'
                    value={intake?.childNik || ''}
                    onChange={(val) => {
                      const numeric = val.replace(/\D/g, '').slice(0, 16);
                      onIntakeFieldChange('childNik', numeric);
                      if (validationErrors?.childNik && numeric.length === 16) {
                        onClearError?.('childNik');
                      }
                    }}
                    error={validationErrors?.childNik}
                    invalid={Boolean(validationErrors?.childNik)}
                    placeholder='16 digit NIK...'
                    maxLength={16}
                    isMonospace
                  />

                  <PatientLineSelect
                    id='admin-child-sex-select'
                    label='Jenis Kelamin'
                    value={intake?.childSex || 'Laki-laki'}
                    onChange={(val) => onIntakeFieldChange('childSex', val as ChildSex)}
                    options={['Laki-laki', 'Perempuan']}
                    placeholder='Pilih kelamin'
                  />
                </div>
              </div>

              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Kelahiran
                </span>

                <div className='grid grid-cols-2 gap-4'>
                  <CustomDatePicker
                    id='admin-child-birthdate'
                    label='Tanggal Lahir'
                    value={intake?.childBirthDate || ''}
                    onChange={(val) => onIntakeFieldChange('childBirthDate', val)}
                    placeholder='Pilih tgl lahir'
                    disableFutureDates
                    variant='underline'
                  />

                  <PatientLineInput
                    id='admin-child-age'
                    label='Usia Terhitung'
                    value={intake?.childAgeFormatted || '-'}
                    readOnly
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1 pointer-events-none select-text'>
              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Identitas Calon Pasien Anak
                </span>
                <PatientLineInput
                  id='view-child-name'
                  label='Nama Lengkap Anak'
                  value={intake?.childName || '-'}
                  readOnly
                />
                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineInput
                    id='view-child-nik'
                    label='NIK Anak'
                    value={intake?.childNik || '-'}
                    isMonospace
                    readOnly
                  />
                  <PatientLineInput
                    id='view-child-sex'
                    label='Jenis Kelamin'
                    value={intake?.childSex || '-'}
                    readOnly
                  />
                </div>
              </div>

              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Kelahiran
                </span>
                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineInput
                    id='view-child-birthdate'
                    label='Tanggal Lahir Anak'
                    value={intake?.childBirthDate || '-'}
                    isMonospace
                    readOnly
                  />
                  <PatientLineInput
                    id='view-child-age'
                    label='Usia Terhitung'
                    value={intake?.childAgeFormatted || '-'}
                    readOnly
                  />
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB 2: ORANG TUA & ALAMAT */}
        <TabsContent value='orang-tua' className='m-0 outline-none'>
          {isEditing && onIntakeFieldChange ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1'>
              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Data Orang Tua / Wali
                </span>
                <PatientLineInput
                  id='admin-father-name'
                  label='Nama Ayah'
                  value={intake?.fatherName || ''}
                  onChange={(val) => onIntakeFieldChange('fatherName', val)}
                  placeholder='Nama ayah...'
                />
                <PatientLineInput
                  id='admin-mother-name'
                  label='Nama Ibu'
                  value={intake?.motherName || ''}
                  onChange={(val) => onIntakeFieldChange('motherName', val)}
                  placeholder='Nama ibu...'
                />
                <PatientLineInput
                  id='admin-parent-phone'
                  label='Nomor HP Orang Tua/Wali *'
                  type='tel'
                  value={intake?.parentPhone || ''}
                  onChange={(val) => {
                    onIntakeFieldChange('parentPhone', val);
                    if (validationErrors?.parentPhone) {
                      onClearError?.('parentPhone');
                    }
                  }}
                  error={validationErrors?.parentPhone}
                  invalid={Boolean(validationErrors?.parentPhone)}
                  placeholder='08xxxxxxxxxx'
                  isMonospace
                  required
                />
              </div>

              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Domisili & Alamat
                </span>
                <PatientLineTextarea
                  id='admin-child-address'
                  label='Alamat Lengkap'
                  value={intake?.childAddress || ''}
                  onChange={(val) => onIntakeFieldChange('childAddress', val)}
                  placeholder='Alamat lengkap domisili tempat tinggal anak...'
                />
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1 pointer-events-none select-text'>
              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Data Orang Tua / Wali
                </span>
                <PatientLineInput
                  id='view-father-name'
                  label='Nama Ayah'
                  value={intake?.fatherName || '-'}
                  readOnly
                />
                <PatientLineInput
                  id='view-mother-name'
                  label='Nama Ibu'
                  value={intake?.motherName || '-'}
                  readOnly
                />
                <PatientLineInput
                  id='view-parent-phone'
                  label='Nomor HP Orang Tua/Wali'
                  value={intake?.parentPhone || '-'}
                  isMonospace
                  readOnly
                />
              </div>

              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Domisili & Alamat
                </span>
                <PatientLineTextarea
                  id='view-child-address'
                  label='Alamat Lengkap'
                  value={intake?.childAddress || '-'}
                  readOnly
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB 3: RIWAYAT PASIEN */}
        <TabsContent value='riwayat' className='m-0 outline-none'>
          {isEditing && onIntakeFieldChange ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1'>
              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Riwayat Vaksinasi Sebelumnya
                </span>
                <PatientLineInput
                  id='admin-previous-vaccines'
                  label='Riwayat Vaksin Sebelumnya (Teks)'
                  value={intake?.previousVaccineHistory || ''}
                  onChange={(val) => onIntakeFieldChange('previousVaccineHistory', val)}
                  placeholder='cth: HB 0 sudah di RS setelah lahir'
                />
              </div>

              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Riwayat Alergi Anak
                </span>
                <PatientLineInput
                  id='admin-child-allergy'
                  label='Riwayat Alergi (Teks)'
                  value={intake?.childAllergyHistory || ''}
                  onChange={(val) => onIntakeFieldChange('childAllergyHistory', val)}
                  placeholder='cth: Tidak ada alergi yang diketahui / Alergi penisilin'
                />
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1 pointer-events-none select-text'>
              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Riwayat Vaksinasi Sebelumnya
                </span>
                <PatientLineInput
                  id='view-previous-vaccines'
                  label='Riwayat Vaksin Sebelumnya'
                  value={intake?.previousVaccineHistory || '-'}
                  readOnly
                />
              </div>

              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Riwayat Alergi Anak
                </span>
                <PatientLineInput
                  id='view-child-allergy'
                  label='Riwayat Alergi Anak'
                  value={intake?.childAllergyHistory || '-'}
                  readOnly
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB 4: TRAJEKTORI 15 VAKSIN */}
        <TabsContent value='trajektori' className='m-0 outline-none'>
          <div className='space-y-3 pt-1'>
            {CANONICAL_IMMUNIZATION_ROWS.map((milestone) => {
              const entry =
                entriesMap.get(milestone.rowIndex) || {
                  rowIndex: milestone.rowIndex,
                  vaccineName: milestone.vaccineName,
                  vaccineCode: milestone.vaccineCode,
                  status: 'NOT_GIVEN' as const
                };

              const isExpanded = activeEditingIndex === milestone.rowIndex;
              const isGiven = entry.status === 'GIVEN';

              return (
                <div
                  key={milestone.rowIndex}
                  className='rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs transition-all'
                >
                  <div
                    onClick={() => {
                      if (isEditing) {
                        setActiveEditingIndex(isExpanded ? null : milestone.rowIndex);
                      }
                    }}
                    className={`flex items-center justify-between p-3.5 select-none ${
                      isEditing ? 'cursor-pointer hover:bg-muted/30' : ''
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      <span className='flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'>
                        {milestone.rowIndex + 1}
                      </span>

                      <div>
                        <div className='flex items-center gap-2'>
                          <span className='font-semibold text-xs text-foreground'>
                            {milestone.vaccineName}
                          </span>
                          {entry.injectionDate && (
                            <span className='text-[11px] text-muted-foreground'>
                              • {entry.injectionDate} ({entry.ageDisplay || '-'})
                            </span>
                          )}
                        </div>

                        {isGiven ? (
                          <div className='flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground'>
                            <span>BB: {entry.weightKg ? `${entry.weightKg} kg` : '-'}</span>
                            <span>PB: {entry.heightCm ? `${entry.heightCm} cm` : '-'}</span>
                            <span>Suhu: {entry.temperatureCelsius ? `${entry.temperatureCelsius}°C` : '-'}</span>
                            {entry.planning && (
                              <span className='truncate max-w-[200px]'>• {entry.planning}</span>
                            )}
                          </div>
                        ) : (
                          <span className='text-[11px] text-neutral-400 italic block mt-0.5'>
                            Belum dicatat pada kunjungan ini
                          </span>
                        )}
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      <MilestoneStatusBadge status={entry.status} />
                    </div>
                  </div>

                  {isExpanded && isEditing && (
                    <div className='border-t border-border/50 p-3.5 bg-muted/20 animate-in slide-in-from-top-2 duration-150'>
                      <MilestoneRowEditor
                        entry={entry}
                        onChange={(updated) => handleUpdateEntry(updated)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
