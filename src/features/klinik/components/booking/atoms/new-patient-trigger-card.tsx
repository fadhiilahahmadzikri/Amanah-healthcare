'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export interface NewPatientTriggerCardProps {
  onClick: () => void;
  className?: string;
  label?: string;
  subLabel?: string;
}

export function NewPatientTriggerCard({
  onClick,
  className,
  label = 'Daftarkan pasien baru',
  subLabel = 'Pilih profil hubungan atau daftarkan'
}: NewPatientTriggerCardProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'p-4 rounded-2xl border border-dashed border-border hover:border-primary/60 bg-muted/10 hover:bg-primary/5 transition-all cursor-pointer flex items-center gap-3 min-h-[72px] text-left select-none w-full',
        className
      )}
    >
      <div className='size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0'>
        <Icons.add className='size-4' />
      </div>
      <div className='min-w-0 flex-1'>
        <span className='text-xs font-bold text-foreground block truncate'>{label}</span>
        <span className='text-[11px] text-muted-foreground block truncate'>{subLabel}</span>
      </div>
    </button>
  );
}
