'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Spinner } from '@/components/ui/spinner';

export interface DoctorCalendarCloseModalProps {
  isOpen: boolean;
  closingDay: number | null;
  doctorName?: string;
  monthName: string;
  currentYear: number;
  closeNotes: string;
  isPending: boolean;
  onNotesChange: (notes: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
}

export function DoctorCalendarCloseModal({
  isOpen,
  closingDay,
  doctorName,
  monthName,
  currentYear,
  closeNotes,
  isPending,
  onNotesChange,
  onClose,
  onConfirm,
  portalContainerRef
}: DoctorCalendarCloseModalProps) {
  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='w-full sm:w-fit sm:min-w-[440px] max-w-[calc(100vw-2rem)]'
      showCloseButton={false}
      portalContainerRef={portalContainerRef}
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

        {closingDay !== null && (
          <div className='rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1.5 text-xs'>
            <div className='flex items-center justify-between font-semibold'>
              <span className='text-foreground'>{doctorName || 'Dokter'}</span>
              <span className='font-mono text-muted-foreground'>
                {closingDay} {monthName} {currentYear}
              </span>
            </div>
            <p className='text-[11.5px] text-muted-foreground leading-relaxed'>
              Setelah ditutup, jadwal pada tanggal ini tidak beroperasi dan tidak dapat dipesan
              oleh pasien baru.
            </p>
          </div>
        )}

        <div className='space-y-1.5'>
          <Label htmlFor='close-calendar-notes' className='text-xs font-semibold text-foreground'>
            Catatan Penutupan{' '}
            <span className='text-muted-foreground font-normal'>(Opsional)</span>
          </Label>
          <Input
            id='close-calendar-notes'
            value={closeNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder='Contoh: Dokter ada keperluan mendadak / isOnLeave operasional'
            className='text-xs h-9'
          />
        </div>

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
