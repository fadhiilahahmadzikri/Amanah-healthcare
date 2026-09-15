'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useDoctorScheduleView } from '../model/useDoctorScheduleView';
import { DoctorScheduleFilters } from './doctor-schedule-filters';
import { DoctorScheduleCard } from './doctor-schedule-card';
import { DoctorScheduleDetailSheet } from './doctor-schedule-detail-sheet';
import { DoctorScheduleEditModal } from './doctor-schedule-edit-modal';
import { DoctorExportButton } from './doctor-export-button';
import { DoctorSchedulePagination } from './doctor-schedule-pagination';

export function DoctorScheduleView() {
  const scheduleView = useDoctorScheduleView();

  return (
    <>
      {/* 1. Detail Sheet */}
      <DoctorScheduleDetailSheet
        doctor={scheduleView.selectedDoctor}
        isOpen={scheduleView.isDetailOpen}
        onClose={scheduleView.actions.closeDetail}
        onOpenEdit={scheduleView.actions.openEditFromDetail}
      />

      {/* 2. Edit Modal */}
      <DoctorScheduleEditModal
        doctor={scheduleView.selectedDoctor}
        isOpen={scheduleView.isEditOpen}
        onClose={scheduleView.actions.closeEdit}
      />

      {/* 3. Main Workspace Container */}
      <div className='flex h-full min-h-0 flex-1 flex-col gap-4 select-none'>
        {/* Toolbar Header (Search, Filters, Export) - Only rendered when data exists or filters are active */}
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
            </div>
          </div>
        )}

        {/* Doctor Schedules Card Grid with ScrollArea */}
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
                          onOpenDetail={scheduleView.actions.openDetail}
                          onOpenEdit={scheduleView.actions.openEdit}
                        />
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </div>

              {/* Floating Detached Glass Pagination Bar (Backdrop Blur Over Content) */}
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
