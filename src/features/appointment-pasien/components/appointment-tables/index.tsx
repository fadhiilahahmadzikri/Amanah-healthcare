'use client';

import React, { useMemo } from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { DefaultBulkActions } from '@/components/ui/table/default-bulk-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { useAppointmentTable } from '../../model/useAppointmentTable';
import { useClinicFilterOptions, type Appointment } from '@/features/klinik';
import { AppointmentDetailOrganism } from '@/features/klinik/components/details-modal';
import { adminAppointmentToAppointment } from '../../api/mapper';
import { callPatient, completeService, cancelAppointmentAction } from '../../api/service';
import { useQueryClient } from '@tanstack/react-query';
import { getAppointmentColumns } from './columns';
import { AppointmentRecordModal } from '../appointment-record-modal';
import { AppointmentStatusModal } from '../appointment-status-modal';
import { AppointmentCheckInQrModal } from '../appointment-check-in-qr-modal';
import { ChangeDoctorModal } from '../change-doctor-modal';
import { ChangeRoomModal } from '../change-room-modal';
import { DoctorScheduleDetailSheet } from '@/features/jadwal-dokter/components/doctor-schedule-detail-sheet';
import { useDoctorDetailDrawerStore } from '@/features/jadwal-dokter/model/useDoctorDetailDrawerStore';

export function AppointmentTable() {
  const queryClient = useQueryClient();
  const { poliOptions, serviceOptions, doctorOptions, roomOptions } = useClinicFilterOptions();
  const columns = useMemo(
    () => getAppointmentColumns({ poliOptions, serviceOptions, doctorOptions, roomOptions }),
    [poliOptions, serviceOptions, doctorOptions, roomOptions]
  );
  const columnIds = useMemo(() => columns.map((c) => c.id).filter(Boolean) as string[], [columns]);
  const appointmentTable = useAppointmentTable({ columns, columnIds });

  const adaptedAppointment = useMemo(
    () =>
      appointmentTable.selectedAppointment
        ? adminAppointmentToAppointment(appointmentTable.selectedAppointment)
        : null,
    [appointmentTable.selectedAppointment]
  );

  const handleCallPatient = async (apt: Appointment) => {
    await callPatient(apt.id);
    await queryClient.invalidateQueries({ queryKey: ['appointments'] });
    appointmentTable.actions.closeDetail();
  };

  const handleCompletePatient = async (apt: Appointment) => {
    await completeService(apt.id);
    await queryClient.invalidateQueries({ queryKey: ['appointments'] });
    appointmentTable.actions.closeDetail();
  };

  const handleCancel = async (apt: Appointment, reason?: string) => {
    await cancelAppointmentAction(apt.id, reason);
    await queryClient.invalidateQueries({ queryKey: ['appointments'] });
    appointmentTable.actions.closeDetail();
  };

  const isDoctorDrawerOpen = useDoctorDetailDrawerStore((s) => s.isOpen);
  const closeDoctorDrawer = () => useDoctorDetailDrawerStore.getState().closeDrawer();

  return (
    <>
      <AppointmentRecordModal
        isOpen={appointmentTable.isMilestoneOpen}
        appointment={appointmentTable.selectedAppointment}
        onClose={appointmentTable.actions.closeMilestone}
        onViewPatientDetail={appointmentTable.actions.openPatientDetailFromMilestone}
        onUpdateStatus={appointmentTable.actions.openStatusFromMilestone}
        onChangeDoctor={appointmentTable.actions.openChangeDoctorFromMilestone}
        onChangeRoom={appointmentTable.actions.openChangeRoomFromMilestone}
        onQrCheckIn={appointmentTable.actions.openQrFromMilestone}
      />

      <AppointmentDetailOrganism
        appointment={adaptedAppointment}
        isOpen={appointmentTable.isDetailOpen}
        onClose={appointmentTable.actions.closeDetail}
        onCallPatient={handleCallPatient}
        onCompletePatient={handleCompletePatient}
        onCancel={handleCancel}
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
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
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
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
          }}
        />
      )}

      <AppointmentCheckInQrModal
        appointment={appointmentTable.selectedAppointment}
        isOpen={appointmentTable.isQrOpen}
        onClose={appointmentTable.actions.closeQr}
      />

      <DoctorScheduleDetailSheet
        doctor={null}
        isOpen={isDoctorDrawerOpen}
        onClose={closeDoctorDrawer}
        onOpenEdit={() => {}}
      />

      <div
        aria-busy={appointmentTable.isFetching}
        className={cn(
          'flex h-full min-h-0 flex-1 flex-col gap-4',
          appointmentTable.isFetching && 'opacity-75 transition-opacity'
        )}
      >
        <DataTable
          table={appointmentTable.table}
          onRowClick={appointmentTable.actions.openMilestone}
          entityName='appointment'
          bulkActions={<DefaultBulkActions />}
          emptyState={
            appointmentTable.hasFilters ? (
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
        >
          <DataTableToolbar table={appointmentTable.table} />
        </DataTable>
      </div>
    </>
  );
}

export function AppointmentTableSkeleton() {
  return (
    <div className='flex flex-1 flex-col space-y-4'>
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
        <div className='divide-y divide-border/40'>
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
  );
}
