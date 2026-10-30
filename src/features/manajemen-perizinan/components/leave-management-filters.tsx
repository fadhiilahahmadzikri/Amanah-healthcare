'use client';

import * as React from 'react';
import { ResponsiveFacetToolbox } from '@/shared/ui/responsive-facet-toolbox';
import {
  useLeaveDynamicOptions,
  LEAVE_STATUS_OPTIONS,
  LEAVE_TYPE_OPTIONS
} from '../model/useLeaveDynamicOptions';
import type { UseLeaveFiltersResult } from '../model/useLeaveFilters';

export { LEAVE_STATUS_OPTIONS, LEAVE_TYPE_OPTIONS };

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
  const isFiltered = [
    Boolean(searchQuery.trim()),
    selectedStatuses.length > 0,
    selectedStaffTypes.length > 0,
    selectedLeaveTypes.length > 0
  ].some(Boolean);

  const mockFilters = React.useMemo<UseLeaveFiltersResult>(
    () => ({
      searchQuery,
      statusFilter: selectedStatuses,
      staffTypeFilter: selectedStaffTypes,
      leaveTypeFilter: selectedLeaveTypes,
      filteredLeaves: [],
      hasActiveFilters: isFiltered,
      counts: {
        all: 0,
        pending: 0,
        approved: 0,
        rejected: 0
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
      isFiltered,
      onSearchChange,
      onSelectedStatusesChange,
      onSelectedStaffTypesChange,
      onSelectedLeaveTypesChange,
      onResetAll
    ]
  );

  const { facetGroups, activeFilterCount } = useLeaveDynamicOptions({
    filters: mockFilters,
    leaves: []
  });

  return (
    <ResponsiveFacetToolbox
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder='Pencarian permohonan izin...'
      facets={facetGroups}
      isFiltered={isFiltered}
      onResetAll={onResetAll}
      activeFilterCount={activeFilterCount}
      isCompact={false}
      className={className}
    />
  );
}
