'use client';

import React from 'react';
import type { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { PayrollSummaryItem } from '../../api/types';

export interface PayrollTableMeta {
  onSelectStaff?: (staff: PayrollSummaryItem) => void;
  onGenerateReport?: (staff: PayrollSummaryItem) => void;
  isCalculatedOrFinalized?: boolean;
  exportingStaffId?: string | null;
}

export interface CellActionProps {
  data: PayrollSummaryItem;
  table?: Table<PayrollSummaryItem>;
  onSelectStaff?: (staff: PayrollSummaryItem) => void;
  onGenerateReport?: (staff: PayrollSummaryItem) => void;
}

export function CellAction({
  data,
  table,
  onSelectStaff: propOnSelect,
  onGenerateReport: propOnGenerate
}: CellActionProps) {
  const meta = table?.options.meta as PayrollTableMeta | undefined;
  const onSelect = propOnSelect ?? meta?.onSelectStaff;
  const onGenerate = propOnGenerate ?? meta?.onGenerateReport;
  const canGenerate =
    meta?.isCalculatedOrFinalized ||
    data.periodStatus === 'calculated' ||
    data.periodStatus === 'finalized';
  const isExportingThisStaff = meta?.exportingStaffId === data.staffId;

  return (
    <div className='flex items-center justify-center gap-1.5'>
      <Button
        variant='ghost'
        size='sm'
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(data);
        }}
        className='h-7 text-xs px-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 gap-1.5 font-medium cursor-pointer'
        title='Lihat rincian slip gaji'
      >
        <Icons.receipt className='size-3.5' />
        <span>Rincian</span>
      </Button>

      {canGenerate && (
        <Button
          variant='outline'
          size='sm'
          disabled={isExportingThisStaff}
          onClick={(e) => {
            e.stopPropagation();
            onGenerate?.(data);
          }}
          className='h-7 text-xs px-2 rounded-md border-border/70 text-foreground hover:bg-muted/80 gap-1 font-medium cursor-pointer'
          title='Generate laporan slip gaji'
        >
          {isExportingThisStaff ? (
            <Icons.spinner className='size-3 animate-spin' />
          ) : (
            <Icons.fileTypePdf className='size-3 text-primary' />
          )}
          <span className='hidden xl:inline'>Laporan</span>
        </Button>
      )}
    </div>
  );
}
