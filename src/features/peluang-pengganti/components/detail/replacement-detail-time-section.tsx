'use client';

import React from 'react';

export interface ReplacementDetailTimeSectionProps {
  sessionName: string;
  timeDisplay: string;
}

export function ReplacementDetailTimeSection({
  sessionName,
  timeDisplay
}: ReplacementDetailTimeSectionProps) {
  return (
    <div className='bg-muted/30 p-3 rounded-xl space-y-2 text-xs'>
      <div className='text-xs font-semibold text-foreground'>Waktu & sesi pelayanan</div>
      <div className='grid grid-cols-2 gap-2'>
        <div>
          <span className='text-muted-foreground block text-[11px]'>Sesi dinas</span>
          <span className='font-medium text-foreground'>{sessionName}</span>
        </div>
        <div>
          <span className='text-muted-foreground block text-[11px]'>Jam operasional</span>
          <span className='font-medium text-foreground'>{timeDisplay}</span>
        </div>
      </div>
    </div>
  );
}
