'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Icons } from '@/components/icons';
import { PERIOD_STATUS_CONFIG } from '../constants/options';
import { formatCurrency } from '../utils/currency';
import type { PayrollPeriodItem } from '../api/types';

interface PayrollPeriodSelectorProps {
  periods: PayrollPeriodItem[];
  selectedPeriodId?: string | null;
  onSelectPeriod: (id: string) => void;
  onOpenCalculateModal: () => void;
  onOpenRatesModal: () => void;
  onFinalizePeriod?: (id: string) => void;
  onReconcileDailyLeave?: () => void;
  isFinalizing?: boolean;
  isReconciling?: boolean;
  isLoading?: boolean;
}

export function PayrollPeriodSelector({
  periods,
  selectedPeriodId,
  onSelectPeriod,
  onOpenCalculateModal,
  onOpenRatesModal,
  onFinalizePeriod,
  onReconcileDailyLeave,
  isFinalizing,
  isReconciling,
  isLoading
}: PayrollPeriodSelectorProps) {
  const [isConfirmFinalizeOpen, setIsConfirmFinalizeOpen] = useState(false);

  const currentPeriod = periods.find((p) => p.id === selectedPeriodId) || periods[0];
  const statusConfig = currentPeriod
    ? PERIOD_STATUS_CONFIG[currentPeriod.status] || PERIOD_STATUS_CONFIG.draft
    : null;

  const isFinalized = currentPeriod?.status === 'finalized';
  const isCalculated = currentPeriod?.status === 'calculated';

  const handleConfirmFinalize = () => {
    if (currentPeriod?.id && onFinalizePeriod) {
      onFinalizePeriod(currentPeriod.id);
    }
    setIsConfirmFinalizeOpen(false);
  };

  return (
    <>
      {/* Modal Konfirmasi Tutup Buku */}
      <AlertDialog open={isConfirmFinalizeOpen} onOpenChange={setIsConfirmFinalizeOpen}>
        <AlertDialogContent className='max-w-md rounded-2xl'>
          <AlertDialogHeader>
            <div className='flex items-center gap-2.5'>
              <div className='size-9 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0'>
                <Icons.lock className='size-5' />
              </div>
              <AlertDialogTitle className='text-base font-bold'>
                Tutup Buku Periode Payroll?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className='text-xs text-muted-foreground mt-2 leading-relaxed'>
              Setelah periode <strong>&quot;{currentPeriod?.periodName}&quot;</strong> resmi ditutup
              buku (<strong>FINALIZED</strong>), seluruh nominal mutasi, jam kerja, dan slip gaji
              staf akan dikunci permanen.
              <br />
              <br />
              <span className='font-semibold text-foreground'>Integritas Akuntansi:</span> Periode
              ini tidak akan dapat dikalkulasi ulang dan tidak akan terpengaruh jika tarif
              kompensasi diubah di masa mendatang.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='gap-2 mt-2'>
            <AlertDialogCancel className='text-xs h-8 rounded-xl'>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmFinalize}
              disabled={isFinalizing}
              className='text-xs h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5'
            >
              <Icons.checks className='size-3.5' />
              {isFinalizing ? 'Memproses...' : 'Konfirmasi Tutup Buku'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className='bg-card border border-border/60 p-4 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs'>
        <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
          <div className='size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0'>
            <Icons.calendar className='size-5' />
          </div>

          <div>
            <div className='flex items-center gap-2'>
              <h3 className='text-sm font-bold text-foreground'>
                {currentPeriod?.periodName ?? 'Memilih Periode...'}
              </h3>
              {statusConfig && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusConfig.className}`}
                >
                  {isFinalized && <Icons.lock className='size-2.5' />}
                  {statusConfig.label}
                </span>
              )}
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {currentPeriod
                ? `Rentang Tanggal: ${currentPeriod.periodStart} s.d ${currentPeriod.periodEnd} • Total: ${formatCurrency(currentPeriod.totalPayout)}`
                : 'Silakan pilih periode penggajian di samping'}
            </p>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2 shrink-0'>
          {/* Dropdown switch period */}
          {periods.length > 0 && (
            <div className='w-52'>
              <Select
                value={selectedPeriodId ?? currentPeriod?.id}
                onValueChange={onSelectPeriod}
                disabled={isLoading}
              >
                <SelectTrigger className='h-9 text-xs rounded-xl'>
                  <SelectValue placeholder='Pilih Periode Penggajian' />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((p) => (
                    <SelectItem key={p.id} value={p.id} className='text-xs'>
                      {p.periodName} ({p.status.toUpperCase()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Action Tutup Buku jika status calculated */}
          {isCalculated && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsConfirmFinalizeOpen(true)}
              disabled={isLoading || isFinalizing}
              className='h-9 text-xs rounded-xl gap-1.5 border-emerald-500/30 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40'
            >
              <Icons.lock className='size-3.5 text-emerald-600 dark:text-emerald-400' />
              Tutup Buku
            </Button>
          )}

          {/* Action Konfigurasi Tarif Standar */}
          <Button
            variant='outline'
            size='sm'
            onClick={onOpenRatesModal}
            className='h-9 text-xs rounded-xl gap-1.5 px-3'
          >
            <Icons.settings className='size-3.5 text-muted-foreground' />
            Konfigurasi Tarif
          </Button>

          {/* Action Sinkronisasi Cuti Harian On-Demand */}
          <Button
            variant='outline'
            size='sm'
            onClick={onReconcileDailyLeave}
            disabled={isLoading || isReconciling}
            className='h-9 text-xs rounded-xl gap-1.5 px-3'
          >
            <Icons.refresh
              className={`size-3.5 text-muted-foreground ${isReconciling ? 'animate-spin' : ''}`}
            />
            Rekap Cuti
          </Button>

          {/* Trigger Calculation Modal */}
          <Button
            onClick={onOpenCalculateModal}
            size='sm'
            className='h-9 text-xs rounded-xl gap-1.5 px-3.5'
          >
            <Icons.plus className='size-3.5' />
            Kalkulasi Baru
          </Button>
        </div>
      </div>
    </>
  );
}
