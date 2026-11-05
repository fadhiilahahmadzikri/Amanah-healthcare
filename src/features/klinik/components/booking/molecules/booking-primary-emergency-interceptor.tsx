'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export interface BookingPrimaryEmergencyInterceptorProps {
  onSkip: () => void;
  onManual: () => void;
  className?: string;
}

export function BookingPrimaryEmergencyInterceptor({
  onSkip,
  onManual,
  className
}: BookingPrimaryEmergencyInterceptorProps) {
  return (
    <div className={cn('space-y-3 font-sans select-none', className)}>
      <div className='p-3.5 rounded-2xl border border-border/80 bg-muted/20 space-y-2'>
        <div className='flex items-center gap-2 text-foreground font-semibold text-xs sm:text-sm'>
          <Icons.userCheck className='size-4 text-primary shrink-0' />
          <span>Pendaftaran Akun Utama</span>
        </div>
        <p className='text-[11px] sm:text-xs text-muted-foreground leading-relaxed'>
          Sebagai akun utama yang baru didaftarkan, Anda belum memiliki relasi kerabat yang terhubung.
          Kontak darurat bersifat opsional dan dapat dilengkapi nanti.
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1'>
        <button
          type='button'
          onClick={onSkip}
          className={cn(
            'flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer',
            'border-primary/40 bg-primary/5 hover:border-primary hover:bg-primary/10 shadow-xs'
          )}
        >
          <div className='flex items-center justify-between w-full mb-1'>
            <span className='text-xs font-bold text-primary'>Lewati Kontak Darurat</span>
            <Icons.chevronRight className='size-3.5 text-primary shrink-0' />
          </div>
          <span className='text-[10.5px] text-muted-foreground leading-tight'>
            Lanjut ke langkah berikutnya tanpa kontak darurat
          </span>
        </button>

        <button
          type='button'
          onClick={onManual}
          className={cn(
            'flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer',
            'border-border/70 bg-card hover:border-border hover:bg-muted/40'
          )}
        >
          <div className='flex items-center justify-between w-full mb-1'>
            <span className='text-xs font-bold text-foreground'>Isi Kontak Manual</span>
            <Icons.userPlus className='size-3.5 text-muted-foreground shrink-0' />
          </div>
          <span className='text-[10.5px] text-muted-foreground leading-tight'>
            Masukkan kontak orang tua, pasangan, atau keluarga
          </span>
        </button>
      </div>
    </div>
  );
}
