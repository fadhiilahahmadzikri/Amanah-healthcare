'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { FacetedFilter } from '@/shared/ui/faceted-filter';
import { SearchInput } from '@/shared/ui/search-input';
import { toggleItem } from '@/shared/lib/array/toggle-item';
import { cn } from '@/lib/utils';
import { REPLACEMENT_STATUS_CONFIG, SESSION_CODE_LABELS } from '../constants/replacement.constants';

export interface ReplacementFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedStatuses: string[];
  onSelectedStatusesChange: (statuses: string[]) => void;
  selectedSessions: string[];
  onSelectedSessionsChange: (sessions: string[]) => void;
  onResetAll: () => void;
  className?: string;
}

const STATUS_OPTIONS = [
  { value: 'open', label: REPLACEMENT_STATUS_CONFIG.open.label },
  { value: 'claimed', label: REPLACEMENT_STATUS_CONFIG.claimed.label },
  { value: 'completed', label: REPLACEMENT_STATUS_CONFIG.completed.label },
  { value: 'cancelled', label: REPLACEMENT_STATUS_CONFIG.cancelled.label }
];

const SESSION_OPTIONS = Object.entries(SESSION_CODE_LABELS).map(([value, label]) => ({
  value,
  label
}));

export function ReplacementFilters({
  searchQuery,
  onSearchChange,
  selectedStatuses,
  onSelectedStatusesChange,
  selectedSessions,
  onSelectedSessionsChange,
  onResetAll,
  className
}: ReplacementFiltersProps) {
  const [localSearch, setLocalSearch] = React.useState(searchQuery || '');

  React.useEffect(() => {
    setLocalSearch(searchQuery || '');
  }, [searchQuery]);

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
    selectedSessions.length > 0;

  return (
    <div className={cn('flex flex-wrap items-center gap-2 font-sans select-none', className)}>
      {/* 1. Global Search Input */}
      <SearchInput
        value={localSearch}
        onChange={setLocalSearch}
        placeholder='Cari staf cuti / pengganti...'
        ariaLabel='Pencarian peluang dinas pengganti'
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

      {/* 3. Sesi Filter */}
      <FacetedFilter<string>
        title='Sesi Dinas'
        icon={Icons.clock}
        mode='multi'
        options={SESSION_OPTIONS}
        selectedValues={selectedSessions}
        onSelect={(val) => onSelectedSessionsChange(toggleItem(selectedSessions, val))}
        onReset={() => onSelectedSessionsChange([])}
        resetLabel='Reset Sesi'
        popoverWidth='w-48'
      />

      {/* 4. Reset All Button */}
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
