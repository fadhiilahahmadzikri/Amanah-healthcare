'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';

export interface EarlyCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffId: string;
  staffName: string;
  onConfirm: (notes: string) => Promise<void>;
  isLoading?: boolean;
}

export function EarlyCheckoutModal({
  isOpen,
  onClose,
  staffName,
  onConfirm,
  isLoading = false
}: EarlyCheckoutModalProps) {
  const [reason, setReason] = useState('');
  const reasonInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setTimeout(() => {
        reasonInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanReason = reason.trim();
    if (!cleanReason) {
      toast.error('Mohon isi alasan kepulangan lebih awal.');
      return;
    }

    try {
      await onConfirm(cleanReason);
      setReason('');
      onClose();
    } catch {
      // Error handling is handled upstream in caller
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[480px]'
      showCloseButton={false}
    >
      <form onSubmit={handleSubmit} className='relative font-sans space-y-4'>
        {/* Header */}
        <div className='pb-3 border-b border-border/40'>
          <div className='flex items-center gap-2 text-amber-600 dark:text-amber-500 mb-1'>
            <Icons.alertCircle className='size-5' />
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              Presensi Pulang Lebih Awal
            </h3>
          </div>
          <p className='text-xs text-muted-foreground'>
            Staf <span className='font-semibold text-foreground'>{staffName}</span> melakukan
            presensi pulang sebelum jam dinas normal berakhir. Mohon sertakan alasan resmi
            kepulangan.
          </p>
        </div>

        {/* Input Alasan */}
        <div className='space-y-2 py-1'>
          <label
            htmlFor='early-checkout-reason'
            className='text-xs font-semibold text-foreground flex items-center justify-between'
          >
            <span>Alasan Kepulangan Lebih Awal</span>
            <span className='text-[10px] text-destructive'>Wajib diisi</span>
          </label>
          <textarea
            id='early-checkout-reason'
            aria-label='Alasan Kepulangan Lebih Awal'
            ref={reasonInputRef}
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder='Contoh: Kondisi medis mendadak, izin dinas luar rujukan, atau urusan keluarga...'
            className='w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none'
          />
        </div>

        {/* Footer Actions */}
        <div className='pt-3 border-t border-border/40 flex items-center justify-end gap-3'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='default'
            onClick={onClose}
            disabled={isLoading}
            className='px-6 font-medium text-xs sm:text-sm'
          >
            Batal
          </Button>
          <Button
            type='submit'
            variant='default'
            shape='pill'
            size='default'
            disabled={isLoading || !reason.trim()}
            className='px-7 font-semibold text-xs sm:text-sm bg-amber-600 hover:bg-amber-700 text-white'
          >
            {isLoading ? (
              <Icons.spinner className='mr-1.5 size-3.5 animate-spin' />
            ) : (
              <Icons.check className='mr-1.5 size-3.5' />
            )}
            Simpan Kepulangan
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
