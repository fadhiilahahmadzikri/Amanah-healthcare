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
  onViewPatientDetail?: () => void;
}

export function AppointmentCheckInQrModal({
  isOpen,
  appointment,
  onClose,
  onViewPatientDetail
}: AppointmentCheckInQrModalProps) {
  const {
    qrData,
    isLoading,
    isCopied,
    isAlreadyCheckedIn,
    isMissingAssignment,
    formattedCountdown,
    formattedDeadline,
    actions
  } = useAppointmentCheckInQr({
    isOpen,
    appointment,
    onClose
  });

  if (!appointment) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[420px]'
      showCloseButton={false}
    >
      <div className='relative font-sans space-y-4 text-center'>
        {/* Header: Ringkas, Sejajar Vertikal dengan Dinding Kiri QR */}
        <div className='pb-3 border-b border-border/40 text-left'>
          <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
            QR Check-In Pasien
          </h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Pindai kode QR ini di kiosk / perangkat pasien atau gunakan kode manual di bawah ini.
          </p>
        </div>

        {/* Content: QR Code Besar & Sejajar Dinding Kiri-Kanan Modal */}
        {isLoading ? (
          <div className='flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground'>
            <Icons.spinner className='size-8 animate-spin text-primary' />
            <span className='text-xs font-medium'>Menghasilkan QR Code...</span>
          </div>
        ) : isMissingAssignment ? (
          <div className='flex flex-col items-center justify-center py-10 px-4 gap-3 text-center'>
            <div className='size-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center'>
              <Icons.alertCircle className='size-6' />
            </div>
            <div className='space-y-1'>
              <p className='text-sm font-semibold text-foreground'>Dokter / Ruangan Belum Ditugaskan</p>
              <p className='text-xs text-muted-foreground max-w-xs'>
                Check-in hanya dapat dilakukan setelah dokter dan ruangan pemeriksaan telah ditugaskan.
              </p>
            </div>
          </div>
        ) : isAlreadyCheckedIn ? (
          <div className='flex flex-col items-center justify-center py-10 px-4 gap-3 text-center'>
            <div className='size-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center'>
              <Icons.check className='size-6' />
            </div>
            <div className='space-y-1'>
              <p className='text-sm font-semibold text-foreground'>Pasien Sudah Check-In</p>
              <p className='text-xs text-muted-foreground max-w-xs'>
                Janji temu ini telah melakukan check-in dan saat ini berada di dalam antrean aktif poliklinik.
              </p>
            </div>
          </div>
        ) : qrData ? (
          <div className='w-full flex flex-col items-center space-y-3.5'>
            {/* QR Code Lebar Sejajar Header (Edge-to-Edge) dengan Interaksi Klik untuk Salin */}
            <div className='relative w-full aspect-square flex items-center justify-center mx-auto overflow-hidden rounded-xl group'>
              <ModernStyledQRCode
                data={qrData.qrPayload}
                size={360}
                className='w-full h-full cursor-pointer'
              />
              {/* Overlay Tap/Hover Feedback */}
              <button
                type='button'
                onClick={actions.handleCopyCode}
                className='absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-all flex items-center justify-center cursor-pointer'
                title='Klik untuk menyalin kode manual'
              >
                {isCopied && (
                  <div className='px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-lg animate-in fade-in-0 zoom-in-95 flex items-center gap-1.5'>
                    <Icons.check className='size-4' />
                    <span>Kode Tersalin!</span>
                  </div>
                )}
              </button>
            </div>

            {/* Kode Manual 100% Pas di Tengah (Tanpa Offset Tombol Samping) */}
            {qrData.manualCode && (
              <div className='relative flex flex-col items-center justify-center pt-1 w-full'>
                <button
                  type='button'
                  onClick={actions.handleCopyCode}
                  className='group relative flex flex-col items-center justify-center cursor-pointer select-none py-1 px-4 rounded-xl hover:bg-muted/50 transition-colors active:scale-98'
                  title='Klik untuk menyalin kode manual'
                >
                  <span className='text-3xl sm:text-4xl font-black font-mono tracking-widest text-foreground text-center'>
                    {qrData.manualCode}
                  </span>
                  <span className='text-[10.5px] font-medium text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1 mt-0.5'>
                    <Icons.copy className='size-3' />
                    <span>Klik untuk menyalin</span>
                  </span>
                </button>
              </div>
            )}

            {/* Sisa Waktu & Batas Kedaluwarsa: Bersih Tanpa Pills / Emoji */}
            <div className='flex flex-col items-center gap-0.5 text-xs text-muted-foreground select-none pt-0.5'>
              <span className='font-medium text-foreground'>
                Sisa Waktu: {formattedCountdown}
              </span>
              {formattedDeadline && (
                <span className='text-[11.5px]'>
                  Batas Kedaluwarsa: {formattedDeadline}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground'>
            <p className='text-xs'>Gagal memuat QR Code.</p>
            <Button
              variant='outline'
              size='card-action'
              shape='pill'
              onClick={actions.fetchQr}
              className='text-xs cursor-pointer'
            >
              Coba Lagi
            </Button>
          </div>
        )}

        {/* Footer: Tombol Aksi Esensial Berukuran Konsisten size='card-action' and shape='pill' */}
        <div className='pt-3.5 border-t border-border/40 flex items-center justify-between gap-3'>
          {onViewPatientDetail ? (
            <Button
              type='button'
              variant='outline'
              size='card-action'
              shape='pill'
              onClick={() => {
                onClose();
                onViewPatientDetail();
              }}
              className='text-xs font-semibold gap-1.5 cursor-pointer px-5'
              leadingIcon={<Icons.user className='size-3.5 text-primary' />}
            >
              <span>Lihat Detail Pasien</span>
            </Button>
          ) : (
            <div />
          )}

          <Button
            type='button'
            variant='default'
            shape='pill'
            size='card-action'
            onClick={onClose}
            className='px-6 font-semibold text-xs cursor-pointer'
          >
            Tutup
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
