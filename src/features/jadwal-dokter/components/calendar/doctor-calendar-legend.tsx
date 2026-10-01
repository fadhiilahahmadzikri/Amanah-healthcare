'use client';

import React from 'react';

export function DoctorCalendarLegend() {
  return (
    <div className='px-4 py-3 border-t border-border/30 bg-muted/5 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-bold shrink-0'>
      <div className='flex items-center gap-2'>
        <span className='size-2.5 rounded-full bg-emerald-500' />
        <span className='text-emerald-700 dark:text-emerald-400'>Buka</span>
      </div>
      <div className='flex items-center gap-2'>
        <span className='size-2.5 rounded-full bg-sky-500' />
        <span className='text-sky-700 dark:text-sky-400'>Cuti</span>
      </div>
      <div className='flex items-center gap-2'>
        <span className='size-2.5 rounded-full bg-muted-foreground/50' />
        <span className='text-muted-foreground'>Tutup</span>
      </div>
    </div>
  );
}
