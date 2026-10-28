'use client';

import { useMemo } from 'react';
import { Icons } from '@/components/icons';
import { toggleItem } from '@/shared/lib/array/toggle-item';
import { buildMonthOptions, isToday } from './appointment-filters.rules';
import { STATUS_OPTIONS } from '../config/appointment-filter-options';
import { useClinicFilterOptions, type FilterOption } from '../hooks/use-clinic-filter-options';
import { useStateSearchEngine, type SearchEngineResultItem } from '@/components/search-engine';
import type { FacetGroupDefinition } from '@/shared/ui/responsive-facet-toolbox';
import type { AppointmentStatus } from '../api/types';
import type { AppointmentFilterState } from './appointmentViewModel';
import type { AppointmentFilterActions } from '../components/appointment-filters';

export interface UseAppointmentDynamicOptionsProps {
  filters: AppointmentFilterState;
  actions: AppointmentFilterActions;
  serviceOptions?: FilterOption[];
}

export function useAppointmentDynamicOptions({
  filters,
  actions,
  serviceOptions: discreteServiceOptions
}: UseAppointmentDynamicOptionsProps) {
  const clinicFilterData = useClinicFilterOptions();
  const availableServices = discreteServiceOptions ?? clinicFilterData.serviceOptions;

  const monthOptions = useMemo(() => buildMonthOptions(), []);

  // 1. Facet Groups for Agnostic ResponsiveFacetToolbox & FacetSidebarSheet
  const facetGroups = useMemo<FacetGroupDefinition[]>(() => {
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
          filters.monthFilter && filters.monthFilter !== 'ALL' ? [filters.monthFilter] : [],
        onSelect: (val: string) => {
          actions.changeMonthFilter(val === filters.monthFilter ? 'ALL' : val);
        },
        onReset: () => actions.changeMonthFilter('ALL'),
        popoverWidth: 'w-48',
        resetLabel: 'Semua Bulan'
      },
      {
        id: 'service',
        title: 'Layanan',
        icon: Icons.plusCircle,
        mode: 'multi',
        options: availableServices.map((srv) => ({ label: srv.label, value: srv.value })),
        selectedValues: filters.selectedServices,
        onSelect: (service: string) => {
          actions.changeSelectedServices(toggleItem(filters.selectedServices, service));
        },
        onReset: () => actions.changeSelectedServices([]),
        popoverWidth: 'w-56',
        resetLabel: 'Reset Layanan'
      },
      {
        id: 'status',
        title: 'Status',
        icon: Icons.activity,
        mode: 'multi',
        options: STATUS_OPTIONS.map((st) => ({
          label: st.label,
          value: st.value,
          dotColor: st.dotColor
        })),
        selectedValues: filters.selectedStatuses,
        onSelect: (st: string) => {
          actions.changeSelectedStatuses(
            toggleItem(filters.selectedStatuses, st as AppointmentStatus)
          );
        },
        onReset: () => actions.changeSelectedStatuses([]),
        popoverWidth: 'w-52',
        resetLabel: 'Reset Status'
      }
    ];
  }, [
    monthOptions,
    availableServices,
    filters.monthFilter,
    filters.selectedServices,
    filters.selectedStatuses,
    actions
  ]);

  // 2. Accurate count of active filter parameters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery?.trim()) count++;
    if (filters.monthFilter && filters.monthFilter !== 'ALL') count++;
    if (filters.dateFilter && !isToday(filters.dateFilter)) count++;
    if (filters.selectedServices.length > 0) count += filters.selectedServices.length;
    if (filters.selectedStatuses.length > 0) count += filters.selectedStatuses.length;
    return count;
  }, [
    filters.searchQuery,
    filters.monthFilter,
    filters.dateFilter,
    filters.selectedServices,
    filters.selectedStatuses
  ]);

  // 3. Centralized Search Engine Index Items (Doctors + Services + Poliklinik)
  const indexItems = useMemo<SearchEngineResultItem[]>(() => {
    const items: SearchEngineResultItem[] = [];

    // 1. Doctors from backend options
    clinicFilterData.doctorOptions.forEach((doc, idx) => {
      items.push({
        id: `doc-${idx}-${doc.value}`,
        title: doc.label,
        subtitle: 'Dokter Spesialis / Umum',
        category: 'Dokter',
        icon: Icons.userCheck,
        queryValue: doc.label
      });
    });

    // 2. Services from catalog
    availableServices.forEach((srv, idx) => {
      items.push({
        id: `srv-${idx}-${srv.value}`,
        title: srv.label,
        subtitle: 'Layanan Medis Klinik',
        category: 'Layanan',
        icon: Icons.plusCircle,
        queryValue: srv.label
      });
    });

    // 3. Poliklinik units
    clinicFilterData.poliOptions.forEach((poli, idx) => {
      items.push({
        id: `poli-${idx}-${poli.value}`,
        title: poli.label,
        subtitle: 'Unit Poliklinik',
        category: 'Poliklinik',
        icon: Icons.mapPin,
        queryValue: poli.label
      });
    });

    return items;
  }, [availableServices, clinicFilterData.doctorOptions, clinicFilterData.poliOptions]);

  const searchEngine = useStateSearchEngine({
    query: filters.searchQuery,
    onQueryChange: actions.changeSearch,
    id: 'klinik-janji-temu',
    title: 'Pencarian Janji Temu',
    description: 'Cari janji temu berdasarkan nama dokter, pasien, atau layanan',
    placeholder: 'Ketik nama dokter, spesialis, atau layanan...',
    indexItems
  });

  return {
    facetGroups,
    activeFilterCount,
    searchEngine,
    clinicFilterData,
    availableServices
  };
}
