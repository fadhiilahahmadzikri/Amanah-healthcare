'use client';

import * as React from 'react';
import { ResponsiveFacetToolbox } from '@/shared/ui/responsive-facet-toolbox';
import { useClinicalHistoryDynamicOptions } from '../../model/useClinicalHistoryDynamicOptions';
import { CLINICAL_HISTORY_TAB, type ClinicalHistoryTabType } from '../../api/history-queries';

export interface ClinicalHistoryMobileFilterToolbarProps {
  activeTab: ClinicalHistoryTabType;
  onSelectTab?: (tab: ClinicalHistoryTabType) => void;
  search: string;
  onSearchChange: (val: string) => void;
  patientId: string;
  onPatientChange: (val: string) => void;
  familyMembers: Array<{
    id: string;
    fullName: string;
    relationshipLabel?: string;
    relationship: string;
  }>;
  hasFilters: boolean;
  onReset: () => void;
  totalMaternal?: number;
  totalImmunization?: number;
  className?: string;
}

export function ClinicalHistoryMobileFilterToolbar({
  activeTab,
  onSelectTab,
  search,
  onSearchChange,
  patientId,
  onPatientChange,
  familyMembers,
  hasFilters: _hasFilters,
  onReset,
  totalMaternal = 0,
  totalImmunization = 0,
  className
}: ClinicalHistoryMobileFilterToolbarProps) {
  const dynamicOptions = useClinicalHistoryDynamicOptions({
    activeTab,
    setActiveTab: onSelectTab ?? (() => {}),
    totalMaternal,
    totalImmunization,
    familyMembers,
    patientId,
    setPatientId: onPatientChange,
    search,
    setSearch: onSearchChange,
    onReset
  });

  const searchPlaceholder =
    activeTab === CLINICAL_HISTORY_TAB.MATERNITY
      ? 'Cari nama ibu atau NIK...'
      : 'Cari nama anak atau NIK...';

  return (
    <ResponsiveFacetToolbox
      searchQuery={search}
      onSearchChange={onSearchChange}
      searchPlaceholder={searchPlaceholder}
      onOpenSearchDialog={dynamicOptions.searchEngine.open}
      facets={dynamicOptions.facetGroups}
      isFiltered={dynamicOptions.isFiltered}
      onResetAll={dynamicOptions.resetAllFilters}
      activeFilterCount={dynamicOptions.activeFilterCount}
      isCompact={true}
      className={className}
    />
  );
}
