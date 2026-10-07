'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useQueryClient } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { performCheckIn } from '@/features/appointment-pasien/api/service';
import type { PerformCheckInResponse } from '@/features/appointment-pasien/api/types';
import { klinikKeys } from '../api/query-keys';
import { appointmentKeys } from '@/features/appointment-pasien/api/queries';

export interface PatientCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckInSuccess?: (result: PerformCheckInResponse['data']) => void;
}

type TabMode = 'scan' | 'manual';

export function PatientCheckInModal({
  isOpen,
  onClose,
  onCheckInSuccess
}: PatientCheckInModalProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabMode>('scan');
  const [manualCode, setManualCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScannerStarting, setIsScannerStarting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<PerformCheckInResponse['data'] | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanningActiveRef = useRef(false);
  const containerId = 'patient-qr-reader-container';

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isScanningActiveRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping html5-qrcode scanner:', err);
      } finally {
        isScanningActiveRef.current = false;
      }
    }
  }, []);

  const handleCheckIn = useCallback(
    async (payload: { token?: string; manualCode?: string }) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        const response = await performCheckIn(payload);
        if (response.success && response.data) {
          setSuccessResult(response.data);
          toast.success(response.message || 'Check-in berhasil! Anda telah masuk antrean.');
          await Promise.allSettled([
            queryClient.invalidateQueries({ queryKey: klinikKeys.all }),
            queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
          ]);
          onCheckInSuccess?.(response.data);
        } else {
          toast.error(response.message || 'Check-in gagal diproses');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`Check-in gagal: ${msg}`);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, onCheckInSuccess, queryClient]
  );

  const startScanner = useCallback(async () => {
    await stopScanner();
    setCameraError(null);
    setIsScannerStarting(true);

    try {
      const containerElement = document.getElementById(containerId);
      if (!containerElement) {
        setIsScannerStarting(false);
        return;
      }

      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 }
        },
        async (decodedText) => {
          let token = decodedText.trim();
          let parsedManualCode: string | undefined;

          try {
            if (token.startsWith('{') && token.endsWith('}')) {
              const parsed = JSON.parse(token);
              if (parsed.token) token = parsed.token;
              if (parsed.manualCode) parsedManualCode = parsed.manualCode;
            }
          } catch {
            // Keep raw token string
          }

          await stopScanner();
          await handleCheckIn({ token, manualCode: parsedManualCode });
        },
        () => {
          // Ignore transient frame scan errors
        }
      );

      isScanningActiveRef.current = true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Unable to start camera for QR scan:', msg);
      setCameraError(
        'Kamera tidak dapat diakses atau izin ditolak. Silakan gunakan tab Kode Manual.'
      );
    } finally {
      setIsScannerStarting(false);
    }
  }, [handleCheckIn, stopScanner]);

  // Handle scanner start/stop on tab switch and modal open state
  useEffect(() => {
    if (!isOpen || successResult) {
      stopScanner();
      return;
    }

    if (activeTab === 'scan') {
      const timer = setTimeout(() => {
        startScanner();
      }, 150);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, activeTab, successResult, startScanner, stopScanner]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!clean) {
      toast.error('Masukkan kode manual check-in');
      return;
    }
    await handleCheckIn({ manualCode: clean });
  };

  const handleClose = async () => {
    await stopScanner();
    setManualCode('');
    setSuccessResult(null);
    setCameraError(null);
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth='max-w-[480px]'
      showCloseButton={false}
    >
      <div className='relative font-sans space-y-4'>
        {/* Header */}
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
            onClick={handleClose}
            aria-label='Tutup'
            className='rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors cursor-pointer shrink-0'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        {/* Success View */}
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
              onClick={handleClose}
              className='w-full font-semibold text-xs py-2 mt-2'
            >
              Kembali ke Antrean
            </Button>
          </div>
        ) : (
          <>
            {/* Tabs Selector */}
            <div className='flex p-1 bg-muted/60 rounded-xl gap-1 border border-border/40'>
              <button
                type='button'
                onClick={() => setActiveTab('scan')}
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
                onClick={() => setActiveTab('manual')}
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

            {/* Tab 1: QR Scanner */}
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
                      onClick={() => setActiveTab('manual')}
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

            {/* Tab 2: Manual Code Input */}
            {activeTab === 'manual' && (
              <form onSubmit={handleManualSubmit} className='space-y-4 py-2'>
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
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
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
                    onClick={handleClose}
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
