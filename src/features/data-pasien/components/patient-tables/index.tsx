'use client';

import React, { useMemo } from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { useSidebar } from '@/components/ui/sidebar';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ResponsiveFacetToolbox } from '@/shared/ui/responsive-facet-toolbox';
import { SearchEngineDialog } from '@/components/search-engine';
import { DataTableViewOptions } from '@/components/ui/table/data-table-view-options';
import { usePatientTable } from '../../model/usePatientTable';
import { usePatientDynamicOptions } from '../../model/usePatientDynamicOptions';
import { getPatientColumns } from './columns';
import { usePatientFormReferences } from '../../model/usePatientFormReferences';
import { PatientModal } from '../patient-modal';
import { PatientHistoryModal } from '../patient-history-modal';
import { PatientDeleteDialog } from '../patient-delete-dialog';
import { PatientBulkActions } from './patient-bulk-actions';
import { PatientExportButton } from '../patient-export-button';
import { PatientMobileCards } from '../patient-mobile-cards';

export function PatientTable() {
  const references = usePatientFormReferences();

  const { state: sidebarState } = useSidebar();
  const isSidebarExpanded = sidebarState === 'expanded';

  const { isOpen: isMobile } = useMediaQuery('(max-width: 768px)');
  const { isOpen: isUnder1024 } = useMediaQuery('(max-width: 1024px)');
  const { isOpen: isUnder1280 } = useMediaQuery('(max-width: 1280px)');

  // Canonical responsive breakpoint formula from Kehadiran Pegawai:
  // 1. Mobile & tablet viewports (<= 1024px)
  // 2. Expanded sidebar collisions on standard viewports (<= 1280px)
  const isCompact = isMobile || isUnder1024 || (isUnder1280 && isSidebarExpanded);

  const tableColumns = useMemo(
    () =>
      getPatientColumns({
        genders: references.genders,
        statuses: references.statuses,
        bloodTypes: references.bloodTypes
      }),
    [references.genders, references.statuses, references.bloodTypes]
  );
  const columnIds = useMemo(
    () => tableColumns.map((c) => c.id).filter(Boolean) as string[],
    [tableColumns]
  );

  const patientTable = usePatientTable({ columns: tableColumns, columnIds });

  const selectedRowIds = patientTable.table
    .getFilteredSelectedRowModel()
    .flatRows.map((r) => r.original.id);

  const rows = patientTable.table.getRowModel().rows.map((r) => r.original);

  const {
    searchQuery,
    handleSearchChange,
    facetGroups,
    activeFilterCount,
    isFiltered,
    resetAllFilters,
    searchEngine
  } = usePatientDynamicOptions({
    table: patientTable.table,
    genders: references.genders,
    statuses: references.statuses,
    bloodTypes: references.bloodTypes,
    onReset: patientTable.resetFilters
  });

  if (patientTable.isLoading) {
    return <PatientTableSkeleton />;
  }

  return (
    <>
      {/* Centralized Search Engine Modal */}
      <SearchEngineDialog
        config={searchEngine.config}
        isOpen={searchEngine.isOpen}
        onClose={searchEngine.close}
      />

      {/* 1. Modal Pasien Terpadu (Detail & Edit dengan Unlock Button) */}
      <PatientModal
        key={patientTable.selectedPatient?.id || 'new'}
        patient={patientTable.selectedPatient}
        isOpen={patientTable.isDetailOpen || patientTable.isEditOpen}
        initialMode={patientTable.isEditOpen ? 'edit' : 'view'}
        onClose={() => {
          if (patientTable.isDetailOpen) patientTable.actions.closeDetail();
          if (patientTable.isEditOpen) patientTable.actions.closeEdit();
        }}
      />

      {/* 2. Modal Garis Waktu Riwayat Janji Temu & Form Klinis Terkait */}
      <PatientHistoryModal
        patient={patientTable.selectedPatient}
        isOpen={patientTable.isHistoryOpen}
        onClose={patientTable.actions.closeHistory}
      />

      {/* 3. Dialog Konfirmasi Hapus Pasien Tunggal */}
      <PatientDeleteDialog
        patient={patientTable.selectedPatient}
        isOpen={patientTable.isDeleteOpen}
        onClose={patientTable.actions.closeDelete}
      />

      {/* 4. Dialog Konfirmasi Hapus Pasien Massal (Bulk) */}
      <PatientDeleteDialog
        isOpen={patientTable.isBulkDeleteOpen}
        patientIds={selectedRowIds}
        onClose={patientTable.actions.closeBulkDelete}
        onSuccess={() => patientTable.table.resetRowSelection()}
      />

      <div className='flex h-full min-h-0 flex-1 flex-col gap-3.5'>
        {/* Unified Master Responsive Facet Toolbox (Desktop Inline & Mobile Drawer Sheet) */}
        <ResponsiveFacetToolbox
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          searchPlaceholder='Cari nama, no. RM, NIK pasien...'
          onOpenSearchDialog={searchEngine.open}
          facets={facetGroups}
          isFiltered={isFiltered}
          onResetAll={resetAllFilters}
          activeFilterCount={activeFilterCount}
          isCompact={isCompact}
          extraRightSlot={
            <div className='flex items-center gap-1.5 sm:gap-2 shrink-0'>
              {!isCompact && <DataTableViewOptions table={patientTable.table} />}
              <PatientExportButton
                variant={isCompact ? 'icon' : 'default'}
                className={isCompact ? 'size-8 rounded-md shrink-0' : undefined}
              />
            </div>
          }
        />

        {/* Desktop View: TanStack Table dengan Infinite Scroll Support */}
        <div className='hidden md:flex min-h-0 flex-1 flex-col'>
          <DataTable
            table={patientTable.table}
            onRowClick={patientTable.actions.openDetail}
            entityName='pasien'
            hidePagination={true}
            footerSlot={
              <div
                ref={patientTable.sentinelRef}
                className='border-t border-border/50 bg-background/80 px-4 py-2.5 shadow-md backdrop-blur-xl flex items-center justify-between text-xs text-muted-foreground'
              >
                <span>
                  Menampilkan{' '}
                  <strong className='font-semibold text-foreground'>{rows.length}</strong> dari{' '}
                  {patientTable.totalPatients} hasil pencarian
                </span>
                {patientTable.isFetchingNextPage ? (
                  <div className='flex items-center gap-1.5 text-primary font-medium'>
                    <Icons.spinner className='size-3.5 animate-spin' />
                    <span>Memuat pasien berikutnya...</span>
                  </div>
                ) : !patientTable.hasNextPage ? (
                  <span className='text-muted-foreground/60'>
                    Semua hasil pencarian telah dimuat
                  </span>
                ) : (
                  <span className='text-muted-foreground/60'>
                    Scroll ke bawah untuk memuat otomatis
                  </span>
                )}
              </div>
            }
            bulkActions={
              <PatientBulkActions
                table={patientTable.table}
                onBulkDelete={patientTable.actions.openBulkDelete}
              />
            }
          />
        </div>

        {/* Mobile View: Single-Tone Cards & Action Drawer */}
        <div className='block md:hidden flex-1 overflow-y-auto min-h-0'>
          <PatientMobileCards
            patients={patientTable.activePatients}
            hasFilters={isFiltered}
            onReset={resetAllFilters}
            onRowClick={patientTable.actions.openDetail}
            onViewDetail={patientTable.actions.openDetail}
            onEdit={patientTable.actions.openEdit}
            onViewHistory={patientTable.actions.openHistory}
            onDelete={patientTable.actions.openDelete}
            sentinelRef={patientTable.sentinelRef}
            isFetchingNextPage={patientTable.isFetchingNextPage}
            hasNextPage={patientTable.hasNextPage}
          />
        </div>
      </div>
    </>
  );
}

