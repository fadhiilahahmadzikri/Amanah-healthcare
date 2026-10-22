'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { FacetedFilter } from '@/shared/ui/faceted-filter';
import { SearchInput } from '@/shared/ui/search-input';
import { toggleItem } from '@/shared/lib/array/toggle-item';
import { cn } from '@/lib/utils';

export interface LeaveManagementFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedStatuses: string[];
  onSelectedStatusesChange: (statuses: string[]) => void;
  selectedStaffTypes: string[];
  onSelectedStaffTypesChange: (types: string[]) => void;
  selectedLeaveTypes: string[];
  onSelectedLeaveTypesChange: (types: string[]) => void;
  onResetAll: () => void;
  className?: string;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Menunggu' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
  { value: 'cancelled', label: 'Dibatalkan' }
] as const;

const STAFF_TYPE_OPTIONS = [
  { value: 'doctor', label: 'Dokter' },
  { value: 'midwife', label: 'Bidan' },
  { value: 'worker', label: 'Staf Operasional' }
] as const;

const LEAVE_TYPE_OPTIONS = [
  { value: 'annual_leave', label: 'Cuti Tahunan' },
  { value: 'sick_leave', label: 'Izin Sakit' },
  { value: 'seminar_symposium', label: 'Seminar/Simposium' },
  { value: 'family_matter', label: 'Keperluan Keluarga' },
  { value: 'external_assignment', label: 'Tugas Luar' },
  { value: 'other', label: 'Lainnya' }
] as const;

export function LeaveManagementFilters({
  searchQuery,
  onSearchChange,
  selectedStatuses,
  onSelectedStatusesChange,
  selectedStaffTypes,
  onSelectedStaffTypesChange,
  selectedLeaveTypes,
  onSelectedLeaveTypesChange,
  onResetAll,
  className
}: LeaveManagementFiltersProps) {
  const [localSearch, setLocalSearch] = React.useState(searchQuery || '');

  React.useEffect(() => {
    setLocalSearch(searchQuery || '');
  }, [searchQuery]);

  // Debounced dispatch (250ms) for smooth typing
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
    selectedStatuses.length > 0 ||
    selectedStaffTypes.length > 0 ||
    selectedLeaveTypes.length > 0;

  return (
    <div className={cn('flex flex-wrap items-center gap-2 font-sans select-none', className)}>
      {/* 1. Global Search Input */}
      <SearchInput
        value={localSearch}
        onChange={setLocalSearch}
        placeholder='Pencarian permohonan izin...'
        ariaLabel='Pencarian permohonan izin'
      />

      {/* 2. Status Filter */}
      <FacetedFilter<string>
        title='Status'
        icon={Icons.activity}
        mode='multi'
        options={STATUS_OPTIONS}
        selectedValues={selectedStatuses}
        onSelect={(val) => onSelectedStatusesChange(toggleItem(selectedStatuses, val))}
        onReset={() => onSelectedStatusesChange([])}
        resetLabel='Reset Status'
        popoverWidth='w-48'
      />

      {/* 3. Kategori Staf Filter */}
      <FacetedFilter<string>
        title='Kategori'
        icon={Icons.users}
        mode='multi'
        options={STAFF_TYPE_OPTIONS}
        selectedValues={selectedStaffTypes}
        onSelect={(val) => onSelectedStaffTypesChange(toggleItem(selectedStaffTypes, val))}
        onReset={() => onSelectedStaffTypesChange([])}
        resetLabel='Reset Kategori'
        popoverWidth='w-52'
      />

      {/* 4. Tipe Izin Filter */}
      <FacetedFilter<string>
        title='Tipe Izin'
        icon={Icons.calendar}
        mode='multi'
        options={LEAVE_TYPE_OPTIONS}
        selectedValues={selectedLeaveTypes}
        onSelect={(val) => onSelectedLeaveTypesChange(toggleItem(selectedLeaveTypes, val))}
        onReset={() => onSelectedLeaveTypesChange([])}
        resetLabel='Reset Tipe Izin'
        popoverWidth='w-56'
      />

      {/* 5. Reset All Button */}
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
