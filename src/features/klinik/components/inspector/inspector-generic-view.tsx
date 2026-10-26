'use client';

import * as React from 'react';
import { getGenderLabel } from '@/constants/gender.constants';
import { getRelationshipLabel } from '@/constants/relationship.constants';
import type { InspectorTabProps } from './types';

export function InspectorGenericView({ appointment, data }: InspectorTabProps) {
  const { flow, answers, automatic, child, patient } = data;

  if (flow === 'immunization' || child) {
    const childNik = child?.childNik || answers.childNik || '-';
    const birthDate = child?.childBirthDate || answers.childBirthDate || '-';
    const childSex = child?.childSex || answers.childSex || '-';
    const childAge =
      child?.childAgeFormatted || answers.childAgeFormatted || automatic.childAgeAtSubmit || '-';
    const parentPhone = child?.parentPhone || answers.parentPhone || '-';
    const fatherName = child?.fatherName || answers.fatherName || '-';
    const motherName = child?.motherName || answers.motherName || '-';
    const address = child?.childAddress || answers.childAddress || '-';
    const vaccineHistory =
      child?.previousVaccineHistory ||
      answers.previousVaccineHistory ||
      'Belum ada catatan vaksinasi sebelumnya.';
    const allergyHistory = child?.childAllergyHistory || answers.childAllergyHistory || '-';

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
  const nik = patient?.nik || answers.nik || '-';
  const birthInfo = patient?.birthDate
    ? `${patient.birthPlace ? patient.birthPlace + ', ' : ''}${patient.birthDate}`
    : answers.birthDate
      ? `${answers.birthPlace ? answers.birthPlace + ', ' : ''}${answers.birthDate}`
      : '-';
  const gender = getGenderLabel(patient?.gender);

  const bloodType = patient?.bloodType || answers.bloodType || '-';

  const motherName = patient?.motherName || answers.motherName || '-';
  const rawOccupation = patient?.occupation || answers.occupation;
  const occupation = isChild && !rawOccupation ? 'Belum Bekerja' : rawOccupation || '-';

  const phone = patient?.phone || appointment.patient_phone || answers.phone || '-';
  const email = patient?.email || answers.email || appointment.patient_email || '-';

  const address = patient?.address || answers.address || '-';
  const emergency = patient?.emergencyContactName
    ? `${patient.emergencyContactName} (${patient.emergencyContactRelationship || 'Kontak'}) - ${patient.emergencyContactPhone || ''}`
    : null;

  return (
    <div className='grid grid-cols-2 gap-y-3 gap-x-5'>
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
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>NIK Pasien</span>
        <span className='text-sm font-semibold font-mono text-foreground block truncate'>
          {nik}
        </span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Tempat, Tanggal Lahir
        </span>
        <span className='text-sm font-semibold text-foreground block truncate'>{birthInfo}</span>
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
        <span className='text-sm font-semibold text-foreground block truncate'>{bloodType}</span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Nama Ibu Kandung
        </span>
        <span className='text-sm font-semibold text-foreground block truncate'>{motherName}</span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>Pekerjaan</span>
        <span className='text-sm font-semibold text-foreground block truncate'>{occupation}</span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>No. Telepon</span>
        <span className='text-sm font-semibold text-foreground block truncate'>{phone}</span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>Email</span>
        <span className='text-sm font-semibold text-foreground block truncate'>{email}</span>
      </div>

      <div className='col-span-2 border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          Alamat Domisili
        </span>
        <p className='text-sm font-medium text-foreground leading-relaxed'>{address}</p>
      </div>

      {emergency && (
        <div className='col-span-2 border-b border-border/40 pb-2'>
          <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
            Kontak Darurat
          </span>
          <p className='text-sm font-medium text-foreground leading-relaxed'>{emergency}</p>
        </div>
      )}

      {autoEntries.length > 0 && (
        <div className='col-span-2 pt-2'>
          <span className='text-xs font-bold text-foreground block mb-2'>
            Kalkulasi Klinis Otomatis
          </span>
          <div className='grid grid-cols-2 gap-y-3 gap-x-5'>
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
        <div className='col-span-2 pt-2'>
          <span className='text-xs font-bold text-foreground block mb-2'>
            Jawaban Formulir Tambahan
          </span>
          <div className='grid grid-cols-2 gap-y-3 gap-x-5'>
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
