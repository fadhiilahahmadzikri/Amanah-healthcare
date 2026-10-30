'use client';

import { useMemo } from 'react';
import { Icons } from '@/components/icons';
import type { FacetGroupDefinition } from '@/shared/ui/responsive-facet-toolbox';
import { useStateSearchEngine, type SearchEngineResultItem } from '@/components/search-engine';
import { CATEGORY_FACET_OPTIONS, STATUS_FACET_OPTIONS } from '../constants/options';
import type { UsePayrollViewResult } from './usePayrollView';

export interface UsePayrollDynamicOptionsProps {
  payrollView: UsePayrollViewResult;
}

/**
 * Helper untuk membersihkan label periode agar hanya menampilkan periode waktu (bulan & tahun),
 * mengeliminasi awalan berulang seperti "Payroll Periode " atau "Periode Gaji ".
 */
export function formatPeriodDisplay(periodName: string): string {
  if (!periodName) return '';
  return periodName
    .replace(/^payroll\s+periode\s+/i, '')
    .replace(/^periode\s+gaji\s+/i, '')
    .replace(/^periode\s+/i, '')
    .trim();
}

export function usePayrollDynamicOptions({ payrollView }: UsePayrollDynamicOptionsProps) {
  const {
    periods,
    selectedPeriodId,
    selectedCategory,
    selectedStatus,
    summaries,
    searchQuery,
    actions
  } = payrollView;

  // 1. Period Options (Hanya menampilkan waktu periode agar ringkas pada tab filter)
  const periodFacetOptions = useMemo(() => {
    return periods.map((p) => ({
      value: p.id,
      label: formatPeriodDisplay(p.periodName),
      dotColor: p.status === 'finalized' ? 'bg-emerald-500' : 'bg-sky-500'
    }));
  }, [periods]);

  // 2. Category Options (Presentation SSOT)
  const categoryFacetOptions = CATEGORY_FACET_OPTIONS;

  // 3. Status Options (Presentation SSOT)
  const statusFacetOptions = STATUS_FACET_OPTIONS;

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
        subtitle: staff.roleName ?? '',
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

    CATEGORY_FACET_OPTIONS.forEach((cat) => {
      items.push({
        id: `cat-${cat.value}`,
        title: cat.label,
        subtitle: 'Kategori Staf',
        category: 'Kategori',
        icon: Icons.teams,
        queryValue: cat.label
      });
    });

    return items;
  }, [summaries, periods]);

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
