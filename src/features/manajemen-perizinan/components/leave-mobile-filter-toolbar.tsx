'use client';

import React, { useMemo } from 'react';
import { ResponsiveFacetToolbox } from '@/shared/ui/responsive-facet-toolbox';
import { SearchEngineDialog } from '@/components/search-engine';
import { LeaveSettingsButton } from './leave-settings-button';
import {
  useLeaveDynamicOptions,
  LEAVE_STATUS_OPTIONS,
  LEAVE_STAFF_TYPE_OPTIONS,
  LEAVE_TYPE_OPTIONS
} from '../model/useLeaveDynamicOptions';
import type { LeaveRequestItem } from '../api/types';
import type { UseLeaveFiltersResult } from '../model/useLeaveFilters';
import type { LeaveConfigurationCategory } from './leave-settings-button';

export { LEAVE_STATUS_OPTIONS, LEAVE_STAFF_TYPE_OPTIONS, LEAVE_TYPE_OPTIONS };

export interface LeaveMobileFilterToolbarProps {
  leaves: LeaveRequestItem[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedStatuses: string[];
  onSelectedStatusesChange: (statuses: string[]) => void;
  selectedStaffTypes: string[];
  onSelectedStaffTypesChange: (types: string[]) => void;
  selectedLeaveTypes: string[];
  onSelectedLeaveTypesChange: (types: string[]) => void;
  onResetAll: () => void;
  onOpenSettingsModal?: (category?: LeaveConfigurationCategory) => void;
  className?: string;
}

export function LeaveMobileFilterToolbar({
  leaves,
  searchQuery,
  onSearchChange,
  selectedStatuses,
  onSelectedStatusesChange,
  selectedStaffTypes,
  onSelectedStaffTypesChange,
  selectedLeaveTypes,
  onSelectedLeaveTypesChange,
  onResetAll,
  onOpenSettingsModal,
  className
}: LeaveMobileFilterToolbarProps) {
  const mockFilters = useMemo<UseLeaveFiltersResult>(
    () => ({
      searchQuery,
      statusFilter: selectedStatuses,
      staffTypeFilter: selectedStaffTypes,
      leaveTypeFilter: selectedLeaveTypes,
      filteredLeaves: leaves,
      hasActiveFilters: [
        Boolean(searchQuery.trim()),
        selectedStatuses.length > 0,
        selectedStaffTypes.length > 0,
        selectedLeaveTypes.length > 0
      ].some(Boolean),
      counts: {
        all: leaves.length,
        pending: leaves.filter((l) => l.status === 'pending').length,
        approved: leaves.filter((l) => l.status === 'approved').length,
        rejected: leaves.filter((l) => l.status === 'rejected').length
      },
      actions: {
        changeSearch: onSearchChange,
        changeStatusFilter: onSelectedStatusesChange,
        changeStaffTypeFilter: onSelectedStaffTypesChange,
        changeLeaveTypeFilter: onSelectedLeaveTypesChange,
        resetFilters: onResetAll
      }
    }),
    [
      searchQuery,
      selectedStatuses,
      selectedStaffTypes,
      selectedLeaveTypes,
      leaves,
      onSearchChange,
      onSelectedStatusesChange,
      onSelectedStaffTypesChange,
      onSelectedLeaveTypesChange,
      onResetAll
    ]
  );

  const { facetGroups, activeFilterCount, searchEngine } = useLeaveDynamicOptions({
    filters: mockFilters,
    leaves
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
        searchPlaceholder='Pencarian permohonan izin...'
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
        extraRightSlot={
          onOpenSettingsModal && (
            <div className='flex items-center gap-1.5 shrink-0'>
              <LeaveSettingsButton
                onSelectCategory={onOpenSettingsModal}
                forceMode='drawer'
                className='size-8 rounded-md'
              />
            </div>
          )
        }
      />
    </>
  );
}
