'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { FacetedFilter } from '@/shared/ui/faceted-filter';
import { DateFilter } from '@/shared/ui/date-filter';
import { SearchInput } from '@/shared/ui/search-input';
import { toggleItem } from '@/shared/lib/array/toggle-item';
import { buildMonthOptions } from '@/features/klinik/model/appointment-filters.rules';
import { doctorScheduleFilterOptionsQueryOptions } from '../api/queries';
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

const STATUS_DOTS: Record<string, string> = {
  buka: 'bg-emerald-500',
  penuh: 'bg-amber-500',
  cuti: 'bg-sky-500',
  tutup: 'bg-muted-foreground/60'
};

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

  const { data: filterOptionsData } = useQuery(doctorScheduleFilterOptionsQueryOptions());

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

  const poliFacetOptions = React.useMemo(() => {
    if (filterOptionsData?.poliklinik && filterOptionsData.poliklinik.length > 0) {
      return filterOptionsData.poliklinik.map((p) => ({ value: p.name, label: p.name }));
    }
    return POLI_OPTIONS.map((poli) => ({ value: poli, label: poli }));
  }, [filterOptionsData]);

  const statusFacetOptions = React.useMemo(() => {
    if (filterOptionsData?.statuses && filterOptionsData.statuses.length > 0) {
      return filterOptionsData.statuses.map((s) => ({
        value: s.label,
        label: s.label,
        dotColor: STATUS_DOTS[s.id.toLowerCase()] || 'bg-primary'
      }));
    }
    return DOCTOR_SCHEDULE_STATUS_OPTIONS;
  }, [filterOptionsData]);

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
        options={statusFacetOptions}
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
