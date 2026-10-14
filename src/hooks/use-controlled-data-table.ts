'use client';

import * as React from 'react';
import {
  type ColumnFiltersState,
  type ColumnPinningState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type TableOptions,
  type TableState,
  type Updater,
  type VisibilityState,
  type ExpandedState,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

export interface UseControlledDataTableProps<TData>
  extends Omit<
    TableOptions<TData>,
    | 'state'
    | 'getCoreRowModel'
  > {
  initialState?: Partial<TableState>;
  pagination: PaginationState;
  onPaginationChange: (updaterOrValue: Updater<PaginationState>) => void;
  sorting: SortingState;
  onSortingChange: (updaterOrValue: Updater<SortingState>) => void;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: (updaterOrValue: Updater<ColumnFiltersState>) => void;
}

export function useControlledDataTable<TData>(props: UseControlledDataTableProps<TData>) {
  const {
    columns,
    pageCount = -1,
    initialState,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    columnFilters,
    onColumnFiltersChange,
    manualPagination = true,
    manualFiltering = true,
    manualSorting = false,
    ...tableProps
  } = props;

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
    initialState?.rowSelection ?? {}
  );
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    initialState?.columnVisibility ?? {}
  );
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>(
    initialState?.columnPinning ?? {}
  );
  const [expanded, setExpanded] = React.useState<ExpandedState>(
    initialState?.expanded ?? {}
  );

  const table = useReactTable({
    ...tableProps,
    columns,
    initialState,
    pageCount,
    state: {
      pagination,
      sorting,
      columnVisibility,
      columnPinning,
      rowSelection,
      columnFilters,
      expanded,
    },
    defaultColumn: {
      enableColumnFilter: false,
      ...tableProps.defaultColumn,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onExpandedChange: tableProps.onExpandedChange ?? setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: tableProps.getExpandedRowModel ?? getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    manualPagination,
    manualSorting,
    manualFiltering,
  });

  return { table };
}
