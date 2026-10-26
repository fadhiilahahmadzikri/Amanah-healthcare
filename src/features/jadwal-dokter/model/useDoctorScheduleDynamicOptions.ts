'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { toggleItem } from '@/shared/lib/array/toggle-item';
import { buildMonthOptions, isToday } from '@/features/klinik/model/appointment-filters.rules';
import type { FacetGroupDefinition } from '@/shared/ui/responsive-facet-toolbox';
import { useStateSearchEngine, type SearchEngineResultItem } from '@/components/search-engine';
import { doctorScheduleFilterOptionsQueryOptions } from '../api/queries';
import type { useDoctorScheduleView } from './useDoctorScheduleView';

export interface UseDoctorScheduleDynamicOptionsProps {
  scheduleView: ReturnType<typeof useDoctorScheduleView>;
}

export function useDoctorScheduleDynamicOptions({
  scheduleView
}: UseDoctorScheduleDynamicOptionsProps) {
  const { data: filterOptionsData } = useQuery(doctorScheduleFilterOptionsQueryOptions());

  const monthOptions = useMemo(() => buildMonthOptions(), []);

  // 1. Facet Groups for Agnostic ResponsiveFacetToolbox & FacetSidebarSheet
  const facetGroups = useMemo<FacetGroupDefinition[]>(() => {
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
        selectedValues:
          scheduleView.monthFilter && scheduleView.monthFilter !== 'ALL'
            ? [scheduleView.monthFilter]
            : [],
        onSelect: (val: string) => {
          scheduleView.actions.changeMonthFilter(val === scheduleView.monthFilter ? 'ALL' : val);
        },
        onReset: () => scheduleView.actions.changeMonthFilter('ALL'),
        popoverWidth: 'w-48',
        resetLabel: 'Semua Bulan'
      },
      {
        id: 'poli',
        title: 'Poli',
        icon: Icons.plusCircle,
        mode: 'multi',
        options: poliklinik.map((p) => ({ label: p.name, value: p.name })),
        selectedValues: scheduleView.selectedPoli,
        onSelect: (poli: string) => {
          scheduleView.actions.changeSelectedPoli(toggleItem(scheduleView.selectedPoli, poli));
        },
        onReset: () => scheduleView.actions.changeSelectedPoli([]),
        popoverWidth: 'w-56',
        resetLabel: 'Reset Poli'
      },
      {
        id: 'session',
        title: 'Sesi',
        icon: Icons.clock,
        mode: 'multi',
        options: sessions.map((s) => ({ label: s.label, value: s.code })),
        selectedValues: scheduleView.selectedSessions,
        onSelect: (sesi: string) => {
          scheduleView.actions.changeSelectedSessions(
            toggleItem(scheduleView.selectedSessions, sesi)
          );
        },
        onReset: () => scheduleView.actions.changeSelectedSessions([]),
        popoverWidth: 'w-48',
        resetLabel: 'Reset Sesi'
      },
      {
        id: 'status',
        title: 'Status',
        icon: Icons.activity,
        mode: 'multi',
        options: statuses.map((st) => ({ label: st.label, value: st.id })),
        selectedValues: scheduleView.selectedStatuses,
        onSelect: (st: string) => {
          scheduleView.actions.changeSelectedStatuses(
            toggleItem(scheduleView.selectedStatuses, st)
          );
        },
        onReset: () => scheduleView.actions.changeSelectedStatuses([]),
        popoverWidth: 'w-52',
        resetLabel: 'Reset Status'
      }
    ];
  }, [
    filterOptionsData,
    monthOptions,
    scheduleView.monthFilter,
    scheduleView.selectedPoli,
    scheduleView.selectedSessions,
    scheduleView.selectedStatuses,
    scheduleView.actions
  ]);

  // 2. Accurate count of active filter parameters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (scheduleView.searchQuery?.trim()) count++;
    if (scheduleView.monthFilter && scheduleView.monthFilter !== 'ALL') count++;
    if (scheduleView.dateFilter && !isToday(scheduleView.dateFilter)) count++;
    if (scheduleView.selectedPoli.length > 0) count += scheduleView.selectedPoli.length;
    if (scheduleView.selectedSessions.length > 0) count += scheduleView.selectedSessions.length;
    if (scheduleView.selectedStatuses.length > 0) count += scheduleView.selectedStatuses.length;
    return count;
  }, [
    scheduleView.searchQuery,
    scheduleView.monthFilter,
    scheduleView.dateFilter,
    scheduleView.selectedPoli,
    scheduleView.selectedSessions,
    scheduleView.selectedStatuses
  ]);

  // 3. Centralized Search Engine Index Items (Doctors + Poliklinik)
  const indexItems = useMemo<SearchEngineResultItem[]>(() => {
    const items: SearchEngineResultItem[] = [];

    // Doctors loaded in view
    scheduleView.doctors.forEach((doc) => {
      items.push({
        id: `doc-${doc.id}`,
        title: doc.fullName,
        subtitle: `${doc.specialty} • ${doc.doctorStatus}`,
        category: 'Dokter',
        icon: Icons.stethoscope,
        queryValue: doc.fullName
      });
    });

    // Poliklinik units catalog
    (filterOptionsData?.poliklinik ?? []).forEach((p, idx) => {
      items.push({
        id: `poli-${idx}-${p.id}`,
        title: p.name,
        subtitle: 'Unit Poliklinik',
        category: 'Poliklinik',
        icon: Icons.mapPin,
        queryValue: p.name
      });
    });

    return items;
  }, [scheduleView.doctors, filterOptionsData?.poliklinik]);

  const searchEngine = useStateSearchEngine({
    query: scheduleView.searchQuery,
    onQueryChange: scheduleView.actions.changeSearch,
    id: 'jadwal-dokter-search',
    title: 'Pencarian Jadwal Dokter',
    description: 'Cari jadwal dokter berdasarkan nama dokter, spesialisasi, atau poli',
    placeholder: 'Ketik nama dokter atau unit poli...',
    indexItems
  });

  return {
    filterOptionsData,
    facetGroups,
    activeFilterCount,
    searchEngine
  };
}
