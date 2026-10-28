'use client';

import React, { useMemo } from 'react';
import { ResponsiveFacetToolbox } from '@/shared/ui/responsive-facet-toolbox';
import { SearchEngineDialog } from '@/components/search-engine';
import type { FilterOption } from '../hooks/use-clinic-filter-options';
import { isAppointmentFilterActive } from '../model/appointment-filters.rules';
import type { AppointmentStatus } from '../api/types';
import type { AppointmentFilterState } from '../model/appointmentViewModel';
import { useAppointmentDynamicOptions } from '../model/useAppointmentDynamicOptions';

export interface AppointmentFilterActions {
  changeSearch: (value: string) => void;
  changeMonthFilter: (value: string) => void;
  changeDateFilter: (value: Date | undefined) => void;
  changeSelectedServices: (services: string[]) => void;
  changeSelectedStatuses: (statuses: AppointmentStatus[]) => void;
  resetFilters: () => void;
}

export interface AppointmentFiltersProps {
  filters: AppointmentFilterState;
  actions: AppointmentFilterActions;
  serviceOptions?: FilterOption[];
  className?: string;
}

export function AppointmentFilters({
  filters,
  actions,
  serviceOptions,
  className
}: AppointmentFiltersProps) {
  const today = useMemo(() => new Date(), []);

  const { facetGroups, activeFilterCount, searchEngine } = useAppointmentDynamicOptions({
    filters,
    actions,
    serviceOptions
  });

  const isFiltered = isAppointmentFilterActive(filters, today);

  return (
    <>
      <SearchEngineDialog
        config={searchEngine.config}
        isOpen={searchEngine.isOpen}
        onClose={searchEngine.close}
      />

      <ResponsiveFacetToolbox
        searchQuery={filters.searchQuery}
        onSearchChange={actions.changeSearch}
        searchPlaceholder='Pencarian Janji Temu...'
        onOpenSearchDialog={searchEngine.open}
        dateFilter={{
          label: 'Tanggal',
          selectedDate: filters.dateFilter,
          onSelectDate: actions.changeDateFilter,
          defaultDate: today,
          resetLabel: 'Kembali ke Hari Ini'
        }}
        facets={facetGroups}
        isFiltered={isFiltered}
        onResetAll={() => {
          searchEngine.clearQuery();
          actions.resetFilters();
        }}
        activeFilterCount={activeFilterCount}
        isCompact={false}
        className={className}
      />
    </>
  );
}
