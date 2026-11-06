'use client';

import React from 'react';
import type { UserItem } from '../../api/types';

export interface UserProfileSectionProps {
  user: UserItem;
  formatDateTime: (dateStr?: string | null) => string;
}

function calculateAge(birthDateStr?: string | null): number | null {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

function formatBirthDate(birthDateStr?: string | null): string {
  if (!birthDateStr) return '-';
  try {
    const d = new Date(birthDateStr);
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(d);
  } catch {
    return birthDateStr;
  }
}

export function UserProfileSection({ user }: UserProfileSectionProps) {
  const patient = user.patientProfile;
  const staff = user.staffProfile;

  return (
    <div className='space-y-4'>
      <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
        {staff ? 'Profil Staf' : patient ? 'Profil Pasien' : 'Profil Terhubung'}
      </span>

      <div className='divide-y divide-border/40 text-xs'>
        {staff ? (
          <>
            <div className='py-2 flex items-center justify-between'>
              <span className='text-muted-foreground'>Kode Staf / NIP</span>
              <span className='font-mono font-medium text-foreground'>{staff.staffCode}</span>
            </div>
            <div className='py-2 flex items-center justify-between'>
              <span className='text-muted-foreground'>Posisi</span>
              <span className='font-medium text-foreground'>
                {staff.positionTitle || 'Staf Operasional'}
              </span>
            </div>
            <div className='py-2 flex items-center justify-between'>
              <span className='text-muted-foreground'>Departemen</span>
              <span className='font-medium text-foreground'>{staff.departmentName || '-'}</span>
            </div>
            <div className='py-2 flex items-center justify-between'>
              <span className='text-muted-foreground'>Unit Poliklinik</span>
              <span className='font-medium text-foreground'>
                {staff.primaryUnitName || '-'}
              </span>
            </div>
          </>
        ) : patient ? (
          <>
            <div className='py-2 flex items-center justify-between'>
              <span className='text-muted-foreground'>No. Rekam Medis</span>
              <span className='font-mono font-semibold text-foreground'>
                {patient.medicalRecordNumber}
              </span>
            </div>
            <div className='py-2 flex items-center justify-between'>
              <span className='text-muted-foreground'>Golongan Darah</span>
              <span className='font-semibold text-foreground'>
                {patient.bloodType || '-'}
              </span>
            </div>
            <div className='py-2 flex items-start justify-between gap-4'>
              <span className='text-muted-foreground shrink-0'>Tanggal Lahir &amp; Usia</span>
              <span className='font-medium text-foreground text-right'>
                {patient.birthPlace ? `${patient.birthPlace}, ` : ''}
                {formatBirthDate(patient.birthDate)}
                {calculateAge(patient.birthDate) !== null && (
                  <span className='text-muted-foreground ml-1'>
                    ({calculateAge(patient.birthDate)} th)
                  </span>
                )}
              </span>
            </div>
            <div className='py-2 flex items-center justify-between'>
              <span className='text-muted-foreground'>Jenis Kelamin</span>
              <span className='font-medium text-foreground'>
                {patient.gender === 'female' ? 'Perempuan' : patient.gender === 'male' ? 'Laki-laki' : '-'}
              </span>
            </div>
            <div className='py-2 flex items-center justify-between'>
              <span className='text-muted-foreground'>Nama Ibu Kandung</span>
              <span className='font-medium text-foreground'>{patient.motherName || '-'}</span>
            </div>
            <div className='py-2 flex items-center justify-between'>
              <span className='text-muted-foreground'>Pekerjaan</span>
              <span className='font-medium text-foreground'>{patient.occupation || '-'}</span>
            </div>
            <div className='py-2 flex items-center justify-between'>
              <span className='text-muted-foreground'>Total Kunjungan</span>
              <span className='font-medium text-foreground'>{patient.visitCount || 0} kali</span>
            </div>
            {patient.address?.fullAddress && (
              <div className='py-2 flex items-start justify-between gap-4'>
                <span className='text-muted-foreground shrink-0'>Alamat Domisili</span>
                <span className='font-medium text-foreground text-right text-[11px] max-w-[65%]'>
                  {patient.address.fullAddress}
                </span>
              </div>
            )}
            {patient.emergencyContact && (
              <div className='py-2 flex items-start justify-between gap-4'>
                <span className='text-muted-foreground shrink-0'>Kontak Darurat</span>
                <span className='font-medium text-foreground text-right text-[11px]'>
                  {patient.emergencyContact.name}
                  {patient.emergencyContact.relationship ? ` (${patient.emergencyContact.relationship})` : ''} -{' '}
                  <span className='font-mono'>{patient.emergencyContact.phone}</span>
                </span>
              </div>
            )}
          </>
        ) : (
          <div className='py-6 text-center text-xs text-muted-foreground'>
            Belum ada profil staf atau pasien terhubung
          </div>
        )}
      </div>
    </div>
  );
}
