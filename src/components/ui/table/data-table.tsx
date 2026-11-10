import { type Table as TanstackTable, type Row, flexRender } from '@tanstack/react-table';
import * as React from 'react';
import { cn } from '@/lib/utils';

import { DataTablePagination } from '@/components/ui/table/data-table-pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { getCommonPinningStyles, getCommonPinningClasses } from '@/lib/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { DataTableSkeleton } from './data-table-skeleton';

import { DataTableBulkActions } from './data-table-bulk-actions';

interface DataTableProps<TData> extends React.ComponentProps<'div'> {
  table: TanstackTable<TData>;
  actionBar?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  getRowClassName?: (row: Row<TData>) => string;
  renderRowDivider?: (row: Row<TData>, index: number) => React.ReactNode;
  entityName?: string;
  bulkActions?: React.ReactNode;
  emptyState?: React.ReactNode;
  isLoading?: boolean;
  hidePagination?: boolean;
  footerSlot?: React.ReactNode;
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
  getRowClassName,
  renderRowDivider,
  entityName,
  bulkActions,
  emptyState,
  isLoading,
  hidePagination = false,
  footerSlot
}: DataTableProps<TData>) {
  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>, row: TData) => {
    if (!onRowClick) return;
    if (event.defaultPrevented) return;
    if (isInteractiveElement(event.target)) return;

    onRowClick(row);
  };

  const hasCoreData = (table.getCoreRowModel().rows?.length ?? 0) > 0;

  if (isLoading && !hasCoreData) {
    return (
      <div className='flex min-h-0 flex-1 h-full w-full flex-col'>
        <DataTableSkeleton columnCount={table.getAllColumns().length} />
      </div>
    );
  }

  if (!hasCoreData) {
    return (
      <div className='flex min-h-0 flex-1 h-full w-full flex-col'>
        {emptyState ?? (
          <EmptyState
            title={entityName ? `Belum ada data ${entityName}` : 'Tidak ada data ditemukan'}
            description={
              entityName
                ? `Data ${entityName} akan ditampilkan di sini setelah tersedia.`
                : 'Data akan ditampilkan di sini setelah tersedia.'
            }
            className='h-full w-full flex-1'
          />
        )}
      </div>
    );
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      {children}
      <div className='relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-border/70 bg-card shadow-xs'>
        <div className='absolute inset-0 overflow-auto'>
          <div className='pb-24 min-w-full inline-block align-top'>
            <Table containerClassName='border-0 rounded-none shadow-none bg-transparent overflow-visible'>
              <TableHeader className='bg-surface-subtle/90 dark:bg-muted/40 sticky top-0 z-20 border-b border-border/60 backdrop-blur-xs'>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className={getCommonPinningClasses({ column: header.column, isHeader: true })}
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
                  table.getRowModel().rows.map((row, index) => {
                    const divider = renderRowDivider?.(row, index);
                    return (
                      <React.Fragment key={row.id}>
                        {divider && (
                          <TableRow className='hover:bg-transparent bg-transparent border-none'>
                            <TableCell
                              colSpan={table.getVisibleLeafColumns().length}
                              className='p-0'
                            >
                              {divider}
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow
                          data-state={row.getIsSelected() && 'selected'}
                          onClick={(event) => handleRowClick(event, row.original)}
                          className={cn(
                            'group/row',
                            onRowClick && 'cursor-pointer hover:bg-muted/50',
                            row.depth > 0 &&
                              'bg-muted/15 dark:bg-muted/20 hover:bg-muted/30 transition-colors',
                            getRowClassName?.(row)
                          )}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className={getCommonPinningClasses({ column: cell.column, isHeader: false })}
                              style={{
                                ...getCommonPinningStyles({
                                  column: cell.column,
                                  isHeader: false
                                }),
                                width:
                                  cell.column.getSize() !== 150
                                    ? cell.column.getSize()
                                    : undefined
                              }}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      </React.Fragment>
                    );
                  })
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
        </div>
        {table.getFilteredRowModel().rows.length > 0 ? (
          <div className='absolute bottom-0 inset-x-0 z-20 pointer-events-none flex justify-center'>
            <div className='pointer-events-auto flex w-full flex-col gap-2.5'>
              {!hidePagination ? (
                <DataTablePagination
                  table={table}
                  className='border-t border-border/50 bg-surface-subtle/90 px-4 py-3 shadow-md backdrop-blur-xl supports-[backdrop-filter]:bg-surface-subtle/80 dark:bg-card/90 dark:supports-[backdrop-filter]:bg-card/80 sm:gap-6'
                />
              ) : (
                footerSlot
              )}
              {actionBar && table.getFilteredSelectedRowModel().flatRows.length > 0 && actionBar}
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
