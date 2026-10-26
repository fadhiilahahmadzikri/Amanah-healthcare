'use client';

import * as React from 'react';
import { ResponsiveFacetToolbox } from '@/shared/ui/responsive-facet-toolbox';
import {
  useReplacementDynamicOptions,
  REPLACEMENT_STATUS_OPTIONS,
  REPLACEMENT_SESSION_OPTIONS
} from '../model/useReplacementDynamicOptions';
import type { UseReplacementFiltersResult } from '../model/useReplacementFilters';

export { REPLACEMENT_STATUS_OPTIONS, REPLACEMENT_SESSION_OPTIONS };

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
  const isFiltered = [
    Boolean(searchQuery.trim()),
    selectedStatuses.length > 0,
    selectedSessions.length > 0
  ].some(Boolean);

  const mockFilters = React.useMemo<UseReplacementFiltersResult>(
    () => ({
      searchQuery,
      statusFilter: selectedStatuses,
      sessionFilter: selectedSessions,
      filteredOpportunities: [],
      hasActiveFilters: isFiltered,
      counts: {
        all: 0,
        open: 0,
        claimed: 0,
        completed: 0,
        cancelled: 0
      },
      actions: {
        changeSearch: onSearchChange,
        changeStatusFilter: onSelectedStatusesChange,
        changeSessionFilter: onSelectedSessionsChange,
        resetFilters: onResetAll
      }
    }),
    [
      searchQuery,
      selectedStatuses,
      selectedSessions,
      isFiltered,
      onSearchChange,
      onSelectedStatusesChange,
      onSelectedSessionsChange,
      onResetAll
    ]
  );

  const { facetGroups, activeFilterCount } = useReplacementDynamicOptions({
    filters: mockFilters,
    opportunities: []
  });

  return (
    <ResponsiveFacetToolbox
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder='Cari staf cuti / pengganti...'
      facets={facetGroups}
      isFiltered={isFiltered}
      onResetAll={onResetAll}
      activeFilterCount={activeFilterCount}
      isCompact={false}
      className={className}
    />
  );
}
