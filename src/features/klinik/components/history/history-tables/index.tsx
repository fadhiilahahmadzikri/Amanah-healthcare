'use client';

import * as React from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTablePagination } from '@/components/ui/table/data-table-pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { useSidebar } from '@/components/ui/sidebar';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ResponsiveFacetToolbox } from '@/shared/ui/responsive-facet-toolbox';
import { SearchEngineDialog } from '@/components/search-engine';
import { cn } from '@/lib/utils';
import { useClinicalHistoryTable } from '../../../model/useClinicalHistoryTable';
import { useClinicalHistoryDialogs } from '../../../model/useClinicalHistoryDialogs';
import { useClinicalHistoryDynamicOptions } from '../../../model/useClinicalHistoryDynamicOptions';
import { getMaternityColumns } from './maternity-columns';
import { getImmunizationColumns } from './immunization-columns';
import { ClinicalHistoryMobileCards } from '../history-mobile-cards';
import { ClinicalRecordDetailModal } from '../clinical-record-detail-modal';
import { CLINICAL_HISTORY_TAB } from '../../../api/history-queries';

export function ClinicalHistoryTables() {
  const dialogs = useClinicalHistoryDialogs();

  const maternityColumns = React.useMemo(
    () =>
      getMaternityColumns({
        onViewDetail: (id) => dialogs.actions.openDetail(CLINICAL_HISTORY_TAB.MATERNITY, id)
      }),
    [dialogs.actions]
  );

  const immunizationColumns = React.useMemo(
    () =>
      getImmunizationColumns({
        onViewDetail: (id) => dialogs.actions.openDetail(CLINICAL_HISTORY_TAB.IMMUNIZATION, id)
      }),
    [dialogs.actions]
  );

  const tableState = useClinicalHistoryTable({
    maternityColumns,
    immunizationColumns,
    dialogs
  });

  const { state: sidebarState } = useSidebar();
  const isSidebarExpanded = sidebarState === 'expanded';

  const { isOpen: isUnder1024 } = useMediaQuery('(max-width: 1024px)');
  const { isOpen: isUnder1280 } = useMediaQuery('(max-width: 1280px)');

  // Canonical responsive breakpoint formula from Kehadiran Pegawai:
  // 1. Mobile & tablet viewports (<= 1024px)
  // 2. Expanded sidebar collisions on standard viewports (<= 1280px)
  const isCompact = isUnder1024 || (isUnder1280 && isSidebarExpanded);

  const dynamicOptions = useClinicalHistoryDynamicOptions({
    activeTab: tableState.activeTab,
    setActiveTab: tableState.setActiveTab,
    totalMaternal: tableState.totalMaternal,
    totalImmunization: tableState.totalImmunization,
    familyMembers: tableState.familyMembers,
    patientId: tableState.patientId,
    setPatientId: tableState.setPatientId,
    search: tableState.search,
    setSearch: tableState.setSearch,
    maternalRows: tableState.maternalRows,
    immunizationRows: tableState.immunizationRows,
    onReset: tableState.resetFilters
  });

  return (
    <>
      {/* Search Engine Command Dialog (Shared with Kehadiran Pegawai, Jadwal Dokter, Data Pasien) */}
      <SearchEngineDialog
        config={dynamicOptions.searchEngine.config}
        isOpen={dynamicOptions.searchEngine.isOpen}
        onClose={dynamicOptions.searchEngine.close}
      />

      <div
        aria-busy={tableState.isFetching}
        className={cn(
          'flex h-full min-h-0 flex-1 flex-col gap-3 select-none font-sans',
          tableState.isFetching && 'opacity-80 transition-opacity'
        )}
      >
        {/* Master Responsive Facet Toolbox (Desktop Inline & Mobile Drawer Sheet) */}
        <ResponsiveFacetToolbox
          searchQuery={tableState.search}
          onSearchChange={tableState.setSearch}
          searchPlaceholder={
            tableState.activeTab === CLINICAL_HISTORY_TAB.MATERNITY
              ? 'Cari nama ibu atau NIK...'
              : 'Cari nama anak atau NIK...'
          }
          onOpenSearchDialog={dynamicOptions.searchEngine.open}
          facets={dynamicOptions.facetGroups}
          isFiltered={dynamicOptions.isFiltered}
          onResetAll={dynamicOptions.resetAllFilters}
          activeFilterCount={dynamicOptions.activeFilterCount}
          isCompact={isCompact}
        />

        {/* Desktop View: TanStack DataTable */}
        <div className='hidden md:flex min-h-0 flex-1 flex-col'>
          <DataTable
            table={tableState.activeTable as any}
            onRowClick={(row: any) =>
              tableState.dialogs.actions.openDetail(tableState.activeTab, row.id)
            }
            entityName={
              tableState.activeTab === CLINICAL_HISTORY_TAB.MATERNITY
                ? 'riwayat kehamilan'
                : 'riwayat imunisasi'
            }
            emptyState={
              dynamicOptions.isFiltered ? (
                <EmptyState
                  icon={Icons.search}
                  title='Tidak ada riwayat yang cocok'
                  description='Tidak ditemukan riwayat rekam medis dengan filter atau kata kunci pencarian yang dipilih.'
                />
              ) : (
                <EmptyState
                  icon={Icons.history}
                  title={
                    tableState.activeTab === CLINICAL_HISTORY_TAB.MATERNITY
                      ? 'Belum ada riwayat formulir kehamilan'
                      : 'Belum ada riwayat formulir imunisasi'
                  }
                  description='Formulir rekam medis yang telah diisi saat reservasi janji temu akan tercatat di sini.'
                />
              )
            }
          />
        </div>

        {/* Mobile View: Cards Layout matching Kehadiran Pegawai & Data Pasien */}
        <div className='block md:hidden flex-1 overflow-y-auto min-h-0'>
          <ClinicalHistoryMobileCards
            activeTab={tableState.activeTab}
            maternalRecords={tableState.maternalRows}
            immunizationRecords={tableState.immunizationRows}
            hasFilters={dynamicOptions.isFiltered}
            onViewDetail={(type, id) => tableState.dialogs.actions.openDetail(type, id)}
          />
          {tableState.totalActive > 0 && (
            <div className='sticky bottom-0 bg-background pt-2 pb-1 border-t border-border/80 shadow-md z-10'>
              <DataTablePagination table={tableState.activeTable as any} />
            </div>
          )}
        </div>
      </div>

      {/* Centralized Read-Only Detail Modal */}
      <ClinicalRecordDetailModal
        isOpen={tableState.dialogs.isOpen}
        recordType={tableState.dialogs.recordType}
        recordId={tableState.dialogs.recordId}
        onClose={tableState.dialogs.actions.closeDetail}
      />
    </>
  );
}

