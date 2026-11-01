'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export interface BookingComplaintStepProps {
  complaint: string;
  setComplaint: (complaint: string) => void;
  complaintSuggestions?: string[];
}

export function BookingComplaintStep({
  complaint,
  setComplaint,
  complaintSuggestions = []
}: BookingComplaintStepProps) {
  const isItemSelected = (item: string) => {
    const currentTokens = complaint
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    return currentTokens.includes(item.toLowerCase());
  };

  const handleToggleComplaint = (item: string) => {
    const currentTokens = complaint
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const existsIndex = currentTokens.findIndex((t) => t.toLowerCase() === item.toLowerCase());

    let updated: string[];
    if (existsIndex >= 0) {
      updated = currentTokens.filter((_, idx) => idx !== existsIndex);
    } else {
      updated = [...currentTokens, item];
    }
    setComplaint(updated.join(', '));
  };

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

      {complaintSuggestions.length > 0 && (
        <div className='space-y-2 pt-1'>
          <p className='text-[11px] font-medium text-muted-foreground'>
            Rekomendasi keluhan awal (klik untuk memilih):
          </p>
          <div className='flex flex-wrap gap-1.5'>
            {complaintSuggestions.map((item, idx) => {
              const selected = isItemSelected(item);
              return (
                <button
                  key={idx}
                  type='button'
                  onClick={() => handleToggleComplaint(item)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer select-none',
                    selected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/40 hover:bg-muted text-foreground border-border/70 hover:border-border'
                  )}
                >
                  {selected ? (
                    <Icons.check className='size-3 shrink-0' />
                  ) : (
                    <Icons.add className='size-3 shrink-0 text-muted-foreground' />
                  )}
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className='space-y-2 pt-1'>
        <label htmlFor='complaint-input' className='block text-xs font-semibold text-foreground'>
          Keluhan Medis / Gejala Klinis
        </label>
        <textarea
          id='complaint-input'
          aria-label='Keluhan Medis / Gejala Klinis'
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
