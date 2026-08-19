'use client';

import { parseAsInteger, parseAsString, parseAsArrayOf, useQueryStates } from 'nuqs';
import { getSortingStateParser } from '@/lib/parsers';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { DefaultBulkActions } from '@/components/ui/table/default-bulk-actions';
import { columns } from './columns';
import { useOrderStore } from '../../store/order-store';
import { useMemo } from 'react';
import { Order } from '@/constants/mock-db';
import { useRecordNavigation } from '@/hooks/use-record-navigation';

const columnIds = columns.map((c) => c.id).filter(Boolean) as string[];

export function OrderTable() {
  const { orders } = useOrderStore();
  const navigateToOrder = useRecordNavigation('/dashboard/orders');

  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: getSortingStateParser(columnIds).withDefault([]),
    customer: parseAsString,
    orderNumber: parseAsString,
    status: parseAsArrayOf(parseAsString, ',')
  });

  const filteredAndSortedData = useMemo(() => {
    let result = [...orders];
    const customerSearch = params.customer?.toLowerCase();
    const orderNumberSearch = params.orderNumber?.toLowerCase();
    const selectedStatuses = params.status;

    if (customerSearch) {
      result = result.filter(
        (o) =>
          o.customerName.toLowerCase().includes(customerSearch) ||
          o.customerId.toLowerCase() === customerSearch
      );
    }
    if (orderNumberSearch) {
      result = result.filter((o) => o.orderNumber.toLowerCase().includes(orderNumberSearch));
    }
    if (selectedStatuses && selectedStatuses.length > 0) {
      result = result.filter((o) => selectedStatuses.includes(o.status));
    }

    if (params.sort.length > 0) {
      const { id, desc } = params.sort[0];
      result.sort((a, b) => {
        return compareSortValues(getOrderSortValue(a, id), getOrderSortValue(b, id), desc);
      });
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [orders, params]);

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
    <div className='space-y-4 flex flex-1 flex-col h-full'>
      <DataTable
        table={table}
        onRowClick={navigateToOrder}
        entityName='order'
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

function getOrderSortValue(order: Order, columnId: string): SortValue {
  switch (columnId) {
    case 'customer':
      return order.customerName;
    case 'createdAt':
      return new Date(order.createdAt).getTime();
    case 'totalAmount':
      return order.totalAmount;
    case 'orderNumber':
      return order.orderNumber;
    case 'status':
      return order.status;
    default:
      return '';
  }
}
