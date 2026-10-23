'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/icons';
import { EntityCardGrid, EntityCardGridSkeleton } from '@/components/cards/master-entity-card';
import { LeaveCard } from './leave-card';
import { LeaveDetailModal } from './leave-detail-modal';
import { LeaveSettingsModal } from './leave-settings-modal';
import { LeaveSettingsButton } from './leave-settings-button';
import { LeaveManagementFilters } from './leave-management-filters';
import { LeaveMobileFilterToolbar } from './leave-mobile-filter-toolbar';
import { ReplacementOpportunitiesModal } from './replacement-opportunities-modal';
import { useLeaveManagementPresenter } from '../model';

export function LeaveManagementView() {
  const { filters, leaves, isLoading, detailModal, settingsModal, replacementOpportunitiesModal } =
    useLeaveManagementPresenter();

  return (
    <>
      <LeaveDetailModal
        leave={detailModal.selectedLeave}
        isOpen={detailModal.isOpen}
        onClose={detailModal.close}
      />

      <LeaveSettingsModal
        isOpen={settingsModal.isOpen}
        category={settingsModal.category}
        onClose={settingsModal.close}
      />

      <ReplacementOpportunitiesModal
        isOpen={replacementOpportunitiesModal.isOpen}
        onClose={replacementOpportunitiesModal.close}
      />

      <div className='flex h-full min-h-0 flex-1 flex-col gap-4 select-none'>
        {/* Desktop Toolbar: Filters on the left, Action buttons on the right */}
        <div className='hidden md:flex items-center justify-between gap-3 shrink-0'>
          <LeaveManagementFilters
            searchQuery={filters.searchQuery}
            onSearchChange={filters.actions.changeSearch}
            selectedStatuses={filters.statusFilter}
            onSelectedStatusesChange={filters.actions.changeStatusFilter}
            selectedStaffTypes={filters.staffTypeFilter}
            onSelectedStaffTypesChange={filters.actions.changeStaffTypeFilter}
            selectedLeaveTypes={filters.leaveTypeFilter}
            onSelectedLeaveTypesChange={filters.actions.changeLeaveTypeFilter}
            onResetAll={filters.actions.resetFilters}
          />
          <div className='flex items-center gap-2 shrink-0'>
            <Button
              variant='outline'
              size='sm'
              onClick={replacementOpportunitiesModal.open}
              className='h-8 text-xs gap-1.5'
            >
              <Icons.clock className='size-3.5 text-primary' />
              <span>Peluang Pengganti</span>
            </Button>
            <LeaveSettingsButton
              onSelectCategory={settingsModal.open}
              activeCategory={settingsModal.category}
            />
          </div>
        </div>

        {/* Mobile Toolbar Dock */}
        <div className='block md:hidden shrink-0'>
          <LeaveMobileFilterToolbar
            leaves={leaves}
            searchQuery={filters.searchQuery}
            onSearchChange={filters.actions.changeSearch}
            selectedStatuses={filters.statusFilter}
            onSelectedStatusesChange={filters.actions.changeStatusFilter}
            selectedStaffTypes={filters.staffTypeFilter}
            onSelectedStaffTypesChange={filters.actions.changeStaffTypeFilter}
            selectedLeaveTypes={filters.leaveTypeFilter}
            onSelectedLeaveTypesChange={filters.actions.changeLeaveTypeFilter}
            onResetAll={filters.actions.resetFilters}
            onOpenReplacementModal={replacementOpportunitiesModal.open}
            onOpenSettingsModal={settingsModal.open}
          />
        </div>

        {/* Main Content Area: Direct Leave Card Grid */}
        <div className='relative flex flex-1 min-h-0 flex-col overflow-hidden'>
          {isLoading && filters.filteredLeaves.length === 0 ? (
            <div className='absolute inset-0 flex overflow-hidden'>
              <ScrollArea className='h-full w-full pr-0 md:pr-3'>
                <div className='pb-20 pt-1'>
                  <EntityCardGridSkeleton count={6} />
                </div>
              </ScrollArea>
            </div>
          ) : filters.filteredLeaves.length === 0 ? (
            <div className='flex flex-1 min-h-0 h-full w-full flex-col'>
              <EmptyState
                icon={Icons.calendar}
                title='Tidak ada permohonan izin ditemukan'
                description={
                  filters.hasActiveFilters
                    ? 'Tidak ada permohonan yang sesuai dengan filter atau kata kunci pencarian.'
                    : 'Belum ada permohonan izin staf yang tercatat.'
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
            <div className='absolute inset-0 flex overflow-hidden'>
              <ScrollArea className='h-full w-full pr-0 md:pr-3'>
                <div className='pb-20 pt-1'>
                  <EntityCardGrid>
                    {filters.filteredLeaves.map((leave) => (
                      <LeaveCard
                        key={leave.id}
                        leave={leave}
                        onSelect={detailModal.open}
                        isSelected={detailModal.selectedLeave?.id === leave.id}
                      />
                    ))}
                  </EntityCardGrid>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
