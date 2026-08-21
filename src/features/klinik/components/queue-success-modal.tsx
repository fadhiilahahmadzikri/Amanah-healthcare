'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Appointment, QueueItem } from '../api/types';

export interface QueueSuccessModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  appointment: Appointment | null;
  queueItem: QueueItem | null;
  onClose: () => void;
}

export function QueueSuccessModal({
  isOpen,
  isProcessing,
  appointment,
  queueItem,
  onClose
}: QueueSuccessModalProps) {
  const router = useRouter();
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && !isProcessing && queueItem && !hasTriggeredConfetti) {
      setHasTriggeredConfetti(true);

      // Multi-burst Confetti Celebration
      try {
        const count = 200;
        const defaults = {
          origin: { y: 0.6 }
        };

        const fire = (particleRatio: number, opts: confetti.Options) => {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio)
          });
        };

        fire(0.25, {
          spread: 26,
          startVelocity: 55,
          colors: ['#151a66', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6']
        });
        fire(0.2, {
          spread: 60,
          colors: ['#151a66', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6']
        });
        fire(0.35, {
          spread: 100,
          decay: 0.91,
          scalar: 0.8,
          colors: ['#151a66', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6']
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 25,
          decay: 0.92,
          scalar: 1.2,
          colors: ['#151a66', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6']
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 45,
          colors: ['#151a66', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6']
        });
      } catch {
        // Fallback if canvas-confetti is not available
      }
    }

    if (!isOpen) {
      setHasTriggeredConfetti(false);
    }
  }, [isOpen, isProcessing, queueItem, hasTriggeredConfetti]);

  if (!isOpen) return null;

  const handlePrint = () => {
    toast.success('Mencetak tiket antrean pasien...', {
      description: `Nomor Antrean: ${queueItem?.queue_number || 'A-014'}`
    });
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleGoToLiveQueue = () => {
    onClose();
    router.push('/dashboard/klinik/antrean');
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={isProcessing ? () => {} : onClose}
      maxWidth='max-w-[500px]'
      showCloseButton={!isProcessing}
    >
      {isProcessing ? (
        /* STATE 1: DIALOG MEMPROSES */
        <div className='py-8 px-4 flex flex-col items-center justify-center text-center space-y-5 select-none'>
          <div className='relative'>
            <div className='size-20 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center animate-pulse'>
              <Icons.billing className='size-10 text-primary-bright animate-spin' />
            </div>
            <span className='absolute -bottom-1 -right-1 size-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs shadow-md'>
              <Icons.check className='size-3 stroke-[3]' />
            </span>
          </div>

          <div className='space-y-1.5 max-w-sm'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              Kami sedang memproses janji temu Anda...
            </h3>
            <p className='text-xs text-muted-foreground leading-relaxed'>
              Menghubungkan reservasi ke sistem pendaftaran antrean dan poliklinik RS Amanah
              Healthcare.
            </p>
          </div>

          {/* Animated Progress Strip */}
          <div className='w-full max-w-xs h-1.5 bg-muted rounded-full overflow-hidden'>
            <div className='h-full bg-gradient-to-r from-primary-bright to-emerald-500 rounded-full animate-[pulse_1s_ease-in-out_infinite] w-3/4' />
          </div>
        </div>
      ) : (
        /* STATE 2: MODAL TIKET NOMOR ANTREAN PASIEN */
        <div className='space-y-4 font-sans select-none'>
          {/* Header Tiket */}
          <div className='text-center space-y-1 pb-1'>
            <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-subtle text-success border border-success-border text-xs font-bold shadow-2xs'>
              <Icons.check className='size-3 stroke-[3]' />
              <span>Janji Temu & Antrean Berhasil Terdaftar!</span>
            </span>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight pt-1'>
              Tiket Reservasi & Nomor Antrean
            </h3>
            <p className='text-xs text-muted-foreground'>
              Simpan bukti reservasi ini atau tunjukkan kepada petugas loket pendaftaran.
            </p>
          </div>

          {/* Main Queue Card (Ticket Style with Cutouts) */}
          <div className='relative rounded-2xl border-2 border-primary/20 dark:border-indigo-400/30 bg-gradient-to-b from-primary/5 via-card to-card p-5 shadow-md overflow-hidden'>
            {/* Top Cutout Dots */}
            <div className='flex items-center justify-between pb-3.5 border-b border-dashed border-border/80'>
              <div className='space-y-0.5'>
                <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase'>
                  RS Amanah Healthcare
                </span>
                <p className='text-xs font-semibold text-primary dark:text-indigo-300'>
                  {appointment?.service || queueItem?.poli || 'Poli Penyakit Dalam'}
                </p>
              </div>

              <div className='text-right space-y-0.5'>
                <span className='text-[10px] font-medium text-muted-foreground block'>
                  Kode Booking
                </span>
                <span className='font-mono text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded-md border border-border/50'>
                  {appointment?.booking_code || 'KLINIK-8R4NM'}
                </span>
              </div>
            </div>

            {/* Hero Number Antrean */}
            <div className='py-4 text-center space-y-1'>
              <span className='text-xs font-medium text-muted-foreground'>Nomor Antrean Anda</span>
              <div className='text-4xl sm:text-5xl font-black tracking-tight text-primary-bright font-mono drop-shadow-xs'>
                {queueItem?.queue_number || 'A-014'}
              </div>
              <div className='flex items-center justify-center gap-1.5 pt-1 text-xs text-muted-foreground'>
                <Icons.history className='size-3.5 text-primary' />
                <span>
                  Estimasi Pelayanan:{' '}
                  <strong className='text-foreground font-semibold'>
                    {queueItem?.estimated_time || appointment?.time || '09:00 WIB'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Ticket Information Grid */}
            <div className='pt-3 border-t border-dashed border-border/80 grid grid-cols-2 gap-y-2.5 gap-x-3 text-xs'>
              <div>
                <span className='text-[11px] text-muted-foreground block'>Nama Pasien</span>
                <span className='font-bold text-foreground truncate block'>
                  {appointment?.patient_name || 'Rian Hidayat'}
                </span>
              </div>

              <div>
                <span className='text-[11px] text-muted-foreground block'>Dokter Pemeriksa</span>
                <span className='font-bold text-foreground truncate block'>
                  {appointment?.doctor_name || queueItem?.doctor_name || 'dr. Sarah Putri, Sp.PD'}
                </span>
              </div>

              <div>
                <span className='text-[11px] text-muted-foreground block'>Tanggal Reservasi</span>
                <span className='font-medium text-foreground block'>
                  {appointment?.date || 'Kamis, 20 Ags 2026'}
                </span>
              </div>

              <div>
                <span className='text-[11px] text-muted-foreground block'>Ruang Praktik</span>
                <span className='font-medium text-foreground block truncate'>
                  {queueItem?.room || 'Room 201'}
                </span>
              </div>
            </div>

            {/* Waiting Count Info Box */}
            <div className='mt-3.5 p-2.5 rounded-xl bg-primary/5 dark:bg-indigo-950/40 border border-primary/15 flex items-center gap-2.5 text-xs text-muted-foreground'>
              <Icons.info className='size-4 text-primary shrink-0' />
              <span>
                Saat ini terdapat{' '}
                <strong className='text-primary dark:text-indigo-300 font-bold'>
                  {queueItem?.waiting_count || 2} pasien
                </strong>{' '}
                yang sedang menunggu di poliklinik terkait.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row items-center gap-2 pt-2'>
            <Button
              type='button'
              variant='outline'
              size='md'
              onClick={handlePrint}
              leadingIcon={<Icons.help className='size-3.5' />}
              className='w-full sm:w-auto flex-1'
            >
              Cetak / Simpan Tiket
            </Button>

            <Button
              type='button'
              variant='primary'
              size='md'
              onClick={handleGoToLiveQueue}
              trailingIcon={<Icons.arrowUpRight className='size-3 stroke-[2.5]' />}
              className='w-full sm:w-auto flex-1'
            >
              Lihat Antrean Live
            </Button>
          </div>

          <div className='text-center pt-1'>
            <button
              type='button'
              onClick={onClose}
              className='text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
            >
              Tutup & Kembali ke Halaman
            </button>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
}
