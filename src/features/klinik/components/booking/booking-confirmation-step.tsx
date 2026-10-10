'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import type { ServiceCatalogItem } from '../../api/catalog.service';
import type { PatientAffiliationProfile } from '@/features/data-pasien/api/patient-affiliation-service';

export interface BookingConfirmationStepProps {
  selectedService: ServiceCatalogItem | null;
  selectedPatient: PatientAffiliationProfile | null;
  dateStr: string;
  session?: string;
  visitType: string;
  complaint: string;
  serviceName?: string;
  patientName?: string;
}

export function BookingConfirmationStep({
  selectedService,
  selectedPatient,
  dateStr,
  session,
  visitType,
  complaint,
  serviceName,
  patientName
}: BookingConfirmationStepProps) {
  const sessionLabel = session || '-';
  const displayServiceName = serviceName || selectedService?.name || 'Poliklinik';
  const displayPatientName = patientName || selectedPatient?.fullName || 'Pasien';

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Cek lagi ringkasan janji temu kamu ya ✨
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Pastikan semua data sudah sesuai sebelum tiket antrean resmi diterbitkan.
        </p>
      </div>

      <div className='space-y-1 text-xs pt-1'>
        <div className='flex items-center justify-between py-2 border-b border-border'>
          <span className='text-muted-foreground font-normal'>Poliklinik & Layanan</span>
          <span className='font-semibold text-foreground'>{displayServiceName}</span>
        </div>

        <div className='flex items-center justify-between py-2 border-b border-border'>
          <span className='text-muted-foreground font-normal'>Pasien</span>
          <span className='font-semibold text-foreground'>
            {displayPatientName}
            {selectedPatient?.nik ? ` (NIK: ${selectedPatient.nik})` : ''}
          </span>
        </div>

        <div className='flex items-center justify-between py-2 border-b border-border'>
          <span className='text-muted-foreground font-normal'>Tanggal Reservasi</span>
          <span className='font-semibold text-primary'>{dateStr}</span>
        </div>

        <div className='flex items-center justify-between py-2 border-b border-border'>
          <span className='text-muted-foreground font-normal'>Sesi Konsultasi</span>
          <span className='font-bold text-primary'>{sessionLabel}</span>
        </div>

        <div className='flex items-center justify-between py-2 border-b border-border'>
          <span className='text-muted-foreground font-normal'>Tipe Kunjungan</span>
          <span className='font-medium text-foreground'>{visitType}</span>
        </div>

        <div className='py-2 space-y-1'>
          <span className='text-muted-foreground font-normal block'>Keluhan Medis</span>
          <p className='text-foreground font-normal'>{complaint || '-'}</p>
        </div>
      </div>

      <div className='flex items-center gap-2 p-2.5 rounded-lg bg-muted/60 text-muted-foreground text-xs'>
        <Icons.check className='size-4 text-emerald-600 shrink-0' />
        <span>
          Setelah disimpan, tiket nomor antrean resmi klinik akan langsung terbit. Dokter dan
          ruangan konsultasi ditetapkan saat giliran dipanggil.
        </span>
      </div>
    </div>
  );
}