export function ClinicalHistoryTableSkeleton() {
  return (
    <div className='flex flex-1 flex-col space-y-4'>
      {/* Desktop Toolbar Skeleton */}
      <div className='hidden md:flex items-center justify-between gap-2 p-1'>
        <div className='flex items-center gap-2 flex-1'>
          <Skeleton className='h-8 w-64 rounded-md' />
          <Skeleton className='h-8 w-48 rounded-md' />
        </div>
      </div>

      {/* Desktop Rows Skeleton */}
      <div className='hidden md:block flex-1 overflow-hidden rounded-2xl border border-border/60 bg-card p-4 space-y-3'>
        <div className='flex items-center justify-between border-b border-border/40 pb-3'>
          <Skeleton className='h-4 w-32 rounded-md' />
          <Skeleton className='h-4 w-40 rounded-md' />
          <Skeleton className='h-4 w-24 rounded-md' />
          <Skeleton className='h-4 w-28 rounded-md' />
          <Skeleton className='h-4 w-20 rounded-md' />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className='flex items-center justify-between py-2'>
            <Skeleton className='h-4 w-28 rounded-md' />
            <Skeleton className='h-4 w-44 rounded-md' />
            <Skeleton className='h-5 w-20 rounded-md' />
            <Skeleton className='h-4 w-32 rounded-md' />
            <Skeleton className='h-7 w-24 rounded-full' />
          </div>
        ))}
      </div>

      {/* Mobile Cards Skeleton */}
      <div className='block md:hidden space-y-3 pt-1'>
        <Skeleton className='h-8.5 w-full rounded-xl' />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className='h-36 w-full rounded-2xl' />
        ))}
      </div>
    </div>
  );
}
