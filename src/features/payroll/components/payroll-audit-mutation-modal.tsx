'use client';

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/icons';
import { formatCurrency } from '../utils/currency';
import { ENTRY_TYPE_CONFIG, SOURCE_TYPE_LABELS } from '../constants/options';
import type { PayrollEntryType, PayrollPeriodItem, PayrollSummaryItem } from '../api/types';

export interface PayrollAuditMutationModalProps {
  isOpen: boolean;
  onClose: () => void;
  period?: PayrollPeriodItem | null;
  summaries: PayrollSummaryItem[];
}

export function PayrollAuditMutationModal({
  isOpen,
  onClose,
  period,
  summaries
}: PayrollAuditMutationModalProps) {
  const [filterType, setFilterType] = useState<string>('all');

  // Consolidate all entries across all staff
  const allMutations = useMemo(() => {
    const list: Array<{
      id: string;
      staffName: string;
      staffType: string;
      entryType: PayrollEntryType;
      sourceType: string;
      quantityHours: number;
      hourlyRate: number;
      amount: number;
      description?: string | null;
      createdAt: string;
    }> = [];

    for (const s of summaries) {
      for (const e of s.entries) {
        list.push({
          id: e.id,
          staffName: s.fullName,
          staffType: s.staffType,
          entryType: e.entryType,
          sourceType: e.sourceType,
          quantityHours: e.quantityHours,
          hourlyRate: e.hourlyRate,
          amount: e.amount,
          description: e.description,
          createdAt: e.createdAt
        });
      }
    }

    return list;
  }, [summaries]);

  const filteredMutations = useMemo(() => {
    if (filterType === 'all') return allMutations;
    return allMutations.filter((m) => m.entryType === filterType);
  }, [allMutations, filterType]);

  const totalAmount = useMemo(
    () => filteredMutations.reduce((acc, m) => acc + m.amount, 0),
    [filteredMutations]
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-3xl p-0 overflow-hidden rounded-2xl max-h-[85vh] flex flex-col'>
        <DialogHeader className='p-5 border-b border-border/60 shrink-0'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-2.5'>
              <div className='size-9 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center shrink-0'>
                <Icons.receipt className='size-5' />
              </div>
              <div>
                <DialogTitle className='text-base font-bold'>
                  Audit Mutasi Komponen Penggajian
                </DialogTitle>
                <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                  {period?.periodName ?? 'Periode Penggajian'} • {filteredMutations.length} total
                  mutasi tercatat
                </DialogDescription>
              </div>
            </div>

            {/* Filter by entry type */}
            <div className='w-48 shrink-0'>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className='h-8 text-xs rounded-xl'>
                  <SelectValue placeholder='Semua Tipe Mutasi' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all' className='text-xs'>
                    Semua Komponen
                  </SelectItem>
                  <SelectItem value='base_scheduled' className='text-xs'>
                    Jam Pokok
                  </SelectItem>
                  <SelectItem value='leave_deduction' className='text-xs'>
                    Potongan Cuti
                  </SelectItem>
                  <SelectItem value='replacement_addition' className='text-xs'>
                    Insentif Pengganti
                  </SelectItem>
                  <SelectItem value='overtime_addition' className='text-xs'>
                    Lembur
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>

        {/* Mutation List Table */}
        <div className='flex-1 min-h-0 relative'>
          {filteredMutations.length === 0 ? (
            <div className='p-12 text-center text-xs text-muted-foreground'>
              Tidak ada data entri mutasi pada kriteria ini.
            </div>
          ) : (
            <ScrollArea className='h-[420px] w-full'>
              <Table>
                <TableHeader className='bg-muted/30 sticky top-0 z-10 backdrop-blur-xs'>
                  <TableRow className='border-b border-border/60'>
                    <TableHead className='text-xs font-semibold text-foreground py-2.5 pl-4'>
                      Karyawan / Staf
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-foreground py-2.5'>
                      Komponen Mutasi
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-foreground py-2.5'>
                      Sumber
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-foreground py-2.5 text-center'>
                      Volume Jam
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-foreground py-2.5 text-right pr-4'>
                      Nominal
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMutations.map((m) => {
                    const config =
                      ENTRY_TYPE_CONFIG[m.entryType] || ENTRY_TYPE_CONFIG.base_scheduled;
                    const isPositive = m.amount >= 0;

                    return (
                      <TableRow key={m.id} className='border-b border-border/40 hover:bg-muted/30'>
                        <TableCell className='py-2.5 pl-4'>
                          <span className='font-semibold text-xs text-foreground block'>
                            {m.staffName}
                          </span>
                          <span className='text-[10px] text-muted-foreground capitalize'>
                            {m.staffType}
                          </span>
                        </TableCell>
                        <TableCell className='py-2.5 text-xs font-medium'>
                          <span className='block text-foreground'>{config.label}</span>
                          {m.description && (
                            <span className='text-[10px] text-muted-foreground block truncate max-w-xs'>
                              {m.description}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className='py-2.5 text-xs text-muted-foreground'>
                          <span className='px-1.5 py-0.5 rounded bg-muted text-[10px]'>
                            {SOURCE_TYPE_LABELS[m.sourceType] ?? m.sourceType}
                          </span>
                        </TableCell>
                        <TableCell className='py-2.5 text-center text-xs tabular-nums text-muted-foreground'>
                          {m.quantityHours} jam
                        </TableCell>
                        <TableCell className='py-2.5 text-right pr-4 text-xs font-bold tabular-nums'>
                          <span className={config.colorClass}>
                            {isPositive ? '+' : ''}
                            {formatCurrency(m.amount)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>

        {/* Footer Summary */}
        <DialogFooter className='p-4 border-t border-border/60 bg-muted/10 flex items-center justify-between sm:justify-between shrink-0'>
          <div className='text-xs text-muted-foreground'>
            Akumulasi Mutasi Terfilter:{' '}
            <span className='font-bold text-foreground'>{formatCurrency(totalAmount)}</span>
          </div>
          <Button variant='outline' size='sm' onClick={onClose} className='text-xs h-8 rounded-xl'>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
