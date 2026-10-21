'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SearchInput } from '@/shared/ui/search-input';
import { FacetedFilter } from '@/shared/ui/faceted-filter';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { usePayrollFilterOptionsQuery } from '../api/queries';
import { cn } from '@/lib/utils';

export interface PayrollFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onResetAll: () => void;
  totalFiltered: number;
  totalCount: number;
  className?: string;
}

export function PayrollFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onResetAll,
  totalFiltered,
  totalCount,
  className
}: PayrollFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const { data: filterOptions } = usePayrollFilterOptionsQuery();

  useEffect(() => {
    setLocalSearch(searchQuery || '');
  }, [searchQuery]);

  // Debounced search query (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, searchQuery]);

  const isFiltered = Boolean(searchQuery.trim()) || selectedCategory !== 'all';

  const categoryOptions = useMemo(() => {
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
  }, [filterOptions]);

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-muted/15 border border-border/60 rounded-xl select-none',
        className
      )}
    >
      <div className='flex flex-wrap items-center gap-2 flex-1'>
        {/* 1. Debounced Search Input */}
        <SearchInput
          value={localSearch}
          onChange={setLocalSearch}
          placeholder='Cari staf atau posisi...'
          ariaLabel='Pencarian Karyawan Penggajian'
          className='w-full sm:w-64'
        />

        {/* 2. Faceted Filter for Category (Backend-driven) */}
        <FacetedFilter<string>
          title='Kategori Staf'
          icon={Icons.teams}
          mode='single'
          options={categoryOptions}
          selectedValues={selectedCategory && selectedCategory !== 'all' ? [selectedCategory] : []}
          onSelect={(val) => onCategoryChange(val)}
          onReset={() => onCategoryChange('all')}
          resetLabel='Semua Kategori'
          popoverWidth='w-48'
        />

        {/* 3. Reset Button */}
        {isFiltered && (
          <Button
            variant='ghost'
            size='sm'
            onClick={onResetAll}
            className='h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border/80'
          >
            <Icons.close className='size-3.5 mr-1' />
            Reset
          </Button>
        )}
      </div>

      {/* Count Indicator */}
      <div className='text-xs text-muted-foreground font-medium shrink-0'>
        Menampilkan <span className='text-foreground font-bold'>{totalFiltered}</span> dari{' '}
        {totalCount} Staf
      </div>
    </div>
  );
}
