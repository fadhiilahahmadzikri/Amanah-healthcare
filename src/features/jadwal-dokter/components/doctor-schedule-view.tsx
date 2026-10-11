'use client';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toDateParam, useDoctorScheduleView } from '../model/useDoctorScheduleView';
import { DoctorScheduleFilters } from './doctor-schedule-filters';
import { DoctorScheduleCard } from './doctor-schedule-card';
import { DoctorScheduleDetailSheet } from './doctor-schedule-detail-sheet';
import { DoctorExportButton } from './doctor-export-button';
import { DoctorSchedulePagination } from './doctor-schedule-pagination';
import { DoctorScheduleSettingsButton, DoctorScheduleSettingsModal } from './settings';
import { DoctorAssignmentModal } from './doctor-assignment-modal';
import { useDoctorScheduleSettingsCycle } from '../model/useDoctorScheduleSettingsCycle';
import type { DoctorSchedule } from '../api/types';

export function DoctorScheduleView() {
  const scheduleView = useDoctorScheduleView();
  const settingsCycle = useDoctorScheduleSettingsCycle();
  const [selectedDoctorForAssignment, setSelectedDoctorForAssignment] =
    useState<DoctorSchedule | null>(null);
  const [assignmentFocusedDow, setAssignmentFocusedDow] = useState<number | undefined>(undefined);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  return (
    <>
      <DoctorScheduleDetailSheet
        doctor={scheduleView.selectedDoctor}
        isOpen={scheduleView.isDetailOpen}
        onClose={scheduleView.actions.closeDetail}
        selectedDate={scheduleView.dateFilter ? toDateParam(scheduleView.dateFilter) : undefined}
        onViewDoctorSchedule={scheduleView.actions.openDoctorScheduleById}
        onOpenAssignment={(doc, dow) => {
          setSelectedDoctorForAssignment(doc);
          setAssignmentFocusedDow(dow);
          setIsAssignmentModalOpen(true);
        }}
      />

      <DoctorScheduleSettingsModal cycle={settingsCycle} />

      <DoctorAssignmentModal
        doctor={selectedDoctorForAssignment}
        isOpen={isAssignmentModalOpen}
        focusedDow={assignmentFocusedDow}
        onClose={() => {
          setIsAssignmentModalOpen(false);
          setSelectedDoctorForAssignment(null);
          setAssignmentFocusedDow(undefined);
        }}
      />

      <div className='flex h-full min-h-0 flex-1 flex-col gap-4 select-none'>
        {(scheduleView.totalDoctors > 0 || scheduleView.hasActiveFilters) && (
          <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3'>
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
              <DoctorExportButton data={scheduleView.doctors} />
              <DoctorScheduleSettingsButton
                onSelectCategory={(category, subView) => {
                  settingsCycle.openSettings(category, subView);
                }}
              />
            </div>
          </div>
        )}

        <div className='relative flex flex-1 min-h-0 flex-col overflow-hidden'>
          {scheduleView.isLoading && scheduleView.doctors.length === 0 ? (
            <div className='absolute inset-0 flex overflow-hidden'>
              <ScrollArea className='h-full w-full pr-3'>
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
                <ScrollArea className='h-full w-full pr-3'>
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
                          date={
                            scheduleView.dateFilter
                              ? toDateParam(scheduleView.dateFilter)
                              : undefined
                          }
                          isSelected={Boolean(
                            scheduleView.selectedDoctorId &&
                            (scheduleView.selectedDoctorId === doctor.id ||
                              scheduleView.selectedDoctorId === doctor.practitioner_id)
                          )}
                          onOpenDetail={scheduleView.actions.openDetail}
                          onOpenSettings={(doc) => {
                            setSelectedDoctorForAssignment(doc);
                            setAssignmentFocusedDow(undefined);
                            setIsAssignmentModalOpen(true);
                          }}
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
