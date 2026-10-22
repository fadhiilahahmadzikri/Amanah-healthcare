'use client';

import { useMemo, useState, useCallback } from 'react';
import type { ColumnDef, Table } from '@tanstack/react-table';
import { parseAsString, useQueryStates } from 'nuqs';
import { useDataTable } from '@/hooks/use-data-table';
import type { PayrollSummaryItem, StaffCategory } from '../api/types';

export interface UsePayrollTableParams {
  data: PayrollSummaryItem[];
  columns: ColumnDef<PayrollSummaryItem>[];
}

export interface UsePayrollTableResult {
  table: Table<PayrollSummaryItem>;
  filteredSummaries: PayrollSummaryItem[];
  selectedStaff: PayrollSummaryItem | null;
  exportStaffTarget: PayrollSummaryItem | null;
  // Modal states
  isDetailOpen: boolean;
  isCalculateOpen: boolean;
  isRatesOpen: boolean;
  isAuditOpen: boolean;
  isConfirmFinalizeOpen: boolean;
  isExportPeriodOpen: boolean;
  // Filter states
  searchQuery: string;
  categoryFilter: string;
  hasFilters: boolean;
  // Actions
  actions: {
    openDetail: (staff: PayrollSummaryItem) => void;
    closeDetail: () => void;
    openExportStaff: (staff: PayrollSummaryItem) => void;
    closeExportStaff: () => void;
    openExportPeriod: () => void;
    closeExportPeriod: () => void;
    openCalculate: () => void;
    closeCalculate: () => void;
    openRates: () => void;
    closeRates: () => void;
    openAudit: () => void;
    closeAudit: () => void;
    openConfirmFinalize: () => void;
    closeConfirmFinalize: () => void;
    setSearch: (search: string) => void;
    setCategory: (category: string) => void;
    resetFilters: () => void;
  };
}

export function usePayrollTable({ data, columns }: UsePayrollTableParams): UsePayrollTableResult {
  // 1. URL State with Nuqs
  const [params, setParams] = useQueryStates({
    search: parseAsString.withDefault(''),
    category: parseAsString.withDefault('all')
  });

  // 2. Modals state
  const [selectedStaff, setSelectedStaff] = useState<PayrollSummaryItem | null>(null);
  const [exportStaffTarget, setExportStaffTarget] = useState<PayrollSummaryItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCalculateOpen, setIsCalculateOpen] = useState(false);
  const [isRatesOpen, setIsRatesOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isConfirmFinalizeOpen, setIsConfirmFinalizeOpen] = useState(false);
  const [isExportPeriodOpen, setIsExportPeriodOpen] = useState(false);

  // 3. Filtered Data
  const filteredSummaries = useMemo(() => {
    return data.filter((item) => {
      const q = params.search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.fullName.toLowerCase().includes(q) ||
        (item.positionTitle && item.positionTitle.toLowerCase().includes(q)) ||
        (item.staffCode && item.staffCode.toLowerCase().includes(q));

      const matchesCategory = params.category === 'all' || item.staffType === params.category;

      return matchesSearch && matchesCategory;
    });
  }, [data, params.search, params.category]);

  const hasFilters = Boolean(params.search.trim()) || params.category !== 'all';

  // 4. Modal Action Handlers
  const openDetail = useCallback((staff: PayrollSummaryItem) => {
    setSelectedStaff(staff);
    setIsDetailOpen(true);
  }, []);

  const closeDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedStaff(null);
  }, []);

  const openExportStaff = useCallback((staff: PayrollSummaryItem) => {
    setExportStaffTarget(staff);
  }, []);

  const closeExportStaff = useCallback(() => {
    setExportStaffTarget(null);
  }, []);

  const openExportPeriod = useCallback(() => {
    setIsExportPeriodOpen(true);
  }, []);

  const closeExportPeriod = useCallback(() => {
    setIsExportPeriodOpen(false);
  }, []);

  const openCalculate = useCallback(() => setIsCalculateOpen(true), []);
  const closeCalculate = useCallback(() => setIsCalculateOpen(false), []);

  const openRates = useCallback(() => setIsRatesOpen(true), []);
  const closeRates = useCallback(() => setIsRatesOpen(false), []);

  const openAudit = useCallback(() => setIsAuditOpen(true), []);
  const closeAudit = useCallback(() => setIsAuditOpen(false), []);

  const openConfirmFinalize = useCallback(() => setIsConfirmFinalizeOpen(true), []);
  const closeConfirmFinalize = useCallback(() => setIsConfirmFinalizeOpen(false), []);

  const setSearch = useCallback(
    (search: string) => {
      void setParams({ search: search ? search : null });
    },
    [setParams]
  );

  const setCategory = useCallback(
    (category: string) => {
      void setParams({ category: category === 'all' ? null : (category as StaffCategory) });
    },
    [setParams]
  );

  const resetFilters = useCallback(() => {
    void setParams({ search: null, category: null });
  }, [setParams]);

  // 5. TanStack Table Hook (hidePagination mode: 1 page, all data)
  const { table } = useDataTable({
    data: filteredSummaries,
    columns,
    pageCount: 1,
    shallow: true,
    debounceMs: 250,
    initialState: {
      columnPinning: { left: ['select'], right: ['actions'] }
    },
    meta: {
      onSelectStaff: openDetail,
      onExportStaff: openExportStaff
    }
  });

  return {
    table,
    filteredSummaries,
    selectedStaff,
    exportStaffTarget,
    isDetailOpen,
    isCalculateOpen,
    isRatesOpen,
    isAuditOpen,
    isConfirmFinalizeOpen,
    isExportPeriodOpen,
    searchQuery: params.search,
    categoryFilter: params.category,
    hasFilters,
    actions: {
      openDetail,
      closeDetail,
      openExportStaff,
      closeExportStaff,
      openExportPeriod,
      closeExportPeriod,
      openCalculate,
      closeCalculate,
      openRates,
      closeRates,
      openAudit,
      closeAudit,
      openConfirmFinalize,
      closeConfirmFinalize,
      setSearch,
      setCategory,
      resetFilters
    }
  };
}
