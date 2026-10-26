'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/icons';
import { EntityCardGrid, EntityCardGridSkeleton } from '@/components/cards/master-entity-card';
import { ResponsiveFacetToolbox } from '@/shared/ui/responsive-facet-toolbox';
import { SearchEngineDialog } from '@/components/search-engine';
import { useSidebar } from '@/components/ui/sidebar';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { ReplacementCard } from './replacement-card';
import { ReplacementKanbanBoard } from './kanban';
import { ReplacementDetailModal } from './replacement-detail-modal';
import { AssignReplacementModal } from './assign-replacement-modal';
import { useReplacementManagementPresenter } from '../model/useReplacementManagementPresenter';
import { useReplacementDynamicOptions } from '../model/useReplacementDynamicOptions';

export function ReplacementManagementView() {
  const {
    filters,
    opportunities,
    isLoading,
    refetch,
    viewMode,
    detailModal,
    assignModal,
    actions
  } = useReplacementManagementPresenter();

  const { state: sidebarState } = useSidebar();
  const isSidebarExpanded = sidebarState === 'expanded';

  const { isOpen: isUnder1024 } = useMediaQuery('(max-width: 1024px)');
  const { isOpen: isUnder1280 } = useMediaQuery('(max-width: 1280px)');

  // Canonical responsive breakpoint formula from Kehadiran Pegawai:
  // 1. Mobile & tablet viewports (<= 1024px)
  // 2. Expanded sidebar collisions on standard viewports (<= 1280px)
  const isCompact = isUnder1024 || (isUnder1280 && isSidebarExpanded);

  const { facetGroups, activeFilterCount, searchEngine } = useReplacementDynamicOptions({
    filters,
    opportunities
  });

  return (
    <>
      <SearchEngineDialog
        config={searchEngine.config}
        isOpen={searchEngine.isOpen}
        onClose={searchEngine.close}
      />

      {/* Inspection Detail Modal */}
      <ReplacementDetailModal
        replacement={detailModal.selectedOpportunity}
        isOpen={detailModal.isOpen}
        onClose={detailModal.close}
        onOpenAssign={assignModal.open}
        onCancelOpportunity={(id) => actions.cancel(id)}
        isCancelling={actions.isCancelling}
      />

      {/* Admin Assign Modal */}
      <AssignReplacementModal
        opportunity={assignModal.opportunity}
        isOpen={assignModal.isOpen}
        onClose={assignModal.close}
        onAssign={(oppId, staffId, pracId, notes) => actions.assign(oppId, staffId, pracId, notes)}
        isAssigning={actions.isAssigning}
      />

      <div className='flex h-full min-h-0 flex-1 flex-col gap-3.5 select-none'>
        {/* Unified Master Responsive Facet Toolbox (Desktop Inline & Mobile Drawer Sheet) */}
        <ResponsiveFacetToolbox
          searchQuery={filters.searchQuery}
          onSearchChange={filters.actions.changeSearch}
          searchPlaceholder='Cari staf cuti / pengganti...'
          onOpenSearchDialog={searchEngine.open}
          facets={facetGroups}
          isFiltered={filters.hasActiveFilters}
          onResetAll={() => {
            searchEngine.clearQuery();
            filters.actions.resetFilters();
          }}
          activeFilterCount={activeFilterCount}
          isCompact={isCompact}
          extraRightSlot={
            <div className='flex items-center gap-1.5 sm:gap-2 shrink-0'>
              {/* View Mode Toggle: Kanban vs List */}
              <div className='flex items-center rounded-lg border border-border/80 p-0.5 bg-muted/30'>
                <Button
                  variant={!viewMode.isFlattenMode ? 'secondary' : 'ghost'}
                  size={isCompact ? 'icon' : 'sm'}
                  onClick={() => viewMode.setPreference('kanban')}
                  className={cn(isCompact ? 'size-7' : 'h-7 px-2 text-xs gap-1.5')}
                  title='Tampilan Papan Kanban'
                >
                  <Icons.kanban className='size-3.5' />
                  {!isCompact && <span>Papan</span>}
                </Button>
                <Button
                  variant={viewMode.isFlattenMode ? 'secondary' : 'ghost'}
                  size={isCompact ? 'icon' : 'sm'}
                  onClick={() => viewMode.setPreference('list')}
                  className={cn(isCompact ? 'size-7' : 'h-7 px-2 text-xs gap-1.5')}
                  title='Tampilan Daftar / Grid'
                >
                  <Icons.layoutList className='size-3.5' />
                  {!isCompact && <span>Daftar</span>}
                </Button>
              </div>

              {/* Refresh Button */}
              <Button
                variant='outline'
                size={isCompact ? 'icon' : 'sm'}
                onClick={() => void refetch()}
                className={cn(isCompact ? 'size-8 rounded-md' : 'h-8 text-xs gap-1.5')}
                title='Muat ulang data'
                aria-label='Muat ulang data'
              >
                <Icons.refresh className='size-3.5 text-primary' />
                {!isCompact && <span>Segarkan</span>}
              </Button>
            </div>
          }
        />

        {/* Active Filter Mode Alert Banner (Desktop Only) */}
        {filters.hasActiveFilters && !isCompact && (
          <div className='flex items-center justify-between px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs shrink-0 animate-in fade-in duration-200'>
            <div className='flex items-center gap-1.5'>
              <Icons.info className='size-3.5 shrink-0 text-amber-600 dark:text-amber-400' />
              <span>
                Mode filter aktif: Menampilkan {filters.filteredOpportunities.length} peluang
                pengganti dalam tampilan daftar.
              </span>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={filters.actions.resetFilters}
              className='h-6 px-2 text-[11px] text-amber-700 dark:text-amber-400 hover:bg-amber-500/20'
            >
              Reset Filter
            </Button>
          </div>
        )}

        {/* Main Content Area */}
        <div className='relative flex flex-1 min-h-0 flex-col overflow-hidden'>
          {isLoading && opportunities.length === 0 ? (
            <div className='flex flex-1 min-h-0 overflow-hidden'>
              {/* Mobile Skeleton Feed */}
              <div className='block md:hidden flex-1 overflow-y-auto w-full px-1 pb-20 pt-1 space-y-3'>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className='h-[188px] rounded-[22px] bg-muted/20 animate-pulse border border-border/40'
                  />
                ))}
              </div>

              {/* Desktop Skeleton Grid */}
              <div className='hidden md:block w-full'>
                <ScrollArea className='h-full w-full pr-3'>
                  <div className='pb-20 pt-1'>
                    <EntityCardGridSkeleton count={6} />
                  </div>
                </ScrollArea>
              </div>
            </div>
          ) : filters.filteredOpportunities.length === 0 ? (
            <div className='flex flex-1 min-h-0 h-full w-full flex-col'>
              <EmptyState
                icon={Icons.userCheck}
                title='Tidak ada peluang pengganti ditemukan'
                description={
                  filters.hasActiveFilters
                    ? 'Tidak ada peluang dinas pengganti yang sesuai dengan filter atau pencarian.'
                    : 'Belum ada peluang dinas pengganti yang tercatat saat ini.'
                }
                action={
                  filters.hasActiveFilters ? (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={filters.actions.resetFilters}
                      className='h-9 text-xs'
                    >
                      Reset Filter
                    </Button>
                  ) : undefined
                }
                className='h-full w-full flex-1'
              />
            </div>
          ) : (
            <>
              {/* Mobile View: Pure Vertical Card Feed */}
              <div className='block md:hidden flex-1 overflow-y-auto overflow-x-hidden min-h-0 w-full'>
                <div className='flex flex-col gap-3 pb-24 pt-1 px-1 w-full max-w-full'>
                  {filters.filteredOpportunities.map((item) => (
                    <ReplacementCard
                      key={item.id}
                      opportunity={item}
                      onSelect={detailModal.open}
                      isSelected={detailModal.selectedOpportunity?.id === item.id}
                      className='w-full max-w-full'
                    />
                  ))}
                </div>
              </div>

              {/* Desktop View: Kanban Board vs Multi-Column Grid */}
              <div className='hidden md:flex absolute inset-0 overflow-hidden'>
                {viewMode.isFlattenMode ? (
                  <ScrollArea className='h-full w-full pr-3'>
                    <div className='pb-20 pt-1'>
                      <EntityCardGrid>
                        {filters.filteredOpportunities.map((item) => (
                          <ReplacementCard
                            key={item.id}
                            opportunity={item}
                            onSelect={detailModal.open}
                            isSelected={detailModal.selectedOpportunity?.id === item.id}
                          />
                        ))}
                      </EntityCardGrid>
                    </div>
                  </ScrollArea>
                ) : (
                  <ReplacementKanbanBoard
                    opportunities={opportunities}
                    onSelectOpportunity={detailModal.open}
                    selectedOpportunityId={detailModal.selectedOpportunity?.id}
                    onTriggerAssign={assignModal.open}
                    onTriggerCancel={(id) => actions.cancel(id)}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
