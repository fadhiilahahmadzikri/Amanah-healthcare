'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { getGenderLabel, type Gender } from '@/constants/gender.constants';
import { getRelationshipLabel } from '@/constants/relationship.constants';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineTextarea } from '@/features/data-pasien/components/registration/atoms/patient-line-textarea';
import { PatientGenderSelector } from '@/features/data-pasien/components/registration/molecules/patient-gender-selector';
import { PatientBloodTypeSelector } from '@/features/data-pasien/components/registration/molecules/patient-blood-type-selector';
import { PatientSearchableSelect } from '@/features/data-pasien/components/registration/molecules/patient-searchable-select';
import {
  CountryBadge,
  PatientRegionDropdown,
  type PatientRegionValues
} from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';
import { formatClinicDate } from '@/lib/date-format';
import type { EditableRegularData, UnifiedInspectorData } from '../types';

export interface RegularIdentitySectionProps {
  data: UnifiedInspectorData;
  isEditing?: boolean;
  regularFormData?: EditableRegularData;
  onRegularFieldChange?: (field: keyof EditableRegularData, val: any) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
  references: any;
}

export function RegularIdentitySection({
  data,
  isEditing = false,
  regularFormData,
  onRegularFieldChange,
  validationErrors,
  onClearError,
  references
}: RegularIdentitySectionProps) {
  const [showNik, setShowNik] = React.useState(false);
  const { patient } = data;
  const relationship = getRelationshipLabel(patient?.relationshipType);

  const isChild = React.useMemo(() => {
    if (
      patient?.relationshipType === 'child' ||
      String(relationship).toLowerCase().includes('anak')
    ) {
      return true;
    }
    const bDate = patient?.birthDate;
    if (bDate) {
      const birthYear = new Date(bDate).getFullYear();
      const currentYear = new Date().getFullYear();
      if (!Number.isNaN(birthYear) && currentYear - birthYear < 17) {
        return true;
      }
    }
    return false;
  }, [patient, relationship]);

  const mrn = patient?.medicalRecordNumber || '';
  const nik = patient?.nik || '';
  const gender = getGenderLabel(patient?.gender);
  const bloodType = patient?.bloodType || '';
  const motherName = patient?.motherName || '';
  const rawOccupation = patient?.occupation;
  const occupation = rawOccupation || '';
  const phone = patient?.phone || '';
  const email = patient?.email || '';

  const regionValues: PatientRegionValues = React.useMemo(
    () => ({
      provinceName: regularFormData?.provinceName || patient?.provinceName || '',
      provinceCode: regularFormData?.provinceCode || patient?.provinceCode || '',
      regencyName: regularFormData?.regencyName || patient?.regencyName || '',
      regencyCode: regularFormData?.regencyCode || patient?.regencyCode || '',
      districtName: regularFormData?.districtName || patient?.districtName || '',
      districtCode: regularFormData?.districtCode || patient?.districtCode || '',
      villageName: regularFormData?.villageName || patient?.villageName || '',
      villageCode: regularFormData?.villageCode || patient?.villageCode || '',
      line1: regularFormData?.line1 ?? patient?.line1 ?? ''
    }),
    [regularFormData, patient]
  );

  const handleRegionChange = React.useCallback(
    (updates: Partial<PatientRegionValues>) => {
      if (!onRegularFieldChange) return;
      Object.entries(updates).forEach(([key, val]) => {
        onRegularFieldChange(key as keyof EditableRegularData, val);
      });
      const merged = { ...regionValues, ...updates };
      const parts = [
        merged.line1,
        merged.villageName ? `Kel. ${merged.villageName}` : '',
        merged.districtName ? `Kec. ${merged.districtName}` : '',
        merged.regencyName,
        merged.provinceName ? `Prov. ${merged.provinceName}` : ''
      ].filter(Boolean);
      onRegularFieldChange('address', parts.join(', '));
    },
    [onRegularFieldChange, regionValues]
  );

  return (
    <div className='rounded-xl border border-border/60 p-4 bg-muted/10 space-y-4 shadow-2xs font-sans'>
      <span className='text-xs font-bold text-foreground block pb-1 border-b border-border/40 uppercase tracking-wider'>
        Identitas Pasien & Demografi
      </span>

      {isEditing && regularFormData && onRegularFieldChange ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <PatientLineInput
            id='reg-mrn-input'
            label='Nomor Rekam Medis (RM)'
            value={regularFormData.medicalRecordNumber ?? mrn}
            onChange={(val) => onRegularFieldChange('medicalRecordNumber', val)}
            placeholder='RM-XXXX-XXXX'
            isMonospace
          />

          <PatientLineInput
            id='reg-name-input'
            label='Nama Lengkap Pasien *'
            value={regularFormData.fullName ?? (patient?.fullName || '')}
            onChange={(val) => {
              onRegularFieldChange('fullName', val);
              if (validationErrors?.fullName && val.trim().length > 0) {
                onClearError?.('fullName');
              }
            }}
            error={validationErrors?.fullName}
            invalid={Boolean(validationErrors?.fullName)}
            placeholder='Nama lengkap...'
            required
          />

          <PatientLineInput
            id='reg-nik-input'
            label='NIK Pasien (16 Digit)'
            value={regularFormData.nik ?? nik}
            onChange={(val) => {
              const numeric = val.replace(/\D/g, '').slice(0, 16);
              onRegularFieldChange('nik', numeric);
              if (validationErrors?.nik && numeric.length === 16) {
                onClearError?.('nik');
              }
            }}
            error={validationErrors?.nik}
            invalid={Boolean(validationErrors?.nik)}
            placeholder='16 digit NIK...'
            maxLength={16}
            isMonospace
            isMasked={!showNik}
            trailingIcon={
              <button
                type='button'
                onClick={() => setShowNik((prev) => !prev)}
                className='text-muted-foreground hover:text-foreground transition-colors p-1'
                title={showNik ? 'Sembunyikan NIK' : 'Tampilkan NIK'}
                tabIndex={-1}
              >
                {showNik ? (
                  <Icons.eyeOff className='size-4 text-primary' />
                ) : (
                  <Icons.eye className='size-4 text-muted-foreground' />
                )}
              </button>
            }
          />

          <PatientLineInput
            id='reg-birthplace-input'
            label='Tempat Lahir'
            value={regularFormData.birthPlace ?? (patient?.birthPlace || '')}
            onChange={(val) => onRegularFieldChange('birthPlace', val)}
            placeholder='Kota lahir...'
          />

          <CustomDatePicker
            id='reg-birthdate-input'
            label='Tanggal Lahir *'
            value={regularFormData.birthDate ?? (patient?.birthDate || '')}
            onChange={(val) => {
              onRegularFieldChange('birthDate', val);
              if (validationErrors?.birthDate && val.trim().length > 0) {
                onClearError?.('birthDate');
              }
            }}
            error={validationErrors?.birthDate}
            invalid={Boolean(validationErrors?.birthDate)}
            placeholder='YYYY-MM-DD'
            disableFutureDates
            variant='underline'
          />

          <PatientGenderSelector
            id='reg-gender-select'
            label='Jenis Kelamin'
            variant='dropdown'
            value={regularFormData.gender || patient?.gender || ''}
            onChange={(val) => onRegularFieldChange('gender', val as Gender)}
            options={references.genders}
          />

          <PatientBloodTypeSelector
            id='reg-blood-select'
            label='Golongan Darah'
            value={regularFormData.bloodType || patient?.bloodType || ''}
            onChange={(val) => onRegularFieldChange('bloodType', val)}
            options={references.bloodTypes}
          />

          <PatientLineInput
            id='reg-mother-input'
            label='Nama Ibu Kandung'
            value={regularFormData.motherName ?? motherName}
            onChange={(val) => onRegularFieldChange('motherName', val)}
            placeholder='Nama ibu kandung...'
          />

          <div className='col-span-1 sm:col-span-2'>
            <PatientSearchableSelect
              id='reg-occ-select'
              label='Pekerjaan'
              value={regularFormData.occupation ?? (rawOccupation || '')}
              placeholder='Pilih pekerjaan pasien...'
              options={references.occupations.map((occ: any) => ({
                id: occ.code,
                name: occ.name,
                description: occ.description
              }))}
              isLoading={references.isLoading}
              onSelect={(item) => onRegularFieldChange('occupation', item.name)}
              searchPlaceholder='Cari pekerjaan...'
            />
          </div>

          <PatientLineInput
            id='reg-phone-input'
            label='No. Telepon / WhatsApp'
            type='tel'
            value={regularFormData.phone ?? phone}
            onChange={(val) => {
              onRegularFieldChange('phone', val);
              if (validationErrors?.phone) {
                onClearError?.('phone');
              }
            }}
            error={validationErrors?.phone}
            invalid={Boolean(validationErrors?.phone)}
            placeholder='08xxxxxxxxxx'
            isMonospace
          />

          <PatientLineInput
            id='reg-email-input'
            label='Email Pasien'
            type='email'
            value={regularFormData.email ?? (patient?.email || '')}
            onChange={(val) => {
              onRegularFieldChange('email', val);
              if (validationErrors?.email) {
                onClearError?.('email');
              }
            }}
            error={validationErrors?.email}
            invalid={Boolean(validationErrors?.email)}
            placeholder='email@domain.com'
          />

          <div className='col-span-1 sm:col-span-2 space-y-2 pt-2 pb-1 border-t border-border/30'>
            <div className='flex items-center justify-between pb-1'>
              <span className='text-xs font-semibold text-muted-foreground block uppercase tracking-wider'>
                Alamat Domisili Pasien
              </span>
              <CountryBadge />
            </div>
            <PatientRegionDropdown values={regionValues} onChange={handleRegionChange} />
          </div>

          <div className='col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-border/30'>
            <PatientLineInput
              id='reg-emg-name-input'
              label='Nama Kontak Darurat'
              value={regularFormData.emergencyContactName ?? (patient?.emergencyContactName || '')}
              onChange={(val) => {
                onRegularFieldChange('emergencyContactName', val);
                if (validationErrors?.emergencyContactName && val.trim().length > 0) {
                  onClearError?.('emergencyContactName');
                }
              }}
              error={validationErrors?.emergencyContactName}
              invalid={Boolean(validationErrors?.emergencyContactName)}
              placeholder='Nama kontak darurat...'
            />
            <PatientLineInput
              id='reg-emg-phone-input'
              label='No. Telp Kontak Darurat'
              value={
                regularFormData.emergencyContactPhone ?? (patient?.emergencyContactPhone || '')
              }
              onChange={(val) => {
                onRegularFieldChange('emergencyContactPhone', val);
                if (validationErrors?.emergencyContactPhone && val.trim().length > 0) {
                  onClearError?.('emergencyContactPhone');
                }
              }}
              error={validationErrors?.emergencyContactPhone}
              invalid={Boolean(validationErrors?.emergencyContactPhone)}
              placeholder='08xxxxxxxxxx'
              isMonospace
            />
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 select-text'>
          {mrn && (
            <PatientLineInput
              id='read-mrn'
              label='Nomor Rekam Medis (RM)'
              value={mrn}
              isMonospace
              readOnly
            />
          )}

          <PatientLineInput
            id='read-relationship'
            label='Hubungan Keluarga'
            value={relationship}
            readOnly
          />

          <PatientLineInput
            id='read-fullname'
            label='Nama Lengkap Pasien'
            value={patient?.fullName || ''}
            readOnly
          />

          <PatientLineInput
            id='read-nik'
            label='NIK Pasien (16 Digit)'
            value={nik}
            readOnly
            isMonospace
            isMasked={!showNik}
            trailingIcon={
              nik ? (
                <button
                  type='button'
                  onClick={() => setShowNik((prev) => !prev)}
                  className='text-muted-foreground hover:text-foreground transition-colors p-1'
                  title={showNik ? 'Sembunyikan NIK' : 'Tampilkan NIK'}
                  tabIndex={-1}
                >
                  {showNik ? (
                    <Icons.eyeOff className='size-4 text-primary' />
                  ) : (
                    <Icons.eye className='size-4 text-muted-foreground' />
                  )}
                </button>
              ) : null
            }
          />

          <PatientLineInput
            id='read-birthplace'
            label='Tempat Lahir'
            value={patient?.birthPlace || ''}
            readOnly
          />

          <PatientLineInput
            id='read-birthdate'
            label='Tanggal Lahir'
            value={
              patient?.birthDate
                ? formatClinicDate(patient.birthDate, { style: 'human_medium' })
                : ''
            }
            isMonospace
            readOnly
          />

          <PatientLineInput id='read-gender' label='Jenis Kelamin' value={gender} readOnly />

          <PatientLineInput id='read-bloodtype' label='Golongan Darah' value={bloodType} readOnly />

          <PatientLineInput id='read-mother' label='Nama Ibu Kandung' value={motherName} readOnly />

          <div className='col-span-1 sm:col-span-2'>
            <PatientLineInput id='read-occupation' label='Pekerjaan' value={occupation} readOnly />
          </div>

          <PatientLineInput
            id='read-phone'
            label='No. Telepon / WhatsApp'
            value={phone}
            isMonospace
            readOnly
          />

          <PatientLineInput id='read-email' label='Email Pasien' value={email} readOnly />

          <div className='col-span-1 sm:col-span-2 space-y-3 pt-2 pb-1 border-t border-border/30'>
            <div className='flex items-center justify-between pb-1'>
              <span className='text-xs font-semibold text-muted-foreground block uppercase tracking-wider'>
                Alamat Domisili Pasien
              </span>
              <CountryBadge />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='col-span-1 sm:col-span-2'>
                <PatientLineInput
                  id='read-province'
                  label='Provinsi'
                  value={regionValues.provinceName || ''}
                  readOnly
                />
              </div>
              <div className='col-span-1 sm:col-span-2'>
                <PatientLineInput
                  id='read-regency'
                  label='Kota / Kabupaten'
                  value={regionValues.regencyName || ''}
                  readOnly
                />
              </div>
              <PatientLineInput
                id='read-district'
                label='Kecamatan'
                value={regionValues.districtName || ''}
                readOnly
              />
              <PatientLineInput
                id='read-village'
                label='Kelurahan / Desa'
                value={regionValues.villageName || ''}
                readOnly
              />
              <div className='col-span-1 sm:col-span-2'>
                <PatientLineTextarea
                  id='read-line1'
                  label='Alamat Detail (Jalan, RT/RW, No. Rumah)'
                  value={regionValues.line1 || ''}
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className='col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-border/30'>
            <PatientLineInput
              id='read-emg-name'
              label='Nama Kontak Darurat'
              value={regularFormData?.emergencyContactName || patient?.emergencyContactName || ''}
              readOnly
            />
            <PatientLineInput
              id='read-emg-phone'
              label='No. Telp Kontak Darurat'
              value={
                regularFormData?.emergencyContactPhone || patient?.emergencyContactPhone || ''
              }
              isMonospace
              readOnly
            />
          </div>
        </div>
      )}
    </div>
  );
}
