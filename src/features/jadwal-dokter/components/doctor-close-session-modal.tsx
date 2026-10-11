'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { formatFriendlySessionName } from '../constants/schedule-shift.constants';
import type { DoctorDailySession } from '../api/types';

export interface DoctorCloseSessionModalProps {
  isOpen: boolean;
  closingSession: DoctorDailySession | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
}

export function DoctorCloseSessionModal({
  isOpen,
  closingSession,
  isPending,
  onClose,
  onConfirm,
  portalContainerRef
}: DoctorCloseSessionModalProps) {
  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='w-full sm:w-fit sm:min-w-[440px] max-w-[calc(100vw-2rem)]'
      portalContainerRef={portalContainerRef}
      showCloseButton={false}
    >
      <div className='relative font-sans space-y-4 text-left p-1'>
        <div className='flex items-start justify-between gap-4'>
          <div className='space-y-1 min-w-0 flex-1'>
            <div className='flex items-center gap-1.5 text-rose-600 dark:text-rose-400'>
              <Icons.lock className='size-4 shrink-0' />
              <span className='text-xs font-bold tracking-tight whitespace-nowrap'>
                Konfirmasi Tutup Jadwal
              </span>
            </div>
            <h3 className='text-sm sm:text-base font-bold text-foreground leading-snug whitespace-nowrap'>
              Apakah Anda yakin ingin menutup sesi ini?
            </h3>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Tutup dialog'
            className='rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors cursor-pointer shrink-0'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        {closingSession && (
          <div className='rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1.5 text-xs'>
            <div className='flex items-center justify-between font-semibold'>
              <span className='text-foreground'>
                {formatFriendlySessionName(closingSession.nama_sesi) || closingSession.nama_sesi}
              </span>
              <span className='font-mono text-muted-foreground'>
                {closingSession.jam_mulai} - {closingSession.jam_selesai}
              </span>
            </div>
            <p className='text-[11.5px] text-muted-foreground leading-relaxed'>
              Setelah ditutup, sesi ini tidak akan dapat dipesan oleh pasien baru.
            </p>
          </div>
        )}

        <div className='flex items-center justify-end gap-2 pt-2 border-t border-border/40'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            shape='pill'
            onClick={onClose}
            className='text-xs px-4 font-semibold cursor-pointer'
          >
            Tidak
          </Button>
          <Button
            type='button'
            variant='destructive'
            size='sm'
            shape='pill'
            disabled={isPending}
            onClick={onConfirm}
            className='text-xs px-4 font-semibold gap-1.5 cursor-pointer'
          >
            {isPending && <Spinner className='size-3.5' />}
            <span>Ya, Tutup Jadwal</span>
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
