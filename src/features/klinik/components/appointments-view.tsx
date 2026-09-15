'use client';

import type { ComponentProps } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useAppointmentsView } from '../model/useAppointmentsView';
import { AppointmentCard } from './appointment-card';
import { AppointmentFilters } from './appointment-filters';
import { AppointmentModal } from './appointment-modal';
import { AppointmentPagination } from './appointment-pagination';
import { DetailsModal } from './details-modal';

type AppointmentModalSubmit = ComponentProps<typeof AppointmentModal>['onSubmit'];

export function AppointmentsView() {
  const appointmentsView = useAppointmentsView();

  const handleFormSubmit: AppointmentModalSubmit = (data, appointmentId) => {
    const result = appointmentsView.actions.submitForm(data, appointmentId);
    if (result.type === 'edit') {
      toast.success('Jadwal janji temu berhasil diperbarui!');
    }
  };

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col gap-4 select-none font-sans'>
      {/* 1. Filter Toolbar Row with Actions */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0'>
        <AppointmentFilters
          searchQuery={appointmentsView.filters.searchQuery}
          onSearchChange={appointmentsView.actions.changeSearch}
          monthFilter={appointmentsView.filters.monthFilter}
          onMonthFilterChange={appointmentsView.actions.changeMonthFilter}
          dateFilter={appointmentsView.filters.dateFilter}
          onDateFilterChange={appointmentsView.actions.changeDateFilter}
          selectedServices={appointmentsView.filters.selectedServices}
          onSelectedServicesChange={appointmentsView.actions.changeSelectedServices}
          selectedStatuses={appointmentsView.filters.selectedStatuses}
          onSelectedStatusesChange={appointmentsView.actions.changeSelectedStatuses}
          onResetAll={appointmentsView.actions.resetFilters}
          className='flex-1'
        />

        <Button
          onClick={appointmentsView.actions.openCreateModal}
          className='shrink-0 text-xs md:text-sm'
        >
          <Icons.add className='mr-2 h-4 w-4' />
          <span>Tambah Janji Temu</span>
        </Button>
      </div>

      {/* 2. Appointments Card Grid with ScrollArea */}
      <div className='relative flex flex-1 min-h-0 flex-col overflow-hidden'>
        <div className='absolute inset-0 flex overflow-hidden'>
          <ScrollArea className='h-full w-full pr-3'>
            <div className='pb-20 pt-1'>
              {appointmentsView.cards.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5'>
                  {appointmentsView.cards.map(({ appointment, doctor }) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      doctor={doctor}
                      onReschedule={appointmentsView.actions.openRescheduleModal}
                      onViewDetails={appointmentsView.actions.openDetailsModal}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Icons.search}
                  title='Tidak ada janji temu ditemukan'
                  description='Data janji temu akan ditampilkan di sini setelah tersedia.'
                  className='min-h-[360px] my-auto'
                />
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Floating Detached Glass Pagination Bar (Backdrop Blur Over Content) */}
        {appointmentsView.filteredCount > 0 ? (
          <div className='absolute bottom-0 inset-x-0 z-20 pointer-events-none flex justify-center'>
            <div className='pointer-events-auto w-full'>
              <AppointmentPagination
                currentPage={appointmentsView.currentPage}
                pageSize={appointmentsView.pageSize}
                totalItems={appointmentsView.filteredCount}
                onPageChange={appointmentsView.actions.changePage}
                onPageSizeChange={appointmentsView.actions.changePageSize}
                pageSizeOptions={[6, 12, 18, 24, 30]}
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Stepper Appointment Modal (Add & Reschedule) */}
      <AppointmentModal
        isOpen={appointmentsView.isFormModalOpen}
        mode={appointmentsView.formModalMode}
        initialAppointment={appointmentsView.selectedAppointment}
        onClose={appointmentsView.actions.closeFormModal}
        onSubmit={handleFormSubmit}
      />

      {/* Summary Details Modal */}
      <DetailsModal
        isOpen={appointmentsView.isDetailsModalOpen}
        appointment={appointmentsView.selectedAppointment}
        onClose={appointmentsView.actions.closeDetailsModal}
        onReschedule={appointmentsView.actions.openRescheduleModal}
      />
    </div>
  );
}
