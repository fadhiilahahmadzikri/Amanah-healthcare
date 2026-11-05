'use client';

import * as React from 'react';
import type { UnifiedInspectorData } from '../types';

export interface RegularClinicalNotesSectionProps {
  data: UnifiedInspectorData;
}

export function RegularClinicalNotesSection({ data }: RegularClinicalNotesSectionProps) {
  const { answers, automatic } = data;

  const entries = Object.entries(answers).filter(
    ([, val]) => val && String(val).trim().length > 0
  );
  const autoEntries = Object.entries(automatic).filter(
    ([, val]) => val && String(val).trim().length > 0
  );

  if (autoEntries.length === 0 && entries.length === 0) {
    return null;
  }

  return (
    <div className='space-y-4 font-sans'>
      {autoEntries.length > 0 && (
        <div className='rounded-xl border border-border/60 p-4 bg-muted/10 shadow-2xs'>
          <span className='text-xs font-bold text-foreground block mb-2 uppercase tracking-wider'>
            Kalkulasi Klinis Otomatis
          </span>
          <div className='grid grid-cols-2 gap-y-3 gap-x-5 select-text'>
            {autoEntries.map(([key, val]) => (
              <div key={key} className='border-b border-border/40 pb-2'>
                <span className='text-xs font-normal text-muted-foreground block mb-0.5 truncate'>
                  {key}
                </span>
                <span className='text-sm font-semibold text-foreground block truncate'>
                  {String(val)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div className='rounded-xl border border-border/60 p-4 bg-muted/10 shadow-2xs'>
          <span className='text-xs font-bold text-foreground block mb-2 uppercase tracking-wider'>
            Jawaban Formulir Tambahan
          </span>
          <div className='grid grid-cols-2 gap-y-3 gap-x-5 select-text'>
            {entries.map(([key, val]) => (
              <div key={key} className='border-b border-border/40 pb-2'>
                <span className='text-xs font-normal text-muted-foreground block mb-0.5 truncate'>
                  {key}
                </span>
                <span className='text-sm font-semibold text-foreground block truncate'>
                  {String(val)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
