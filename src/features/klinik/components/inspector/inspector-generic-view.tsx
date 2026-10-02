'use client';

import * as React from 'react';
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

  const mrn = patient?.medicalRecordNumber || '-';
  const nik = patient?.nik || answers.nik || answers.nik_ktp || '-';
  const birthInfo = patient?.birthDate
    ? `${patient.birthPlace ? patient.birthPlace + ', ' : ''}${patient.birthDate}`
    : answers.birthDate
      ? `${answers.birthPlace ? answers.birthPlace + ', ' : ''}${answers.birthDate}`
      : '-';
  const gender =
    patient?.gender === 'female' || patient?.gender === 'P' || patient?.gender === 'PEREMPUAN'
      ? 'Perempuan'
      : patient?.gender === 'male' || patient?.gender === 'L' || patient?.gender === 'LAKI_LAKI'
        ? 'Laki-laki'
        : patient?.gender || '-';
  const bloodType = patient?.bloodType && patient.bloodType !== 'unknown' ? patient.bloodType : '-';
  const motherName = patient?.motherName || answers.motherName || answers.ibuKandung || '-';
  const occupation = patient?.occupation || answers.occupation || answers.pekerjaan || '-';
  const phone = patient?.phone || appointment.patient_phone || answers.phone || '-';
  const email = patient?.email || answers.email || '-';
  const relationship = patient?.relationLabel || patient?.relationshipType || 'Diri Sendiri';
  const address =
    patient?.address ||
    [patient?.villageName, patient?.districtName, patient?.regencyName, patient?.provinceName]
      .filter(Boolean)
      .join(', ') ||
    answers.address ||
    '-';
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
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
          No. Telepon Pasien
        </span>
        <span className='text-sm font-semibold text-foreground block truncate'>{phone}</span>
      </div>

      <div className='border-b border-border/40 pb-2'>
        <span className='text-xs font-normal text-muted-foreground block mb-0.5'>Email Pasien</span>
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
