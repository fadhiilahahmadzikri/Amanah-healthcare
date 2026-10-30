'use client';

import { useMemo, useCallback, useEffect } from 'react';
import { parseAsString, useQueryStates } from 'nuqs';
import {
  usePayrollPeriodsQuery,
  usePayrollPeriodDetailQuery,
  usePayrollFilterOptionsQuery
} from '../api/queries';
import type {
  PayrollPeriodItem,
  PayrollSummaryItem,
  PayrollFilterOptionsResponse
} from '../api/types';
import type { MetricChartPoint } from '@/components/charts/metric-chart-card';

export interface UsePayrollViewResult {
  periods: PayrollPeriodItem[];
  currentPeriod: PayrollPeriodItem | undefined;
  summaries: PayrollSummaryItem[];
  filteredSummaries: PayrollSummaryItem[];
  totalStaff: number;
  totalFilteredStaff: number;
  selectedPeriodId: string | null;
  selectedStaff: PayrollSummaryItem | null;
  searchQuery: string;
  selectedCategory: string;
  selectedStatus: string;
  isDetailOpen: boolean;
  hasActiveFilters: boolean;
  isLoading: boolean;
  isFetching: boolean;
  filterOptions: PayrollFilterOptionsResponse | undefined;
  kpiStats: {
    totalPayout: number;
    totalBaseHours: number;
    totalLeaveDeductions: number;
    totalReplacementAdditions: number;
    sparklinePayout: MetricChartPoint[];
    sparklineHours: MetricChartPoint[];
    sparklineDeductions: MetricChartPoint[];
    sparklineAdditions: MetricChartPoint[];
  };
  actions: {
    changeSearch: (q: string) => void;
    changePeriod: (id: string) => void;
    changeCategory: (cat: string) => void;
    changeStatus: (st: string) => void;
    resetFilters: () => void;
    openDetail: (staff: PayrollSummaryItem) => void;
    closeDetail: () => void;
  };
}

