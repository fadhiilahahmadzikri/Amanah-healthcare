'use client';

import { useMemo } from 'react';
import type { ColumnDef, Table } from '@tanstack/react-table';
import { useDataTable } from '@/hooks/use-data-table';
import type { PayrollSummaryItem } from '../api/types';

export interface UsePayrollTableParams {
  data: PayrollSummaryItem[];
  columns: ColumnDef<PayrollSummaryItem>[];
  onSelectStaff?: (staff: PayrollSummaryItem) => void;
  onGenerateReport?: (staff: PayrollSummaryItem) => void;
  isCalculatedOrFinalized?: boolean;
  exportingStaffId?: string | null;
}

export interface UsePayrollTableResult {
  table: Table<PayrollSummaryItem>;
}

export function usePayrollTable({
  data,
  columns,
  onSelectStaff,
  onGenerateReport,
  isCalculatedOrFinalized,
  exportingStaffId
}: UsePayrollTableParams): UsePayrollTableResult {
  const meta = useMemo(() => {
    return {
      onSelectStaff,
      onGenerateReport,
      isCalculatedOrFinalized,
      exportingStaffId
    };
  }, [onSelectStaff, onGenerateReport, isCalculatedOrFinalized, exportingStaffId]);

  const { table } = useDataTable({
    data,
    columns,
    pageCount: 1,
    shallow: true,
    debounceMs: 250,
    initialState: {
      columnPinning: { left: ['select'], right: ['actions'] }
    },
    meta
  });

  return {
    table
  };
}
