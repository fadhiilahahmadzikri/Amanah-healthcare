'use client';

import * as React from 'react';
import { SearchInput } from '@/shared/ui/search-input';
import { FacetedFilter } from '@/shared/ui/faceted-filter';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { PERIOD_STATUS_CONFIG, STATUS_FILTER_OPTIONS } from '../constants/options';
import type { PayrollPeriodItem, PayrollFilterOptionsResponse } from '../api/types';

export interface PayrollFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedPeriodId: string | null;
  onPeriodChange: (id: string) => void;
  periods: PayrollPeriodItem[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onResetAll: () => void;
  filterOptions?: PayrollFilterOptionsResponse;
  className?: string;
}

export function PayrollFilters({
  searchQuery,
  onSearchChange,
  selectedPeriodId,
  onPeriodChange,
  periods,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  onResetAll,
  filterOptions,
  className
}: PayrollFiltersProps) {
  const [localSearch, setLocalSearch] = React.useState(searchQuery || '');

  React.useEffect(() => {
    setLocalSearch(searchQuery || '');
  }, [searchQuery]);

  // Debounced search query (250ms)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, searchQuery]);

  const hasSearch = Boolean(searchQuery.trim() || localSearch.trim());
  const hasCategoryFilter = selectedCategory !== 'all' && Boolean(selectedCategory);
  const hasStatusFilter = selectedStatus !== 'all' && Boolean(selectedStatus);
  const isFiltered = [hasSearch, hasCategoryFilter, hasStatusFilter].some(Boolean);

  // 1. Period Options
  const periodOptions = React.useMemo(() => {
    return periods.map((p) => {
      const statusLabel = PERIOD_STATUS_CONFIG[p.status]?.label ?? p.status;
      return {
        value: p.id,
        label: `${p.periodName} (${statusLabel})`
      };
    });
  }, [periods]);

  // 2. Role Options (Derived from backend filterOptions)
  const roleOptions = React.useMemo(() => {
    const opts = [{ label: 'Semua Peran', value: 'all' }];
    if (filterOptions?.categories && filterOptions.categories.length > 0) {
      filterOptions.categories.forEach((code) => {
        opts.push({
          label: code.charAt(0).toUpperCase() + code.slice(1).replace(/_/g, ' '),
          value: code
        });
      });
    }
    return opts;
  }, [filterOptions?.categories]);

  // 3. Status Options (Presentation SSOT)
  const statusOptions = STATUS_FILTER_OPTIONS;

  return (
    <div className={cn('flex flex-wrap items-center gap-2 font-sans select-none', className)}>
      {/* 1. Global Search Input */}
      <SearchInput
        value={localSearch}
        onChange={setLocalSearch}
        placeholder='Pencarian Karyawan...'
        ariaLabel='Pencarian Karyawan'
      />

      {/* 2. Period Filter */}
      {periodOptions.length > 0 && (
        <FacetedFilter<string>
          title='Periode'
          icon={Icons.calendar}
          mode='single'
          options={periodOptions}
          selectedValues={selectedPeriodId ? [selectedPeriodId] : []}
          onSelect={(val) => onPeriodChange(val)}
          onReset={() => onPeriodChange(periods[0]?.id || '')}
          resetLabel='Periode Terbaru'
          popoverWidth='w-64'
        />
      )}

      {/* 3. Role Filter */}
      {roleOptions.length > 1 && (
        <FacetedFilter<string>
          title='Peran'
          icon={Icons.users}
          mode='single'
          options={roleOptions}
          selectedValues={selectedCategory && selectedCategory !== 'all' ? [selectedCategory] : []}
          onSelect={(val) => onCategoryChange(val)}
          onReset={() => onCategoryChange('all')}
          resetLabel='Semua Peran'
          popoverWidth='w-48'
        />
      )}

      {/* 4. Status Filter */}
      <FacetedFilter<string>
        title='Status'
        icon={Icons.activity}
        mode='single'
        options={statusOptions}
        selectedValues={selectedStatus && selectedStatus !== 'all' ? [selectedStatus] : []}
        onSelect={(val) => onStatusChange(val)}
        onReset={() => onStatusChange('all')}
        resetLabel='Semua Status'
        popoverWidth='w-48'
      />

      {/* 5. Reset Filters Button */}
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