export function usePayrollView(): UsePayrollViewResult {
  // 1. URL State management with nuqs
  const [params, setParams] = useQueryStates(
    {
      periodId: parseAsString.withDefault(''),
      search: parseAsString.withDefault(''),
      category: parseAsString.withDefault('all'),
      status: parseAsString.withDefault('all'),
      selectedStaffId: parseAsString.withDefault(''),
      dialog: parseAsString.withDefault('')
    },
    { shallow: true }
  );

  // 2. Data fetching from SSOT queries
  const {
    data: periods = [],
    isLoading: isPeriodsLoading,
    isFetching: isPeriodsFetching
  } = usePayrollPeriodsQuery();

  const { data: filterOptions, isLoading: isFilterOptionsLoading } = usePayrollFilterOptionsQuery();

  // Resolve effective active period
  const effectivePeriodId = useMemo(() => {
    if (params.periodId && periods.some((p) => p.id === params.periodId)) {
      return params.periodId;
    }
    return periods.length > 0 ? periods[0].id : null;
  }, [params.periodId, periods]);

  // Keep URL in sync with effective period if not set
  useEffect(() => {
    if (!params.periodId && effectivePeriodId) {
      void setParams({ periodId: effectivePeriodId }, { shallow: true });
    }
  }, [params.periodId, effectivePeriodId, setParams]);

  const {
    data: periodDetail,
    isLoading: isDetailLoading,
    isFetching: isDetailFetching
  } = usePayrollPeriodDetailQuery(effectivePeriodId);

  const currentPeriod = useMemo(() => {
    return periodDetail?.period || periods.find((p) => p.id === effectivePeriodId);
  }, [periodDetail?.period, periods, effectivePeriodId]);

  const summaries = useMemo(() => {
    return periodDetail?.summaries || [];
  }, [periodDetail?.summaries]);

  // 3. Deterministic client filtering based on URL parameters
  const filteredSummaries = useMemo(() => {
    return summaries.filter((item) => {
      const q = params.search.trim().toLowerCase();
      const searchableFields = [item.fullName, item.staffCode, item.positionTitle];
      const matchesSearch =
        !q ||
        searchableFields.some(
          (field) => typeof field === 'string' && field.toLowerCase().includes(q)
        );

      const matchesCategory =
        params.category === 'all' ||
        item.roleCode === params.category ||
        item.roleId === params.category;

      const effectiveStatus = item.periodStatus ?? currentPeriod?.status;
      const matchesStatus =
        params.status === 'all' ||
        (Boolean(effectiveStatus) &&
          effectiveStatus?.toLowerCase() === params.status.toLowerCase());

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [summaries, params.search, params.category, params.status, currentPeriod?.status]);

  const hasActiveFilters = [
    Boolean(params.search.trim()),
    params.category !== 'all' && Boolean(params.category),
    params.status !== 'all' && Boolean(params.status)
  ].some(Boolean);

  // 4. Resolve selected staff detail dialog
  const selectedStaff = useMemo(() => {
    if (!params.selectedStaffId) return null;
    return (
      summaries.find(
        (s) => s.staffId === params.selectedStaffId || s.staffCode === params.selectedStaffId
      ) || null
    );
  }, [params.selectedStaffId, summaries]);

  const isDetailOpen = Boolean(params.dialog === 'detail' && selectedStaff);

  // 5. Calculate KPI metrics & dynamic sparklines
  const kpiStats = useMemo(() => {
    const totalPayout =
      currentPeriod?.totalPayout ?? summaries.reduce((acc, s) => acc + s.netPayroll, 0);
    const totalBaseHours = summaries.reduce((acc, s) => acc + s.baseHours, 0);
    const totalLeaveDeductions = summaries.reduce((acc, s) => acc + s.leaveDeductions, 0);
    const totalReplacementAdditions = summaries.reduce((acc, s) => acc + s.replacementAdditions, 0);

    const sparklinePayout: MetricChartPoint[] =
      summaries.length === 0
        ? [{ label: 'Periode', value: totalPayout }]
        : summaries.map((s, idx) => ({
            label: s.fullName.split(' ')[0] || `Staf ${idx + 1}`,
            value: s.netPayroll
          }));

    const sparklineHours: MetricChartPoint[] =
      summaries.length === 0
        ? [{ label: 'Periode', value: totalBaseHours }]
        : summaries.map((s, idx) => ({
            label: s.fullName.split(' ')[0] || `Staf ${idx + 1}`,
            value: s.baseHours
          }));

    const sparklineDeductions: MetricChartPoint[] =
      summaries.length === 0
        ? [{ label: 'Periode', value: totalLeaveDeductions }]
        : summaries.map((s, idx) => ({
            label: s.fullName.split(' ')[0] || `Staf ${idx + 1}`,
            value: s.leaveDeductions
          }));

    const sparklineAdditions: MetricChartPoint[] =
      summaries.length === 0
        ? [{ label: 'Periode', value: totalReplacementAdditions }]
        : summaries.map((s, idx) => ({
            label: s.fullName.split(' ')[0] || `Staf ${idx + 1}`,
            value: s.replacementAdditions
          }));

    return {
      totalPayout,
      totalBaseHours,
      totalLeaveDeductions,
      totalReplacementAdditions,
      sparklinePayout,
      sparklineHours,
      sparklineDeductions,
      sparklineAdditions
    };
  }, [currentPeriod?.totalPayout, summaries]);

  // 6. Action handlers
  const changeSearch = useCallback(
    (q: string) => {
      void setParams({ search: q || null }, { shallow: true });
    },
    [setParams]
  );

  const changePeriod = useCallback(
    (id: string) => {
      void setParams({ periodId: id || null }, { shallow: true });
    },
    [setParams]
  );

  const changeCategory = useCallback(
    (cat: string) => {
      void setParams({ category: cat === 'all' ? null : cat }, { shallow: true });
    },
    [setParams]
  );

  const changeStatus = useCallback(
    (st: string) => {
      void setParams({ status: st === 'all' ? null : st }, { shallow: true });
    },
    [setParams]
  );

  const resetFilters = useCallback(() => {
    void setParams({ search: null, category: null, status: null }, { shallow: true });
  }, [setParams]);

  const openDetail = useCallback(
    (staff: PayrollSummaryItem) => {
      void setParams({ selectedStaffId: staff.staffId, dialog: 'detail' }, { shallow: true });
    },
    [setParams]
  );

  const closeDetail = useCallback(() => {
    void setParams({ selectedStaffId: null, dialog: null }, { shallow: true });
  }, [setParams]);

  return {
    periods,
    currentPeriod,
    summaries,
    filteredSummaries,
    totalStaff: summaries.length,
    totalFilteredStaff: filteredSummaries.length,
    selectedPeriodId: effectivePeriodId,
    selectedStaff,
    searchQuery: params.search,
    selectedCategory: params.category || 'all',
    selectedStatus: params.status || 'all',
    isDetailOpen,
    hasActiveFilters,
    isLoading: [isPeriodsLoading, isDetailLoading, isFilterOptionsLoading].some(Boolean),
    isFetching: isPeriodsFetching || isDetailFetching,
    filterOptions,
    kpiStats,
    actions: {
      changeSearch,
      changePeriod,
      changeCategory,
      changeStatus,
      resetFilters,
      openDetail,
      closeDetail
    }
  };
}
