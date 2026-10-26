'use client';

import React, { useState } from 'react';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { useCalculatePayrollMutation } from '../api/mutations';

export interface PayrollCalculateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newPeriodId: string) => void;
}

export function PayrollCalculateModal({ isOpen, onClose, onSuccess }: PayrollCalculateModalProps) {
  const calculateMutation = useCalculatePayrollMutation();

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  const [periodStart, setPeriodStart] = useState(`${year}-${month}-01`);
  const [periodEnd, setPeriodEnd] = useState(`${year}-${month}-30`);
  const [periodName, setPeriodName] = useState(`Periode Gaji ${month}/${year}`);

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

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='w-full sm:max-w-xl'
      className='max-h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden'
      showCloseButton={false}
      dismissible={!calculateMutation.isPending}
    >
      <div className='flex flex-col h-full min-h-0 flex-1 font-sans select-none'>
        {/* Pinned Header */}
        <div className='shrink-0 pb-3.5 border-b border-border/50 flex items-start justify-between gap-3'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              Kalkulasi Payroll Baru
            </h3>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Hitung gaji pokok, potongan cuti, dan insentif pengganti staf.
            </p>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className='flex-1 min-h-0 overflow-y-auto py-4 space-y-4 pr-1'>
          <div className='space-y-1.5'>
            <Label htmlFor='calc-period-name' className='text-xs font-medium'>
              Nama periode penggajian
            </Label>
            <Input
              id='calc-period-name'
              type='text'
              value={periodName}
              onChange={(e) => setPeriodName(e.target.value)}
              placeholder='Contoh: Periode Gaji Maret 2026'
              className='text-xs h-8.5 rounded-lg'
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='calc-period-start' className='text-xs font-medium'>
                Tanggal mulai
              </Label>
              <Input
                id='calc-period-start'
                type='date'
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className='text-xs h-8.5 rounded-lg'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='calc-period-end' className='text-xs font-medium'>
                Tanggal selesai
              </Label>
              <Input
                id='calc-period-end'
                type='date'
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className='text-xs h-8.5 rounded-lg'
              />
            </div>
          </div>

          <div className='p-3.5 bg-muted/30 border border-border/50 rounded-xl text-[11px] text-muted-foreground space-y-1.5 leading-relaxed'>
            <div className='font-semibold text-foreground'>
              <span>Ketentuan Kalkulasi</span>
            </div>
            <p>
              Engine akan mengevaluasi seluruh roster dinas dokter, bidan, dan staf operasional
              serta memproses pemotongan izin yang telah disetujui admin secara otomatis.
            </p>
          </div>
        </div>

        {/* Pinned Footer */}
        <div className='shrink-0 pt-3.5 border-t border-border/50 flex items-center justify-end gap-2.5'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onClose}
            disabled={calculateMutation.isPending}
            className='px-4 font-semibold cursor-pointer text-xs h-8.5 text-muted-foreground hover:text-foreground'
          >
            Batal
          </Button>
          <Button
            type='button'
            size='sm'
            onClick={handleCalculate}
            disabled={calculateMutation.isPending || !periodName || !periodStart || !periodEnd}
            className='px-5 font-semibold cursor-pointer text-xs h-8.5 gap-1.5'
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
        </div>
      </div>
    </ModalWrapper>
  );
}
