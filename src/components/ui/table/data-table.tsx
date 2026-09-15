import { type Table as TanstackTable, flexRender } from '@tanstack/react-table';
import type * as React from 'react';

import { DataTablePagination } from '@/components/ui/table/data-table-pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { getCommonPinningStyles } from '@/lib/data-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { EmptyState } from '@/components/ui/empty-state';

import { DataTableBulkActions } from './data-table-bulk-actions';

interface DataTableProps<TData> extends React.ComponentProps<'div'> {
  table: TanstackTable<TData>;
  actionBar?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  entityName?: string;
  bulkActions?: React.ReactNode;
  emptyState?: React.ReactNode;
}

const interactiveRowSelector = [
  'a',
  'button',
  'input',
  'select',
  'textarea',
  '[role="button"]',
  '[role="checkbox"]',
  '[role="menuitem"]',
  '[data-row-click-ignore="true"]'
].join(',');

export function DataTable<TData>({
  table,
  actionBar,
  children,
  onRowClick,
  entityName,
  bulkActions,
  emptyState
}: DataTableProps<TData>) {
  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>, row: TData) => {
    if (!onRowClick || event.defaultPrevented || isInteractiveElement(event.target)) return;

    onRowClick(row);
  };

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      {children}
      <div className='relative flex min-h-0 flex-1 flex-col overflow-hidden'>
        <div className='absolute inset-0 flex overflow-hidden'>
          <ScrollArea className='h-full w-full'>
            <div className='pb-24'>
              <Table>
                <TableHeader className='bg-background sticky top-0 z-20 border-b border-border/60'>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          style={{
                            ...getCommonPinningStyles({ column: header.column, isHeader: true }),
                            width:
                              header.column.getSize() !== 150 ? header.column.getSize() : undefined
                          }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        onClick={(event) => handleRowClick(event, row.original)}
                        className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            style={{
                              ...getCommonPinningStyles({ column: cell.column, isHeader: false }),
                              width:
                                cell.column.getSize() !== 150 ? cell.column.getSize() : undefined
                            }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={table.getAllColumns().length}
                        className='h-[320px] p-6 text-center'
                      >
                        {emptyState ?? (
                          <EmptyState
                            title='Tidak ada data ditemukan'
                            description='Data akan ditampilkan di sini setelah tersedia.'
                            className='min-h-[260px] border-0 bg-transparent'
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
        </div>
        {table.getFilteredRowModel().rows.length > 0 ? (
          <div className='absolute bottom-0 inset-x-0 z-20 pointer-events-none flex justify-center'>
            <div className='pointer-events-auto flex w-full flex-col gap-2.5'>
              <DataTablePagination
                table={table}
                className='border-t border-border/50 bg-background/80 px-4 py-3 shadow-md backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 dark:bg-card/80 dark:supports-[backdrop-filter]:bg-card/70 sm:gap-6'
              />
              {actionBar && table.getFilteredSelectedRowModel().rows.length > 0 && actionBar}
              {bulkActions && (
                <DataTableBulkActions table={table} entityName={entityName || 'row'}>
                  {bulkActions}
                </DataTableBulkActions>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function isInteractiveElement(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest(interactiveRowSelector));
}
