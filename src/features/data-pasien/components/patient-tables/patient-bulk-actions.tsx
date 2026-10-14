'use client';

import * as React from 'react';
import type { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { Patient } from '../../api/types';

export interface PatientBulkActionsProps {
  table: Table<Patient>;
  onBulkDelete: (patients: Patient[]) => void;
}

export function PatientBulkActions({ table, onBulkDelete }: PatientBulkActionsProps) {
  const selectedRows = table.getFilteredSelectedRowModel().flatRows;
  const selectedPatients = selectedRows.map((r) => r.original);

  if (selectedRows.length === 0) return null;

  return (
    <Button
      variant='destructive'
      size='sm'
      shape='pill'
      onClick={() => onBulkDelete(selectedPatients)}
      className='h-7 px-3 text-xs font-semibold gap-1.5 cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-transform'
    >
      <Icons.trash className='size-3.5' />
      <span>Nonaktifkan Terpilih ({selectedRows.length})</span>
    </Button>
  );
}
