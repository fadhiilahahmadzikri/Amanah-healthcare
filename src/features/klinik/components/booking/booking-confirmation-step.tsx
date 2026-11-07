'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import type { ServiceCatalogItem } from '../../api/catalog.service';
import type { PatientAffiliationProfile } from '@/features/data-pasien/api/patient-affiliation-service';
import { formatClinicDate } from '@/lib/date-format';
import { formatFriendlyVisitType, type CanonicalVisitType } from '@/constants/visit-type.constants';
import { AUDIENCE, type AudienceType } from '@/core/auth/permissions.constants';

export interface BookingConfirmationStepProps {
  selectedService: ServiceCatalogItem | null;
  selectedPatient: PatientAffiliationProfile | null;
  dateStr: string;
  session?: string;
  sessionLabel?: string;
  visitType: CanonicalVisitType | string;
  complaint: string;
  mode?: 'create' | 'reschedule';
  strategy?: 'proposal' | 'direct';
  audience?: AudienceType;
  reason?: string;
  onReasonChange?: (reason: string) => void;
  appointmentCount?: number;
}

export function BookingConfirmationStep({
  selectedService,
  selectedPatient,
  dateStr,
  session,
  sessionLabel,
  visitType,
  complaint,
  mode = 'create',
  strategy,
  audience,
  reason,
  onReasonChange,
  appointmentCount
}: BookingConfirmationStepProps) {
  const isReschedule = mode === 'reschedule';
  const isInternalProposal =
    isReschedule && audience === AUDIENCE.INTERNAL && strategy !== 'direct';
  const displaySession = sessionLabel || session || '';
  const displayServiceName = selectedService?.name ?? '';
  const displayPatientName = selectedPatient?.fullName ?? '';
  const isBulk = Boolean(appointmentCount && appointmentCount > 1);

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          {isReschedule
            ? isInternalProposal
              ? isBulk
                ? `Pengajuan jadwal baru untuk ${appointmentCount} antrean`
                : 'Cek ringkasan jadwal baru janji temu ✨'
              : 'Cek ringkasan jadwal baru kamu ✨'
            : 'Cek lagi ringkasan janji temu kamu ya ✨'}
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          {isReschedule
            ? isInternalProposal
              ? 'Pastikan tanggal dan sesi baru sudah sesuai sebelum diajukan ke pasien.'
              : 'Pastikan tanggal dan sesi baru sudah sesuai sebelum disimpan.'
            : 'Pastikan semua data sudah sesuai sebelum tiket antrean resmi diterbitkan.'}
        </p>
      </div>

      <div className='space-y-1 text-xs pt-1'>
        {displayServiceName && (
          <div className='flex items-center justify-between py-2 border-b border-border'>
            <span className='text-muted-foreground font-normal'>Poliklinik & Layanan</span>
            <span className='font-semibold text-foreground'>{displayServiceName}</span>
          </div>
        )}

        <div className='flex items-center justify-between py-2 border-b border-border'>
          <span className='text-muted-foreground font-normal'>
            {isBulk ? 'Jumlah Pasien' : 'Pasien'}
          </span>
          <span className='font-semibold text-foreground'>
            {isBulk ? (
              `${appointmentCount} Antrean Terpilih`
            ) : (
              <>
                {displayPatientName}
                {selectedPatient?.nik ? ` (NIK: ${selectedPatient.nik})` : ''}
              </>
            )}
          </span>
        </div>

        <div className='flex items-center justify-between py-2 border-b border-border'>
          <span className='text-muted-foreground font-normal'>
            {isReschedule ? 'Tanggal Baru' : 'Tanggal Reservasi'}
          </span>
          <span className='font-semibold text-primary'>{formatClinicDate(dateStr)}</span>
        </div>

        <div className='flex items-center justify-between py-2 border-b border-border'>
          <span className='text-muted-foreground font-normal'>
            {isReschedule ? 'Sesi Baru' : 'Sesi Konsultasi'}
          </span>
          <span className='font-bold text-primary'>{displaySession}</span>
        </div>

        {isInternalProposal && (
          <div className='py-2.5 space-y-1.5 border-b border-border'>
            <label htmlFor='reschedule-reason' className='text-muted-foreground font-normal block'>
              Alasan Pengajuan Jadwal Ulang
            </label>
            <input
              id='reschedule-reason'
              type='text'
              value={reason || ''}
              onChange={(e) => onReasonChange?.(e.target.value)}
              placeholder='Misal: Dokter penanggung jawab berhalangan hadir'
              className='w-full h-8.5 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-2xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground'
            />
          </div>
        )}

        {!isReschedule && (
          <div className='flex items-center justify-between py-2 border-b border-border'>
            <span className='text-muted-foreground font-normal'>Tipe Kunjungan</span>
            <span className='font-medium text-foreground'>
              {formatFriendlyVisitType(visitType as CanonicalVisitType)}
            </span>
          </div>
        )}

        {!isReschedule && (
          <div className='py-2 space-y-1'>
            <span className='text-muted-foreground font-normal block'>Keluhan Medis</span>
            <p className='text-foreground font-normal'>{complaint || ''}</p>
          </div>
        )}
      </div>

      <div className='flex items-center gap-2 p-2.5 rounded-lg bg-muted/60 text-muted-foreground text-xs'>
        <Icons.info className='size-4 text-primary shrink-0' />
        <span>
          {isReschedule
            ? isInternalProposal
              ? 'Usulan perubahan jadwal akan dikirimkan kepada pasien via notifikasi. Janji temu akan berpindah setelah disetujui pasien.'
              : 'Setelah disimpan, jadwal janji temu Anda akan langsung diperbarui ke tanggal dan sesi baru yang dipilih.'
            : 'Setelah disimpan, tiket nomor antrean resmi klinik akan langsung terbit. Dokter dan ruangan konsultasi ditetapkan saat giliran dipanggil.'}
        </span>
      </div>
    </div>
  );
}
