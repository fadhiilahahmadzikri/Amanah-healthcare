'use client';

import { useMemo } from 'react';
import { Icons } from '@/components/icons';
import { STAFF_TYPE_LABELS, type StaffType } from '@/constants/staff-types.constant';
import {
  ATTENDANCE_SHIFT_LABELS,
  ATTENDANCE_STATUS_LABELS
} from '../constants/attendance-status.constants';
import type {
  AvailableAttendanceFilters,
  FilterOption,
  StaffAttendance,
  AttendanceFilterParams
} from '../api/types';
import type { FacetGroupDefinition } from '@/shared/ui/responsive-facet-toolbox';
import type { AttendanceTabFilter } from './useAttendanceFilterState';

export interface UseAttendanceDynamicOptionsProps {
  availableFilters?: AvailableAttendanceFilters;
  records?: StaffAttendance[];
  params: AttendanceFilterParams;
  onFilterChange: (newParams: Partial<AttendanceFilterParams>) => void;
  activeTab?: AttendanceTabFilter;
  onTabChange?: (tab: AttendanceTabFilter) => void;
  counts?: { all: number; active: number; completed: number };
}

export function useAttendanceDynamicOptions({
  availableFilters,
  records: _records = [],
  params,
  onFilterChange,
  activeTab = 'all',
  onTabChange,
  counts
}: UseAttendanceDynamicOptionsProps) {
  // 1. Shift options strictly derived from DB SSOT
  const shiftOptions: FilterOption[] = useMemo(() => {
    return availableFilters?.shifts ?? [];
  }, [availableFilters?.shifts]);

  // 2. Category options strictly derived from DB SSOT
  const categoryOptions: FilterOption[] = useMemo(() => {
    return availableFilters?.categories ?? [];
  }, [availableFilters?.categories]);

  // 3. Status options strictly derived from DB SSOT
  const statusOptions: FilterOption[] = useMemo(() => {
    return availableFilters?.statuses ?? [];
  }, [availableFilters?.statuses]);

  // 4. Facet Group Definitions for Generic ResponsiveFacetToolbox
  const facetGroups = useMemo<FacetGroupDefinition[]>(() => {
    return [
      ...(onTabChange
        ? [
            {
              id: 'dinas',
              title: 'Dinas',
              icon: Icons.userCheck,
              mode: 'single' as const,
              options: [
                {
                  label: 'Sedang Dinas',
                  value: 'active',
                  count: counts?.active,
                  dotColor: 'bg-amber-500'
                },
                {
                  label: 'Selesai Dinas',
                  value: 'completed',
                  count: counts?.completed,
                  dotColor: 'bg-emerald-500'
                }
              ],
              selectedValues: activeTab && activeTab !== 'all' ? [activeTab] : [],
              onSelect: (val: string) => {
                onTabChange(val === activeTab ? 'all' : (val as AttendanceTabFilter));
              },
              onReset: () => onTabChange('all'),
              popoverWidth: 'w-48'
            }
          ]
        : []),
      {
        id: 'shift',
        title: 'Shift',
        icon: Icons.clock,
        mode: 'single',
        options: shiftOptions.map((s) => ({
          label: ATTENDANCE_SHIFT_LABELS[s.value] || s.label,
          value: s.value
        })),
        selectedValues: params.shift && params.shift !== 'all' ? [params.shift] : [],
        onSelect: (val) =>
          onFilterChange({ shift: val === 'all' || val === params.shift ? null : val }),
        onReset: () => onFilterChange({ shift: null }),
        popoverWidth: 'w-48'
      },
      {
        id: 'category',
        title: 'Kategori',
        icon: Icons.users,
        mode: 'single',
        options: categoryOptions.map((c) => ({
          label: STAFF_TYPE_LABELS[c.value as StaffType] || c.label,
          value: c.value
        })),
        selectedValues: params.category && params.category !== 'all' ? [params.category] : [],
        onSelect: (val) =>
          onFilterChange({ category: val === 'all' || val === params.category ? null : val }),
        onReset: () => onFilterChange({ category: null }),
        popoverWidth: 'w-52'
      },
      {
        id: 'status',
        title: 'Status',
        icon: Icons.activity,
        mode: 'single',
        options: statusOptions.map((st) => ({
          label: ATTENDANCE_STATUS_LABELS[st.value] || st.label,
          value: st.value
        })),
        selectedValues: params.status && params.status !== 'all' ? [params.status] : [],
        onSelect: (val) =>
          onFilterChange({ status: val === 'all' || val === params.status ? null : val }),
        onReset: () => onFilterChange({ status: null }),
        popoverWidth: 'w-48'
      }
    ];
  }, [
    shiftOptions,
    categoryOptions,
    statusOptions,
    params.shift,
    params.category,
    params.status,
    activeTab,
    onTabChange,
    counts,
    onFilterChange
  ]);

  return {
    shiftOptions,
    categoryOptions,
    statusOptions,
    facetGroups
  };
}
