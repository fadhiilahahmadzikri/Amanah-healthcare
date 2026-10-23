'use client';

import React, { useState } from 'react';
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
import { PayrollActionMenu } from './payroll-action-menu';
import type { PayrollPeriodItem } from '../api/types';

interface PayrollPeriodSelectorProps {
  periods: PayrollPeriodItem[];
  selectedPeriodId?: string | null;
  onSelectPeriod: (id: string) => void;
  onOpenCalculateModal: () => void;
  onOpenRatesModal: () => void;
  onOpenAuditModal: () => void;
  onOpenExportModal?: () => void;
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
  onOpenAuditModal,
  onOpenExportModal,
  onFinalizePeriod,
  onReconcileDailyLeave,
  isFinalizing,
  isReconciling,
  isLoading
}: PayrollPeriodSelectorProps) {
  const [isConfirmFinalizeOpen, setIsConfirmFinalizeOpen] = useState(false);

  const currentPeriod = periods.find((p) => p.id === selectedPeriodId) || periods[0];
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
                Tutup Buku Periode Penggajian?
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

      {/* Minimalist Action Bar: Clean, Simple, Zero Redundancy */}
      <div className='flex flex-wrap items-center justify-between sm:justify-end gap-2.5 shrink-0'>
        {/* Dropdown switch period */}
        {periods.length > 0 && (
          <div className='flex-1 sm:flex-initial sm:w-72'>
            <Select
              value={selectedPeriodId ?? currentPeriod?.id}
              onValueChange={onSelectPeriod}
              disabled={isLoading}
            >
              <SelectTrigger className='h-9 text-xs rounded-xl bg-card border-border/80 shadow-xs'>
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

        {/* Unified Action Context Menu */}
        <PayrollActionMenu
          onOpenCalculate={onOpenCalculateModal}
          onOpenConfirmFinalize={() => setIsConfirmFinalizeOpen(true)}
          onOpenRates={onOpenRatesModal}
          onReconcileDailyLeave={onReconcileDailyLeave ?? (() => {})}
          onOpenAudit={onOpenAuditModal}
          onOpenExport={onOpenExportModal}
          canFinalize={isCalculated}
          isFinalizing={isFinalizing}
          isReconciling={isReconciling}
          disabled={isLoading}
        />
      </div>
    </>
  );
}
