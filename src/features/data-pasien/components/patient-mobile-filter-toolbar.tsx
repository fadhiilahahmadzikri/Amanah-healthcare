'use client';

import * as React from 'react';
import type { Table } from '@tanstack/react-table';
import { ResponsiveFacetToolbox } from '@/shared/ui/responsive-facet-toolbox';
import { SearchEngineDialog } from '@/components/search-engine';
import { PatientExportButton } from './patient-export-button';
import { usePatientDynamicOptions } from '../model/usePatientDynamicOptions';
import type { Patient } from '../api/types';

export interface PatientMobileFilterToolbarProps {
  table: Table<Patient>;
  onReset?: () => void;
  className?: string;
}

export function PatientMobileFilterToolbar({
  table,
  onReset,
  className
}: PatientMobileFilterToolbarProps) {
  const {
    searchQuery,
    handleSearchChange,
    facetGroups,
    activeFilterCount,
    isFiltered,
    resetAllFilters,
    searchEngine
  } = usePatientDynamicOptions({
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
        searchPlaceholder='Cari nama, no. RM, NIK pasien...'
        onOpenSearchDialog={searchEngine.open}
        facets={facetGroups}
        isFiltered={isFiltered}
        onResetAll={resetAllFilters}
        activeFilterCount={activeFilterCount}
        isCompact={true}
        extraRightSlot={
          <PatientExportButton variant='icon' className='size-8 rounded-md shrink-0' />
        }
        className={className}
      />
    </>
  );
}
