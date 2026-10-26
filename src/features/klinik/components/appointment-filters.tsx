'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { FacetedFilter } from '@/shared/ui/faceted-filter';
import { DateFilter } from '@/shared/ui/date-filter';
import { SearchInput } from '@/shared/ui/search-input';
import { toggleItem } from '@/shared/lib/array/toggle-item';
import { useClinicFilterOptions, type FilterOption } from '../hooks/use-clinic-filter-options';
import { buildMonthOptions, isAppointmentFilterActive } from '../model/appointment-filters.rules';
import type { AppointmentStatus } from '../api/types';
import type { AppointmentFilterState } from '../model/appointmentViewModel';
import { cn } from '@/lib/utils';

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
  const clinicFilterData = useClinicFilterOptions();
  const availableServices = serviceOptions ?? clinicFilterData.serviceOptions;

  const today = React.useMemo(() => new Date(), []);
  const isFiltered = isAppointmentFilterActive(filters, today);
  const monthOptions = React.useMemo(() => buildMonthOptions(), []);

  const serviceFacetOptions = React.useMemo(
    () => availableServices.map((srv) => ({ value: srv.value, label: srv.label })),
    [availableServices]
  );

  return (
    <div className={cn('flex flex-wrap items-center gap-2 font-sans select-none', className)}>
      {/* 1. Global Search Input */}
      <SearchInput
        value={filters.searchQuery}
        onChange={actions.changeSearch}
        placeholder='Pencarian Global...'
        ariaLabel='Pencarian Global'
      />

      {/* 2. Month Filter */}
      <FacetedFilter<string>
        title='Bulan'
        icon={Icons.calendar}
        mode='single'
        options={monthOptions}
        selectedValues={
          filters.monthFilter && filters.monthFilter !== 'ALL' ? [filters.monthFilter] : []
        }
        onSelect={(val) => actions.changeMonthFilter(val)}
        onReset={() => actions.changeMonthFilter('ALL')}
        resetLabel='Reset Bulan'
        popoverWidth='w-48'
      />

      {/* 3. Date Filter */}
      <DateFilter
        label='Tanggal'
        selectedDate={filters.dateFilter}
        onSelectDate={actions.changeDateFilter}
        defaultDate={today}
        resetLabel='Kembali ke Hari Ini'
      />

      {/* 4. Layanan / Poli Filter */}
      <FacetedFilter<string>
        title='Layanan'
        icon={Icons.plusCircle}
        mode='multi'
        options={serviceFacetOptions}
        selectedValues={filters.selectedServices}
        onSelect={(service) =>
          actions.changeSelectedServices(toggleItem(filters.selectedServices, service))
        }
        onReset={() => actions.changeSelectedServices([])}
        resetLabel='Reset Layanan'
        popoverWidth='w-56'
      />

      {/* 6. Reset Filters Button */}
      {isFiltered && (
        <Button
          variant='ghost'
          size='sm'
          onClick={actions.resetFilters}
          className='h-8 px-2.5 text-xs border border-dashed border-border'
        >
          <Icons.close className='size-3.5 mr-1' />
          Reset
        </Button>
      )}
    </div>
  );
}
