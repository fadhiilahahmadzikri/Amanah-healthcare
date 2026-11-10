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
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { useMediaQuery } from '@/hooks/use-media-query';
import { formatCurrency } from '../utils/currency';
import type { PayrollPeriodItem, ReconcileLeaveResult } from '../api/types';

export type ReconcileResult = ReconcileLeaveResult;

export interface PayrollReconcileLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReconcile: (targetDate?: string) => Promise<ReconcileLeaveResult | undefined>;
  isReconciling: boolean;
  period?: PayrollPeriodItem | null;
}

export function PayrollReconcileLeaveModal({
  isOpen,
  onClose,
  onReconcile,
  isReconciling,
  period
}: PayrollReconcileLeaveModalProps) {
  const { isOpen: isMobile } = useMediaQuery('(max-width: 768px)');
  const contentContainerRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().slice(0, 10);
  const [targetDate, setTargetDate] = useState<string>(today);
  const [result, setResult] = useState<ReconcileResult | null>(null);

  // GSAP subtle entrance transition matching Doctor Schedule modal
  useEffect(() => {
    if (!isOpen || !contentContainerRef.current) return;
    gsap.fromTo(
      contentContainerRef.current,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.22, ease: 'power2.out' }
    );
  }, [isOpen]);

  const handleExecute = async () => {
    const res = await onReconcile(targetDate);
    if (res) {
      setResult(res);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  const handleModalClose = () => {
    setResult(null);
    onClose();
  };

  const contentBody = (
    <div ref={contentContainerRef} className='space-y-4'>
      {!result ? (
        <>
          {/* Policy Banner */}
          <div className='p-3 bg-muted/40 border border-border/50 rounded-xl flex items-center gap-2 text-xs text-muted-foreground'>
            <Icons.info className='size-3.5 text-primary shrink-0' />
            <span>Sistem otomatis memotong upah staf yang izin atau cuti pada jadwal dinasnya.</span>
          </div>

          {/* Date Input using CustomDatePicker */}
          <div className='space-y-2 bg-card border border-border/70 rounded-xl p-4'>
            <Label className='text-xs font-semibold text-foreground'>
              Pilih Tanggal Presensi
            </Label>
            <div className='flex items-center gap-2.5 pt-1'>
              <div className='flex-1 max-w-xs'>
                <CustomDatePicker
                  value={targetDate}
                  onChange={(val) => setTargetDate(val)}
                  placeholder='Pilih tanggal'
                  ariaLabel='Pilih Tanggal Presensi'
                />
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setTargetDate(today)}
                disabled={isReconciling || targetDate === today}
                className='text-xs h-9 px-3 cursor-pointer'
              >
                Hari Ini
              </Button>
            </div>
            <p className='text-[11px] text-muted-foreground'>
              Pilih tanggal jadwal kerja staf yang ingin disinkronkan potongannya.
            </p>
          </div>
        </>
      ) : (
        /* Result View */
        <div className='space-y-4'>
          <div className='p-4 bg-muted/30 border border-border/50 rounded-xl space-y-1 text-xs'>
            <div className='text-foreground font-bold text-sm flex items-center gap-2'>
              <Icons.check className='size-4 text-emerald-600' />
              <span>Sinkronisasi Cuti Selesai</span>
            </div>
            <p className='text-muted-foreground'>
              Tanggal yang diproses: <strong className='text-foreground'>{result.targetDate}</strong>
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div className='bg-card border border-border/60 rounded-xl p-3.5'>
              <span className='text-[11px] text-muted-foreground block font-medium'>
                Staf Terkena Potongan
              </span>
              <span className='text-xl font-bold text-foreground mt-1 block tabular-nums'>
                {result.processedCount} orang
              </span>
            </div>

            <div className='bg-card border border-border/60 rounded-xl p-3.5'>
              <span className='text-[11px] text-muted-foreground block font-medium'>
                Total Potongan Upah
              </span>
              <span className='text-xl font-bold text-destructive mt-1 block tabular-nums'>
                {formatCurrency(result.totalDeductionsAmount)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const footerButtons = !result ? (
    <>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={handleModalClose}
        disabled={isReconciling}
        className='px-3 font-semibold cursor-pointer text-xs h-8.5 text-muted-foreground hover:text-foreground'
      >
        Batal
      </Button>
      <Button
        type='button'
        variant='default'
        size='sm'
        onClick={handleExecute}
        disabled={isReconciling || !targetDate}
        className='px-4 font-semibold cursor-pointer text-xs h-8.5 gap-1.5'
      >
        {isReconciling ? (
          <>
            <Icons.spinner className='size-3.5 animate-spin mr-1' />
            <span>Memproses...</span>
          </>
        ) : (
          <span>Sinkronkan Sekarang</span>
        )}
      </Button>
    </>
  ) : (
    <>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={handleReset}
        className='px-3 font-semibold cursor-pointer text-xs h-8.5 text-muted-foreground hover:text-foreground'
      >
        Tanggal Lain
      </Button>
      <Button
        type='button'
        variant='default'
        size='sm'
        onClick={handleModalClose}
        className='px-4 font-semibold cursor-pointer text-xs h-8.5'
      >
        Selesai
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && handleModalClose()}>
        <DrawerContent className='max-h-[85vh] font-sans flex flex-col p-0 overflow-hidden'>
          <DrawerHeader className='shrink-0 text-left pb-3 border-b border-border/50 px-4 pt-3'>
            <DrawerTitle className='text-base font-bold text-foreground tracking-tight'>
              Sinkronkan Potongan Cuti
            </DrawerTitle>
            <DrawerDescription className='text-xs text-muted-foreground max-w-md leading-normal'>
              {period?.periodName ?? 'Periode Penggajian'} • Sinkronkan data potongan izin dan cuti
              staf ke slip gaji.
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
      onClose={handleModalClose}
      maxWidth='w-full sm:max-w-xl'
      className='max-h-[85vh] flex flex-col p-4 sm:p-5 overflow-hidden'
      showCloseButton={false}
      dismissible={!isReconciling}
    >
      <div className='flex flex-col h-full min-h-0 flex-1 font-sans select-none'>
        {/* Pinned Header */}
        <div className='shrink-0 pb-3 border-b border-border/50 flex items-start justify-between gap-3'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              Sinkronkan Potongan Cuti
            </h3>
            <p className='text-xs text-muted-foreground max-w-md leading-normal'>
              {period?.periodName ?? 'Periode Penggajian'} • Sinkronkan data potongan izin dan cuti
              staf ke slip gaji.
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
