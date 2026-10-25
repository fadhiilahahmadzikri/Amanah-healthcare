'use client';

import { useMemo } from 'react';
import { Icons } from '@/components/icons';
import type { FacetGroupDefinition } from '@/shared/ui/responsive-facet-toolbox';
import { useStateSearchEngine, type SearchEngineResultItem } from '@/components/search-engine';
import type { UsePayrollViewResult } from './usePayrollView';

export interface UsePayrollDynamicOptionsProps {
  payrollView: UsePayrollViewResult;
}

export function usePayrollDynamicOptions({ payrollView }: UsePayrollDynamicOptionsProps) {
  const {
    periods,
    selectedPeriodId,
    selectedCategory,
    selectedStatus,
    filterOptions,
    summaries,
    searchQuery,
    actions
  } = payrollView;

  // 1. Period Options
  const periodFacetOptions = useMemo(() => {
    return periods.map((p) => {
      const statusLabel =
        p.status === 'calculated'
          ? 'Terkalkulasi'
          : p.status === 'finalized'
            ? 'Ditutup buku'
            : 'Draf';
      return {
        value: p.id,
        label: `${p.periodName} (${statusLabel})`
      };
    });
  }, [periods]);

  // 2. Category Options (Backend SSOT)
  const categoryFacetOptions = useMemo(() => {
    if (filterOptions?.categories && filterOptions.categories.length > 0) {
      return filterOptions.categories.map((c) => ({
        value: c.id,
        label: c.label
      }));
    }
    return [
      { label: 'Dokter', value: 'doctor' },
      { label: 'Bidan', value: 'midwife' },
      { label: 'Staf Operasional', value: 'worker' }
    ];
  }, [filterOptions?.categories]);

  // 3. Status Options (Backend SSOT)
  const statusFacetOptions = useMemo(() => {
    if (filterOptions?.statuses && filterOptions.statuses.length > 0) {
      return filterOptions.statuses.map((s) => ({
        value: s.id,
        label: s.label
      }));
    }
    return [
      { label: 'Draf', value: 'draft' },
      { label: 'Terkalkulasi', value: 'calculated' },
      { label: 'Ditutup Buku', value: 'finalized' }
    ];
  }, [filterOptions?.statuses]);

  // 4. Facet Groups for Agnostic ResponsiveFacetToolbox & FacetSidebarSheet
  const facetGroups = useMemo<FacetGroupDefinition[]>(() => {
    const groups: FacetGroupDefinition[] = [];

    if (periodFacetOptions.length > 0) {
      groups.push({
        id: 'period',
        title: 'Periode',
        icon: Icons.calendar,
        mode: 'single',
        options: periodFacetOptions,
        selectedValues: selectedPeriodId ? [selectedPeriodId] : [],
        onSelect: (val: string) => actions.changePeriod(val),
        onReset: () => actions.changePeriod(periods[0]?.id || ''),
        resetLabel: 'Periode Terbaru',
        popoverWidth: 'w-64'
      });
    }

    groups.push({
      id: 'category',
      title: 'Kategori',
      icon: Icons.teams,
      mode: 'single',
      options: categoryFacetOptions,
      selectedValues: selectedCategory && selectedCategory !== 'all' ? [selectedCategory] : [],
      onSelect: (val: string) => actions.changeCategory(val),
      onReset: () => actions.changeCategory('all'),
      resetLabel: 'Semua Kategori',
      popoverWidth: 'w-48'
    });

    groups.push({
      id: 'status',
      title: 'Status',
      icon: Icons.activity,
      mode: 'single',
      options: statusFacetOptions,
      selectedValues: selectedStatus && selectedStatus !== 'all' ? [selectedStatus] : [],
      onSelect: (val: string) => actions.changeStatus(val),
      onReset: () => actions.changeStatus('all'),
      resetLabel: 'Semua Status',
      popoverWidth: 'w-48'
    });

    return groups;
  }, [
    periodFacetOptions,
    selectedPeriodId,
    periods,
    categoryFacetOptions,
    selectedCategory,
    statusFacetOptions,
    selectedStatus,
    actions
  ]);

  // 5. Accurate Count of Active Filter Parameters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedPeriodId && periods.length > 0 && selectedPeriodId !== periods[0]?.id) count++;
    if (selectedCategory && selectedCategory !== 'all') count++;
    if (selectedStatus && selectedStatus !== 'all') count++;
    return count;
  }, [searchQuery, selectedPeriodId, periods, selectedCategory, selectedStatus]);

  // 6. Centralized Search Engine Index Items (Staff, Periods, Categories)
  const indexItems = useMemo<SearchEngineResultItem[]>(() => {
    const items: SearchEngineResultItem[] = [];

    summaries.forEach((staff) => {
      items.push({
        id: `staff-${staff.staffId}`,
        title: staff.fullName,
        subtitle: staff.positionTitle
          ? `${staff.staffType.toUpperCase()} • ${staff.positionTitle}`
          : staff.staffType.toUpperCase(),
        category: 'Karyawan',
        icon: Icons.user,
        queryValue: staff.fullName
      });
    });

    periods.forEach((period) => {
      items.push({
        id: `period-${period.id}`,
        title: period.periodName,
        subtitle: `Status: ${period.status.toUpperCase()} • ${period.periodStart} s/d ${period.periodEnd}`,
        category: 'Periode Penggajian',
        icon: Icons.calendar,
        queryValue: period.periodName
      });
    });

    (filterOptions?.categories ?? []).forEach((cat) => {
      items.push({
        id: `cat-${cat.id}`,
        title: cat.label,
        subtitle: 'Kategori Staf',
        category: 'Kategori',
        icon: Icons.teams,
        queryValue: cat.label
      });
    });

    return items;
  }, [summaries, periods, filterOptions?.categories]);

  const searchEngine = useStateSearchEngine({
    query: searchQuery,
    onQueryChange: actions.changeSearch,
    id: 'payroll-search-engine',
    title: 'Pencarian Penggajian Staf',
    description: 'Cari berdasarkan nama karyawan, NIP, jabatan, atau periode penggajian',
    placeholder: 'Ketik nama karyawan, NIP, atau periode...',
    indexItems
  });

  return {
    facetGroups,
    activeFilterCount,
    searchEngine
  };
}
