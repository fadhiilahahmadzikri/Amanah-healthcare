'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { DefaultBulkActions } from '@/components/ui/table/default-bulk-actions';
import { useDataTable } from '@/hooks/use-data-table';
import { useNotificationStore } from '../../utils/store';
import { parseAsInteger, parseAsString, parseAsArrayOf, useQueryStates } from 'nuqs';
import { columns } from './columns';

export function NotificationsTable() {
  const { notifications } = useNotificationStore();

  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    title: parseAsString,
    category: parseAsArrayOf(parseAsString, ',').withDefault([]),
    status: parseAsArrayOf(parseAsString, ',').withDefault([])
  });

  let filtered = notifications;

  if (params.title) {
    const q = params.title.toLowerCase();
    filtered = filtered.filter(
      (n) =>
        n.sender.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        n.roleSubtitle.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
    );
  }

  if (params.category.length > 0) {
    filtered = filtered.filter((n) => n.category && params.category.includes(n.category));
  }

  if (params.status.length > 0) {
    filtered = filtered.filter((n) => params.status.includes(n.status));
  }

  const pageCount = Math.ceil(filtered.length / params.perPage);
  const pagedData = filtered.slice(
    (params.page - 1) * params.perPage,
    params.page * params.perPage
  );

  const { table } = useDataTable({
    data: pagedData,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 500
  });

  return (
    <div className='space-y-4 flex flex-1 flex-col h-full'>
      <DataTable table={table} entityName='notifikasi' bulkActions={<DefaultBulkActions />}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
