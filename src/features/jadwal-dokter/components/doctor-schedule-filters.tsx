'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import {
  ResponsiveFacetToolbox,
  type FacetGroupDefinition
} from '@/shared/ui/responsive-facet-toolbox';
import { toggleItem } from '@/shared/lib/array/toggle-item';
import { buildMonthOptions, isToday } from '@/features/klinik/model/appointment-filters.rules';
import { doctorScheduleFilterOptionsQueryOptions } from '../api/queries';

export interface DoctorScheduleFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  monthFilter: string;
  onMonthFilterChange: (month: string) => void;
  dateFilter: Date | undefined;
  onDateFilterChange: (date: Date | undefined) => void;
  selectedPoli: string[];
  onSelectedPoliChange: (poli: string[]) => void;
  selectedSessions: string[];
  onSelectedSessionsChange: (sessions: string[]) => void;
  selectedStatuses: string[];
  onSelectedStatusesChange: (statuses: string[]) => void;
  onResetAll: () => void;
  className?: string;
}

export function DoctorScheduleFilters({
  searchQuery,
  onSearchChange,
  monthFilter,
  onMonthFilterChange,
  dateFilter,
  onDateFilterChange,
  selectedPoli,
  onSelectedPoliChange,
  selectedSessions,
  onSelectedSessionsChange,
  selectedStatuses,
  onSelectedStatusesChange,
  onResetAll,
  className
}: DoctorScheduleFiltersProps) {
  const today = React.useMemo(() => new Date(), []);
  const { data: filterOptionsData } = useQuery(doctorScheduleFilterOptionsQueryOptions());
  const monthOptions = React.useMemo(() => buildMonthOptions(), []);

  const isFiltered =
    Boolean(searchQuery.trim()) ||
    (monthFilter !== 'ALL' && monthFilter !== '') ||
    Boolean(dateFilter && !isToday(dateFilter)) ||
    selectedPoli.length > 0 ||
    selectedSessions.length > 0 ||
    selectedStatuses.length > 0;

  const facetGroups = React.useMemo<FacetGroupDefinition[]>(() => {
    const poliklinik = filterOptionsData?.poliklinik ?? [];
    const sessions = filterOptionsData?.sessions ?? [];
    const statuses = filterOptionsData?.statuses ?? [];

    return [
      {
        id: 'month',
        title: 'Bulan',
        icon: Icons.calendar,
        mode: 'single',
        options: monthOptions
          .filter((m) => m.value !== 'ALL')
          .map((m) => ({ label: m.label, value: m.value })),
        selectedValues: monthFilter && monthFilter !== 'ALL' ? [monthFilter] : [],
        onSelect: (val) => onMonthFilterChange(val === monthFilter ? 'ALL' : val),
        onReset: () => onMonthFilterChange('ALL'),
        popoverWidth: 'w-48',
        resetLabel: 'Semua Bulan'
      },
      {
        id: 'poli',
        title: 'Poli',
        icon: Icons.plusCircle,
        mode: 'multi',
        options: poliklinik.map((p) => ({ label: p.name, value: p.name })),
        selectedValues: selectedPoli,
        onSelect: (poli) => onSelectedPoliChange(toggleItem(selectedPoli, poli)),
        onReset: () => onSelectedPoliChange([]),
        popoverWidth: 'w-56',
        resetLabel: 'Reset Poli'
      },
      {
        id: 'session',
        title: 'Sesi',
        icon: Icons.clock,
        mode: 'multi',
        options: sessions.map((s) => ({ label: s.label, value: s.code })),
        selectedValues: selectedSessions,
        onSelect: (sesi) => onSelectedSessionsChange(toggleItem(selectedSessions, sesi)),
        onReset: () => onSelectedSessionsChange([]),
        popoverWidth: 'w-48',
        resetLabel: 'Reset Sesi'
      },
      {
        id: 'status',
        title: 'Status',
        icon: Icons.activity,
        mode: 'multi',
        options: statuses.map((st) => ({ label: st.label, value: st.id })),
        selectedValues: selectedStatuses,
        onSelect: (status) => onSelectedStatusesChange(toggleItem(selectedStatuses, status)),
        onReset: () => onSelectedStatusesChange([]),
        popoverWidth: 'w-52',
        resetLabel: 'Reset Status'
      }
    ];
  }, [
    filterOptionsData,
    monthOptions,
    monthFilter,
    selectedPoli,
    selectedSessions,
    selectedStatuses,
    onMonthFilterChange,
    onSelectedPoliChange,
    onSelectedSessionsChange,
    onSelectedStatusesChange
  ]);

  return (
    <ResponsiveFacetToolbox
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder='Pencarian Dokter...'
      dateFilter={{
        label: 'Tanggal',
        selectedDate: dateFilter,
        onSelectDate: onDateFilterChange,
        defaultDate: today,
        resetLabel: 'Kembali ke Hari Ini'
      }}
      facets={facetGroups}
      isFiltered={isFiltered}
      onResetAll={onResetAll}
      isCompact={false}
      className={className}
    />
  );
}
