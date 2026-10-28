'use client';

import * as React from 'react';
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
import { getGenderLabel } from '@/constants/gender.constants';
import { getRelationshipLabel } from '@/constants/relationship.constants';
import type { InspectorTabProps } from './types';

export function InspectorGenericView({
  data,
  isEditing = false,
  regularFormData,
  onRegularFieldChange
}: InspectorTabProps) {
  const { flow, answers, automatic, child, patient } = data;

  if (flow === 'immunization' || child) {
    const childNik = child?.childNik || '-';
    const birthDate = child?.childBirthDate || '-';
    const childSex = child?.childSex || '-';
    const childAge = child?.childAgeFormatted || '-';
    const parentPhone = child?.parentPhone || '-';
    const fatherName = child?.fatherName || '-';
    const motherName = child?.motherName || '-';
    const address = child?.childAddress || '-';
    const vaccineHistory =
      child?.previousVaccineHistory || 'Belum ada catatan vaksinasi sebelumnya.';
    const allergyHistory = child?.childAllergyHistory || '-';

    return (
      <div className='grid grid-cols-2 gap-y-3 gap-x-5'>
        <div className='border-b border-border/40 pb-2'>
          <span className='text-xs font-normal text-muted-foreground block mb-0.5'>NIK Anak</span>
          <span className='text-sm font-semibold font-mono text-foreground block truncate'>
            {childNik}
          </span>
        </div>

        <div className='border-b border-border/40 pb-2'>
          <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
            Usia Saat Pendaftaran
          </span>
          <span className='text-sm font-bold font-mono text-primary block truncate'>
            {childAge}
          </span>
        </div>

        <div className='border-b border-border/40 pb-2'>
          <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
            Tanggal Lahir / Kelamin
          </span>
          <span className='text-sm font-semibold text-foreground block truncate'>
            {birthDate} ({childSex})
          </span>
        </div>

        <div className='border-b border-border/40 pb-2'>
          <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
            No. Telepon Orang Tua
          </span>
          <span className='text-sm font-semibold text-foreground block truncate'>
            {parentPhone}
          </span>
        </div>

        <div className='col-span-2 border-b border-border/40 pb-2'>
          <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
            Nama Orang Tua (Ayah / Ibu)
          </span>
          <span className='text-sm font-semibold text-foreground block truncate'>
            {fatherName} / {motherName}
          </span>
        </div>

        <div className='col-span-2 border-b border-border/40 pb-2'>
          <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
            Alamat Tempat Tinggal
          </span>
          <p className='text-sm font-medium text-foreground leading-relaxed'>{address}</p>
        </div>

        <div className='col-span-2 border-b border-border/40 pb-2'>
          <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
            Riwayat Vaksinasi Sebelumnya
          </span>
          <p className='text-sm font-medium text-foreground leading-relaxed'>{vaccineHistory}</p>
        </div>

        <div className='col-span-2 border-b border-border/40 pb-2'>
          <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
            Riwayat Alergi Anak
          </span>
          <p className='text-sm font-medium text-foreground leading-relaxed'>{allergyHistory}</p>
        </div>
      </div>
    );
  }

  const entries = Object.entries(answers).filter(([, val]) => val && String(val).trim().length > 0);
  const autoEntries = Object.entries(automatic).filter(
    ([, val]) => val && String(val).trim().length > 0
  );

  const relationship = getRelationshipLabel(patient?.relationshipType);

  const isChild = React.useMemo(() => {
    if (
      patient?.relationshipType === 'child' ||
      String(relationship).toLowerCase().includes('anak')
    ) {
      return true;
    }
    const bDate = patient?.birthDate || answers.birthDate;
    if (bDate) {
      const birthYear = new Date(bDate).getFullYear();
      const currentYear = new Date().getFullYear();
      if (!isNaN(birthYear) && currentYear - birthYear < 17) {
        return true;
      }
    }
    return false;
  }, [patient, relationship, answers.birthDate]);

  const mrn = patient?.medicalRecordNumber || '-';
  const nik = patient?.nik || '-';
  const birthInfo = patient?.birthDate
    ? `${patient.birthPlace ? patient.birthPlace + ', ' : ''}${patient.birthDate}`
    : '-';
  const gender = getGenderLabel(patient?.gender);
  const bloodType = patient?.bloodType || '-';
  const motherName = patient?.motherName || '-';
  const rawOccupation = patient?.occupation;
  const occupation = isChild && !rawOccupation ? 'Belum Bekerja' : rawOccupation || '-';
  const phone = patient?.phone || '-';
  const email = patient?.email || '-';
  const address = patient?.address || '-';
  const emergency = patient?.emergencyContactName
    ? `${patient.emergencyContactName} (${patient.emergencyContactRelationship || 'Kontak'}) - ${patient.emergencyContactPhone || ''}`
    : null;

  return (
    <div className='flex flex-col gap-5'>
      {/* Profil Identitas Pasien (Editable atau Read-Only) */}
      <div className='rounded-lg border border-border/50 p-4 bg-muted/10'>
        <span className='text-xs font-bold text-foreground block mb-3 pb-1 border-b border-border/40'>
          Identitas Pasien & Demografi
        </span>
        {isEditing && regularFormData && onRegularFieldChange ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
            <div className='space-y-1.5'>
              <Label htmlFor='reg-mrn-input' className='text-xs font-medium text-foreground'>
                Nomor Rekam Medis (RM)
              </Label>
              <Input
                id='reg-mrn-input'
                value={regularFormData.medicalRecordNumber ?? (mrn !== '-' ? mrn : '')}
                onChange={(e) => onRegularFieldChange('medicalRecordNumber', e.target.value)}
                placeholder='RM-XXXX-XXXX'
                className='h-8 text-xs font-mono font-semibold text-primary'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='reg-name-input' className='text-xs font-medium text-foreground'>
                Nama Lengkap Pasien <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='reg-name-input'
                value={regularFormData.fullName ?? (patient?.fullName || '')}
                onChange={(e) => onRegularFieldChange('fullName', e.target.value)}
                placeholder='Nama lengkap...'
                className='h-8 text-xs'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='reg-nik-input' className='text-xs font-medium text-foreground'>
                NIK Pasien (16 Digit)
              </Label>
              <Input
                id='reg-nik-input'
                value={regularFormData.nik ?? (nik !== '-' ? nik : '')}
                onChange={(e) => onRegularFieldChange('nik', e.target.value)}
                placeholder='16 digit NIK...'
                maxLength={16}
                className='h-8 text-xs font-mono'
              />
            </div>

            <div className='grid grid-cols-2 gap-2'>
              <div className='space-y-1.5'>
                <Label htmlFor='reg-birthplace-input' className='text-xs font-medium text-foreground'>
                  Tempat Lahir
                </Label>
                <Input
                  id='reg-birthplace-input'
                  value={regularFormData.birthPlace ?? (patient?.birthPlace || '')}
                  onChange={(e) => onRegularFieldChange('birthPlace', e.target.value)}
                  placeholder='Kota lahir...'
                  className='h-8 text-xs'
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='reg-birthdate-input' className='text-xs font-medium text-foreground'>
                  Tanggal Lahir
                </Label>
                <CustomDatePicker
                  id='reg-birthdate-input'
                  value={regularFormData.birthDate ?? (patient?.birthDate || '')}
                  onChange={(val) => onRegularFieldChange('birthDate', val)}
                  placeholder='YYYY-MM-DD'
                  triggerClassName='h-8 text-xs'
                  disableFutureDates
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-2'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium text-foreground'>Jenis Kelamin</Label>
                <Select
                  value={regularFormData.gender || patient?.gender || ''}
                  onValueChange={(val) => onRegularFieldChange('gender', val)}
                >
                  <SelectTrigger className='h-8 text-xs w-full'>
                    <SelectValue placeholder='Pilih kelamin' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='male' className='text-xs'>
                      Laki-laki
                    </SelectItem>
                    <SelectItem value='female' className='text-xs'>
                      Perempuan
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium text-foreground'>Golongan Darah</Label>
                <Select
                  value={regularFormData.bloodType || patient?.bloodType || ''}
                  onValueChange={(val) => onRegularFieldChange('bloodType', val)}
                >
                  <SelectTrigger className='h-8 text-xs w-full'>
                    <SelectValue placeholder='Pilih gol. darah' />
                  </SelectTrigger>
                  <SelectContent>
                    {['A', 'B', 'AB', 'O', 'Tidak tahu'].map((b) => (
                      <SelectItem key={b} value={b} className='text-xs'>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='reg-mother-input' className='text-xs font-medium text-foreground'>
                Nama Ibu Kandung
              </Label>
              <Input
                id='reg-mother-input'
                value={regularFormData.motherName ?? (motherName !== '-' ? motherName : '')}
                onChange={(e) => onRegularFieldChange('motherName', e.target.value)}
                placeholder='Nama ibu kandung...'
                className='h-8 text-xs'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='reg-occ-input' className='text-xs font-medium text-foreground'>
                Pekerjaan
              </Label>
              <Input
                id='reg-occ-input'
                value={regularFormData.occupation ?? (rawOccupation || '')}
                onChange={(e) => onRegularFieldChange('occupation', e.target.value)}
                placeholder='Pekerjaan...'
                className='h-8 text-xs'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='reg-phone-input' className='text-xs font-medium text-foreground'>
                No. Telepon / WhatsApp
              </Label>
              <Input
                id='reg-phone-input'
                value={regularFormData.phone ?? (phone !== '-' ? phone : '')}
                onChange={(e) => onRegularFieldChange('phone', e.target.value)}
                placeholder='08xxxxxxxxxx'
                className='h-8 text-xs font-mono'
              />
            </div>

            <div className='col-span-1 sm:col-span-2 space-y-1.5'>
              <Label htmlFor='reg-address-input' className='text-xs font-medium text-foreground'>
                Alamat Domisili
              </Label>
              <Textarea
                id='reg-address-input'
                value={regularFormData.address ?? (address !== '-' ? address : '')}
                onChange={(e) => onRegularFieldChange('address', e.target.value)}
                placeholder='Alamat lengkap domisili...'
                rows={2}
                className='text-xs resize-none'
              />
            </div>

            <div className='col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border/30'>
              <div className='space-y-1.5'>
                <Label htmlFor='reg-emg-name-input' className='text-xs font-medium text-foreground'>
                  Nama Kontak Darurat
                </Label>
                <Input
                  id='reg-emg-name-input'
                  value={
                    regularFormData.emergencyContactName ??
                    (patient?.emergencyContactName || '')
                  }
                  onChange={(e) => onRegularFieldChange('emergencyContactName', e.target.value)}
                  placeholder='Nama kontak darurat...'
                  className='h-8 text-xs'
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='reg-emg-phone-input' className='text-xs font-medium text-foreground'>
                  No. Telp Kontak Darurat
                </Label>
                <Input
                  id='reg-emg-phone-input'
                  value={
                    regularFormData.emergencyContactPhone ??
                    (patient?.emergencyContactPhone || '')
                  }
                  onChange={(e) => onRegularFieldChange('emergencyContactPhone', e.target.value)}
                  placeholder='08xxxxxxxxxx'
                  className='h-8 text-xs font-mono'
                />
              </div>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-5 select-text'>
            {mrn !== '-' && (
              <div className='border-b border-border/40 pb-2'>
                <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                  Nomor Rekam Medis (RM)
                </span>
                <span className='text-sm font-bold font-mono text-primary block truncate'>{mrn}</span>
              </div>
            )}

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                Hubungan Keluarga
              </span>
              <span className='text-sm font-semibold text-foreground block truncate capitalize'>
                {relationship}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                NIK Pasien
              </span>
              <span className='text-sm font-semibold font-mono text-foreground block truncate'>
                {nik}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                Tempat, Tanggal Lahir
              </span>
              <span className='text-sm font-semibold text-foreground block truncate'>
                {birthInfo}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                Jenis Kelamin
              </span>
              <span className='text-sm font-semibold text-foreground block truncate'>{gender}</span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                Golongan Darah
              </span>
              <span className='text-sm font-semibold text-foreground block truncate'>
                {bloodType}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                Nama Ibu Kandung
              </span>
              <span className='text-sm font-semibold text-foreground block truncate'>
                {motherName}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                Pekerjaan
              </span>
              <span className='text-sm font-semibold text-foreground block truncate'>
                {occupation}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                No. Telepon
              </span>
              <span className='text-sm font-semibold text-foreground block truncate'>{phone}</span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>Email</span>
              <span className='text-sm font-semibold text-foreground block truncate'>{email}</span>
            </div>

            <div className='col-span-1 sm:col-span-2 border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                Alamat Domisili
              </span>
              <p className='text-sm font-medium text-foreground leading-relaxed'>{address}</p>
            </div>

            {emergency && (
              <div className='col-span-1 sm:col-span-2 border-b border-border/40 pb-2'>
                <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                  Kontak Darurat
                </span>
                <p className='text-sm font-medium text-foreground leading-relaxed'>{emergency}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Skrining Klinis & Vitals (Review-first atau Editable) */}
      <div className='rounded-lg border border-border/50 p-4 bg-card'>
        <span className='text-xs font-bold text-foreground block mb-3 pb-1 border-b border-border/40'>
          Data Klinis & Anamnesis Intake
        </span>

        {isEditing && regularFormData && onRegularFieldChange ? (
          <div className='space-y-4'>
            <div className='space-y-1.5'>
              <Label htmlFor='reg-complaint-input' className='text-xs font-medium text-foreground'>
                Keluhan Utama
              </Label>
              <Textarea
                id='reg-complaint-input'
                value={regularFormData.complaint}
                onChange={(e) => onRegularFieldChange('complaint', e.target.value)}
                placeholder='Keluhan utama saat konsultasi...'
                rows={3}
                className='text-xs resize-none'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='reg-allergy-input' className='text-xs font-medium text-foreground'>
                Riwayat Alergi (Obat / Makanan)
              </Label>
              <Input
                id='reg-allergy-input'
                value={regularFormData.allergyHistory}
                onChange={(e) => onRegularFieldChange('allergyHistory', e.target.value)}
                placeholder='Riwayat alergi...'
                className='h-8 text-xs'
              />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='reg-height-input' className='text-xs font-medium text-foreground'>
                  Tinggi Badan (cm)
                </Label>
                <Input
                  id='reg-height-input'
                  type='number'
                  value={regularFormData.heightCm}
                  onChange={(e) => onRegularFieldChange('heightCm', e.target.value)}
                  placeholder='Contoh: 165'
                  className='h-8 text-xs font-mono'
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='reg-weight-input' className='text-xs font-medium text-foreground'>
                  Berat Badan (kg)
                </Label>
                <Input
                  id='reg-weight-input'
                  type='number'
                  value={regularFormData.weightKg}
                  onChange={(e) => onRegularFieldChange('weightKg', e.target.value)}
                  placeholder='Contoh: 60'
                  className='h-8 text-xs font-mono'
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='reg-bp-input' className='text-xs font-medium text-foreground'>
                  Tekanan Darah (mmHg)
                </Label>
                <Input
                  id='reg-bp-input'
                  value={regularFormData.bloodPressure}
                  onChange={(e) => onRegularFieldChange('bloodPressure', e.target.value)}
                  placeholder='Contoh: 120/80'
                  className='h-8 text-xs font-mono'
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='reg-notes-input' className='text-xs font-medium text-foreground'>
                Catatan Tambahan
              </Label>
              <Textarea
                id='reg-notes-input'
                value={regularFormData.notes}
                onChange={(e) => onRegularFieldChange('notes', e.target.value)}
                placeholder='Catatan skrining atau anjuran medis awal...'
                rows={3}
                className='text-xs resize-none'
              />
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-5 select-text'>
            <div className='col-span-1 sm:col-span-2 border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                Keluhan Utama
              </span>
              <p className='text-sm font-semibold text-foreground leading-relaxed'>
                {regularFormData?.complaint ||
                  answers.complaint ||
                  answers.keluhanUtama ||
                  data.complaint ||
                  '-'}
              </p>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                Riwayat Alergi
              </span>
              <span className='text-sm font-medium text-foreground block truncate'>
                {regularFormData?.allergyHistory ||
                  answers.allergy ||
                  answers.allergyHistory ||
                  answers.riwayatAlergi ||
                  'Tidak ada riwayat alergi'}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                Tinggi / Berat Badan
              </span>
              <span className='text-sm font-semibold font-mono text-foreground block truncate'>
                {regularFormData?.heightCm || answers.height || '-'} cm /{' '}
                {regularFormData?.weightKg || answers.weight || '-'} kg
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                Tekanan Darah
              </span>
              <span className='text-sm font-semibold font-mono text-foreground block truncate'>
                {regularFormData?.bloodPressure || answers.bloodPressure || '-'} mmHg
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
                Catatan Tambahan
              </span>
              <span className='text-sm font-medium text-foreground block truncate'>
                {regularFormData?.notes || answers.notes || '-'}
              </span>
            </div>
          </div>
        )}
      </div>

      {autoEntries.length > 0 && (
        <div className='rounded-lg border border-border/50 p-4 bg-muted/10'>
          <span className='text-xs font-bold text-foreground block mb-2'>
            Kalkulasi Klinis Otomatis
          </span>
          <div className='grid grid-cols-2 gap-y-3 gap-x-5 select-text'>
            {autoEntries.map(([key, val]) => (
              <div key={key} className='border-b border-border/40 pb-2'>
                <span className='text-xs font-normal text-muted-foreground block mb-0.5 truncate'>
                  {key}
                </span>
                <span className='text-sm font-semibold text-foreground block truncate'>
                  {String(val)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div className='rounded-lg border border-border/50 p-4 bg-muted/10'>
          <span className='text-xs font-bold text-foreground block mb-2'>
            Jawaban Formulir Tambahan
          </span>
          <div className='grid grid-cols-2 gap-y-3 gap-x-5 select-text'>
            {entries.map(([key, val]) => (
              <div key={key} className='border-b border-border/40 pb-2'>
                <span className='text-xs font-normal text-muted-foreground block mb-0.5 truncate'>
                  {key}
                </span>
                <span className='text-sm font-semibold text-foreground block truncate'>
                  {String(val)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
