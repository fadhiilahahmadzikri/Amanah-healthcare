'use client';

import * as React from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { DefaultBulkActions } from '@/components/ui/table/default-bulk-actions';
import { useDataTable } from '@/hooks/use-data-table';
import { stockProductsQueryOptions } from '../../api/queries';
import { columns } from './columns';

interface StockTableProps {
  search?: string;
  status?: 'ALL' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export function StockTable({ search, status }: StockTableProps) {
  const { data } = useSuspenseQuery(stockProductsQueryOptions({ search, status }));

  const { table } = useDataTable({
    data,
    columns,
    pageCount: 1,
    initialState: {
      sorting: [{ id: 'name', desc: false }],
      columnPinning: { right: ['actions'] }
    }
  });

  return (
    <div className='space-y-4'>
      <DataTableToolbar table={table} />
      <DataTable table={table} entityName='stock item' bulkActions={<DefaultBulkActions />} />
    </div>
  );
}
