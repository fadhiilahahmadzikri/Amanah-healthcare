'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/icons';
import { EntityCardGrid, EntityCardGridSkeleton } from '@/components/cards/master-entity-card';
import { ReplacementCard } from './replacement-card';
import { ReplacementKanbanBoard } from './kanban';
import { ReplacementFilters } from './replacement-filters';
import { ReplacementMobileFilterToolbar } from './replacement-mobile-filter-toolbar';
import { ReplacementDetailModal } from './replacement-detail-modal';
import { AssignReplacementModal } from './assign-replacement-modal';
import { useReplacementManagementPresenter } from '../model';

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

  return (
    <>
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
        {/* Desktop Toolbar */}
        <div className='hidden md:flex items-center justify-between gap-3 shrink-0'>
          <ReplacementFilters
            searchQuery={filters.searchQuery}
            onSearchChange={filters.actions.changeSearch}
            selectedStatuses={filters.statusFilter}
            onSelectedStatusesChange={filters.actions.changeStatusFilter}
            selectedSessions={filters.sessionFilter}
            onSelectedSessionsChange={filters.actions.changeSessionFilter}
            onResetAll={filters.actions.resetFilters}
          />

          <div className='flex items-center gap-2 shrink-0'>
            {/* View Mode Toggle */}
            <div className='flex items-center rounded-lg border border-border/80 p-0.5 bg-muted/30'>
              <Button
                variant={!viewMode.isFlattenMode ? 'secondary' : 'ghost'}
                size='sm'
                onClick={() => viewMode.setPreference('kanban')}
                className='h-7 px-2 text-xs gap-1.5'
                title='Tampilan Papan Kanban'
              >
                <Icons.kanban className='size-3.5' />
                <span>Papan</span>
              </Button>
              <Button
                variant={viewMode.isFlattenMode ? 'secondary' : 'ghost'}
                size='sm'
                onClick={() => viewMode.setPreference('list')}
                className='h-7 px-2 text-xs gap-1.5'
                title='Tampilan Daftar / Grid'
              >
                <Icons.layoutList className='size-3.5' />
                <span>Daftar</span>
              </Button>
            </div>

            {/* Refresh Button */}
            <Button
              variant='outline'
              size='sm'
              onClick={() => void refetch()}
              className='h-8 text-xs gap-1.5'
              title='Muat ulang data'
            >
              <Icons.refresh className='size-3.5 text-primary' />
              <span>Segarkan</span>
            </Button>
          </div>
        </div>

        {/* Mobile Toolbar Dock */}
        <div className='block md:hidden shrink-0'>
          <ReplacementMobileFilterToolbar
            opportunities={opportunities}
            searchQuery={filters.searchQuery}
            onSearchChange={filters.actions.changeSearch}
            selectedStatuses={filters.statusFilter}
            onSelectedStatusesChange={filters.actions.changeStatusFilter}
            selectedSessions={filters.sessionFilter}
            onSelectedSessionsChange={filters.actions.changeSessionFilter}
            onResetAll={filters.actions.resetFilters}
          />
        </div>

        {/* Active Filter Mode Alert Banner (Desktop Only) */}
        {filters.hasActiveFilters && (
          <div className='hidden md:flex items-center justify-between px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs shrink-0 animate-in fade-in duration-200'>
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
            <div className='absolute inset-0 flex overflow-hidden'>
              {/* Mobile Skeleton Feed */}
              <div className='block md:hidden w-full px-1 pb-20 pt-1 space-y-3'>
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
              <div className='block md:hidden absolute inset-0 overflow-hidden'>
                <ScrollArea className='h-full w-full'>
                  <div className='flex flex-col gap-3 pb-24 pt-1 px-1'>
                    {filters.filteredOpportunities.map((item) => (
                      <ReplacementCard
                        key={item.id}
                        opportunity={item}
                        onSelect={detailModal.open}
                        isSelected={detailModal.selectedOpportunity?.id === item.id}
                      />
                    ))}
                  </div>
                </ScrollArea>
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
