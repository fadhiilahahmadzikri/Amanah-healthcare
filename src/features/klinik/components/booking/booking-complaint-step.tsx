'use client';

import React from 'react';

export interface BookingComplaintStepProps {
  complaint: string;
  setComplaint: (complaint: string) => void;
}

export function BookingComplaintStep({ complaint, setComplaint }: BookingComplaintStepProps) {
  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Ada keluhan apa yang kamu rasakan?
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Ceritakan sedikit gejala atau alasan kunjunganmu agar dokter jaga dapat bersiap.
        </p>
      </div>

      <div className='space-y-2 pt-1'>
        <label htmlFor='complaint-input' className='block text-xs font-semibold text-foreground'>
          Keluhan Medis / Gejala Klinis
        </label>
        <textarea
          id='complaint-input'
          rows={5}
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          placeholder='contoh: Sudah 2 hari demam naik turun, kepala pusing, dan batuk kering...'
          className='w-full p-3.5 text-xs bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all'
        />
      </div>
    </div>
  );
}
