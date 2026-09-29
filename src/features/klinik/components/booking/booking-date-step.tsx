'use client';

import React from 'react';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';

export interface BookingDateStepProps {
  dateStr: string;
  setDateStr: (date: string) => void;
}

export function BookingDateStep({ dateStr, setDateStr }: BookingDateStepProps) {
  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Kapan mau berkunjung ke klinik? 🗓️
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Pilih tanggal periksa yang paling cocok buat jadwal kamu.
        </p>
      </div>

      <div className='pt-1'>
        <CustomDatePicker
          id='tanggalKunjunganTrigger'
          label='Tanggal kunjungan*'
          placeholder='Pilih tanggal kunjungan...'
          ariaLabel='Tanggal kunjungan'
          value={dateStr}
          onChange={(newDate) => setDateStr(newDate)}
          disablePastDates={true}
        />
      </div>
    </div>
  );
}
