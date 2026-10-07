'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { ModernStyledQRCode } from '@/features/kehadiran-pegawai';
import { useAppointmentCheckInQr } from '../model/useAppointmentCheckInQr';
import type { AdminAppointment } from '../api/types';

export interface AppointmentCheckInQrModalProps {
  isOpen: boolean;
  appointment: AdminAppointment | null;
  onClose: () => void;
}

export function AppointmentCheckInQrModal({
  isOpen,
  appointment,
  onClose
}: AppointmentCheckInQrModalProps) {
  const { qrData, isLoading, isCopied, formattedCountdown, actions } = useAppointmentCheckInQr({
    isOpen,
    appointment,
    onClose
  });

  if (!appointment) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[460px]'
      showCloseButton={false}
    >
      <div className='relative font-sans space-y-4 text-center'>
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

        <div className='relative flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-card border border-border/60 shadow-xs min-h-[260px]'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground'>
              <Icons.spinner className='size-8 animate-spin text-primary' />
              <span className='text-xs font-medium'>Menghasilkan QR Code...</span>
            </div>
          ) : qrData ? (
            <div className='w-full flex flex-col items-center space-y-3'>
              <div className='size-[200px] flex items-center justify-center bg-white p-2 rounded-xl border border-border/40 shadow-xs'>
                <ModernStyledQRCode data={qrData.qrPayload} size={190} />
              </div>

              <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold'>
                <Icons.clock className='size-3.5' />
                <span>Batas Waktu Check-In: {formattedCountdown}</span>
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground'>
              <p className='text-xs'>Gagal memuat QR Code.</p>
              <Button variant='outline' size='sm' onClick={actions.fetchQr} className='text-xs'>
                Coba Lagi
              </Button>
            </div>
          )}
        </div>

        {qrData?.manualCode && (
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
              onClick={actions.handleCopyCode}
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

        <div className='pt-2 border-t border-border/40 flex items-center justify-between gap-2'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={actions.fetchQr}
            disabled={isLoading}
            className='text-xs text-muted-foreground hover:text-foreground gap-1.5'
          >
            <Icons.refresh className='size-3.5' />
            <span>Muat Ulang QR</span>
          </Button>

          <Button
            type='button'
            variant='default'
            shape='pill'
            size='sm'
            onClick={onClose}
            className='px-6 font-semibold text-xs'
          >
            Tutup
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
