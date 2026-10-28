'use client';

import React, { useMemo } from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { DefaultBulkActions } from '@/components/ui/table/default-bulk-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ResponsiveFacetToolbox } from '@/shared/ui/responsive-facet-toolbox';
import { SearchEngineDialog } from '@/components/search-engine';
import { DataTableViewOptions } from '@/components/ui/table/data-table-view-options';
import { useAppointmentTable } from '../../model/useAppointmentTable';
import { useAppointmentDynamicOptions } from '../../model/useAppointmentDynamicOptions';
import { useClinicFilterOptions, type Appointment } from '@/features/klinik';
import type { Option } from '@/types/data-table';
import { AppointmentDetailOrganism } from '@/features/klinik/components/details-modal';
import { adminAppointmentToAppointment } from '../../api/mapper';
import { callPatient, completeService, cancelAppointmentAction } from '../../api/service';
import { appointmentKeys, queueNavigationQueryOptions } from '../../api/queries';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { getAppointmentColumns } from './columns';
import { AppointmentRecordModal } from '../appointment-record-modal';
import { AppointmentTimelineModal } from '../appointment-timeline-modal';
import { AppointmentStatusModal } from '../appointment-status-modal';
import { AppointmentCheckInQrModal } from '../appointment-check-in-qr-modal';
import { ChangeDoctorModal } from '../change-doctor-modal';
import { ChangeRoomModal } from '../change-room-modal';
import { ReservationModal } from '@/features/klinik/components/reservation/reservation-modal';
import { AppointmentMobileCards } from '../appointment-mobile-cards';
import { AppointmentActionDrawer } from '../appointment-action-drawer';
import { AppointmentExportButton } from '../appointment-export-button';
import { AppointmentCardsSkeleton } from '@/features/klinik/components/appointment-cards-skeleton';
import type { AdminAppointment } from '../../api/types';

