'use client';

import React from 'react';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';

export interface BookingDateStepProps {
  dateStr: string;
  setDateStr: (date: string) => void;
  title?: string;
  subtitle?: string;
  label?: string;
  placeholder?: string;
  id?: string;
  ariaLabel?: string;
  disablePastDates?: boolean;
}

export function BookingDateStep({
  dateStr,
  setDateStr,
  title = 'Kapan mau berkunjung ke klinik?',
  subtitle = 'Pilih tanggal periksa yang paling cocok buat jadwal kamu.',
  label = 'Tanggal kunjungan*',
  placeholder = 'Pilih tanggal kunjungan...',
  id = 'tanggalKunjunganTrigger',
  ariaLabel = 'Tanggal kunjungan',
  disablePastDates = true
}: BookingDateStepProps) {
  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          {title}
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          {subtitle}
        </p>
      </div>

      <div className='pt-1'>
        <CustomDatePicker
          id={id}
          label={label}
          placeholder={placeholder}
          ariaLabel={ariaLabel}
          value={dateStr}
          onChange={(newDate) => setDateStr(newDate)}
          disablePastDates={disablePastDates}
        />
      </div>
    </div>
  );
}
