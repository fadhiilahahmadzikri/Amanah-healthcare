'use client';

import * as React from 'react';
import { SearchInput } from '@/shared/ui/search-input';
import { FacetedFilter } from '@/shared/ui/faceted-filter';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
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

  const isFiltered =
    Boolean(searchQuery.trim()) ||
    Boolean(localSearch.trim()) ||
    (selectedCategory !== 'all' && Boolean(selectedCategory)) ||
    (selectedStatus !== 'all' && Boolean(selectedStatus));

  // 1. Period Options
  const periodOptions = React.useMemo(() => {
    return periods.map((p) => {
      const statusLabel =
        p.status === 'calculated'
          ? 'Terkalkulasi'
          : p.status === 'finalized'
            ? 'Ditutup buku'
            : 'Draf';
      return {
        value: p.id,
        label: `${p.periodName} (${statusLabel})`
      };
    });
  }, [periods]);

  // 2. Category Options (Backend SSOT)
  const categoryOptions = React.useMemo(() => {
    const list = [{ label: 'Semua Kategori', value: 'all' }];
    if (filterOptions?.categories) {
      for (const cat of filterOptions.categories) {
        list.push({ label: cat.label, value: cat.id });
      }
    } else {
      list.push(
        { label: 'Dokter', value: 'doctor' },
        { label: 'Bidan', value: 'midwife' },
        { label: 'Staf Operasional', value: 'worker' }
      );
    }
    return list;
  }, [filterOptions?.categories]);

  // 3. Status Options (Backend SSOT)
  const statusOptions = React.useMemo(() => {
    const list = [{ label: 'Semua Status', value: 'all' }];
    if (filterOptions?.statuses) {
      for (const st of filterOptions.statuses) {
        list.push({ label: st.label, value: st.id });
      }
    } else {
      list.push(
        { label: 'Draf', value: 'draft' },
        { label: 'Terkalkulasi', value: 'calculated' },
        { label: 'Ditutup Buku', value: 'finalized' }
      );
    }
    return list;
  }, [filterOptions?.statuses]);

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

      {/* 3. Category Filter */}
      <FacetedFilter<string>
        title='Kategori'
        icon={Icons.teams}
        mode='single'
        options={categoryOptions}
        selectedValues={selectedCategory && selectedCategory !== 'all' ? [selectedCategory] : []}
        onSelect={(val) => onCategoryChange(val)}
        onReset={() => onCategoryChange('all')}
        resetLabel='Semua Kategori'
        popoverWidth='w-48'
      />

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
