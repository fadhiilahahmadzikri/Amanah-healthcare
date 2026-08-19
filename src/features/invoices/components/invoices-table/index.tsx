'use client';

import { parseAsInteger, parseAsString, parseAsArrayOf, useQueryStates } from 'nuqs';
import { getSortingStateParser } from '@/lib/parsers';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { DefaultBulkActions } from '@/components/ui/table/default-bulk-actions';
import { useRecordNavigation } from '@/hooks/use-record-navigation';
import { columns } from './columns';
import { useInvoiceStore, Invoice } from '../../store/invoice-store';
import { useCustomerStore } from '@/features/customers/store/customer-store';
import { useMemo } from 'react';

const columnIds = columns.map((c) => c.id).filter(Boolean) as string[];

export function InvoiceTable() {
  const { invoices } = useInvoiceStore();
  const navigateToInvoice = useRecordNavigation('/dashboard/invoices');

  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: getSortingStateParser(columnIds).withDefault([]),
    customer: parseAsString,
    invoiceNumber: parseAsString,
    status: parseAsArrayOf(parseAsString, ',')
  });

  const filteredAndSortedData = useMemo(() => {
    let result = [...invoices];
    let customerSearch = params.customer?.toLowerCase();

    // Look up customer by ID in case the URL param is a customerId
    if (customerSearch && customerSearch.startsWith('cust_')) {
      const customerObj = useCustomerStore
        .getState()
        .customers.find((c) => c.id.toLowerCase() === customerSearch);
      if (customerObj) {
        customerSearch = customerObj.name.toLowerCase();
      }
    }

    const invoiceNumberSearch = params.invoiceNumber?.toLowerCase();
    const selectedStatuses = params.status;

    if (customerSearch) {
      result = result.filter(
        (o) =>
          o.customerName.toLowerCase().includes(customerSearch) ||
          o.customerEmail.toLowerCase().includes(customerSearch)
      );
    }
    if (invoiceNumberSearch) {
      result = result.filter((o) => o.invoiceNumber.toLowerCase().includes(invoiceNumberSearch));
    }
    if (selectedStatuses && selectedStatuses.length > 0) {
      result = result.filter((o) => selectedStatuses.includes(o.status));
    }

    if (params.sort.length > 0) {
      const { id, desc } = params.sort[0];
      result.sort((a, b) => {
        return compareSortValues(getInvoiceSortValue(a, id), getInvoiceSortValue(b, id), desc);
      });
    } else {
      result.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
    }

    return result;
  }, [invoices, params]);

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
        onRowClick={navigateToInvoice}
        entityName='invoice'
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

function getInvoiceSortValue(invoice: Invoice, columnId: string): SortValue {
  switch (columnId) {
    case 'customer':
      return invoice.customerName;
    case 'dueDate':
      return new Date(invoice.dueDate).getTime();
    case 'issuedAt':
      return new Date(invoice.issuedAt).getTime();
    case 'totalAmount':
      return invoice.totalAmount;
    case 'invoiceNumber':
      return invoice.invoiceNumber;
    case 'status':
      return invoice.status;
    default:
      return '';
  }
}
