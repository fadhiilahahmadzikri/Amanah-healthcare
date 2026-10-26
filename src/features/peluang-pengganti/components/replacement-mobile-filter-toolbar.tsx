'use client';

import React, { useMemo } from 'react';
import { ResponsiveFacetToolbox } from '@/shared/ui/responsive-facet-toolbox';
import { SearchEngineDialog } from '@/components/search-engine';
import {
  useReplacementDynamicOptions,
  REPLACEMENT_STATUS_OPTIONS,
  REPLACEMENT_SESSION_OPTIONS
} from '../model/useReplacementDynamicOptions';
import type { ReplacementOpportunityItem } from '../api/types';
import type { UseReplacementFiltersResult } from '../model/useReplacementFilters';

export { REPLACEMENT_STATUS_OPTIONS, REPLACEMENT_SESSION_OPTIONS };

export interface ReplacementMobileFilterToolbarProps {
  opportunities: ReplacementOpportunityItem[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedStatuses: string[];
  onSelectedStatusesChange: (statuses: string[]) => void;
  selectedSessions: string[];
  onSelectedSessionsChange: (sessions: string[]) => void;
  onResetAll: () => void;
  className?: string;
}

export function ReplacementMobileFilterToolbar({
  opportunities,
  searchQuery,
  onSearchChange,
  selectedStatuses,
  onSelectedStatusesChange,
  selectedSessions,
  onSelectedSessionsChange,
  onResetAll,
  className
}: ReplacementMobileFilterToolbarProps) {
  const mockFilters = useMemo<UseReplacementFiltersResult>(
    () => ({
      searchQuery,
      statusFilter: selectedStatuses,
      sessionFilter: selectedSessions,
      filteredOpportunities: opportunities,
      hasActiveFilters: [
        Boolean(searchQuery.trim()),
        selectedStatuses.length > 0,
        selectedSessions.length > 0
      ].some(Boolean),
      counts: {
        all: opportunities.length,
        open: opportunities.filter((o) => o.status === 'open').length,
        claimed: opportunities.filter((o) => o.status === 'claimed').length,
        completed: opportunities.filter((o) => o.status === 'completed').length,
        cancelled: opportunities.filter((o) => o.status === 'cancelled').length
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
      opportunities,
      onSearchChange,
      onSelectedStatusesChange,
      onSelectedSessionsChange,
      onResetAll
    ]
  );

  const { facetGroups, activeFilterCount, searchEngine } = useReplacementDynamicOptions({
    filters: mockFilters,
    opportunities
  });

  return (
    <>
      <SearchEngineDialog
        config={searchEngine.config}
        isOpen={searchEngine.isOpen}
        onClose={searchEngine.close}
      />

      <ResponsiveFacetToolbox
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder='Cari staf cuti / pengganti...'
        onOpenSearchDialog={searchEngine.open}
        facets={facetGroups}
        isFiltered={mockFilters.hasActiveFilters}
        onResetAll={() => {
          searchEngine.clearQuery();
          onResetAll();
        }}
        activeFilterCount={activeFilterCount}
        isCompact={true}
        className={className}
      />
    </>
  );
}
