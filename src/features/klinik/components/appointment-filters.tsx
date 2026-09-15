'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { FacetedFilter } from '@/shared/ui/faceted-filter';
import { DateFilter } from '@/shared/ui/date-filter';
import { SearchInput } from '@/shared/ui/search-input';
import { toggleItem } from '@/shared/lib/array/toggle-item';
import { SERVICE_OPTIONS, STATUS_OPTIONS } from '../config/appointment-filter-options';
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
  // Consolidated contract
  filters?: AppointmentFilterState;
  actions?: AppointmentFilterActions;

  // Backwards-compatible discrete props
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  monthFilter?: string;
  onMonthFilterChange?: (month: string) => void;
  dateFilter?: Date | undefined;
  onDateFilterChange?: (date: Date | undefined) => void;
  selectedServices?: string[];
  onSelectedServicesChange?: (services: string[]) => void;
  selectedStatuses?: AppointmentStatus[];
  onSelectedStatusesChange?: (statuses: AppointmentStatus[]) => void;
  onResetAll?: () => void;
  className?: string;
}

export function AppointmentFilters({
  filters,
  actions,
  searchQuery: discreteQuery,
  onSearchChange: discreteOnSearchChange,
  monthFilter: discreteMonth,
  onMonthFilterChange: discreteOnMonthChange,
  dateFilter: discreteDate,
  onDateFilterChange: discreteOnDateChange,
  selectedServices: discreteServices,
  onSelectedServicesChange: discreteOnServicesChange,
  selectedStatuses: discreteStatuses,
  onSelectedStatusesChange: discreteOnStatusesChange,
  onResetAll: discreteOnResetAll,
  className
}: AppointmentFiltersProps) {
  // Resolve effective state & actions (supporting both consolidated and discrete props)
  const currentFilters: AppointmentFilterState = React.useMemo(
    () => ({
      searchQuery: filters?.searchQuery ?? discreteQuery ?? '',
      monthFilter: filters?.monthFilter ?? discreteMonth ?? 'ALL',
      dateFilter: filters?.dateFilter ?? discreteDate,
      selectedServices: filters?.selectedServices ?? discreteServices ?? [],
      selectedStatuses: filters?.selectedStatuses ?? discreteStatuses ?? []
    }),
    [filters, discreteQuery, discreteMonth, discreteDate, discreteServices, discreteStatuses]
  );

  const handleSearchChange = actions?.changeSearch ?? discreteOnSearchChange ?? (() => {});
  const handleMonthChange = actions?.changeMonthFilter ?? discreteOnMonthChange ?? (() => {});
  const handleDateChange = actions?.changeDateFilter ?? discreteOnDateChange ?? (() => {});
  const handleServicesChange =
    actions?.changeSelectedServices ?? discreteOnServicesChange ?? (() => {});
  const handleStatusesChange =
    actions?.changeSelectedStatuses ?? discreteOnStatusesChange ?? (() => {});
  const handleReset = actions?.resetFilters ?? discreteOnResetAll ?? (() => {});

  const isFiltered = isAppointmentFilterActive(currentFilters);
  const monthOptions = React.useMemo(() => buildMonthOptions(), []);

  const serviceFacetOptions = React.useMemo(
    () => SERVICE_OPTIONS.map((srv) => ({ value: srv, label: srv })),
    []
  );

  return (
    <div className={cn('flex flex-wrap items-center gap-2 font-sans select-none', className)}>
      {/* 1. Global Search Input */}
      <SearchInput
        value={currentFilters.searchQuery}
        onChange={handleSearchChange}
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
          currentFilters.monthFilter && currentFilters.monthFilter !== 'ALL'
            ? [currentFilters.monthFilter]
            : []
        }
        onSelect={(val) => handleMonthChange(val)}
        onReset={() => handleMonthChange('ALL')}
        resetLabel='Reset Bulan'
        popoverWidth='w-48'
      />

      {/* 3. Date Filter */}
      <DateFilter
        label='Tanggal'
        selectedDate={currentFilters.dateFilter}
        onSelectDate={handleDateChange}
        resetLabel='Reset Tanggal'
      />

      {/* 4. Layanan / Poli Filter */}
      <FacetedFilter<string>
        title='Layanan'
        icon={Icons.plusCircle}
        mode='multi'
        options={serviceFacetOptions}
        selectedValues={currentFilters.selectedServices}
        onSelect={(service) =>
          handleServicesChange(toggleItem(currentFilters.selectedServices, service))
        }
        onReset={() => handleServicesChange([])}
        resetLabel='Reset Layanan'
        popoverWidth='w-56'
      />

      {/* 5. Status Filter */}
      <FacetedFilter<AppointmentStatus>
        title='Status'
        icon={Icons.plusCircle}
        mode='multi'
        options={STATUS_OPTIONS}
        selectedValues={currentFilters.selectedStatuses}
        onSelect={(status) =>
          handleStatusesChange(toggleItem(currentFilters.selectedStatuses, status))
        }
        onReset={() => handleStatusesChange([])}
        resetLabel='Reset Status'
        popoverWidth='w-48'
      />

      {/* 6. Reset Filters Button */}
      {isFiltered && (
        <Button
          variant='ghost'
          size='sm'
          onClick={handleReset}
          className='h-8 px-2.5 text-xs border border-dashed border-border'
        >
          <Icons.close className='size-3.5 mr-1' />
          Reset
        </Button>
      )}
    </div>
  );
}
