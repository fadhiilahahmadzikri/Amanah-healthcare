'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useCalculatePayrollMutation } from '../api/mutations';

export interface PayrollCalculateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newPeriodId: string) => void;
}

export function PayrollCalculateModal({ isOpen, onClose, onSuccess }: PayrollCalculateModalProps) {
  const calculateMutation = useCalculatePayrollMutation();
  const { isOpen: isMobile } = useMediaQuery('(max-width: 768px)');
  const contentContainerRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const monthName = now.toLocaleString('id-ID', { month: 'long' });
  const defaultPeriodName = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;

  const [periodStart, setPeriodStart] = useState(`${year}-${month}-01`);
  const [periodEnd, setPeriodEnd] = useState(`${year}-${month}-30`);
  const [periodName, setPeriodName] = useState(defaultPeriodName);

  // GSAP subtle entrance transition matching Doctor Schedule modal
  useEffect(() => {
    if (!isOpen || !contentContainerRef.current) return;
    gsap.fromTo(
      contentContainerRef.current,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.22, ease: 'power2.out' }
    );
  }, [isOpen]);

  const handleCalculate = async () => {
    try {
      const result = await calculateMutation.mutateAsync({
        periodStart,
        periodEnd,
        periodName
      });
      onSuccess?.(result.period.id);
      onClose();
    } catch {
      // Error handled by mutation toast
    }
  };

  const hasRequiredFields = Boolean(periodName.trim() && periodStart && periodEnd);

  const contentBody = (
    <div ref={contentContainerRef} className='space-y-4'>
      <div className='space-y-1.5'>
        <Label htmlFor='calc-period-name' className='text-xs font-semibold text-foreground'>
          Nama Periode Penggajian
        </Label>
        <Input
          id='calc-period-name'
          type='text'
          value={periodName}
          onChange={(e) => setPeriodName(e.target.value)}
          placeholder='Contoh: Periode Gaji Maret 2026'
          className='text-xs h-8.5 rounded-lg'
          disabled={calculateMutation.isPending}
        />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <div className='space-y-1.5'>
          <Label htmlFor='calc-period-start' className='text-xs font-semibold text-foreground'>
            Tanggal Mulai
          </Label>
          <Input
            id='calc-period-start'
            type='date'
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            className='text-xs h-8.5 rounded-lg'
            disabled={calculateMutation.isPending}
          />
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='calc-period-end' className='text-xs font-semibold text-foreground'>
            Tanggal Selesai
          </Label>
          <Input
            id='calc-period-end'
            type='date'
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            className='text-xs h-8.5 rounded-lg'
            disabled={calculateMutation.isPending}
          />
        </div>
      </div>

      <div className='p-3.5 bg-muted/30 border border-border/50 rounded-xl text-[11px] text-muted-foreground space-y-1.5 leading-relaxed'>
        <div className='font-semibold text-foreground flex items-center gap-1.5'>
          <Icons.info className='size-3.5 text-primary shrink-0' />
          <span>Ketentuan Kalkulasi</span>
        </div>
        <p className='max-w-md'>
          Engine akan mengevaluasi seluruh roster dinas dokter, bidan, dan staf operasional serta
          memproses pemotongan izin yang telah disetujui admin secara otomatis.
        </p>
      </div>
    </div>
  );

  const footerButtons = (
    <>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={onClose}
        disabled={calculateMutation.isPending}
        className='px-3 font-semibold cursor-pointer text-xs h-8.5 text-muted-foreground hover:text-foreground'
      >
        Batal
      </Button>
      <Button
        type='button'
        variant='default'
        size='sm'
        onClick={handleCalculate}
        disabled={calculateMutation.isPending || !hasRequiredFields}
        className='px-4 font-semibold cursor-pointer text-xs h-8.5 gap-1.5'
      >
        {calculateMutation.isPending ? (
          <>
            <Icons.spinner className='size-3.5 animate-spin mr-1' />
            <span>Mengkalkulasi...</span>
          </>
        ) : (
          <span>Jalankan Kalkulasi</span>
        )}
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className='max-h-[85vh] font-sans flex flex-col p-0 overflow-hidden'>
          <DrawerHeader className='shrink-0 text-left pb-3 border-b border-border/50 px-4 pt-3'>
            <DrawerTitle className='text-base font-bold text-foreground tracking-tight'>
              Kalkulasi Payroll Baru
            </DrawerTitle>
            <DrawerDescription className='text-xs text-muted-foreground max-w-md leading-normal'>
              Hitung gaji pokok, potongan cuti, dan insentif pengganti staf.
            </DrawerDescription>
          </DrawerHeader>

          <div className='flex-1 min-h-0 overflow-y-auto p-4 space-y-4'>{contentBody}</div>

          <DrawerFooter className='shrink-0 pt-3 border-t border-border/50 px-4 pb-4 flex flex-row items-center justify-between gap-2.5'>
            {footerButtons}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='w-full sm:max-w-xl'
      className='max-h-[85vh] flex flex-col p-4 sm:p-5 overflow-hidden'
      showCloseButton={false}
      dismissible={!calculateMutation.isPending}
    >
      <div className='flex flex-col h-full min-h-0 flex-1 font-sans select-none'>
        {/* Pinned Header */}
        <div className='shrink-0 pb-3 border-b border-border/50 flex items-start justify-between gap-3'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              Kalkulasi Payroll Baru
            </h3>
            <p className='text-xs text-muted-foreground max-w-md leading-normal'>
              Hitung gaji pokok, potongan cuti, dan insentif pengganti staf.
            </p>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className='flex-1 min-h-0 overflow-y-auto py-3.5 space-y-4 pr-1'>{contentBody}</div>

        {/* Pinned Footer */}
        <div className='shrink-0 pt-3 border-t border-border/50 flex items-center justify-between gap-2.5'>
          {footerButtons}
        </div>
      </div>
    </ModalWrapper>
  );
}
