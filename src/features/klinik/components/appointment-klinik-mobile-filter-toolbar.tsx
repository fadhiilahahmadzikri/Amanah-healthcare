'use client';

import React, { useMemo } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { SearchEngineDialog } from '@/components/search-engine';
import { ResponsiveFacetToolbox } from '@/shared/ui/responsive-facet-toolbox';
import type { FilterOption } from '../hooks/use-clinic-filter-options';
import { isAppointmentFilterActive } from '../model/appointment-filters.rules';
import type { AppointmentFilterActions } from './appointment-filters';
import type { AppointmentFilterState } from '../model/appointmentViewModel';
import { useAppointmentDynamicOptions } from '../model/useAppointmentDynamicOptions';

export interface AppointmentKlinikMobileFilterToolbarProps {
  filters: AppointmentFilterState;
  actions: AppointmentFilterActions;
  totalAppointments?: number;
  filteredCount?: number;
  serviceOptions?: FilterOption[];
  onOpenCheckIn?: () => void;
  onOpenCreate?: () => void;
  className?: string;
}

export function AppointmentKlinikMobileFilterToolbar({
  filters,
  actions,
  totalAppointments: _totalAppointments,
  filteredCount: _filteredCount,
  serviceOptions,
  onOpenCheckIn,
  onOpenCreate,
  className
}: AppointmentKlinikMobileFilterToolbarProps) {
  const today = useMemo(() => new Date(), []);

  const { facetGroups, activeFilterCount, searchEngine } = useAppointmentDynamicOptions({
    filters,
    actions,
    serviceOptions
  });

  const isFiltered = isAppointmentFilterActive(filters, today);

  return (
    <>
      <SearchEngineDialog
        config={searchEngine.config}
        isOpen={searchEngine.isOpen}
        onClose={searchEngine.close}
      />

      <ResponsiveFacetToolbox
        searchQuery={filters.searchQuery}
        onSearchChange={actions.changeSearch}
        searchPlaceholder='Pencarian Janji Temu...'
        onOpenSearchDialog={searchEngine.open}
        dateFilter={{
          label: 'Tanggal',
          selectedDate: filters.dateFilter,
          onSelectDate: actions.changeDateFilter,
          defaultDate: today,
          resetLabel: 'Kembali ke Hari Ini'
        }}
        facets={facetGroups}
        isFiltered={isFiltered}
        onResetAll={() => {
          searchEngine.clearQuery();
          actions.resetFilters();
        }}
        activeFilterCount={activeFilterCount}
        isCompact={true}
        className={className}
        extraRightSlot={
          <div className='flex items-center gap-1.5 shrink-0'>
            {onOpenCheckIn && (
              <Button
                type='button'
                variant='outline'
                size='icon'
                onClick={onOpenCheckIn}
                aria-label='Check-In Pasien'
                className='size-8 rounded-md cursor-pointer shrink-0'
                title='Check-In Pasien'
              >
                <Icons.qrCode className='size-3.5' />
              </Button>
            )}

            {onOpenCreate && (
              <Button
                type='button'
                variant='primary'
                size='icon'
                onClick={onOpenCreate}
                aria-label='Tambah Janji Temu'
                className='size-8 rounded-md cursor-pointer shrink-0 shadow-2xs'
                title='Tambah Janji Temu'
              >
                <Icons.add className='size-3.5' />
              </Button>
            )}
          </div>
        }
      />
    </>
  );
}
