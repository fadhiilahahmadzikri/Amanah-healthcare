'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@/components/ui/drawer';
import { usePatientCheckIn } from '../model/usePatientCheckIn';
import { PatientQrScanner } from './patient-qr-scanner';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
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
    manualCode,
    isSubmitting,
    cameraError,
    successResult,
    isManualDrawerOpen,
    actions
  } = usePatientCheckIn({
    isOpen,
    onClose,
    onCheckInSuccess
  });

  if (!isOpen) return null;

  return (
    <>
      {/* 1. Main Immersive Full-Screen Scanner Modal */}
      <ModalWrapper
        isOpen={isOpen}
        onClose={actions.handleClose}
        maxWidth='max-w-none'
        backdropClassName='p-0'
        showCloseButton={false}
        className='flex flex-col p-0 overflow-hidden bg-black text-white w-screen h-[100dvh] max-h-[100dvh] rounded-none border-0 shadow-none m-0'
      >
        <div className='relative w-full h-full flex flex-col font-sans select-none overflow-hidden'>
          {successResult ? (
            /* Success State */
            <div className='h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-background text-foreground'>
              <div className='size-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center ring-8 ring-emerald-500/5'>
                <Icons.check className='size-8 stroke-[2.5]' />
              </div>

              <div className='space-y-1.5'>
                <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning-subtle text-warning border border-warning-border text-xs font-bold'>
                  <span className='size-2 rounded-full bg-warning' />
                  Menunggu Panggilan
                </span>
                <p className='text-sm font-bold text-foreground pt-1'>Nomor Antrean Anda:</p>
                <div className='text-3xl font-black font-mono tracking-wider text-primary'>
                  {successResult.queueNumber || '-'}
                </div>
              </div>

              <p className='text-xs text-muted-foreground max-w-[320px] leading-relaxed'>
                Silakan duduk di ruang tunggu klinik. Anda akan menerima notifikasi suara dan layar
                saat nomor antrean dipanggil.
              </p>

              <Button
                type='button'
                variant='default'
                shape='pill'
                size='card-action'
                onClick={actions.handleClose}
                className='w-full font-semibold text-xs mt-2'
              >
                Kembali ke Antrean
              </Button>
            </div>
          ) : (
            /* Full-Screen Camera View */
            <div className='relative w-full h-full flex-1 flex flex-col overflow-hidden bg-black'>
              {/* Floating Top Header Bar */}
              <div className='absolute top-4 right-4 z-30 flex items-center pointer-events-none'>
                <button
                  type='button'
                  onClick={actions.handleClose}
                  aria-label='Tutup kamera scanner'
                  className='pointer-events-auto size-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-colors cursor-pointer shadow-lg'
                >
                  <Icons.close className='size-4' />
                </button>
              </div>

              {/* Full Camera Viewfinder */}
              <div className='relative w-full h-full flex-1 overflow-hidden bg-black flex items-center justify-center'>
                <PatientQrScanner
                  onScan={actions.handleScan}
                  onError={actions.handleScannerError}
                  isSubmitting={isSubmitting}
                />

                {isSubmitting && (
                  <div className='absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2 text-white z-20'>
                    <Icons.spinner className='size-8 animate-spin text-primary' />
                    <span className='text-xs font-semibold'>Memproses check-in...</span>
                  </div>
                )}
              </div>

              {/* Camera Error Message (if any) */}
              {cameraError && (
                <div className='absolute top-16 inset-x-4 z-30 bg-destructive/90 text-destructive-foreground backdrop-blur-md text-xs p-3 rounded-xl border border-destructive/30 text-center space-y-2 shadow-xl'>
                  <p>{cameraError}</p>
                  <div className='flex items-center justify-center gap-2 pt-1'>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={actions.clearCameraError}
                      className='text-xs h-7 px-3 bg-black/40 border-white/20 text-white'
                    >
                      <Icons.refresh className='size-3 mr-1' />
                      <span>Coba Lagi</span>
                    </Button>
                    <Button
                      type='button'
                      variant='secondary'
                      size='sm'
                      onClick={() => actions.setIsManualDrawerOpen(true)}
                      className='text-xs h-7 px-3'
                    >
                      Input Manual
                    </Button>
                  </div>
                </div>
              )}

              {/* Floating Action Button (FAB) Manual Code Button */}
              <div className='absolute bottom-5 inset-x-0 z-30 flex justify-center pointer-events-none'>
                <Button
                  type='button'
                  shape='pill'
                  variant='secondary'
                  size='card-action'
                  onClick={() => actions.setIsManualDrawerOpen(true)}
                  className='pointer-events-auto bg-card/95 hover:bg-card text-foreground backdrop-blur-md shadow-2xl border border-border/80 px-5 text-xs font-semibold gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95'
                >
                  <Icons.edit className='size-3.5 text-primary' />
                  <span>Masukkan Kode Manual</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </ModalWrapper>

      {/* 2. Manual Code Bottom Drawer Sheet */}
      <Drawer
        open={isManualDrawerOpen}
        onOpenChange={(open) => actions.setIsManualDrawerOpen(open)}
      >
        <DrawerContent
          className='max-h-[85vh] font-sans z-[70]'
          overlayClassName='z-[70]'
        >
          <DrawerHeader className='text-left pb-2.5 border-b border-border/40'>
            <DrawerTitle className='text-base font-bold text-foreground tracking-tight'>
              Kode Manual Check-In
            </DrawerTitle>
            <DrawerDescription className='text-xs text-muted-foreground'>
              Masukkan 6 digit kode unik yang tertera pada layar admin klinik.
            </DrawerDescription>
          </DrawerHeader>

          <form onSubmit={actions.handleManualSubmit} className='p-4 space-y-4 select-none'>
            <div className='py-3 flex flex-col items-center space-y-2'>
              <label
                htmlFor='checkin-manual-code'
                className='text-xs font-medium text-foreground block text-center'
              >
                Kode Check-In Pasien
              </label>
              <div className='flex justify-center'>
                <InputOTP
                  id='checkin-manual-code'
                  aria-label='Kode Manual Check-In'
                  maxLength={6}
                  value={manualCode}
                  onChange={(val) => actions.setManualCode(val.toUpperCase())}
                  disabled={isSubmitting}
                  containerClassName='justify-center'
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className='size-11 text-base font-bold font-mono'
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className='text-[11px] text-muted-foreground text-center'>
                Pemeriksaan kode akan langsung mengaktifkan antrean Anda.
              </p>
            </div>

            <DrawerFooter className='pt-2 border-t border-border/40 px-0 flex-row gap-2'>
              <Button
                type='button'
                variant='outline'
                shape='pill'
                size='card-action'
                onClick={() => actions.setIsManualDrawerOpen(false)}
                className='flex-1 font-semibold text-xs'
              >
                Batal
              </Button>
              <Button
                type='submit'
                variant='default'
                shape='pill'
                size='card-action'
                disabled={isSubmitting || !manualCode.trim()}
                className='flex-1 font-semibold text-xs'
              >
                {isSubmitting ? (
                  <Icons.spinner className='size-3.5 mr-1.5 animate-spin' />
                ) : (
                  <Icons.check className='size-3.5 mr-1.5' />
                )}
                Konfirmasi
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </>
  );
}
