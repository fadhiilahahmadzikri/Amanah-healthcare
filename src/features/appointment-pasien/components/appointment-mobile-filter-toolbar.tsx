'use client';

import React from 'react';
import type { Table } from '@tanstack/react-table';
import { ResponsiveFacetToolbox } from '@/shared/ui/responsive-facet-toolbox';
import { SearchEngineDialog } from '@/components/search-engine';
import { AppointmentExportButton } from './appointment-export-button';
import { useAppointmentDynamicOptions } from '../model/useAppointmentDynamicOptions';
import type { AdminAppointment } from '../api/types';

export interface AppointmentMobileFilterToolbarProps {
  table: Table<AdminAppointment>;
  onReset?: () => void;
  className?: string;
}

export function AppointmentMobileFilterToolbar({
  table,
  onReset,
  className
}: AppointmentMobileFilterToolbarProps) {
  const {
    searchQuery,
    handleSearchChange,
    dateFilterConfig,
    facetGroups,
    activeFilterCount,
    isFiltered,
    resetAllFilters,
    searchEngine
  } = useAppointmentDynamicOptions({
    table,
    onReset
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
        onSearchChange={handleSearchChange}
        searchPlaceholder='Cari pasien, no antrean, dokter...'
        onOpenSearchDialog={searchEngine.open}
        dateFilter={dateFilterConfig}
        facets={facetGroups}
        isFiltered={isFiltered}
        onResetAll={resetAllFilters}
        activeFilterCount={activeFilterCount}
        isCompact={true}
        extraRightSlot={
          <AppointmentExportButton variant='icon' className='size-8 rounded-md shrink-0' />
        }
        className={className}
      />
    </>
  );
}
