'use client';

import { useMemo } from 'react';
import { Icons } from '@/components/icons';
import { ATTENDANCE_STATUS_LABELS } from '../constants/attendance-status.constants';
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
  currentShift?: { id: string; code: string; label: string } | null;
  params: AttendanceFilterParams;
  onFilterChange: (newParams: Partial<AttendanceFilterParams>) => void;
  activeTab?: AttendanceTabFilter;
  onTabChange?: (tab: AttendanceTabFilter) => void;
  counts?: { all: number; active: number; completed: number };
}

export function useAttendanceDynamicOptions({
  availableFilters,
  records: _records = [],
  currentShift,
  params,
  onFilterChange,
  activeTab = 'all',
  onTabChange,
  counts
}: UseAttendanceDynamicOptionsProps) {
  // 1. Shift options strictly derived from DB SSOT with dynamic current shift option
  const shiftOptions: FilterOption[] = useMemo(() => {
    const dbOptions = availableFilters?.shifts ?? [];
    const currentOptionLabel = currentShift
      ? `Sesi Sekarang (${currentShift.label})`
      : 'Sesi Sekarang';
    return [
      { label: currentOptionLabel, value: 'current' },
      { label: 'Semua Shift', value: 'all' },
      ...dbOptions
    ];
  }, [availableFilters?.shifts, currentShift]);

  // 2. Role options strictly derived from DB SSOT (roles table via availableFilters)
  const roleOptions: FilterOption[] = useMemo(() => {
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
          label: s.label || s.value,
          value: s.value
        })),
        selectedValues: params.shift ? [params.shift] : ['current'],
        onSelect: (val) =>
          onFilterChange({ shift: val === params.shift ? 'current' : val }),
        onReset: () => onFilterChange({ shift: 'current' }),
        popoverWidth: 'w-48'
      },
      {
        id: 'role',
        title: 'Peran',
        icon: Icons.users,
        mode: 'single',
        options: roleOptions.map((c) => ({
          label: c.label || c.value,
          value: c.value
        })),
        selectedValues: params.category && params.category !== 'all' ? [params.category] : [],
        onSelect: (val) =>
          onFilterChange({ category: val === 'all' || val === params.category ? 'all' : val }),
        onReset: () => onFilterChange({ category: 'all' }),
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
          onFilterChange({ status: val === 'all' || val === params.status ? 'all' : val }),
        onReset: () => onFilterChange({ status: 'all' }),
        popoverWidth: 'w-48'
      }
    ];
  }, [
    shiftOptions,
    roleOptions,
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
    roleOptions,
    statusOptions,
    facetGroups
  };
}
