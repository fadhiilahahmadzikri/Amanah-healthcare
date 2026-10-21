'use client';

import React from 'react';
import type { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { PayrollSummaryItem } from '../../api/types';

export interface PayrollTableMeta {
  onSelectStaff?: (staff: PayrollSummaryItem) => void;
}

export interface CellActionProps {
  data: PayrollSummaryItem;
  table?: Table<PayrollSummaryItem>;
  onSelectStaff?: (staff: PayrollSummaryItem) => void;
}

export function CellAction({ data, table, onSelectStaff: propOnSelect }: CellActionProps) {
  const meta = table?.options.meta as PayrollTableMeta | undefined;
  const onSelect = propOnSelect ?? meta?.onSelectStaff;

  return (
    <div className='flex items-center justify-center'>
      <Button
        variant='ghost'
        size='sm'
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(data);
        }}
        className='h-7 text-xs px-2.5 rounded-lg text-primary hover:text-primary hover:bg-primary/10 gap-1.5 font-medium'
      >
        <Icons.receipt className='size-3.5' />
        <span>Rincian</span>
      </Button>
    </div>
  );
}
