'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { QueueTicketCard } from './queue-ticket-card';
import { toast } from 'sonner';
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

  if (!isOpen) return null;

  const handleDownload = () => {
    toast.success('Mencetak e-tiket antrean pasien...', {
      description: `Nomor Antrean: ${queueItem?.queue_number || appointment?.booking_code || 'A-001'}`
    });
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleGoToLiveQueue = () => {
    onClose();
    router.push('/dashboard/klinik/antrean');
  };

  const handleToasterClick = () => {
    toast.info('Antrean Anda telah tercatat pada sistem RS Amanah.', {
      description: `Poli: ${appointment?.service || queueItem?.poli || 'Poli Penyakit Dalam'}`
    });
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={isProcessing ? () => {} : onClose}
      maxWidth='max-w-[380px]'
      showCloseButton={false}
      className={
        isProcessing
          ? 'max-w-[400px]'
          : 'bg-transparent border-none shadow-none p-0 sm:p-0 overflow-visible'
      }
    >
      {isProcessing ? (
        /* STATE 1: DIALOG PROSES RESERVASI */
        <div className='p-6 rounded-3xl bg-card border border-border/80 shadow-2xl flex flex-col items-center justify-center text-center space-y-4 select-none'>
          <div className='relative'>
            <div className='size-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center animate-pulse'>
              <Icons.billing className='size-8 text-primary-bright animate-spin' />
            </div>
            <span className='absolute -bottom-0.5 -right-0.5 size-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] shadow-md'>
              <Icons.check className='size-3 stroke-[3]' />
            </span>
          </div>

          <div className='space-y-1 max-w-xs'>
            <h3 className='text-sm sm:text-base font-bold text-foreground tracking-tight'>
              Kami sedang memproses janji temu Anda...
            </h3>
            <p className='text-xs text-muted-foreground leading-relaxed'>
              Menghubungkan reservasi ke sistem antrean poliklinik RS Amanah Healthcare.
            </p>
          </div>

          {/* Animated Progress Bar */}
          <div className='w-full max-w-[220px] h-1.5 bg-muted rounded-full overflow-hidden'>
            <div className='h-full bg-gradient-to-r from-primary-bright to-emerald-500 rounded-full animate-[pulse_1s_ease-in-out_infinite] w-3/4' />
          </div>
        </div>
      ) : (
        /* STATE 2: REUSABLE QUEUE TICKET CARD DENGAN GSAP & CONFETTI */
        <div className='w-full flex justify-center py-1'>
          <QueueTicketCard
            queueNumber={queueItem?.queue_number || 'A-001'}
            serviceName={appointment?.service || queueItem?.poli || 'Poli Penyakit Dalam'}
            doctorName={
              appointment?.doctor_name || queueItem?.doctor_name || 'dr. Sarah Putri, Sp.PD'
            }
            dateStr={appointment?.date || 'Jumat, 21 Ags 2026'}
            timeSlot={appointment?.time || '09:30 WIB'}
            bookingCode={appointment?.booking_code || 'KLINIK-8R4NM'}
            patientName={appointment?.patient_name || 'Rian Hidayat'}
            roomName={queueItem?.room || 'Room 201'}
            illustrationSrc='/assets/klinik/waiting-room.svg'
            onClose={onClose}
            onDownload={handleDownload}
            onViewLiveQueue={handleGoToLiveQueue}
            onToasterClick={handleToasterClick}
            autoAnimate={true}
            autoConfetti={true}
          />
        </div>
      )}
    </ModalWrapper>
  );
}
