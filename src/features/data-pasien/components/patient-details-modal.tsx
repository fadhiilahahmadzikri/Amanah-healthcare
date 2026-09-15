'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getStatusConfig } from '@/styles/clinical-tokens';
import { cn } from '@/lib/utils';
import type { Patient } from '../api/types';

export interface PatientDetailsModalProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onEdit?: (patient: Patient) => void;
}

export function PatientDetailsModal({
  isOpen,
  patient,
  onClose,
  onEdit
}: PatientDetailsModalProps) {
  if (!patient) return null;

  const initials = patient.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const statusConfig = getStatusConfig(patient.account_status);

  const nikDisplay = patient.nik_ktp || patient.nik || '-';
  const ibuKandungDisplay = patient.nama_ibu_kandung || '-';
  const tempatLahirDisplay = patient.tempat_lahir || '-';
  const tanggalLahirDisplay = patient.tanggal_lahir || patient.birth_date || '-';
  const usiaDisplay = patient.age !== undefined ? `${patient.age} tahun` : '-';
  const pekerjaanDisplay = patient.pekerjaan || '-';
  const domisiliDisplay = patient.domisili || patient.address || '-';
  const teleponDisplay = patient.nomor_telepon_wa || patient.phone || '-';
  const emailDisplay = patient.email_pasien || patient.email || '-';
  const registrasiDisplay = patient.tanggal_registrasi_akun || '-';
  const loginPertamaDisplay = patient.login_pertama_kali || '-';
  const kunjunganTerakhirDisplay = patient.kunjungan_terakhir || '-';
  const totalKunjunganDisplay =
    patient.total_kunjungan !== undefined ? `${patient.total_kunjungan} kali` : '-';

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[580px]'
      showCloseButton={false}
    >
      <div className='relative font-sans space-y-3.5'>
        {/* 1. Patient Identity Header & Status in Top-Right Position */}
        <div className='flex items-start justify-between gap-4 pb-3.5 border-b border-border/40'>
          <div className='flex items-center gap-4 min-w-0 flex-1'>
            <div className='size-16 min-w-[64px] min-h-[64px] rounded-full overflow-hidden shrink-0 ring-1 ring-border/40 bg-muted aspect-square'>
              <Avatar className='size-full rounded-full'>
                {patient.avatar && <AvatarImage src={patient.avatar} alt={patient.name} />}
                <AvatarFallback className='bg-primary/10 text-primary font-bold text-lg'>
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className='flex flex-col items-start min-w-0 flex-1 space-y-0.5'>
              <h3 className='text-base sm:text-lg font-bold text-foreground truncate w-full tracking-tight'>
                {patient.name}
              </h3>
              <p className='text-sm font-medium text-muted-foreground truncate w-full'>
                No. Rekam Medis: {patient.patient_id}
              </p>
              <div className='pt-0.5'>
                <span className='inline-flex items-center px-2.5 py-0.5 bg-muted text-muted-foreground rounded-md text-xs font-medium leading-none'>
                  <span>NIK: {nikDisplay}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge in Top-Right Position (Identical to Janji Temu Cards) */}
          <div className='shrink-0 pt-0.5'>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm select-none shadow-none',
                statusConfig.pillBg,
                statusConfig.pillBorder
              )}
            >
              <span
                className={cn(
                  'size-2 rounded-full shrink-0 ring-1 ring-white/60 dark:ring-white/20',
                  statusConfig.dotGradient
                )}
              />
              <span
                className={cn(
                  'bg-clip-text text-transparent font-bold tracking-tight',
                  statusConfig.textGradient
                )}
              >
                {statusConfig.label}
              </span>
            </span>
          </div>
        </div>

        {/* 2. Data Demografis & Identitas (Read-Only / Disabled Font Style) */}
        <div className='pb-3 border-b border-border/40'>
          <span className='text-xs font-normal text-muted-foreground/80 block mb-2'>
            Data Demografis & Identitas
          </span>
          <div className='grid grid-cols-2 gap-y-3 gap-x-5'>
            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                NIK (KTP)
              </span>
              <span className='text-sm font-medium text-muted-foreground block truncate font-mono select-text'>
                {nikDisplay}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Nama Ibu Kandung
              </span>
              <span className='text-sm font-medium text-muted-foreground block truncate select-text'>
                {ibuKandungDisplay}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Tempat, Tanggal Lahir & Usia
              </span>
              <span className='text-sm font-medium text-muted-foreground block truncate select-text'>
                {tempatLahirDisplay}, {tanggalLahirDisplay} ({usiaDisplay})
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Jenis Kelamin & Golongan Darah
              </span>
              <span className='text-sm font-medium text-muted-foreground block truncate select-text'>
                {patient.gender} • Golongan {patient.blood_type || '-'}
              </span>
            </div>

            <div className='col-span-2 border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Pekerjaan & Domisili
              </span>
              <div className='text-sm font-medium text-muted-foreground select-text'>
                <span className='font-medium text-muted-foreground'>{pekerjaanDisplay}</span>
                <span className='text-muted-foreground/80 font-normal block text-xs mt-0.5'>
                  {domisiliDisplay}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Informasi Kontak (Read-Only / Disabled Font Style) */}
        <div className='py-2.5 border-b border-border/40'>
          <span className='text-xs font-normal text-muted-foreground/80 block mb-2'>
            Informasi Kontak
          </span>
          <div className='grid grid-cols-2 gap-y-3 gap-x-5'>
            <div className='border-b border-border/40 pb-2 flex flex-col justify-center'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Nomor Telepon / WhatsApp
              </span>
              <div className='flex items-center gap-1.5 text-sm font-medium text-muted-foreground select-text'>
                <span className='truncate'>{teleponDisplay}</span>
              </div>
            </div>

            <div className='border-b border-border/40 pb-2 flex flex-col justify-center'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Email Pasien
              </span>
              <div className='flex items-center gap-1.5 text-sm font-medium text-muted-foreground select-text'>
                <span className='truncate' title={emailDisplay}>
                  {emailDisplay}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Riwayat Akun & Kunjungan (Read-Only / Disabled Font Style) */}
        <div className='py-2.5 border-b border-border/40'>
          <span className='text-xs font-normal text-muted-foreground/80 block mb-2'>
            Riwayat Akun & Kunjungan
          </span>
          <div className='grid grid-cols-2 gap-y-3 gap-x-5'>
            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Tanggal Registrasi Akun
              </span>
              <span className='text-sm font-medium text-muted-foreground block font-mono select-text'>
                {registrasiDisplay}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Login Pertama Kali
              </span>
              <span className='text-sm font-medium text-muted-foreground block truncate select-text'>
                {loginPertamaDisplay}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Kunjungan Terakhir
              </span>
              <span className='text-sm font-medium text-muted-foreground block truncate select-text'>
                {kunjunganTerakhirDisplay}
              </span>
            </div>

            <div className='border-b border-border/40 pb-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-0.5'>
                Total Kunjungan
              </span>
              <span className='text-sm font-medium text-muted-foreground block select-text'>
                {totalKunjunganDisplay}
              </span>
            </div>
          </div>
        </div>

        {/* 5. Modal Action Buttons */}
        <div className='pt-2 flex items-center justify-end gap-3'>
          {onEdit && (
            <Button
              type='button'
              variant='outline'
              shape='pill'
              size='default'
              onClick={() => {
                onClose();
                onEdit(patient);
              }}
              className='px-5 font-medium'
            >
              <Icons.edit className='mr-1.5 size-3.5' />
              Edit Pasien
            </Button>
          )}

          <Button
            type='button'
            variant='default'
            shape='pill'
            size='default'
            onClick={onClose}
            className='px-7 font-semibold'
          >
            Tutup
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
