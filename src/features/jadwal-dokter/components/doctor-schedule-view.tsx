'use client';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { InviteDoctorModal } from '@/features/staff-management';
import { useDoctorSchedulePresenter } from '../model/useDoctorSchedulePresenter';
import { DoctorScheduleFilters } from './doctor-schedule-filters';
import { DoctorScheduleMobileFilterToolbar } from './doctor-schedule-mobile-filter-toolbar';
import { DoctorScheduleCard } from './doctor-schedule-card';
import { DoctorScheduleDetailSheet } from './doctor-schedule-detail-sheet';
import { DoctorExportButton } from './doctor-export-button';
import { DoctorSchedulePagination } from './doctor-schedule-pagination';
import { DoctorScheduleSettingsButton, DoctorScheduleSettingsModal } from './settings';
import { DoctorAssignmentModal } from './doctor-assignment-modal';

export function DoctorScheduleView() {
  const { scheduleView, settingsCycle, assignmentModal, selectedDateParam, actions } =
    useDoctorSchedulePresenter();
  const [isInviteDoctorOpen, setIsInviteDoctorOpen] = useState(false);

  return (
    <>
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

      <InviteDoctorModal
        isOpen={isInviteDoctorOpen}
        onClose={() => setIsInviteDoctorOpen(false)}
        onSuccess={() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }}
      />

      <div className='flex h-full min-h-0 flex-1 flex-col gap-4 select-none'>
        {(scheduleView.totalDoctors > 0 || scheduleView.hasActiveFilters) && (
          <>
            {/* Desktop Filter Toolbar Row */}
            <div className='hidden md:flex items-center justify-between gap-3 shrink-0'>
              <DoctorScheduleFilters
                searchQuery={scheduleView.searchQuery}
                onSearchChange={scheduleView.actions.changeSearch}
                monthFilter={scheduleView.monthFilter}
                onMonthFilterChange={scheduleView.actions.changeMonthFilter}
                dateFilter={scheduleView.dateFilter}
                onDateFilterChange={scheduleView.actions.changeDateFilter}
                selectedPoli={scheduleView.selectedPoli}
                onSelectedPoliChange={scheduleView.actions.changeSelectedPoli}
                selectedStatuses={scheduleView.selectedStatuses}
                onSelectedStatusesChange={scheduleView.actions.changeSelectedStatuses}
                onResetAll={scheduleView.actions.resetFilters}
                className='flex-1'
              />

              <div className='flex items-center gap-2 shrink-0'>
                <Button
                  onClick={() => setIsInviteDoctorOpen(true)}
                  size='sm'
                  className='h-9 gap-1.5'
                >
                  <Icons.userPlus className='h-4 w-4' />
                  Tambah Dokter
                </Button>
                <DoctorExportButton data={scheduleView.doctors} />
                <DoctorScheduleSettingsButton onSelectCategory={actions.openConfiguration} />
              </div>
            </div>

            {/* Mobile Filter Toolbar Dock */}
            <div className='block md:hidden shrink-0'>
              <DoctorScheduleMobileFilterToolbar
                scheduleView={scheduleView}
                onOpenSettings={actions.openConfiguration}
              />
            </div>
          </>
        )}

        <div className='relative flex flex-1 min-h-0 flex-col overflow-hidden'>
          {scheduleView.isLoading && scheduleView.doctors.length === 0 ? (
            <div className='absolute inset-0 flex overflow-hidden'>
              <ScrollArea className='h-full w-full pr-0 md:pr-3'>
                <div className='pb-20 pt-1'>
                  <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5'>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className='h-[340px] rounded-[24px] bg-muted/20 animate-pulse border border-border/40'
                      />
                    ))}
                  </div>
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
            <>
              <div className='absolute inset-0 flex overflow-hidden'>
                <ScrollArea className='h-full w-full pr-0 md:pr-3'>
                  <div
                    className={cn(
                      'transition-opacity duration-150 pb-20 pt-1',
                      scheduleView.isFetching && 'opacity-75'
                    )}
                  >
                    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5'>
                      {scheduleView.doctors.map((doctor) => (
                        <DoctorScheduleCard
                          key={doctor.id}
                          doctor={doctor}
                          date={selectedDateParam}
                          isSelected={Boolean(
                            scheduleView.selectedDoctorId &&
                            (scheduleView.selectedDoctorId === doctor.id ||
                              scheduleView.selectedDoctorId === doctor.practitioner_id)
                          )}
                          onOpenDetail={scheduleView.actions.openDetail}
                          onOpenSettings={actions.openSettingsForDoctor}
                        />
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </div>

              {scheduleView.totalDoctors > 0 ? (
                <div className='absolute bottom-0 inset-x-0 z-20 pointer-events-none flex justify-center'>
                  <div className='pointer-events-auto w-full'>
                    <DoctorSchedulePagination
                      currentPage={scheduleView.page}
                      pageSize={scheduleView.pageSize}
                      totalItems={scheduleView.totalDoctors}
                      onPageChange={scheduleView.actions.changePage}
                      onPageSizeChange={scheduleView.actions.changePageSize}
                      pageSizeOptions={[6, 12, 18, 24, 30]}
                    />
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </>
  );
}
