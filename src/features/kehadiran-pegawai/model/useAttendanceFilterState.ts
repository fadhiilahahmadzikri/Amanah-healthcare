'use client';

import { useState, useMemo, useCallback } from 'react';
import { isToday } from '@/features/klinik/model/appointment-filters.rules';
import type { AttendanceFilterParams, StaffAttendance } from '../api/types';
import { createDefaultAttendanceFilters } from './attendanceFilters';

export type AttendanceTabFilter = 'all' | 'active' | 'completed';

export function useAttendanceFilterState(records: StaffAttendance[] = []) {
  const [params, setParams] = useState<AttendanceFilterParams>(createDefaultAttendanceFilters);
  const [activeTab, setActiveTab] = useState<AttendanceTabFilter>('all');

  const changeFilter = useCallback((nextParams: Partial<AttendanceFilterParams>) => {
    setParams((prev) => ({ ...prev, ...nextParams }));
  }, []);

  const resetFilter = useCallback(() => {
    setParams(createDefaultAttendanceFilters());
    setActiveTab('all');
  }, []);

  // Date object adapter for DateFilter component
  const dateFilterObj = useMemo(() => {
    if (!params.date) return undefined;
    const parts = params.date.split('-');
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date(params.date);
  }, [params.date]);

  const hasDateFilter = useMemo(() => {
    return Boolean(dateFilterObj && !isToday(dateFilterObj));
  }, [dateFilterObj]);

  const isFiltered = useMemo(() => {
    return Boolean(
      (params.search && params.search.trim().length > 0) ||
      (params.shift && params.shift !== 'all') ||
      (params.status && params.status !== 'all') ||
      (params.category && params.category !== 'all') ||
      activeTab !== 'all' ||
      hasDateFilter
    );
  }, [params, activeTab, hasDateFilter]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (params.search && params.search.trim().length > 0) count++;
    if (params.shift && params.shift !== 'all') count++;
    if (params.status && params.status !== 'all') count++;
    if (params.category && params.category !== 'all') count++;
    if (activeTab !== 'all') count++;
    if (hasDateFilter) count++;
    return count;
  }, [params, activeTab, hasDateFilter]);

  // Tab-filtered records
  const displayedRecords = useMemo(() => {
    if (activeTab === 'active') return records.filter((r) => !r.checkOutAt);
    if (activeTab === 'completed') return records.filter((r) => Boolean(r.checkOutAt));
    return records;
  }, [records, activeTab]);

  const counts = useMemo(() => {
    const active = records.filter((r) => !r.checkOutAt).length;
    const completed = records.filter((r) => Boolean(r.checkOutAt)).length;
    return { all: records.length, active, completed };
  }, [records]);

  const setDateFilterObj = useCallback(
    (d: Date | undefined) => {
      if (!d) {
        changeFilter({ date: null });
        return;
      }
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      changeFilter({ date: `${y}-${m}-${day}` });
    },
    [changeFilter]
  );

  return {
    params,
    activeTab,
    setActiveTab,
    changeFilter,
    resetFilter,
    isFiltered,
    activeFilterCount,
    displayedRecords,
    counts,
    dateFilterObj,
    setDateFilterObj
  };
}
