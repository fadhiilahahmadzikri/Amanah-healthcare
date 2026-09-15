'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { FacetedFilter } from '@/shared/ui/faceted-filter';
import { DateFilter } from '@/shared/ui/date-filter';
import { SearchInput } from '@/shared/ui/search-input';
import { toggleItem } from '@/shared/lib/array/toggle-item';
import { buildMonthOptions } from '@/features/klinik/model/appointment-filters.rules';
import {
  POLI_OPTIONS,
  DOCTOR_SCHEDULE_STATUS_OPTIONS
} from '../config/doctor-schedule-filter-options';
import { cn } from '@/lib/utils';

export interface DoctorScheduleFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  monthFilter: string;
  onMonthFilterChange: (month: string) => void;
  dateFilter: Date | undefined;
  onDateFilterChange: (date: Date | undefined) => void;
  selectedPoli: string[];
  onSelectedPoliChange: (poli: string[]) => void;
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
  selectedStatuses,
  onSelectedStatusesChange,
  onResetAll,
  className
}: DoctorScheduleFiltersProps) {
  const [localSearch, setLocalSearch] = React.useState(searchQuery || '');

  React.useEffect(() => {
    setLocalSearch(searchQuery || '');
  }, [searchQuery]);

  // Debounced query dispatch (250ms) for smooth typing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, searchQuery]);

  const isFiltered =
    Boolean(searchQuery.trim()) ||
    Boolean(localSearch.trim()) ||
    (monthFilter !== 'ALL' && monthFilter !== '') ||
    Boolean(dateFilter) ||
    selectedPoli.length > 0 ||
    selectedStatuses.length > 0;

  const monthOptions = React.useMemo(() => buildMonthOptions(), []);

  const poliFacetOptions = React.useMemo(
    () => POLI_OPTIONS.map((poli) => ({ value: poli, label: poli })),
    []
  );

  return (
    <div className={cn('flex flex-wrap items-center gap-2 font-sans select-none', className)}>
      {/* 1. Global Search Input */}
      <SearchInput
        value={localSearch}
        onChange={setLocalSearch}
        placeholder='Pencarian Dokter...'
        ariaLabel='Pencarian Dokter'
      />

      {/* 2. Month Filter */}
      <FacetedFilter<string>
        title='Bulan'
        icon={Icons.calendar}
        mode='single'
        options={monthOptions}
        selectedValues={monthFilter && monthFilter !== 'ALL' ? [monthFilter] : []}
        onSelect={(val) => onMonthFilterChange(val)}
        onReset={() => onMonthFilterChange('ALL')}
        resetLabel='Reset Bulan'
        popoverWidth='w-48'
      />

      {/* 3. Date Filter */}
      <DateFilter
        label='Tanggal'
        selectedDate={dateFilter}
        onSelectDate={onDateFilterChange}
        resetLabel='Reset Tanggal'
      />

      {/* 4. Poli Filter */}
      <FacetedFilter<string>
        title='Poli'
        icon={Icons.plusCircle}
        mode='multi'
        options={poliFacetOptions}
        selectedValues={selectedPoli}
        onSelect={(poli) => onSelectedPoliChange(toggleItem(selectedPoli, poli))}
        onReset={() => onSelectedPoliChange([])}
        resetLabel='Reset Poli'
        popoverWidth='w-56'
      />

      {/* 5. Status Filter */}
      <FacetedFilter<string>
        title='Status'
        icon={Icons.plusCircle}
        mode='multi'
        options={DOCTOR_SCHEDULE_STATUS_OPTIONS}
        selectedValues={selectedStatuses}
        onSelect={(status) => onSelectedStatusesChange(toggleItem(selectedStatuses, status))}
        onReset={() => onSelectedStatusesChange([])}
        resetLabel='Reset Status'
        popoverWidth='w-48'
      />

      {/* 6. Reset Filters Button */}
      {isFiltered && (
        <Button
          variant='ghost'
          size='sm'
          onClick={onResetAll}
          className='h-8 px-2.5 text-xs border border-dashed border-border'
        >
          <Icons.close className='size-3.5 mr-1' />
          Reset
        </Button>
      )}
    </div>
  );
}
