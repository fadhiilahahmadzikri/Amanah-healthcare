'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { cn } from '@/lib/utils';
import { usePatientCheckIn } from '../model/usePatientCheckIn';
import type { PerformCheckInSuccessData } from '@/features/appointment-pasien/api/types';

export interface PatientCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckInSuccess?: (result: PerformCheckInSuccessData) => void;
}

export function PatientCheckInModal({
  isOpen,
  onClose,
  onCheckInSuccess
}: PatientCheckInModalProps) {
  const {
    activeTab,
    manualCode,
    isSubmitting,
    isScannerStarting,
    cameraError,
    successResult,
    containerId,
    actions
  } = usePatientCheckIn({
    isOpen,
    onClose,
    onCheckInSuccess
  });

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={actions.handleClose}
      maxWidth='max-w-[480px]'
      showCloseButton={false}
    >
      <div className='relative font-sans space-y-4'>
        <div className='flex items-start justify-between gap-3 pb-3 border-b border-border/40'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              {successResult ? 'Check-In Berhasil' : 'Konfirmasi Kedatangan (Check-In)'}
            </h3>
            <p className='text-xs text-muted-foreground'>
              {successResult
                ? 'Status janji temu Anda telah aktif di ruang tunggu klinik.'
                : 'Pindai QR Code dari admin klinik atau masukkan kode manual.'}
            </p>
          </div>
          <button
            type='button'
            onClick={actions.handleClose}
            aria-label='Tutup'
            className='rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors cursor-pointer shrink-0'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        {successResult ? (
          <div className='py-4 flex flex-col items-center text-center space-y-4'>
            <div className='size-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center ring-8 ring-emerald-500/5'>
              <Icons.check className='size-8 stroke-[2.5]' />
            </div>

            <div className='space-y-1.5'>
              <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning-subtle text-warning border border-warning-border text-xs font-bold'>
                <span className='size-2 rounded-full bg-warning' />
                Menunggu Panggilan
              </span>
              <p className='text-sm font-bold text-foreground pt-1'>
                Nomor Antrean Anda:
              </p>
              <div className='text-3xl font-black font-mono tracking-wider text-primary'>
                {successResult.queueNumber || '-'}
              </div>
            </div>

            <p className='text-xs text-muted-foreground max-w-[320px] leading-relaxed'>
              Silakan duduk di ruang tunggu klinik. Anda akan menerima notifikasi suara dan push saat nomor antrean dipanggil.
            </p>

            <Button
              type='button'
              variant='default'
              shape='pill'
              onClick={actions.handleClose}
              className='w-full font-semibold text-xs py-2 mt-2'
            >
              Kembali ke Antrean
            </Button>
          </div>
        ) : (
          <>
            <div className='flex p-1 bg-muted/60 rounded-xl gap-1 border border-border/40'>
              <button
                type='button'
                onClick={() => actions.setActiveTab('scan')}
                className={cn(
                  'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                  activeTab === 'scan'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icons.qrCode className='size-3.5' />
                <span>Pindai QR</span>
              </button>
              <button
                type='button'
                onClick={() => actions.setActiveTab('manual')}
                className={cn(
                  'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                  activeTab === 'manual'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icons.edit className='size-3.5' />
                <span>Kode Manual</span>
              </button>
            </div>

            {activeTab === 'scan' && (
              <div className='space-y-3'>
                <div className='relative w-full aspect-square max-w-[320px] mx-auto rounded-2xl overflow-hidden bg-black/90 flex flex-col items-center justify-center border border-border/60 shadow-inner'>
                  <div id={containerId} className='w-full h-full' />

                  {isScannerStarting && (
                    <div className='absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2 text-white/80 z-10'>
                      <Icons.spinner className='size-7 animate-spin text-primary' />
                      <span className='text-xs font-medium'>Mengaktifkan kamera...</span>
                    </div>
                  )}

                  {isSubmitting && (
                    <div className='absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2 text-white z-20'>
                      <Icons.spinner className='size-8 animate-spin text-primary' />
                      <span className='text-xs font-semibold'>Memproses check-in...</span>
                    </div>
                  )}
                </div>

                {cameraError ? (
                  <div className='bg-destructive/10 text-destructive text-xs p-3 rounded-xl border border-destructive/20 text-center space-y-2'>
                    <p>{cameraError}</p>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => actions.setActiveTab('manual')}
                      className='text-xs h-7'
                    >
                      Beralih ke Input Manual
                    </Button>
                  </div>
                ) : (
                  <p className='text-center text-[11px] text-muted-foreground'>
                    Arahkan kamera ke QR Code yang ditampilkan oleh petugas / admin klinik.
                  </p>
                )}
              </div>
            )}

            {activeTab === 'manual' && (
              <form onSubmit={actions.handleManualSubmit} className='space-y-4 py-2'>
                <div className='space-y-2'>
                  <label
                    htmlFor='checkin-manual-code'
                    className='text-xs font-medium text-foreground block text-left'
                  >
                    Kode Manual Check-In (6 Karakter)
                  </label>
                  <div className='relative'>
                    <input
                      id='checkin-manual-code'
                      aria-label='Kode Manual Check-In'
                      type='text'
                      value={manualCode}
                      onChange={(e) => actions.setManualCode(e.target.value.toUpperCase())}
                      placeholder='Contoh: CK-8F42'
                      maxLength={10}
                      className='w-full text-center text-xl font-bold font-mono tracking-widest py-3 px-4 bg-muted/30 border border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary uppercase'
                    />
                  </div>
                  <p className='text-[11px] text-muted-foreground text-left'>
                    Masukkan 6 digit kode unik yang tertera pada layar admin klinik.
                  </p>
                </div>

                <div className='flex items-center justify-end gap-2 pt-2 border-t border-border/40'>
                  <Button
                    type='button'
                    variant='outline'
                    shape='pill'
                    size='sm'
                    onClick={actions.handleClose}
                    className='text-xs px-5'
                  >
                    Batal
                  </Button>
                  <Button
                    type='submit'
                    variant='default'
                    shape='pill'
                    size='sm'
                    disabled={isSubmitting || !manualCode.trim()}
                    className='text-xs px-6 font-semibold'
                  >
                    {isSubmitting ? (
                      <Icons.spinner className='size-3.5 mr-1.5 animate-spin' />
                    ) : (
                      <Icons.check className='size-3.5 mr-1.5' />
                    )}
                    Konfirmasi Check-In
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </ModalWrapper>
  );
}
