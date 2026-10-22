'use client';

import React from 'react';
import type { Table } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTablePagination } from '@/components/ui/table/data-table-pagination';
import { DefaultBulkActions } from '@/components/ui/table/default-bulk-actions';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/components/icons';
import type { PayrollSummaryItem } from '../../api/types';

export interface PayrollTableProps {
  table: Table<PayrollSummaryItem>;
  isLoading?: boolean;
  hasFilters?: boolean;
  onSelectStaff: (staff: PayrollSummaryItem) => void;
  onResetFilters?: () => void;
}

export function PayrollTable({ table, isLoading, hasFilters, onSelectStaff }: PayrollTableProps) {
  return (
    <div className='flex min-h-0 flex-1 flex-col justify-between'>
      <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
        <DataTable
          table={table}
          onRowClick={onSelectStaff}
          entityName='slip gaji'
          isLoading={isLoading}
          hidePagination={true}
          bulkActions={<DefaultBulkActions />}
          emptyState={
            hasFilters ? (
              <EmptyState
                icon={Icons.receipt}
                title='Tidak ada staf yang cocok'
                description='Silakan sesuaikan kata kunci pencarian atau filter kategori dan status aktif Anda.'
                className='py-16'
              />
            ) : (
              <EmptyState
                icon={Icons.receipt}
                title='Belum ada data slip gaji'
                description='Silakan jalankan kalkulasi penggajian periode baru untuk mengagregasikan rincian gaji staf.'
                className='py-16'
              />
            )
          }
        />
      </div>

      {table.getFilteredRowModel().rows.length > 0 && (
        <div className='pt-2 border-t border-border/80 shrink-0'>
          <DataTablePagination table={table} />
        </div>
      )}
    </div>
  );
}