export function AppointmentTable() {
  const queryClient = useQueryClient();
  const { poliOptions, serviceOptions, doctorOptions, roomOptions } = useClinicFilterOptions();

  const { state: sidebarState } = useSidebar();
  const isSidebarExpanded = sidebarState === 'expanded';

  const { isOpen: isUnder1024 } = useMediaQuery('(max-width: 1024px)');
  const { isOpen: isUnder1280 } = useMediaQuery('(max-width: 1280px)');

  // Canonical responsive breakpoint formula from Kehadiran Pegawai:
  // 1. Mobile & tablet viewports (<= 1024px)
  // 2. Expanded sidebar collisions on standard viewports (<= 1280px)
  const isCompact = isUnder1024 || (isUnder1280 && isSidebarExpanded);

  const [dateParam] = React.useState<string | undefined>(undefined);
  const [actionDrawerAppointment, setActionDrawerAppointment] =
    React.useState<AdminAppointment | null>(null);
  const { data: navigationData } = useSuspenseQuery(
    queueNavigationQueryOptions({ date: dateParam })
  );

  const [initialUnitAssigned, setInitialUnitAssigned] = React.useState(false);

  // Dynamic doctor options based on active unit, including 'unassigned' option with badge count
  const dynamicDoctorOptions = useMemo<Option[]>(() => {
    if (!navigationData?.units || navigationData.units.length === 0) return doctorOptions;

    const list: Option[] = [];
    const activeUnit = navigationData.units[0];

    // Opsi: Belum Ditugaskan
    if (activeUnit.unassignedCount > 0) {
      list.push({
        label: 'Belum Ditugaskan',
        value: 'unassigned',
        count: activeUnit.unassignedCount,
        icon: Icons.userX
      });
    }

    // Opsi: Masing-masing dokter aktif pada unit
    activeUnit.doctors.forEach((doc) => {
      list.push({
        label: doc.name,
        value: doc.id,
        count: doc.totalAppointments,
        icon: Icons.stethoscope
      });
    });

    return list.length > 0 ? list : doctorOptions;
  }, [navigationData, doctorOptions]);

  const columns = useMemo(
    () =>
      getAppointmentColumns({
        poliOptions,
        serviceOptions,
        doctorOptions: dynamicDoctorOptions,
        roomOptions
      }),
    [poliOptions, serviceOptions, dynamicDoctorOptions, roomOptions]
  );
  const columnIds = useMemo(() => columns.map((c) => c.id).filter(Boolean) as string[], [columns]);
  const appointmentTable = useAppointmentTable({ columns, columnIds });
  const { currentUnitId, setUnitId } = appointmentTable;

  React.useEffect(() => {
    if (
      !initialUnitAssigned &&
      !currentUnitId &&
      navigationData?.units &&
      navigationData.units.length > 0
    ) {
      setInitialUnitAssigned(true);
      void setUnitId(navigationData.units[0].id);
    }
  }, [initialUnitAssigned, currentUnitId, navigationData, setUnitId]);

  const {
    searchQuery,
    handleSearchChange,
    dateFilterConfig,
    facetGroups,
    activeFilterCount,
    isFiltered,
    resetAllFilters,
    searchEngine
  } = useAppointmentDynamicOptions({
    table: appointmentTable.table,
    doctorOptions: dynamicDoctorOptions,
    roomOptions,
    serviceOptions,
    units: navigationData?.units,
    currentUnitId: appointmentTable.currentUnitId,
    onSelectUnit: (unitId) => void appointmentTable.setUnitId(unitId),
    onReset: appointmentTable.resetFilters
  });

  const adaptedAppointment = useMemo(
    () =>
      appointmentTable.selectedAppointment
        ? adminAppointmentToAppointment(appointmentTable.selectedAppointment)
        : null,
    [appointmentTable.selectedAppointment]
  );

  const handleCallPatient = async (apt: Appointment) => {
    await callPatient(apt.id);
    await queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    appointmentTable.actions.closeDetail();
  };

  const handleCompletePatient = async (apt: Appointment) => {
    await completeService(apt.id);
    await queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    appointmentTable.actions.closeDetail();
  };

  const handleCancel = async (apt: Appointment, reason?: string) => {
    await cancelAppointmentAction(apt.id, reason);
    await queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    appointmentTable.actions.closeDetail();
  };

  const rows = appointmentTable.table.getRowModel().rows.map((r) => r.original);

  return (
    <>
      {/* Centralized Search Engine Modal */}
      <SearchEngineDialog
        config={searchEngine.config}
        isOpen={searchEngine.isOpen}
        onClose={searchEngine.close}
      />

      {/* Centralized Modals: Mounted once at feature root to avoid unmount clashes */}
      <AppointmentRecordModal
        isOpen={appointmentTable.isRecordDetailOpen}
        appointment={appointmentTable.selectedAppointment}
        onClose={appointmentTable.actions.closeRecordDetail}
        onViewPatientDetail={appointmentTable.actions.openPatientDetailFromRecord}
        onViewTimeline={appointmentTable.actions.openTimelineFromRecord}
        onUpdateStatus={appointmentTable.actions.openStatusFromRecord}
        onChangeDoctor={appointmentTable.actions.openChangeDoctorFromRecord}
        onChangeRoom={appointmentTable.actions.openChangeRoomFromRecord}
        onQrCheckIn={appointmentTable.actions.openQrFromRecord}
        onReschedule={appointmentTable.actions.openRescheduleFromRecord}
        onCancel={() => {
          appointmentTable.actions.closeRecordDetail();
          if (appointmentTable.selectedAppointment) {
            appointmentTable.actions.openDetail(appointmentTable.selectedAppointment);
          }
        }}
        onOpenActionDrawer={() => {
          if (appointmentTable.selectedAppointment) {
            setActionDrawerAppointment(appointmentTable.selectedAppointment);
          }
        }}
      />

      <AppointmentTimelineModal
        isOpen={appointmentTable.isTimelineOpen}
        appointment={appointmentTable.selectedAppointment}
        onClose={appointmentTable.actions.closeTimeline}
        onUpdateStatus={appointmentTable.actions.openStatusFromRecord}
        onQrCheckIn={appointmentTable.actions.openQrFromRecord}
      />

      <AppointmentDetailOrganism
        appointment={adaptedAppointment}
        isOpen={appointmentTable.isDetailOpen}
        onClose={appointmentTable.actions.closeDetail}
        onCallPatient={handleCallPatient}
        onCompletePatient={handleCompletePatient}
        onCancel={handleCancel}
        onOpenActionDrawer={() => {
          if (appointmentTable.selectedAppointment) {
            setActionDrawerAppointment(appointmentTable.selectedAppointment);
          }
        }}
      />

      {/* Centralized Action Drawer for Mobile (Cards, Record Detail, & Patient Detail) */}
      <AppointmentActionDrawer
        isOpen={Boolean(actionDrawerAppointment)}
        appointment={actionDrawerAppointment}
        onClose={() => setActionDrawerAppointment(null)}
        onAssignDoctor={appointmentTable.actions.openChangeDoctor}
        onAssignRoom={appointmentTable.actions.openChangeRoom}
        onUpdateStatus={appointmentTable.actions.openStatus}
        onQrCheckIn={appointmentTable.actions.openQr}
        onReschedule={appointmentTable.actions.openReschedule}
        onViewRecord={appointmentTable.actions.openRecordDetail}
        onViewTimeline={appointmentTable.actions.openTimeline}
        onViewPatientDetail={appointmentTable.actions.openDetail}
        onCancel={appointmentTable.actions.openDetail}
      />

      <AppointmentStatusModal
        appointment={appointmentTable.selectedAppointment}
        isOpen={appointmentTable.isStatusOpen}
        onClose={appointmentTable.actions.closeStatus}
      />

      {appointmentTable.selectedAppointment && (
        <ChangeDoctorModal
          isOpen={appointmentTable.isChangeDoctorOpen}
          appointmentId={appointmentTable.selectedAppointment.id}
          patientName={appointmentTable.selectedAppointment.patientName}
          patientId={appointmentTable.selectedAppointment.patientId}
          queueNumber={appointmentTable.selectedAppointment.queueNumber}
          currentDoctorName={appointmentTable.selectedAppointment.doctorName || undefined}
          appointmentDate={appointmentTable.selectedAppointment.scheduledDate}
          appointmentTime={appointmentTable.selectedAppointment.scheduledStartTime}
          onClose={appointmentTable.actions.closeChangeDoctor}
          onSuccess={() => {
            appointmentTable.actions.closeChangeDoctor();
            queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
          }}
        />
      )}

      {appointmentTable.selectedAppointment && (
        <ChangeRoomModal
          isOpen={appointmentTable.isChangeRoomOpen}
          appointmentId={appointmentTable.selectedAppointment.id}
          patientName={appointmentTable.selectedAppointment.patientName}
          patientId={appointmentTable.selectedAppointment.patientId}
          queueNumber={appointmentTable.selectedAppointment.queueNumber}
          currentRoomName={appointmentTable.selectedAppointment.roomName || undefined}
          appointmentDate={appointmentTable.selectedAppointment.scheduledDate}
          appointmentTime={appointmentTable.selectedAppointment.scheduledStartTime}
          onClose={appointmentTable.actions.closeChangeRoom}
          onSuccess={() => {
            appointmentTable.actions.closeChangeRoom();
            queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
          }}
        />
      )}

      <AppointmentCheckInQrModal
        appointment={appointmentTable.selectedAppointment}
        isOpen={appointmentTable.isQrOpen}
        onClose={appointmentTable.actions.closeQr}
        onViewPatientDetail={appointmentTable.actions.openPatientDetailFromQr}
      />

      {appointmentTable.selectedAppointment && (
        <ReservationModal
          isOpen={appointmentTable.isRescheduleOpen}
          context={{
            patientId: appointmentTable.selectedAppointment.patientId || '',
            patientName: appointmentTable.selectedAppointment.patientName,
            serviceName: appointmentTable.selectedAppointment.layananName ?? undefined,
            poliklinikId: appointmentTable.selectedAppointment.poliklinikId ?? undefined,
            mode: 'reschedule',
            appointmentId: String(appointmentTable.selectedAppointment.id),
            currentDate: appointmentTable.selectedAppointment.scheduledDate,
            currentSession: appointmentTable.selectedAppointment.session ?? undefined,
            queueNumber: appointmentTable.selectedAppointment.queueNumber
          }}
          onClose={appointmentTable.actions.closeReschedule}
          onSuccess={() => {
            appointmentTable.actions.closeReschedule();
            queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
          }}
        />
      )}

      <div
        aria-busy={appointmentTable.isFetching}
        className={cn(
          'flex h-full min-h-0 flex-1 flex-col gap-3.5',
          appointmentTable.isFetching && 'opacity-80 transition-opacity'
        )}
      >
        {/* Unified Master Responsive Facet Toolbox (Desktop Inline & Mobile Drawer Sheet) */}
        <ResponsiveFacetToolbox
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          searchPlaceholder='Cari pasien, no antrean, dokter...'
          onOpenSearchDialog={searchEngine.open}
          dateFilter={dateFilterConfig}
          facets={facetGroups}
          isFiltered={isFiltered}
          onResetAll={resetAllFilters}
          activeFilterCount={activeFilterCount}
          isCompact={isCompact}
          extraRightSlot={
            <div className='flex items-center gap-1.5 sm:gap-2 shrink-0'>
              {!isCompact && <DataTableViewOptions table={appointmentTable.table} />}
              <AppointmentExportButton
                variant={isCompact ? 'icon' : 'full'}
                className={isCompact ? 'size-8 rounded-md shrink-0' : undefined}
              />
            </div>
          }
        />

        {/* Level 3 Desktop View: TanStack Table */}
        <div className='hidden md:flex min-h-0 flex-1 flex-col overflow-y-auto'>
          <DataTable
            table={appointmentTable.table}
            onRowClick={appointmentTable.actions.openRecordDetail}
            entityName='appointment'
            hidePagination
            bulkActions={<DefaultBulkActions />}
            emptyState={
              isFiltered ? (
                <EmptyState
                  title='Tidak ada antrean yang cocok'
                  description='Tidak ditemukan antrean janji temu dengan filter atau kata kunci pencarian yang dipilih.'
                />
              ) : (
                <EmptyState
                  title='Belum ada antrean janji temu'
                  description='Data janji temu dan reservasi pasien akan ditampilkan di sini setelah didaftarkan.'
                />
              )
            }
          />
          <div ref={appointmentTable.sentinelRef} className='h-4 w-full shrink-0' />
          {appointmentTable.isFetchingNextPage && (
            <div className='flex items-center justify-center p-3'>
              <Icons.spinner className='size-4 animate-spin text-primary' />
              <span className='ml-2 text-xs text-muted-foreground'>
                Memuat antrean berikutnya...
              </span>
            </div>
          )}
        </div>

        {/* Level 3 Mobile View: Card-Based Layout Mengikuti Janji Temu Pasien */}
        <div className='block md:hidden flex-1 overflow-y-auto min-h-0'>
          <AppointmentMobileCards
            appointments={rows}
            hasFilters={isFiltered}
            onRowClick={appointmentTable.actions.openRecordDetail}
            onAssignDoctor={appointmentTable.actions.openChangeDoctor}
            onAssignRoom={appointmentTable.actions.openChangeRoom}
            onUpdateStatus={appointmentTable.actions.openStatus}
            onQrCheckIn={appointmentTable.actions.openQr}
            onReschedule={appointmentTable.actions.openReschedule}
            onViewDetail={appointmentTable.actions.openDetail}
            onViewTimeline={appointmentTable.actions.openTimeline}
            onOpenActionDrawer={setActionDrawerAppointment}
          />
          <div ref={appointmentTable.sentinelRef} className='h-4 w-full shrink-0' />
          {appointmentTable.isFetchingNextPage && (
            <div className='flex items-center justify-center p-3'>
              <Icons.spinner className='size-4 animate-spin text-primary' />
              <span className='ml-2 text-xs text-muted-foreground'>
                Memuat antrean berikutnya...
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function AppointmentTableSkeleton() {
  return (
    <>
      {/* Desktop Table Skeleton (Hidden on Mobile) */}
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
            <Skeleton className='h-4 w-24 rounded-md' />
            <Skeleton className='h-4 w-20 rounded-md' />
            <Skeleton className='h-4 w-28 rounded-md' />
            <Skeleton className='h-4 w-20 rounded-md' />
            <Skeleton className='h-4 w-16 rounded-md' />
            <Skeleton className='h-4 w-24 rounded-md' />
            <Skeleton className='h-4 w-20 rounded-md' />
            <Skeleton className='h-4 w-20 rounded-md' />
            <Skeleton className='h-4 w-16 rounded-md' />
          </div>
          <div className='divide-y border-border/40'>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className='px-4 py-3.5 flex items-center justify-between gap-6'>
                <Skeleton className='size-4 rounded-[4px]' />
                <Skeleton className='h-4 w-20 rounded-full bg-muted/40' />
                <Skeleton className='h-4 w-16 rounded-full bg-muted/40' />
                <Skeleton className='h-4 w-32 rounded-full bg-muted/40' />
                <Skeleton className='h-4 w-20 rounded-full bg-muted/40' />
                <Skeleton className='h-4 w-14 rounded-full bg-muted/40' />
                <Skeleton className='h-4 w-24 rounded-full bg-muted/40' />
                <Skeleton className='h-4 w-20 rounded-full bg-muted/40' />
                <Skeleton className='h-4 w-20 rounded-full bg-muted/40' />
                <Skeleton className='h-4 w-16 rounded-full bg-muted/40' />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Card Skeleton (Visible on Mobile Only) */}
      <div className='block md:hidden flex-1 space-y-3 pt-1'>
        <div className='flex items-center justify-between gap-2'>
          <Skeleton className='h-8.5 flex-1 rounded-xl' />
          <div className='flex items-center gap-1'>
            <Skeleton className='size-8.5 rounded-xl' />
            <Skeleton className='size-8.5 rounded-xl' />
            <Skeleton className='size-8.5 rounded-xl' />
          </div>
        </div>
        <AppointmentCardsSkeleton count={4} className='grid grid-cols-1 gap-3.5' />
      </div>
    </>
  );
}
