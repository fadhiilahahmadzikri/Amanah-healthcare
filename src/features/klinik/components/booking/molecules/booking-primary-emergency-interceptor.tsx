'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
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
  const [showInfo, setShowInfo] = React.useState(false);

  return (
    <div className={cn('space-y-3 font-sans select-none', className)}>
      <div className='flex items-center justify-end'>
        <button
          type='button'
          onClick={() => setShowInfo(true)}
          className='inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-1 px-1.5 rounded-md hover:bg-muted/50'
          aria-label='Info kontak darurat'
        >
          <Icons.info className='size-3.5 text-muted-foreground' />
          <span className='text-[11px] font-medium'>Tentang kontak darurat</span>
        </button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5'>
        <button
          type='button'
          onClick={onSkip}
          className={cn(
            'flex flex-col items-start p-3.5 rounded-xl border text-left transition-all cursor-pointer bg-transparent',
            'border-border/70 hover:border-primary focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary shadow-xs'
          )}
        >
          <div className='flex items-center justify-between w-full mb-1'>
            <span className='text-xs font-bold text-foreground'>Lewati Kontak Darurat</span>
            <Icons.chevronRight className='size-3.5 text-muted-foreground shrink-0' />
          </div>
          <span className='text-[10.5px] text-muted-foreground leading-tight'>
            Lanjut ke langkah berikutnya tanpa kontak darurat
          </span>
        </button>

        <button
          type='button'
          onClick={onManual}
          className={cn(
            'flex flex-col items-start p-3.5 rounded-xl border text-left transition-all cursor-pointer bg-transparent',
            'border-border/70 hover:border-primary focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary shadow-xs'
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

      <ModalWrapper
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        maxWidth='max-w-md'
        className='p-5 font-sans select-none'
      >
        <div className='space-y-3'>
          <div className='flex items-center gap-2 text-foreground font-semibold text-sm'>
            <Icons.info className='size-4 text-primary shrink-0' />
            <span>Kontak Darurat Akun Utama</span>
          </div>
          <p className='text-xs text-muted-foreground leading-relaxed'>
            Sebagai akun utama yang baru didaftarkan, Anda belum memiliki relasi kerabat yang terhubung.
            Kontak darurat bersifat opsional dan dapat Anda lengkapi sewaktu-waktu.
          </p>
          <div className='pt-2 flex justify-end'>
            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={() => setShowInfo(false)}
              className='text-xs'
            >
              Mengerti
            </Button>
          </div>
        </div>
      </ModalWrapper>
    </div>
  );
}
