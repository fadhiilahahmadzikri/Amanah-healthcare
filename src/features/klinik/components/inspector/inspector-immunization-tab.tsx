'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineSelect } from '@/features/data-pasien/components/registration/atoms/patient-line-select';
import { useVaccineCatalog } from '../../model/useVaccineCatalog';
import { calculateChildAge } from '../../utils/medical-appointment';
import { VaccineChecklist } from '../booking/vaccine-checklist';
import type { InspectorTabProps } from './types';

export function InspectorImmunizationTab({
  data,
  isEditing = false,
  immunizationFormData,
  onImmunizationFieldChange,
  onVaccineValueChange
}: InspectorTabProps) {
  const { child } = data;
  const { vaccines } = useVaccineCatalog();

  // Read-only values from child
  const childName = immunizationFormData?.childName ?? (child?.childName || '-');
  const childNik = immunizationFormData?.childNik ?? (child?.childNik || '-');
  const birthDate = immunizationFormData?.childBirthDate || child?.childBirthDate || '-';
  const childSex = immunizationFormData?.childSex || child?.childSex || '-';

  let childAge = immunizationFormData?.childAgeFormatted || child?.childAgeFormatted;
  if (!childAge && birthDate && birthDate !== '-') {
    try {
      childAge = calculateChildAge(birthDate);
    } catch {
      childAge = '-';
    }
  }
  if (!childAge) childAge = '-';

  const parentPhone = immunizationFormData?.parentPhone ?? (child?.parentPhone || '-');
  const fatherName = immunizationFormData?.fatherName ?? (child?.fatherName || '-');
  const motherName = immunizationFormData?.motherName ?? (child?.motherName || '-');
  const address = immunizationFormData?.childAddress ?? (child?.childAddress || '-');

  const relationalEntries: any[] = child?.entries || [];

  const hasVaccineHistory =
    immunizationFormData?.hasVaccineHistory ??
    (child?.hasVaccineHistory ||
      (relationalEntries.length > 0
        ? 'Ya, pernah'
        : child?.previousVaccineHistory &&
            child.previousVaccineHistory !== 'Belum pernah imunisasi sama sekali'
          ? 'Ya, pernah'
          : 'Belum pernah sama sekali'));

  const hasAllergyHistory =
    immunizationFormData?.hasAllergyHistory ??
    (child?.hasAllergyHistory ||
      (child?.childAllergyHistory && child.childAllergyHistory !== 'Tidak ada riwayat alergi.'
        ? 'Ada riwayat alergi'
        : 'Tidak ada alergi'));

  const childAllergyHistory =
    immunizationFormData?.childAllergyHistory ??
    (child?.childAllergyHistory ||
      (hasAllergyHistory === 'Ada riwayat alergi'
        ? 'Riwayat alergi tercatat.'
        : 'Tidak ada riwayat alergi.'));

  return (
    <Tabs defaultValue='identitas' className='w-full flex flex-col h-full'>
      <TabsList className='grid grid-cols-4 w-full h-9 mb-3 shrink-0'>
        <TabsTrigger value='identitas' className='text-xs font-semibold cursor-pointer'>
          Identitas Anak
        </TabsTrigger>
        <TabsTrigger value='orang-tua' className='text-xs font-semibold cursor-pointer'>
          Orang Tua & Alamat
        </TabsTrigger>
        <TabsTrigger value='vaksin' className='text-xs font-semibold cursor-pointer'>
          Riwayat Vaksin
        </TabsTrigger>
        <TabsTrigger value='alergi' className='text-xs font-semibold cursor-pointer'>
          Riwayat Alergi
        </TabsTrigger>
      </TabsList>

      <div className='flex-1 overflow-y-auto min-h-0 pr-1'>
        {/* TAB 1: IDENTITAS ANAK */}
        <TabsContent value='identitas' className='m-0 outline-none'>
          {isEditing && immunizationFormData && onImmunizationFieldChange ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1'>
              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Identitas Anak
                </span>

                <PatientLineInput
                  id='child-mrn-input'
                  label='Nomor Rekam Medis (RM)'
                  value={
                    immunizationFormData.medicalRecordNumber ??
                    (data.patient?.medicalRecordNumber || '')
                  }
                  onChange={(val) => onImmunizationFieldChange('medicalRecordNumber', val)}
                  placeholder='RM-XXXX-XXXX'
                  isMonospace
                />

                <PatientLineInput
                  id='child-name-input'
                  label='Nama Lengkap Anak *'
                  value={immunizationFormData.childName}
                  onChange={(val) => onImmunizationFieldChange('childName', val)}
                  placeholder='Nama lengkap anak...'
                  required
                />

                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineInput
                    id='child-nik-input'
                    label='NIK Anak (16 Digit)'
                    value={immunizationFormData.childNik}
                    onChange={(val) => onImmunizationFieldChange('childNik', val)}
                    placeholder='16 digit NIK...'
                    maxLength={16}
                    isMonospace
                  />

                  <PatientLineSelect
                    id='child-sex-select'
                    label='Jenis Kelamin'
                    value={immunizationFormData.childSex || 'Laki-laki'}
                    onChange={(val) => onImmunizationFieldChange('childSex', val)}
                    options={['Laki-laki', 'Perempuan']}
                    placeholder='Pilih kelamin'
                  />
                </div>
              </div>

              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Kelahiran & Kontak Wali
                </span>
                <div className='grid grid-cols-2 gap-4'>
                  <CustomDatePicker
                    id='child-birthdate-input'
                    label='Tanggal Lahir'
                    value={immunizationFormData.childBirthDate}
                    onChange={(val) => {
                      onImmunizationFieldChange('childBirthDate', val);
                      if (val) {
                        try {
                          const calculatedAge = calculateChildAge(val);
                          onImmunizationFieldChange('childAgeFormatted', calculatedAge);
                        } catch {
                          // ignore calculation error
                        }
                      }
                    }}
                    placeholder='Pilih tgl lahir'
                    disableFutureDates
                    variant='underline'
                  />

                  <PatientLineInput
                    id='child-age-calculated'
                    label='Usia Terhitung'
                    value={immunizationFormData.childAgeFormatted || '-'}
                    readOnly
                  />
                </div>

                <PatientLineInput
                  id='child-parent-phone-input'
                  label='Nomor HP Orang Tua/Wali *'
                  type='tel'
                  value={immunizationFormData.parentPhone}
                  onChange={(val) => onImmunizationFieldChange('parentPhone', val)}
                  placeholder='08xxxxxxxxxx'
                  isMonospace
                  required
                />
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1 pointer-events-none select-text'>
              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Identitas Anak
                </span>
                {data.patient?.medicalRecordNumber && (
                  <PatientLineInput
                    id='child-mrn'
                    label='Nomor Rekam Medis (RM)'
                    value={data.patient.medicalRecordNumber}
                    isMonospace
                    readOnly
                  />
                )}
                <PatientLineInput
                  id='child-name'
                  label='Nama Lengkap Anak'
                  value={childName}
                  readOnly
                />
                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineInput
                    id='child-nik'
                    label='NIK Anak'
                    value={childNik}
                    isMonospace
                    readOnly
                  />
                  <PatientLineInput
                    id='child-sex'
                    label='Jenis Kelamin'
                    value={childSex}
                    readOnly
                  />
                </div>
              </div>

              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Kelahiran & Kontak Wali
                </span>
                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineInput
                    id='child-birthdate'
                    label='Tanggal Lahir Anak'
                    value={birthDate}
                    isMonospace
                    readOnly
                  />
                  <PatientLineInput
                    id='child-age'
                    label='Usia Saat Pendaftaran'
                    value={childAge}
                    readOnly
                  />
                </div>
                <PatientLineInput
                  id='child-parent-phone'
                  label='Nomor HP Orang Tua/Wali'
                  value={parentPhone}
                  readOnly
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB 2: ORANG TUA & ALAMAT */}
        <TabsContent value='orang-tua' className='m-0 outline-none'>
          {isEditing && immunizationFormData && onImmunizationFieldChange ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1'>
              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Data Orang Tua / Wali
                </span>
                <PatientLineInput
                  id='father-name-input'
                  label='Nama Ayah'
                  value={immunizationFormData.fatherName}
                  onChange={(val) => onImmunizationFieldChange('fatherName', val)}
                  placeholder='Nama ayah...'
                />
                <PatientLineInput
                  id='mother-name-input'
                  label='Nama Ibu'
                  value={immunizationFormData.motherName}
                  onChange={(val) => onImmunizationFieldChange('motherName', val)}
                  placeholder='Nama ibu...'
                />
              </div>

              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Alamat Tinggal Keluarga
                </span>
                <PatientLineInput
                  id='child-address-input'
                  label='Alamat Tempat Tinggal'
                  value={immunizationFormData.childAddress}
                  onChange={(val) => onImmunizationFieldChange('childAddress', val)}
                  placeholder='Alamat lengkap domisili...'
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
                  id='child-father-name'
                  label='Nama Ayah'
                  value={fatherName}
                  readOnly
                />
                <PatientLineInput
                  id='child-mother-name'
                  label='Nama Ibu'
                  value={motherName}
                  readOnly
                />
              </div>

              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Alamat Tinggal Keluarga
                </span>
                <PatientLineInput
                  id='child-address'
                  label='Alamat Tempat Tinggal'
                  value={address}
                  readOnly
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB 3: RIWAYAT VAKSIN */}
        <TabsContent value='vaksin' className='m-0 outline-none'>
          {isEditing &&
          immunizationFormData &&
          onImmunizationFieldChange &&
          onVaccineValueChange ? (
            <div className='flex flex-col gap-4 pt-1'>
              <div className='rounded-lg border border-border/60 bg-muted/20 p-3'>
                <Label className='text-xs font-medium text-foreground block mb-2'>
                  Apakah si kecil pernah mendapat imunisasi sebelumnya?
                </Label>
                <div className='flex items-center gap-3'>
                  {(['Ya, pernah', 'Belum pernah sama sekali'] as const).map((choice) => (
                    <button
                      key={choice}
                      type='button'
                      onClick={() => onImmunizationFieldChange('hasVaccineHistory', choice)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all cursor-pointer ${
                        immunizationFormData.hasVaccineHistory === choice
                          ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-xs'
                          : 'bg-background text-muted-foreground border-border hover:bg-muted'
                      }`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>

              {immunizationFormData.hasVaccineHistory === 'Ya, pernah' && (
                <div className='flex flex-col gap-3'>
                  <VaccineChecklist
                    values={immunizationFormData.vaccineValues}
                    onFieldChange={onVaccineValueChange}
                  />

                  <div className='pt-1'>
                    <PatientLineInput
                      id='vaccine-notes-input'
                      label='Catatan Tambahan Riwayat Vaksinasi'
                      value={immunizationFormData.previousVaccineHistory}
                      onChange={(val) => onImmunizationFieldChange('previousVaccineHistory', val)}
                      placeholder='Catatan faskes tempat vaksinasi, reaksi KIPI, dll...'
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className='flex flex-col gap-3'>
              <div className='rounded-lg border border-border/60 bg-muted/20 p-3'>
                <span className='text-xs font-normal text-muted-foreground block mb-1'>
                  Apakah si kecil pernah mendapat imunisasi sebelumnya?
                </span>
                <Badge variant={hasVaccineHistory === 'Ya, pernah' ? 'default' : 'secondary'}>
                  {hasVaccineHistory}
                </Badge>
              </div>

              {hasVaccineHistory === 'Ya, pernah' ? (
                <div className='rounded-lg border border-border/60 p-3 bg-card'>
                  <span className='text-xs font-bold text-foreground block mb-2'>
                    Daftar Riwayat Vaksinasi Anak
                  </span>
                  <div className='divide-y divide-border/40'>
                    {vaccines.map((vaccine) => {
                      const code = vaccine.code;
                      const relationalEntry = relationalEntries.find((e) => e.vaccineCode === code);
                      const status = relationalEntry
                        ? relationalEntry.status === 'GIVEN'
                          ? 'Sudah'
                          : relationalEntry.status === 'NOT_GIVEN'
                            ? 'Belum'
                            : 'Tidak tahu'
                        : undefined;
                      const date = relationalEntry ? relationalEntry.givenDate : undefined;

                      return (
                        <div
                          key={vaccine.id || code}
                          className='flex items-center justify-between py-2 text-xs'
                        >
                          <div className='flex items-center gap-2 min-w-0 pr-2'>
                            <span className='font-semibold text-foreground truncate'>
                              {vaccine.name}
                            </span>
                            {vaccine.ageMilestone ? (
                              <span className='text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded'>
                                {vaccine.ageMilestone}
                              </span>
                            ) : null}
                          </div>

                          <div className='flex items-center gap-2 shrink-0'>
                            {status === 'Sudah' ? (
                              <Badge
                                variant='default'
                                className='text-[10px] h-5 px-1.5 bg-emerald-600 hover:bg-emerald-600 text-white'
                              >
                                Sudah {date ? `(${date})` : ''}
                              </Badge>
                            ) : status === 'Belum' ? (
                              <Badge
                                variant='outline'
                                className='text-[10px] h-5 px-1.5 text-muted-foreground'
                              >
                                Belum
                              </Badge>
                            ) : status === 'Tidak tahu' ? (
                              <Badge variant='secondary' className='text-[10px] h-5 px-1.5'>
                                Tidak tahu
                              </Badge>
                            ) : (
                              <span className='text-muted-foreground text-[11px]'>-</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {relationalEntries
                      .filter((entry) => !vaccines.some((v) => v.code === entry.vaccineCode))
                      .map((entry) => {
                        const code = entry.vaccineCode;
                        const isGiven = entry.status === 'GIVEN';
                        const isNotGiven = entry.status === 'NOT_GIVEN';
                        const dateDisplay = entry.givenDate ? `(${entry.givenDate})` : '';

                        return (
                          <div
                            key={entry.id || code}
                            className='flex items-center justify-between py-2 text-xs'
                          >
                            <div className='flex items-center gap-2 min-w-0 pr-2'>
                              <span className='font-semibold text-foreground truncate'>{code}</span>
                            </div>

                            <div className='flex items-center gap-2 shrink-0'>
                              {isGiven ? (
                                <Badge
                                  variant='default'
                                  className='text-[10px] h-5 px-1.5 bg-emerald-600 hover:bg-emerald-600 text-white'
                                >
                                  Sudah {dateDisplay}
                                </Badge>
                              ) : isNotGiven ? (
                                <Badge
                                  variant='outline'
                                  className='text-[10px] h-5 px-1.5 text-muted-foreground'
                                >
                                  Belum
                                </Badge>
                              ) : (
                                <Badge variant='secondary' className='text-[10px] h-5 px-1.5'>
                                  Tidak tahu
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                <div className='rounded-lg border border-border/60 p-4 bg-muted/10 text-center'>
                  <p className='text-xs text-muted-foreground font-medium'>
                    Si kecil belum pernah mendapat imunisasi sebelumnya.
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* TAB 4: RIWAYAT ALERGI */}
        <TabsContent value='alergi' className='m-0 outline-none'>
          {isEditing && immunizationFormData && onImmunizationFieldChange ? (
            <div className='flex flex-col gap-4 pt-1'>
              <div className='rounded-lg border border-border/60 bg-muted/20 p-3'>
                <Label className='text-xs font-medium text-foreground block mb-2'>
                  Apakah anak memiliki riwayat alergi?
                </Label>
                <div className='flex items-center gap-3'>
                  {(['Ada riwayat alergi', 'Tidak ada alergi'] as const).map((choice) => (
                    <button
                      key={choice}
                      type='button'
                      onClick={() => onImmunizationFieldChange('hasAllergyHistory', choice)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all cursor-pointer ${
                        immunizationFormData.hasAllergyHistory === choice
                          ? choice === 'Ada riwayat alergi'
                            ? 'bg-destructive text-destructive-foreground border-destructive font-semibold shadow-xs'
                            : 'bg-primary text-primary-foreground border-primary font-semibold shadow-xs'
                          : 'bg-background text-muted-foreground border-border hover:bg-muted'
                      }`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>

              {immunizationFormData.hasAllergyHistory === 'Ada riwayat alergi' && (
                <div className='pt-1'>
                  <PatientLineInput
                    id='allergy-details-input'
                    label='Detail Catatan Alergi (Obat, Makanan, atau Zat Lainnya)'
                    value={immunizationFormData.childAllergyHistory}
                    onChange={(val) => onImmunizationFieldChange('childAllergyHistory', val)}
                    placeholder='Tuliskan jenis alergi dan reaksi yang muncul...'
                  />
                </div>
              )}
            </div>
          ) : (
            <div className='flex flex-col gap-3'>
              <div className='rounded-lg border border-border/60 bg-muted/20 p-3'>
                <span className='text-xs font-normal text-muted-foreground block mb-1'>
                  Apakah anak memiliki riwayat alergi?
                </span>
                <Badge
                  variant={hasAllergyHistory === 'Ada riwayat alergi' ? 'destructive' : 'secondary'}
                >
                  {hasAllergyHistory}
                </Badge>
              </div>

              {hasAllergyHistory === 'Ada riwayat alergi' ? (
                <div className='rounded-lg border border-border/60 p-3 bg-card'>
                  <span className='text-xs font-bold text-foreground block mb-1'>
                    Detail Catatan Alergi
                  </span>
                  <p className='text-sm text-foreground leading-relaxed'>{childAllergyHistory}</p>
                </div>
              ) : (
                <div className='rounded-lg border border-border/60 p-4 bg-muted/10 text-center'>
                  <p className='text-xs text-muted-foreground font-medium'>
                    Tidak ada riwayat alergi yang dilaporkan untuk anak ini.
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
}
