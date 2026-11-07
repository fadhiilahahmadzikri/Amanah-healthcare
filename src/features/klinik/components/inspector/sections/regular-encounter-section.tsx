'use client';

import * as React from 'react';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { formatClinicDate } from '@/lib/date-format';
import type { Appointment } from '../../../api/types';
import type { EditableRegularData, UnifiedInspectorData } from '../types';

export interface RegularEncounterSectionProps {
  appointment: Appointment;
  data: UnifiedInspectorData;
  isEditing?: boolean;
  regularFormData?: EditableRegularData;
  onRegularFieldChange?: (field: keyof EditableRegularData, val: any) => void;
}

export function RegularEncounterSection({
  appointment,
  data,
  isEditing = false,
  regularFormData,
  onRegularFieldChange
}: RegularEncounterSectionProps) {
  const scheduledDateFormatted = formatClinicDate(
    data.scheduledDate || appointment.date,
    { style: 'human_medium' }
  );

  return (
    <div className='rounded-xl border border-border/60 p-4 bg-card shadow-2xs font-sans'>
      <span className='text-xs font-bold text-foreground block mb-3 pb-1 border-b border-border/40 uppercase tracking-wider'>
        Informasi Pendaftaran & Keluhan
      </span>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-5 select-text mb-3'>
        <div className='border-b border-border/40 pb-2'>
          <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
            Kode Booking
          </span>
          <span className='text-sm font-semibold font-mono text-primary block truncate'>
            {data.bookingCode || appointment.booking_code || ''}
          </span>
        </div>

        <div className='border-b border-border/40 pb-2'>
          <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
            Poliklinik Tujuan
          </span>
          <span className='text-sm font-semibold text-foreground block truncate'>
            {data.poliklinikName || appointment.poliklinik_name || ''}
          </span>
        </div>

        <div className='border-b border-border/40 pb-2'>
          <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
            Layanan Medis
          </span>
          <span className='text-sm font-semibold text-foreground block truncate'>
            {data.serviceName || appointment.service || ''}
          </span>
        </div>

        <div className='border-b border-border/40 pb-2'>
          <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
            Dokter Jaga / Pemeriksa
          </span>
          <span className='text-sm font-semibold text-foreground block truncate'>
            {appointment.doctor_name || ''}
          </span>
        </div>

        <div className='border-b border-border/40 pb-2'>
          <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
            Waktu Konsultasi
          </span>
          <span className='text-sm font-semibold text-foreground block truncate'>
            {scheduledDateFormatted}
            {data.scheduledStartTime || appointment.scheduled_start_time
              ? ` (${data.scheduledStartTime || appointment.scheduled_start_time} WIB)`
              : ''}
          </span>
        </div>

        <div className='border-b border-border/40 pb-2'>
          <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
            Ruang & Lokasi
          </span>
          <span className='text-sm font-semibold text-foreground block truncate'>
            {appointment.room_name || appointment.room_location || ''}
          </span>
        </div>
      </div>

      <div className='pt-1'>
        {isEditing && regularFormData && onRegularFieldChange ? (
          <PatientLineInput
            id='reg-complaint-input'
            label='Keluhan Utama / Alasan Kunjungan'
            value={regularFormData.complaint}
            onChange={(val) => onRegularFieldChange('complaint', val)}
            placeholder='Keluhan utama saat konsultasi...'
          />
        ) : (
          <PatientLineInput
            id='read-complaint'
            label='Keluhan Utama / Alasan Kunjungan'
            value={
              regularFormData?.complaint ||
              data.answers.complaint ||
              data.answers.keluhanUtama ||
              data.complaint ||
              appointment.complaint ||
              ''
            }
            readOnly
          />
        )}
      </div>
    </div>
  );
}