export function PatientTableSkeleton() {
  return (
    <div className='flex flex-1 flex-col'>
      {/* Desktop Skeleton */}
      <div className='hidden md:flex flex-1 flex-col space-y-4'>
        {/* Toolbar Skeleton */}
        <div className='flex w-full items-center justify-between gap-2 overflow-auto p-1'>
          <div className='flex flex-1 items-center gap-2'>
            <Skeleton className='h-8 w-56 rounded-md' />
            <Skeleton className='h-8 w-24 border-dashed rounded-md' />
            <Skeleton className='h-8 w-24 border-dashed rounded-md' />
          </div>
          <Skeleton className='h-8 w-20 rounded-md' />
        </div>

        {/* Clean Borderless Table Skeleton */}
        <div className='flex-1 overflow-hidden'>
          <div className='border-b border-border/60 px-4 py-3 flex items-center justify-between gap-6'>
            <Skeleton className='size-4 rounded-[4px]' />
            <Skeleton className='h-4 w-20 rounded-md' />
            <Skeleton className='h-4 w-32 rounded-md' />
            <Skeleton className='h-4 w-16 rounded-md' />
            <Skeleton className='h-4 w-16 rounded-md' />
            <Skeleton className='h-4 w-24 rounded-md' />
            <Skeleton className='h-4 w-24 rounded-md' />
            <Skeleton className='h-4 w-16 rounded-md' />
          </div>
          <div className='divide-y divide-border/40'>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className='px-4 py-3.5 flex items-center justify-between gap-6'>
                <Skeleton className='size-4 rounded-[4px]' />
                <Skeleton className='h-4 w-16 rounded-full bg-muted/40' />
                <Skeleton className='h-4 w-36 rounded-full bg-muted/40' />
                <Skeleton className='h-4 w-14 rounded-full bg-muted/40' />
                <Skeleton className='h-4 w-12 rounded-full bg-muted/40' />
                <Skeleton className='h-4 w-20 rounded-full bg-muted/40' />
                <Skeleton className='h-4 w-20 rounded-full bg-muted/40' />
                <Skeleton className='h-4 w-16 rounded-full bg-muted/40' />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Skeleton */}
      <div className='block md:hidden flex-1 space-y-3 pt-1'>
        {/* Mobile Filter Toolbar Skeleton */}
        <div className='flex items-center justify-between gap-2 mb-3'>
          <Skeleton className='h-9 w-full rounded-full' />
          <Skeleton className='size-9 rounded-full shrink-0' />
        </div>

        {/* Mobile Cards Skeleton */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className='w-full rounded-[22px] border border-border/60 bg-card p-4 space-y-3 shadow-2xs'
          >
            <div className='flex items-start justify-between gap-3'>
              <div className='flex items-center gap-3 flex-1'>
                <Skeleton className='size-11 rounded-full shrink-0' />
                <div className='space-y-1.5 flex-1'>
                  <Skeleton className='h-4 w-36 rounded-md' />
                  <Skeleton className='h-3 w-20 rounded-md' />
                </div>
              </div>
              <Skeleton className='h-5 w-14 rounded-full' />
            </div>
            <Skeleton className='h-8 w-full rounded-xl' />
            <div className='flex items-center justify-between pt-2 border-t border-border/40'>
              <Skeleton className='h-3 w-28 rounded-md' />
              <div className='flex items-center gap-1.5'>
                <Skeleton className='size-8 rounded-md' />
                <Skeleton className='h-8 w-16 rounded-full' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
