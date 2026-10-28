'use client';

import React from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { useSidebar } from '@/components/ui/sidebar';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ResponsiveFacetToolbox } from '@/shared/ui/responsive-facet-toolbox';
import { SearchEngineDialog } from '@/components/search-engine';
import { DataTableViewOptions } from '@/components/ui/table/data-table-view-options';
import { useMedicalHistoryTable } from '../../model/useMedicalHistoryTable';
import { PatientHistoryGridModal } from '../patient-history-grid-modal';
import { MedicalHistoryExportButton } from '../medical-history-export-button';
import { MedicalHistoryMobileCards } from '../medical-history-mobile-cards';

export function MedicalHistoryTable() {
  const {
    table,
    patients,
    searchQuery,
    handleSearchChange,
    searchEngine,
    facetGroups,
    activeFilterCount,
    isFiltered,
    resetAllFilters,
    selectedPatient,
    isGridModalOpen,
    openPatientHistory,
    closePatientHistory,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    totalPatients: _totalPatients,
    sentinelRef
  } = useMedicalHistoryTable();

  const { state: sidebarState } = useSidebar();
  const isSidebarExpanded = sidebarState === 'expanded';

  const { isOpen: isUnder1024 } = useMediaQuery('(max-width: 1024px)');
  const { isOpen: isUnder1280 } = useMediaQuery('(max-width: 1280px)');

  // Canonical responsive breakpoint formula:
  // 1. Mobile & tablet viewports (<= 1024px)
  // 2. Expanded sidebar collisions on standard viewports (<= 1280px)
  const isCompact = isUnder1024 || (isUnder1280 && isSidebarExpanded);

  // Desktop table scroll container reference for fetch-when-scroll paradigm
  const desktopContainerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const container = desktopContainerRef.current;
    if (!container) return;

    const viewport = container.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');
    if (!viewport) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      if (scrollHeight - scrollTop - clientHeight < 300) {
        if (hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      }
    };

    viewport.addEventListener('scroll', handleScroll, { passive: true });
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <MedicalHistoryTableSkeleton />;
  }

  return (
    <>
      {/* Centralized Search Engine Modal */}
      <SearchEngineDialog
        config={searchEngine.config}
        isOpen={searchEngine.isOpen}
        onClose={searchEngine.close}
      />

      {/* Modal Level 1: Grid Kunjungan Pasien dengan Pemilih Bulan Mengambang & Kartu Minimalis */}
      <PatientHistoryGridModal
        isOpen={isGridModalOpen}
        patient={selectedPatient}
        onClose={closePatientHistory}
      />

      <div className='flex h-full min-h-0 flex-1 flex-col gap-3.5 font-sans'>
        {/* Unified Master Responsive Facet Toolbox */}
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
              {!isCompact && <DataTableViewOptions table={table} />}
              <MedicalHistoryExportButton
                variant={isCompact ? 'icon' : 'default'}
                className={isCompact ? 'size-8 rounded-md shrink-0' : undefined}
              />
            </div>
          }
        />

        {/* Desktop View: TanStack Table dengan Pohon Afiliasi dan Fetch When Scroll */}
        <div ref={desktopContainerRef} className='hidden md:flex min-h-0 flex-1 flex-col'>
          <DataTable
            table={table}
            onRowClick={openPatientHistory}
            entityName='riwayat medis pasien'
            hidePagination={true}
            footerSlot={
              isFetchingNextPage ? (
                <div className='mx-auto mb-3 flex items-center gap-2 rounded-full border border-border/60 bg-background/95 px-4 py-1.5 shadow-md backdrop-blur-md text-xs font-medium text-foreground animate-in fade-in zoom-in-95 duration-150'>
                  <Icons.spinner className='size-3.5 animate-spin text-primary' />
                  <span>Memuat riwayat pasien berikutnya...</span>
                </div>
              ) : null
            }
          />
        </div>

        {/* Mobile View: Kartu Responsif Tunggal & Deck Afiliasi dengan Fetch When Scroll */}
        <div
          className='block md:hidden flex-1 overflow-y-auto min-h-0'
          onScroll={(e) => {
            const target = e.currentTarget;
            if (target.scrollHeight - target.scrollTop - target.clientHeight < 300) {
              if (hasNextPage && !isFetchingNextPage) {
                void fetchNextPage();
              }
            }
          }}
        >
          <MedicalHistoryMobileCards
            patients={patients}
            hasFilters={isFiltered}
            onReset={resetAllFilters}
            onOpenHistory={openPatientHistory}
            sentinelRef={sentinelRef}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
          />
        </div>
      </div>
    </>
  );
}

export function MedicalHistoryTableSkeleton() {
  return (
    <div className='flex flex-1 flex-col font-sans'>
      {/* Desktop Skeleton */}
      <div className='hidden md:flex flex-1 flex-col space-y-4'>
        <div className='flex w-full items-center justify-between gap-2 overflow-auto p-1'>
          <div className='flex flex-1 items-center gap-2'>
            <Skeleton className='h-8 w-56 rounded-md' />
            <Skeleton className='h-8 w-24 border-dashed rounded-md' />
            <Skeleton className='h-8 w-24 border-dashed rounded-md' />
          </div>
          <Skeleton className='h-8 w-20 rounded-md' />
        </div>

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
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className='h-36 w-full rounded-[22px]' />
        ))}
      </div>
    </div>
  );
}
