'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { DefaultBulkActions } from '@/components/ui/table/default-bulk-actions';
import { useDataTable } from '@/hooks/use-data-table';
import { useRecordNavigation } from '@/hooks/use-record-navigation';
import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { getSortingStateParser } from '@/lib/parsers';
import { productsQueryOptions } from '../../api/queries';
import { columns } from './columns';

import { parseAsArrayOf } from 'nuqs';

const columnIds = columns.map((c) => c.id).filter(Boolean) as string[];

export function ProductTable() {
  const navigateToProduct = useRecordNavigation('/dashboard/products');
  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString,
    categoryId: parseAsString,
    status: parseAsArrayOf(parseAsString, ','),
    sort: getSortingStateParser(columnIds).withDefault([])
  });

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(params.name && { search: params.name }),
    ...(params.categoryId && { categoryId: params.categoryId }),
    ...(params.status && params.status.length > 0 && { status: params.status.join(',') }),
    ...(params.sort.length > 0 && { sort: JSON.stringify(params.sort) })
  };

  const { data } = useSuspenseQuery(productsQueryOptions(filters));

  const pageCount = Math.ceil(data.total_products / params.perPage);

  const { table } = useDataTable({
    data: data.products,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnPinning: { right: ['actions'] }
    }
  });

  return (
    <div className='space-y-4 flex flex-1 flex-col h-full'>
      <DataTable
        table={table}
        onRowClick={navigateToProduct}
        entityName='product'
        bulkActions={<DefaultBulkActions />}
      >
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
