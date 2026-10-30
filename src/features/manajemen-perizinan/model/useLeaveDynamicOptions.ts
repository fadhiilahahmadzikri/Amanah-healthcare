'use client';

import { useMemo } from 'react';
import { Icons } from '@/components/icons';
import { toggleItem } from '@/shared/lib/array/toggle-item';
import type { FacetGroupDefinition } from '@/shared/ui/responsive-facet-toolbox';
import { useStateSearchEngine, type SearchEngineResultItem } from '@/components/search-engine';
import type { LeaveRequestItem } from '../api/types';
import type { UseLeaveFiltersResult } from './useLeaveFilters';

export const LEAVE_STATUS_OPTIONS = [
  { value: 'pending', label: 'Menunggu', dotColor: 'bg-amber-500' },
  { value: 'approved', label: 'Disetujui', dotColor: 'bg-emerald-500' },
  { value: 'rejected', label: 'Ditolak', dotColor: 'bg-rose-500' },
  { value: 'cancelled', label: 'Dibatalkan', dotColor: 'bg-slate-400' }
] as const;

export const LEAVE_TYPE_OPTIONS = [
  { value: 'annual_leave', label: 'Cuti Tahunan' },
  { value: 'sick_leave', label: 'Izin Sakit' },
  { value: 'seminar_symposium', label: 'Seminar/Simposium' },
  { value: 'family_matter', label: 'Keperluan Keluarga' },
  { value: 'external_assignment', label: 'Tugas Luar' },
  { value: 'other', label: 'Lainnya' }
] as const;

export interface UseLeaveDynamicOptionsProps {
  filters: UseLeaveFiltersResult;
  leaves: LeaveRequestItem[];
}

export function useLeaveDynamicOptions({ filters, leaves }: UseLeaveDynamicOptionsProps) {
  // 1. Facet Groups for Agnostic ResponsiveFacetToolbox & FacetSidebarSheet
  const facetGroups = useMemo<FacetGroupDefinition[]>(() => {
    const roleMap = new Map<string, { label: string; count: number }>();
    for (const l of leaves) {
      if (l.staff?.roleId && l.staff?.roleName) {
        const key = l.staff.roleId;
        const label = l.staff.roleName;
        if (!roleMap.has(key)) {
          roleMap.set(key, { label, count: 0 });
        }
        roleMap.get(key)!.count += 1;
      }
    }
    const roleOptions = Array.from(roleMap.entries()).map(([value, info]) => ({
      label: info.label,
      value,
      count: info.count
    }));

    return [
      {
        id: 'status',
        title: 'Status',
        icon: Icons.activity,
        mode: 'multi',
        options: LEAVE_STATUS_OPTIONS.map((st) => ({
          label: st.label,
          value: st.value,
          dotColor: st.dotColor,
          count: filters.counts[st.value as keyof typeof filters.counts]
        })),
        selectedValues: filters.statusFilter,
        onSelect: (val: string) => {
          filters.actions.changeStatusFilter(toggleItem(filters.statusFilter, val));
        },
        onReset: () => filters.actions.changeStatusFilter([]),
        resetLabel: 'Reset Status',
        popoverWidth: 'w-48'
      },
      {
        id: 'staffType',
        title: 'Peran',
        icon: Icons.users,
        mode: 'multi',
        options: roleOptions,
        selectedValues: filters.staffTypeFilter,
        onSelect: (val: string) => {
          filters.actions.changeStaffTypeFilter(toggleItem(filters.staffTypeFilter, val));
        },
        onReset: () => filters.actions.changeStaffTypeFilter([]),
        resetLabel: 'Reset Peran',
        popoverWidth: 'w-52'
      },
      {
        id: 'leaveType',
        title: 'Tipe Izin',
        icon: Icons.calendar,
        mode: 'multi',
        options: LEAVE_TYPE_OPTIONS.map((lt) => ({
          label: lt.label,
          value: lt.value
        })),
        selectedValues: filters.leaveTypeFilter,
        onSelect: (val: string) => {
          filters.actions.changeLeaveTypeFilter(toggleItem(filters.leaveTypeFilter, val));
        },
        onReset: () => filters.actions.changeLeaveTypeFilter([]),
        resetLabel: 'Reset Tipe Izin',
        popoverWidth: 'w-56'
      }
    ];
  }, [
    filters.counts,
    filters.statusFilter,
    filters.staffTypeFilter,
    filters.leaveTypeFilter,
    filters.actions,
    leaves
  ]);

  // 2. Accurate Active Filter Count for Trigger Badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery?.trim()) count++;
    if (filters.statusFilter.length > 0) count += filters.statusFilter.length;
    if (filters.staffTypeFilter.length > 0) count += filters.staffTypeFilter.length;
    if (filters.leaveTypeFilter.length > 0) count += filters.leaveTypeFilter.length;
    return count;
  }, [filters.searchQuery, filters.statusFilter, filters.staffTypeFilter, filters.leaveTypeFilter]);

  // 3. Centralized Search Engine Index Items (Staff members from leaves)
  const indexItems = useMemo<SearchEngineResultItem[]>(() => {
    const seen = new Set<string>();
    const items: SearchEngineResultItem[] = [];
    leaves.forEach((l) => {
      const name = l.staff?.fullName;
      if (!name || seen.has(name)) return;
      seen.add(name);
      items.push({
        id: `staff-${l.id}`,
        title: name,
        subtitle: l.staff?.profession || 'Staf',
        category: 'Staf',
        icon: Icons.users,
        queryValue: name
      });
    });
    return items;
  }, [leaves]);

  const searchEngine = useStateSearchEngine({
    query: filters.searchQuery,
    onQueryChange: filters.actions.changeSearch,
    id: 'perizinan-search',
    title: 'Pencarian Permohonan Izin',
    description: 'Cari izin berdasarkan nama staf atau profesi',
    placeholder: 'Ketik nama pemohon...',
    indexItems
  });

  return {
    facetGroups,
    activeFilterCount,
    searchEngine
  };
}
