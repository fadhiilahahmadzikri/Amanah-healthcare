'use client';

import { parseAsInteger, parseAsString, parseAsArrayOf, useQueryStates } from 'nuqs';
import { getSortingStateParser } from '@/lib/parsers';
import { useDataTable } from '@/hooks/use-data-table';
import { useRecordNavigation } from '@/hooks/use-record-navigation';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { DefaultBulkActions } from '@/components/ui/table/default-bulk-actions';
import { columns } from './columns';
import { cn } from '@/lib/utils';
import { useCustomerStore, type Customer } from '../../store/customer-store';
import { useMemo } from 'react';

const columnIds = ['customer', 'company', 'phone', 'status', 'orders', 'totalSpent', 'joinedAt'];

export function CustomerTable() {
  const { customers } = useCustomerStore();
  const navigateToCustomer = useRecordNavigation('/dashboard/customers');

  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: getSortingStateParser(columnIds).withDefault([]),
    customer: parseAsString,
    status: parseAsArrayOf(parseAsString, ',')
  });

  const filteredAndSortedData = useMemo(() => {
    let result = [...customers];
    const customerSearch = params.customer?.toLowerCase();
    const selectedStatuses = params.status;

    if (customerSearch) {
      result = result.filter((customer) => customer.name.toLowerCase().includes(customerSearch));
    }
    if (selectedStatuses && selectedStatuses.length > 0) {
      result = result.filter((customer) => selectedStatuses.includes(customer.status));
    }

    if (params.sort.length > 0) {
      const { id, desc } = params.sort[0];
      result.sort((a, b) => {
        return compareSortValues(getCustomerSortValue(a, id), getCustomerSortValue(b, id), desc);
      });
    }

    return result;
  }, [customers, params]);

  const pageCount = Math.ceil(filteredAndSortedData.length / params.perPage);
  const paginatedData = filteredAndSortedData.slice(
    (params.page - 1) * params.perPage,
    params.page * params.perPage
  );

  const { table } = useDataTable({
    data: paginatedData,
    columns,
    pageCount,
    initialState: {
      sorting: params.sort,
      columnPinning: { right: ['actions'] },
      pagination: {
        pageIndex: params.page - 1,
        pageSize: params.perPage
      }
    }
  });

  return (
    <div className='flex h-full flex-1 flex-col gap-4'>
      <DataTable
        table={table}
        onRowClick={navigateToCustomer}
        entityName='customer'
        bulkActions={<DefaultBulkActions />}
      >
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}

type SortValue = string | number;

function compareSortValues(a: SortValue, b: SortValue, desc: boolean) {
  const result =
    typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b));

  return desc ? -result : result;
}

function getCustomerSortValue(customer: Customer, columnId: string): SortValue {
  switch (columnId) {
    case 'customer':
      return customer.name;
    case 'orders':
      return customer.orders;
    case 'totalSpent':
      return customer.totalSpent;
    case 'joinedAt':
      return new Date(customer.joinedAt).getTime();
    case 'company':
      return customer.company;
    case 'phone':
      return customer.phone;
    case 'status':
      return customer.status;
    default:
      return '';
  }
}
