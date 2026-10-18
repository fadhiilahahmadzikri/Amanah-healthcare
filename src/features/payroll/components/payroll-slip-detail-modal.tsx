'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { ENTRY_TYPE_CONFIG } from '../constants/options';
import { formatCurrency } from '../utils/currency';
import type { PayrollPeriodItem, PayrollSummaryItem } from '../api/types';

interface PayrollSlipDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffSummary: PayrollSummaryItem | null;
  period?: PayrollPeriodItem | null;
}

export function PayrollSlipDetailModal({
  isOpen,
  onClose,
  staffSummary,
  period
}: PayrollSlipDetailModalProps) {
  if (!staffSummary) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-2xl p-0 overflow-hidden rounded-2xl max-h-[85vh] flex flex-col'>
        <DialogHeader className='p-5 border-b border-border/60 shrink-0'>
          <div className='flex items-center gap-3'>
            <div className='size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm'>
              {staffSummary.fullName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <DialogTitle className='text-base font-bold flex items-center gap-2'>
                <span>{staffSummary.fullName}</span>
                <span className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted border border-border/60 text-muted-foreground uppercase'>
                  {staffSummary.staffType}
                </span>
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                {period?.periodName ?? 'Periode Penggajian'} •{' '}
                {staffSummary.positionTitle ?? 'Staf Klinik'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto p-5 flex flex-col gap-4'>
          {/* Summary Box */}
          <div className='bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between'>
            <div>
              <span className='text-xs text-muted-foreground block'>
                Total Gaji Bersih (Take Home Pay)
              </span>
              <span className='text-xl font-bold text-primary'>
                {formatCurrency(staffSummary.netPayroll)}
              </span>
            </div>

            <div className='flex items-center gap-4 text-right text-xs'>
              <div>
                <span className='text-[10px] text-muted-foreground block'>Pokok</span>
                <span className='font-semibold text-foreground'>
                  {formatCurrency(staffSummary.baseEarnings)}
                </span>
              </div>
              {staffSummary.leaveDeductions > 0 && (
                <div>
                  <span className='text-[10px] text-rose-500 block'>Potongan</span>
                  <span className='font-semibold text-rose-600 dark:text-rose-400'>
                    -{formatCurrency(staffSummary.leaveDeductions)}
                  </span>
                </div>
              )}
              {staffSummary.replacementAdditions > 0 && (
                <div>
                  <span className='text-[10px] text-emerald-500 block'>Insentif</span>
                  <span className='font-semibold text-emerald-600 dark:text-emerald-400'>
                    +{formatCurrency(staffSummary.replacementAdditions)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Itemized Entries from Database */}
          <div className='space-y-2'>
            <h5 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              Rincian Komponen Slip Gaji ({staffSummary.entries.length} Entri)
            </h5>

            {staffSummary.entries.length === 0 ? (
              <div className='p-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-border/40'>
                Tidak ada entri komponen pada periode ini.
              </div>
            ) : (
              <div className='space-y-2'>
                {staffSummary.entries.map((entry) => {
                  const config =
                    ENTRY_TYPE_CONFIG[entry.entryType] || ENTRY_TYPE_CONFIG.base_scheduled;
                  const isPositive = entry.amount >= 0;

                  return (
                    <div
                      key={entry.id}
                      className='p-3 bg-card border border-border/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs'
                    >
                      <div className='space-y-0.5'>
                        <div className='flex items-center gap-2'>
                          <span className='font-semibold text-foreground'>{config.label}</span>
                          <span className='text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted'>
                            Sumber: {entry.sourceType}
                          </span>
                        </div>
                        {entry.description && (
                          <p className='text-[11px] text-muted-foreground'>{entry.description}</p>
                        )}
                        <p className='text-[10px] text-muted-foreground/80'>
                          {entry.quantityHours} jam @ {formatCurrency(entry.hourlyRate)}/jam
                        </p>
                      </div>

                      <div className='text-right sm:text-right shrink-0'>
                        <span className={`font-bold text-sm block ${config.colorClass}`}>
                          {isPositive ? '+' : ''}
                          {formatCurrency(entry.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className='p-4 border-t border-border/60 bg-muted/10 shrink-0'>
          <Button variant='outline' size='sm' onClick={onClose} className='text-xs h-8'>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
