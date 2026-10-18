'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { useCalculatePayrollMutation } from '../api/mutations';

interface PayrollCalculateModalProps {
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-md p-0 overflow-hidden rounded-2xl'>
        <DialogHeader className='p-5 border-b border-border/60'>
          <div className='flex items-center gap-2.5'>
            <div className='size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0'>
              <Icons.calendar className='size-5' />
            </div>
            <div>
              <DialogTitle className='text-base font-bold'>Kalkulasi Payroll Baru</DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                Hitung gaji pokok, potongan cuti, dan insentif pengganti staf.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='p-5 space-y-4'>
          <div className='space-y-1.5'>
            <Label htmlFor='calc-period-name' className='text-xs font-medium'>
              Nama Periode Penggajian
            </Label>
            <Input
              id='calc-period-name'
              type='text'
              value={periodName}
              onChange={(e) => setPeriodName(e.target.value)}
              placeholder='Contoh: Periode Gaji Maret 2026'
              className='text-xs h-9 rounded-xl'
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='calc-period-start' className='text-xs font-medium'>
                Tanggal Mulai
              </Label>
              <Input
                id='calc-period-start'
                type='date'
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className='text-xs h-9 rounded-xl'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='calc-period-end' className='text-xs font-medium'>
                Tanggal Selesai
              </Label>
              <Input
                id='calc-period-end'
                type='date'
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className='text-xs h-9 rounded-xl'
              />
            </div>
          </div>

          <div className='p-3 bg-muted/30 border border-border/50 rounded-xl text-[11px] text-muted-foreground space-y-1'>
            <div className='flex items-center gap-1.5 font-medium text-foreground'>
              <Icons.info className='size-3.5 text-primary' />
              <span>Ketentuan Kalkulasi</span>
            </div>
            <p>
              Engine akan mengevaluasi seluruh roster dinas dokter, bidan, dan staf operasional
              serta memproses pemotongan izin yang telah disetujui admin.
            </p>
          </div>
        </div>

        <DialogFooter className='p-4 border-t border-border/60 bg-muted/10 gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={onClose}
            disabled={calculateMutation.isPending}
            className='text-xs h-8 rounded-xl'
          >
            Batal
          </Button>
          <Button
            size='sm'
            onClick={handleCalculate}
            disabled={calculateMutation.isPending || !periodName || !periodStart || !periodEnd}
            className='text-xs h-8 rounded-xl gap-1.5'
          >
            <Icons.clock className='size-3.5' />
            {calculateMutation.isPending ? 'Mengkalkulasi...' : 'Jalankan Kalkulasi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
