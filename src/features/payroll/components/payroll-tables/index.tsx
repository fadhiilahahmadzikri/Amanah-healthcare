'use client';

import React from 'react';
import type { Table } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/table/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/components/icons';
import type { PayrollSummaryItem } from '../../api/types';

export interface PayrollTableProps {
  table: Table<PayrollSummaryItem>;
  isLoading?: boolean;
  hasFilters?: boolean;
  onSelectStaff: (staff: PayrollSummaryItem) => void;
}

export function PayrollTable({ table, isLoading, hasFilters, onSelectStaff }: PayrollTableProps) {
  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <DataTable
        table={table}
        onRowClick={onSelectStaff}
        entityName='slip gaji'
        isLoading={isLoading}
        hidePagination={true}
        emptyState={
          hasFilters ? (
            <EmptyState
              icon={Icons.receipt}
              title='Tidak ada staf yang sesuai'
              description='Coba sesuaikan kata kunci pencarian atau filter kategori di atas.'
              className='py-16'
            />
          ) : (
            <EmptyState
              icon={Icons.receipt}
              title='Belum ada data slip gaji'
              description='Silakan jalankan kalkulasi penggajian periode baru untuk melihat rincian gaji staf.'
              className='py-16'
            />
          )
        }
      />
    </div>
  );
}
