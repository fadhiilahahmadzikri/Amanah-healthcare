'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EntityCardGrid, EntityCardGridSkeleton } from '@/components/cards/master-entity-card';
import { ResponsiveFacetToolbox } from '@/shared/ui/responsive-facet-toolbox';
import { SearchEngineDialog } from '@/components/search-engine';
import { useSidebar } from '@/components/ui/sidebar';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { doctorScheduleKeys } from '../api/query-keys';
import { useDoctorSchedulePresenter } from '../model/useDoctorSchedulePresenter';
import { useDoctorScheduleDynamicOptions } from '../model/useDoctorScheduleDynamicOptions';
import { DoctorAssignmentModal } from './doctor-assignment-modal';
import { DoctorExportButton } from './doctor-export-button';
import { StaffProfileModal } from '@/features/staff-management';
import { DoctorScheduleCard } from './doctor-schedule-card';
import { DoctorScheduleDetailSheet } from './doctor-schedule-detail-sheet';
import { DoctorScheduleSettingsButton, DoctorScheduleSettingsModal } from './settings';
import type { DoctorSchedule } from '../api/types';

export function DoctorScheduleView() {
  const queryClient = useQueryClient();
  const { scheduleView, settingsCycle, assignmentModal, selectedDateParam, actions } =
    useDoctorSchedulePresenter();
  const [selectedDoctorForModal, setSelectedDoctorForModal] = useState<DoctorSchedule | null>(null);

  const { state: sidebarState } = useSidebar();
  const isSidebarExpanded = sidebarState === 'expanded';

  const { isOpen: _isMobile } = useMediaQuery('(max-width: 768px)');
  const { isOpen: isUnder1024 } = useMediaQuery('(max-width: 1024px)');
  const { isOpen: isUnder1280 } = useMediaQuery('(max-width: 1280px)');

  // Responsively triggers facet sidebar mode (Sheet on right):
  // 1. Mobile & tablet viewports (<= 1024px)
  // 2. When app sidebar is expanded on standard desktop viewports <= 1280px
  const isCompact = isUnder1024 || (isUnder1280 && isSidebarExpanded);

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

      <StaffProfileModal
        doctor={selectedDoctorForModal}
        isOpen={Boolean(selectedDoctorForModal)}
        onClose={() => setSelectedDoctorForModal(null)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: doctorScheduleKeys.all });
        }}
      />
      <DoctorScheduleDetailSheet
        doctor={scheduleView.selectedDoctor}
        isOpen={scheduleView.isDetailOpen}
        onClose={scheduleView.actions.closeDetail}
        selectedDate={selectedDateParam}
        onViewDoctorSchedule={scheduleView.actions.openDoctorScheduleById}
        onOpenAssignment={actions.openAssignment}
      />

      <DoctorScheduleSettingsModal cycle={settingsCycle} />

      <DoctorAssignmentModal
        doctor={assignmentModal.doctor}
        isOpen={assignmentModal.isOpen}
        focusedDow={assignmentModal.focusedDow}
        onClose={assignmentModal.close}
      />

      <div className='flex h-full min-h-0 flex-1 flex-col gap-4 select-none'>
        {(scheduleView.totalDoctors > 0 || scheduleView.hasActiveFilters) && (
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
            isCompact={isCompact}
            extraRightSlot={
              <div className='flex items-center gap-1.5 sm:gap-2 shrink-0'>
                <DoctorScheduleSettingsButton
                  onSelectCategory={actions.openConfiguration}
                  forceMode={isCompact ? 'drawer' : undefined}
                  className={isCompact ? 'size-8 rounded-md' : 'h-8 w-8'}
                />
                <DoctorExportButton
                  data={scheduleView.doctors}
                  variant={isCompact ? 'icon' : 'full'}
                  className={isCompact ? 'size-8 rounded-md' : undefined}
                />
              </div>
            }
          />
        )}

        <div className='relative flex flex-1 min-h-0 flex-col overflow-hidden'>
          {scheduleView.isLoading && scheduleView.doctors.length === 0 ? (
            <div className='absolute inset-0 flex overflow-hidden'>
              <ScrollArea className='h-full w-full pr-0 md:pr-3'>
                <div className='pb-20 pt-1'>
                  <EntityCardGridSkeleton count={10} />
                </div>
              </ScrollArea>
            </div>
          ) : scheduleView.doctors.length === 0 ? (
            <div className='flex flex-1 min-h-0 h-full w-full flex-col'>
              <EmptyState
                icon={Icons.calendar}
                title='Tidak ada jadwal dokter ditemukan'
                description='Belum ada jadwal dokter yang tersedia atau silakan sesuaikan kata kunci pencarian dan filter aktif Anda.'
                action={
                  scheduleView.hasActiveFilters ? (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={scheduleView.actions.resetFilters}
                      className='text-xs'
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
                <div
                  className={cn(
                    'transition-opacity duration-150 pb-20 pt-1',
                    scheduleView.isFetching && 'opacity-75'
                  )}
                >
                  <EntityCardGrid>
                    {scheduleView.doctors.map((doctor) => (
                      <DoctorScheduleCard
                        key={doctor.id}
                        doctor={doctor}
                        date={selectedDateParam}
                        isSelected={Boolean(
                          scheduleView.selectedDoctorId &&
                          (scheduleView.selectedDoctorId === doctor.id ||
                            scheduleView.selectedDoctorId === doctor.practitionerId)
                        )}
                        onCardClick={(doc) => setSelectedDoctorForModal(doc)}
                        onOpenDetail={scheduleView.actions.openDetail}
                        onOpenSettings={actions.openSettingsForDoctor}
                      />
                    ))}
                  </EntityCardGrid>

                  {/* Infinite scroll sentinel */}
                  <div ref={scheduleView.sentinelRef} className='h-4 w-full' />
                  {scheduleView.isFetchingNextPage && (
                    <div className='flex items-center justify-center py-6'>
                      <Icons.spinner className='size-6 animate-spin text-primary' />
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
