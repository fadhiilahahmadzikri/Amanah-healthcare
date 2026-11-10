'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
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
import { PatientCheckInResultDrawer } from './patient-check-in-result-drawer';
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    manualCode,
    isSubmitting,
    cameraError,
    isManualDrawerOpen,
    isResultDrawerOpen,
    isScannerPaused,
    resultPayload,
    actions
  } = usePatientCheckIn({
    isOpen,
    onClose,
    onCheckInSuccess
  });

  // Handle ESC key to dismiss modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        actions.handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, actions]);

  if (!isOpen || !isMounted) return null;

  const scannerModalPortal = (
    <div
      role='dialog'
      aria-modal='true'
      className='pointer-events-auto fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black md:bg-black/80 md:backdrop-blur-xs p-0 md:p-6'
    >
      {/* Desktop Backdrop Click-to-Dismiss */}
      <div
        className='absolute inset-0 -z-10 hidden md:block cursor-pointer'
        onClick={actions.handleClose}
        aria-hidden='true'
      />

      {/* Main Viewport Container: 100% full screen edge-to-edge on mobile, smartphone frame on desktop */}
      <div className='relative w-full h-[100dvh] max-h-[100dvh] flex flex-col font-sans select-none overflow-hidden bg-black text-white p-0 m-0 border-0 rounded-none shadow-none md:w-[390px] md:h-[690px] md:max-h-[90vh] md:rounded-[32px] md:border md:border-white/15 md:shadow-2xl md:ring-1 md:ring-white/10'>
        {/* Full-Screen Camera View */}
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
              paused={isScannerPaused}
            />

            {isSubmitting && (
              <div className='absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2 text-white z-20'>
                <Icons.spinner className='size-8 animate-spin text-primary' />
                <span className='text-xs font-semibold'>Memproses check-in...</span>
              </div>
            )}
          </div>

          {/* Camera Error Message (if any permission issue) */}
          {cameraError && (
            <div className='absolute top-16 inset-x-4 z-30 bg-destructive/90 text-destructive-foreground backdrop-blur-md text-xs p-3 rounded-xl border border-destructive/30 text-center space-y-2 shadow-xl'>
              <p>{cameraError}</p>
              <div className='flex items-center justify-center gap-2 pt-1'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={actions.clearCameraError}
                  className='text-xs h-7 px-3 bg-black/40 border-white/20 text-white rounded-lg'
                >
                  <Icons.refresh className='size-3 mr-1' />
                  <span>Coba Lagi</span>
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={actions.openManualInput}
                  className='text-xs h-7 px-3 rounded-lg'
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
              variant='secondary'
              size='card-action'
              onClick={actions.openManualInput}
              className='pointer-events-auto bg-card/95 hover:bg-card text-foreground backdrop-blur-md shadow-2xl border border-border/80 px-5 text-xs font-semibold gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 rounded-xl'
            >
              <Icons.edit className='size-3.5 text-primary' />
              <span>Masukkan Kode Manual</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Main Immersive Scanner Viewport (Edge-to-edge on Mobile, Phone frame on Desktop) */}
      {createPortal(scannerModalPortal, document.body)}

      {/* 2. Master Check-In Result Drawer (Flutter-inspired unified drawer) */}
      <PatientCheckInResultDrawer
        isOpen={isResultDrawerOpen}
        payload={resultPayload}
        onClose={actions.closeResultDrawer}
        onRetryScan={actions.resumeScanning}
        onOpenManualInput={actions.openManualInput}
        onViewQueue={actions.handleClose}
      />

      {/* 3. Manual Code Bottom Drawer Sheet */}
      <Drawer
        open={isManualDrawerOpen}
        onOpenChange={(open) => actions.setIsManualDrawerOpen(open)}
      >
        <DrawerContent
          className='max-h-[85vh] font-sans z-[70] sm:max-w-md sm:mx-auto sm:rounded-t-2xl'
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
                size='card-action'
                onClick={() => actions.setIsManualDrawerOpen(false)}
                className='flex-1 font-semibold text-xs rounded-xl'
              >
                Batal
              </Button>
              <Button
                type='submit'
                variant='default'
                size='card-action'
                disabled={isSubmitting || !manualCode.trim()}
                className='flex-1 font-semibold text-xs rounded-xl'
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
