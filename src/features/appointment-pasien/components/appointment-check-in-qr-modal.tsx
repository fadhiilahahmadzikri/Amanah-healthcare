'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { toast } from 'sonner';
import { ModernStyledQRCode } from '@/features/kehadiran-pegawai';
import { generateCheckInQr } from '../api/service';
import type { AdminAppointment, CheckInQrData } from '../api/types';

export interface AppointmentCheckInQrModalProps {
  isOpen: boolean;
  appointment: AdminAppointment | null;
  onClose: () => void;
}

function formatCountdown(totalSec: number): string {
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function AppointmentCheckInQrModal({
  isOpen,
  appointment,
  onClose
}: AppointmentCheckInQrModalProps) {
  const [qrData, setQrData] = useState<CheckInQrData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchQr = useCallback(async () => {
    if (!appointment) return;
    setIsLoading(true);
    try {
      const res = await generateCheckInQr(appointment.id);
      if (res.success && res.data) {
        setQrData(res.data);
        setSecondsRemaining(res.data.remainingSeconds || 900);
      } else {
        toast.error(res.message || 'Gagal membuat QR Code check-in');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Gagal membuat QR Code: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, [appointment]);

  useEffect(() => {
    if (isOpen && appointment) {
      fetchQr();
    } else {
      setQrData(null);
      setSecondsRemaining(0);
    }
  }, [isOpen, appointment, fetchQr]);

  // Countdown timer effect
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [secondsRemaining]);

  const handleCopyCode = async () => {
    if (!qrData?.manualCode) return;
    try {
      await navigator.clipboard.writeText(qrData.manualCode);
      setIsCopied(true);
      toast.success('Kode check-in berhasil disalin ke clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Gagal menyalin kode');
    }
  };

  if (!appointment) return null;

  const isExpired = secondsRemaining <= 0;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[460px]'
      showCloseButton={false}
    >
      <div className='relative font-sans space-y-4 text-center'>
        {/* Header */}
        <div className='flex items-start justify-between gap-3 pb-3 border-b border-border/40 text-left'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              Kredensial Check-In Pasien
            </h3>
            <p className='text-xs text-muted-foreground'>
              Pindai QR code ini di kiosk / perangkat pasien atau gunakan kode manual.
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Tutup'
            className='rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors cursor-pointer shrink-0'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        {/* Patient Mini Card */}
        <div className='bg-muted/40 rounded-xl p-3 text-left border border-border/40 grid grid-cols-2 gap-2 text-xs'>
          <div>
            <span className='text-[11px] text-muted-foreground block'>Nama Pasien</span>
            <span className='font-semibold text-foreground truncate block'>
              {appointment.patientName}
            </span>
          </div>
          <div>
            <span className='text-[11px] text-muted-foreground block'>No. Antrean</span>
            <span className='font-bold text-primary font-mono block'>
              {appointment.queueNumber}
            </span>
          </div>
          <div>
            <span className='text-[11px] text-muted-foreground block'>Poliklinik</span>
            <span className='font-medium text-foreground truncate block'>
              {appointment.poliklinikName}
            </span>
          </div>
          <div>
            <span className='text-[11px] text-muted-foreground block'>Dokter</span>
            <span className='font-medium text-foreground truncate block'>
              {appointment.doctorName}
            </span>
          </div>
        </div>

        {/* QR Code Presentation Box */}
        <div className='relative flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-card border border-border/60 shadow-xs min-h-[260px]'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground'>
              <Icons.spinner className='size-8 animate-spin text-primary' />
              <span className='text-xs font-medium'>Menghasilkan QR Code...</span>
            </div>
          ) : isExpired ? (
            <div className='flex flex-col items-center justify-center py-10 gap-3'>
              <div className='size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center'>
                <Icons.warning className='size-6' />
              </div>
              <div className='space-y-1'>
                <p className='text-sm font-bold text-foreground'>QR Code Kedaluwarsa</p>
                <p className='text-xs text-muted-foreground max-w-[240px]'>
                  Masa berlaku kode telah habis. Silakan perbarui untuk membuat QR baru.
                </p>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={fetchQr}
                className='text-xs gap-1.5 mt-1'
              >
                <Icons.refresh className='size-3.5' />
                <span>Perbarui QR</span>
              </Button>
            </div>
          ) : qrData ? (
            <div className='w-full flex flex-col items-center space-y-3'>
              <div className='size-[200px] flex items-center justify-center bg-white p-2 rounded-xl border border-border/40 shadow-xs'>
                <ModernStyledQRCode data={qrData.qrPayload} size={190} />
              </div>

              {/* Countdown badge */}
              <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold'>
                <Icons.clock className='size-3.5' />
                <span>Kedaluwarsa dalam: {formatCountdown(secondsRemaining)}</span>
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground'>
              <p className='text-xs'>Gagal memuat QR Code.</p>
              <Button variant='outline' size='sm' onClick={fetchQr} className='text-xs'>
                Coba Lagi
              </Button>
            </div>
          )}
        </div>

        {/* Manual Code Section */}
        {qrData?.manualCode && !isExpired && (
          <div className='bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center justify-between gap-3'>
            <div className='text-left min-w-0'>
              <span className='text-[10px] uppercase font-bold tracking-wider text-muted-foreground block'>
                Kode Manual Pasien
              </span>
              <span className='text-xl font-black font-mono tracking-widest text-primary'>
                {qrData.manualCode}
              </span>
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleCopyCode}
              className='shrink-0 text-xs gap-1.5 h-8'
            >
              {isCopied ? (
                <>
                  <Icons.check className='size-3.5 text-emerald-500' />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Icons.copy className='size-3.5' />
                  <span>Salin</span>
                </>
              )}
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className='pt-2 border-t border-border/40 flex items-center justify-between gap-2'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={fetchQr}
            disabled={isLoading}
            className='text-xs text-muted-foreground hover:text-foreground gap-1.5'
          >
            <Icons.refresh className='size-3.5' />
            <span>Regenerasi QR</span>
          </Button>

          <Button
            type='button'
            variant='default'
            shape='pill'
            size='sm'
            onClick={onClose}
            className='px-6 font-semibold text-xs'
          >
            Selesai
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
