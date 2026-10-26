'use client';

import React, { useState, useMemo } from 'react';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
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
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='w-full sm:max-w-5xl lg:max-w-6xl'
      className='max-h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden'
      showCloseButton={false}
      dismissible={true}
    >
      <div className='flex flex-col h-full min-h-0 flex-1 font-sans select-none'>
        {/* Pinned Header */}
        <div className='shrink-0 pb-3.5 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight truncate'>
              Audit Mutasi Komponen Penggajian
            </h3>
            <p className='text-xs text-muted-foreground mt-0.5 truncate'>
              {period?.periodName ?? 'Periode Penggajian'} • {filteredMutations.length} total mutasi
              tercatat
            </p>
          </div>

          {/* Filter by entry type */}
          <div className='w-full sm:w-52 shrink-0'>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className='h-8.5 text-xs bg-card'>
                <SelectValue placeholder='Semua tipe mutasi' />
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

        {/* Scrollable Body: Spacious Table */}
        <div className='flex-1 min-h-0 overflow-y-auto py-3 relative'>
          {filteredMutations.length === 0 ? (
            <div className='p-12 text-center text-xs text-muted-foreground'>
              Tidak ada data entri mutasi pada kriteria ini.
            </div>
          ) : (
            <div className='border border-border/60 rounded-xl overflow-hidden'>
              <Table>
                <TableHeader className='bg-muted/40 sticky top-0 z-10 backdrop-blur-xs'>
                  <TableRow className='border-b border-border/60 hover:bg-transparent'>
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
                      <TableRow
                        key={m.id}
                        className='border-b border-border/40 hover:bg-muted/30 transition-colors'
                      >
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
                            <span className='text-[11px] text-muted-foreground block truncate max-w-sm'>
                              {m.description}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className='py-2.5 text-xs text-muted-foreground'>
                          <span className='px-1.5 py-0.5 rounded bg-muted text-[10px] border border-border/50'>
                            {SOURCE_TYPE_LABELS[m.sourceType] ?? m.sourceType}
                          </span>
                        </TableCell>
                        <TableCell className='py-2.5 text-center text-xs tabular-nums text-muted-foreground font-mono'>
                          {m.quantityHours} jam
                        </TableCell>
                        <TableCell className='py-2.5 text-right pr-4 text-xs font-bold tabular-nums'>
                          <span className={isPositive ? 'text-foreground' : 'text-destructive'}>
                            {isPositive ? '+' : ''}
                            {formatCurrency(m.amount)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Pinned Footer */}
        <div className='shrink-0 pt-3.5 border-t border-border/50 flex items-center justify-between gap-3'>
          <div className='text-xs text-muted-foreground font-medium'>
            Akumulasi Mutasi Terfilter:{' '}
            <span className='font-bold text-foreground tabular-nums'>
              {formatCurrency(totalAmount)}
            </span>
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onClose}
            className='px-4 font-semibold cursor-pointer text-xs h-8.5 text-muted-foreground hover:text-foreground'
          >
            Tutup
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
