'use client';

import React from 'react';

export function DoctorGridLegend() {
  return (
    <div className='px-4 py-3 border-t border-border/30 bg-muted/5 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-medium font-sans'>
      <div className='flex items-center gap-1.5'>
        <span className='size-2.5 rounded-full bg-emerald-500 shrink-0' />
        <span className='text-emerald-700 dark:text-emerald-400 font-semibold'>Tersedia</span>
      </div>
      <div className='flex items-center gap-1.5'>
        <span className='size-2.5 rounded-full bg-sky-500 shrink-0' />
        <span className='text-sky-700 dark:text-sky-400 font-semibold'>Terisi</span>
      </div>
      <div className='flex items-center gap-1.5'>
        <span className='size-2.5 rounded-full bg-amber-500 shrink-0' />
        <span className='text-amber-700 dark:text-amber-400 font-semibold'>
          Dijadwalkan Ulang
        </span>
      </div>
      <div className='flex items-center gap-1.5'>
        <span className='size-2.5 rounded-full bg-rose-500 shrink-0' />
        <span className='text-rose-700 dark:text-rose-400 font-semibold'>Ditutup</span>
      </div>
      <div className='flex items-center gap-1.5'>
        <span className='size-2.5 rounded-sm border border-dashed border-border/80 bg-muted/20 shrink-0' />
        <span className='text-muted-foreground font-semibold'>Belum Terjadwal</span>
      </div>
      <div className='flex items-center gap-1.5'>
        <span className='size-2.5 rounded-full bg-muted-foreground/30 shrink-0' />
        <span className='text-muted-foreground/60 font-semibold'>Selesai</span>
      </div>
    </div>
  );
}
