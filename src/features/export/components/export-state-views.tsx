'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

export function ExportProgressView({
  progressPercent,
  currentPhase
}: {
  progressPercent: number;
  currentPhase: string;
}) {
  return (
    <div className='py-6 flex flex-col items-center justify-center text-center space-y-3.5'>
      <div className='relative size-18 flex items-center justify-center'>
        <div className='size-18 rounded-full border-4 border-muted border-t-primary animate-spin' />
        <span className='absolute text-xs font-extrabold text-primary'>
          {progressPercent}%
        </span>
      </div>
      <div className='space-y-1'>
        <p className='text-xs sm:text-sm font-semibold text-foreground'>{currentPhase}</p>
        <p className='text-[11px] text-muted-foreground max-w-xs'>
          Proses ekspor berjalan di antrean server. Berkas otomatis terunduh ke peramban.
        </p>
      </div>
    </div>
  );
}

export function ExportCompletedView({ onClose }: { onClose: () => void }) {
  return (
    <div className='py-5 flex flex-col items-center justify-center text-center space-y-3'>
      <div className='size-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400'>
        <Icons.check className='size-6' />
      </div>
      <div className='space-y-1'>
        <p className='text-sm font-bold text-foreground'>Laporan Berhasil Diunduh!</p>
        <p className='text-xs text-muted-foreground max-w-xs'>
          Berkas laporan telah berhasil digenerate dan tersimpan di folder unduhan Anda.
        </p>
      </div>
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={onClose}
        className='mt-2 h-8 text-xs font-semibold px-4 rounded-lg'
      >
        Selesai & Tutup
      </Button>
    </div>
  );
}

export function ExportCheckingView() {
  return (
    <div className='py-8 flex flex-col items-center justify-center text-center space-y-2'>
      <Icons.spinner className='size-6 text-primary animate-spin' />
      <p className='text-xs font-medium text-muted-foreground'>
        Memeriksa ketersediaan data di basis data...
      </p>
    </div>
  );
}

export function ExportEmptyView() {
  return (
    <div className='py-6 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-border/80 bg-muted/20 space-y-2'>
      <div className='size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground'>
        <Icons.alertCircle className='size-5' />
      </div>
      <p className='text-xs font-semibold text-foreground'>Data Tidak Tersedia</p>
      <p className='text-[11px] text-muted-foreground max-w-xs'>
        Tidak ditemukan rekaman data pada periode yang dipilih. Silakan pilih bulan atau periode lain.
      </p>
    </div>
  );
}

export function ExportErrorAlert({ message }: { message: string }) {
  return (
    <div className='p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5'>
      <Icons.alertCircle className='size-4 shrink-0 mt-0.5' />
      <div className='flex-1 min-w-0'>
        <p className='font-semibold'>Gagal Mengekspor Laporan</p>
        <p className='text-[11px] opacity-90 mt-0.5'>{message}</p>
      </div>
    </div>
  );
}
