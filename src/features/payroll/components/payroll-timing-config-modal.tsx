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
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useWorkPoliciesCurrentQuery } from '../api/queries';
import { useUpdateAttendanceTimingMutation } from '../api/mutations';

export interface PayrollTimingConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PayrollTimingConfigModal({ isOpen, onClose }: PayrollTimingConfigModalProps) {
  const { data: workPolicies, isLoading } = useWorkPoliciesCurrentQuery();
  const updateTimingMutation = useUpdateAttendanceTimingMutation();
  const { isOpen: isMobile } = useMediaQuery('(max-width: 768px)');
  const contentContainerRef = useRef<HTMLDivElement>(null);

  const [minBillableShiftMinutes, setMinBillableShiftMinutes] = useState(30);
  const [roundingIncrementMinutes, setRoundingIncrementMinutes] = useState(15);

  // GSAP subtle entrance transition matching Doctor Schedule modal
  useEffect(() => {
    if (!isOpen || !contentContainerRef.current) return;
    gsap.fromTo(
      contentContainerRef.current,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.22, ease: 'power2.out' }
    );
  }, [isOpen]);

  useEffect(() => {
    if (workPolicies?.timing) {
      setMinBillableShiftMinutes(workPolicies.timing.minBillableShiftMinutes ?? 30);
      setRoundingIncrementMinutes(workPolicies.timing.roundingIncrementMinutes ?? 15);
    }
  }, [workPolicies]);

  const isSaving = updateTimingMutation.isPending;

  const handleSave = async () => {
    try {
      await updateTimingMutation.mutateAsync({
        minBillableShiftMinutes,
        roundingIncrementMinutes
      });
      onClose();
    } catch {
      // Error handled by mutation toast
    }
  };

  const contentBody = (
    <div ref={contentContainerRef} className='space-y-4'>
      {/* Information Banner */}
      <div className='p-3.5 bg-muted/30 border border-border/50 rounded-xl space-y-1.5 text-xs'>
        <div className='font-semibold text-foreground flex items-center gap-1.5'>
          <Icons.info className='size-3.5 text-primary shrink-0' />
          <span>Integritas Kalkulasi Jam Dinas</span>
        </div>
        <p className='text-muted-foreground leading-relaxed text-[11px] max-w-lg'>
          Parameter ini mengontrol ambang kelayakan durasi shift dan faktor konversi desimal jam
          kerja pada seluruh kalkulasi slip gaji staf klinik.
        </p>
      </div>

      <div className='flex flex-col gap-3.5'>
        {/* 1. Min Billable Shift Minutes */}
        <div className='p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-border transition-colors'>
          <div className='space-y-0.5 flex-1 pr-2'>
            <Label
              htmlFor='min-billable-minutes'
              className='text-xs sm:text-sm font-semibold text-foreground'
            >
              Batas Minimum Durasi Berbayar
            </Label>
            <p className='text-[11px] text-muted-foreground leading-relaxed max-w-md'>
              Durasi kerja di bawah ambang ini dianggap 0 jam berbayar (mencegah kalkulasi upah 1
              menit).
            </p>
          </div>
          <div className='flex items-center shrink-0 self-end sm:self-center'>
            <div className='flex items-center rounded-lg border border-border/80 bg-background shadow-2xs overflow-hidden h-8.5 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow]'>
              <input
                id='min-billable-minutes'
                type='number'
                aria-label='Batas Minimum Durasi Berbayar'
                value={minBillableShiftMinutes}
                min={0}
                max={120}
                step={5}
                onChange={(e) => setMinBillableShiftMinutes(Number(e.target.value) || 0)}
                disabled={isLoading || isSaving}
                className='h-full text-center font-mono font-medium text-xs bg-transparent border-0 outline-none px-2 text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-20'
              />
              <span className='px-2.5 h-full flex items-center text-[11px] font-medium text-muted-foreground bg-muted/40 border-l border-border/50 select-none'>
                menit
              </span>
            </div>
          </div>
        </div>

        {/* 2. Rounding Increment Minutes */}
        <div className='p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-border transition-colors'>
          <div className='space-y-0.5 flex-1 pr-2'>
            <Label
              htmlFor='rounding-increment-minutes'
              className='text-xs sm:text-sm font-semibold text-foreground'
            >
              Interval Pembulatan Jam Kerja
            </Label>
            <p className='text-[11px] text-muted-foreground leading-relaxed max-w-md'>
              Faktor pembulatan durasi kerja ke kelipatan interval menit terdekat (contoh 15 menit =
              0.25 jam).
            </p>
          </div>
          <div className='flex items-center shrink-0 self-end sm:self-center'>
            <div className='flex items-center rounded-lg border border-border/80 bg-background shadow-2xs overflow-hidden h-8.5 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow]'>
              <input
                id='rounding-increment-minutes'
                type='number'
                aria-label='Interval Pembulatan Jam Kerja'
                value={roundingIncrementMinutes}
                min={1}
                max={60}
                step={5}
                onChange={(e) => setRoundingIncrementMinutes(Number(e.target.value) || 1)}
                disabled={isLoading || isSaving}
                className='h-full text-center font-mono font-medium text-xs bg-transparent border-0 outline-none px-2 text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-20'
              />
              <span className='px-2.5 h-full flex items-center text-[11px] font-medium text-muted-foreground bg-muted/40 border-l border-border/50 select-none'>
                menit
              </span>
            </div>
          </div>
        </div>
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
        disabled={isSaving}
        className='px-3 font-semibold cursor-pointer text-xs h-8.5 text-muted-foreground hover:text-foreground'
      >
        Tutup
      </Button>
      <Button
        type='button'
        variant='default'
        size='sm'
        onClick={handleSave}
        disabled={isSaving || isLoading}
        className='px-4 font-semibold cursor-pointer text-xs h-8.5 gap-1.5'
      >
        {isSaving ? (
          <>
            <Icons.spinner className='size-3.5 animate-spin mr-1' />
            <span>Menyimpan...</span>
          </>
        ) : (
          <span>Simpan Perubahan</span>
        )}
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className='max-h-[85vh] font-sans flex flex-col p-0 overflow-hidden'>
          <DrawerHeader className='shrink-0 text-left pb-3 border-b border-border/50 px-4 pt-3'>
            <DrawerTitle className='text-base font-bold text-foreground tracking-tight flex items-center gap-2'>
              <span>Standar Kerja Berbayar & Pembulatan</span>
              {isLoading && (
                <Icons.spinner className='size-3.5 animate-spin text-primary shrink-0' />
              )}
            </DrawerTitle>
            <DrawerDescription className='text-xs text-muted-foreground max-w-md leading-normal'>
              Konfigurasi batas minimal dan interval pembulatan menit presensi untuk kalkulasi upah
              harian.
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
      dismissible={!isSaving}
    >
      <div className='flex flex-col h-full min-h-0 flex-1 font-sans select-none'>
        {/* Pinned Header */}
        <div className='shrink-0 pb-3 border-b border-border/50 flex items-start justify-between gap-3'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2'>
              <span>Standar Kerja Berbayar & Pembulatan Jam Dinas</span>
              {isLoading && (
                <Icons.spinner className='size-3.5 animate-spin text-primary shrink-0' />
              )}
            </h3>
            <p className='text-xs text-muted-foreground max-w-md leading-normal'>
              Konfigurasi batas minimal dan interval pembulatan menit presensi untuk kalkulasi upah
              harian.
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
