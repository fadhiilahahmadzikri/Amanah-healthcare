'use client';

import React, { useMemo } from 'react';
import { ResponsiveFacetToolbox } from '@/shared/ui/responsive-facet-toolbox';
import { SearchEngineDialog } from '@/components/search-engine';
import { DoctorExportButton } from './doctor-export-button';
import { DoctorScheduleSettingsButton } from './settings/doctor-schedule-settings-button';
import { useDoctorScheduleDynamicOptions } from '../model/useDoctorScheduleDynamicOptions';
import type { useDoctorScheduleView } from '../model/useDoctorScheduleView';
import type { ConfigurationCategory } from '../model/useDoctorScheduleSettingsModal';

export interface DoctorScheduleMobileFilterToolbarProps {
  scheduleView: ReturnType<typeof useDoctorScheduleView>;
  onOpenSettings?: (category: ConfigurationCategory, subView?: 'defs' | 'operating_days') => void;
  className?: string;
}

export function DoctorScheduleMobileFilterToolbar({
  scheduleView,
  onOpenSettings,
  className
}: DoctorScheduleMobileFilterToolbarProps) {
  const today = useMemo(() => new Date(), []);
  const { facetGroups, activeFilterCount, searchEngine } = useDoctorScheduleDynamicOptions({
    scheduleView
  });

  return (
    <>
      <SearchEngineDialog
        config={searchEngine.config}
        isOpen={searchEngine.isOpen}
        onClose={searchEngine.close}
      />

      <ResponsiveFacetToolbox
        searchQuery={scheduleView.searchQuery}
        onSearchChange={scheduleView.actions.changeSearch}
        searchPlaceholder='Pencarian Dokter...'
        onOpenSearchDialog={searchEngine.open}
        dateFilter={{
          label: 'Tanggal',
          selectedDate: scheduleView.dateFilter,
          onSelectDate: scheduleView.actions.changeDateFilter,
          defaultDate: today,
          resetLabel: 'Kembali ke Hari Ini'
        }}
        facets={facetGroups}
        isFiltered={scheduleView.hasActiveFilters}
        onResetAll={() => {
          searchEngine.clearQuery();
          scheduleView.actions.resetFilters();
        }}
        activeFilterCount={activeFilterCount}
        isCompact={true}
        className={className}
        extraRightSlot={
          <div className='flex items-center gap-1.5 shrink-0'>
            {onOpenSettings && (
              <DoctorScheduleSettingsButton
                onSelectCategory={onOpenSettings}
                forceMode='drawer'
                className='size-8 rounded-md'
              />
            )}
            <DoctorExportButton
              data={scheduleView.doctors}
              variant='icon'
              className='size-8 rounded-md'
            />
          </div>
        }
      />
    </>
  );
}
