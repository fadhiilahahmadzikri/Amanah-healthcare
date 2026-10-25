'use client';

import React from 'react';
import { ResponsiveFacetToolbox } from '@/shared/ui/responsive-facet-toolbox';
import { SearchEngineDialog } from '@/components/search-engine';
import { PayrollExportButton } from './payroll-export-button';
import { PayrollSettingsButton } from './payroll-settings-button';
import { usePayrollDynamicOptions } from '../model/usePayrollDynamicOptions';
import type { UsePayrollPresenterResult } from '../model/usePayrollPresenter';

export interface PayrollMobileFilterToolbarProps {
  presenter: UsePayrollPresenterResult;
  className?: string;
}

export function PayrollMobileFilterToolbar({
  presenter,
  className
}: PayrollMobileFilterToolbarProps) {
  const { payrollView, mutations, actions } = presenter;
  const { facetGroups, activeFilterCount, searchEngine } = usePayrollDynamicOptions({
    payrollView
  });

  return (
    <>
      <SearchEngineDialog
        config={searchEngine.config}
        isOpen={searchEngine.isOpen}
        onClose={searchEngine.close}
      />

      <ResponsiveFacetToolbox
        searchQuery={payrollView.searchQuery}
        onSearchChange={payrollView.actions.changeSearch}
        searchPlaceholder='Pencarian Karyawan...'
        onOpenSearchDialog={searchEngine.open}
        facets={facetGroups}
        isFiltered={payrollView.hasActiveFilters}
        onResetAll={() => {
          searchEngine.clearQuery();
          payrollView.actions.resetFilters();
        }}
        activeFilterCount={activeFilterCount}
        isCompact={true}
        className={className}
        extraRightSlot={
          <div className='flex items-center gap-1.5 shrink-0'>
            {/* Morphed Settings Button placed immediately to the left of Export */}
            <PayrollSettingsButton
              onOpenRates={actions.openRates}
              onReconcileDailyLeave={actions.reconcileDailyLeave}
              onOpenAudit={actions.openAudit}
              onOpenConfirmFinalize={actions.openConfirmFinalize}
              canFinalize={payrollView.currentPeriod?.status === 'calculated'}
              isFinalizing={mutations.isFinalizing}
              isReconciling={mutations.isReconciling}
              forceMode='drawer'
              className='size-8 rounded-md'
            />

            {/* Export Button anchored to the far right */}
            <PayrollExportButton
              data={payrollView.filteredSummaries}
              periodName={payrollView.currentPeriod?.periodName}
              variant='icon'
              className='size-8 rounded-md'
            />
          </div>
        }
      />
    </>
  );
}
