'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { DefaultBulkActions } from '@/components/ui/table/default-bulk-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppointmentTable } from '../../model/useAppointmentTable';
import { columns } from './columns';
import { AppointmentDetailModal } from '../appointment-detail-modal';
import { AppointmentStatusModal } from '../appointment-status-modal';

const columnIds = columns.map((c) => c.id).filter(Boolean) as string[];

export function AppointmentTable() {
  const appointmentTable = useAppointmentTable({ columns, columnIds });

  return (
    <>
      <AppointmentDetailModal
        appointment={appointmentTable.selectedAppointment}
        isOpen={appointmentTable.isDetailOpen}
        onClose={appointmentTable.actions.closeDetail}
        onUpdateStatus={appointmentTable.actions.openStatusFromDetail}
      />

      <AppointmentStatusModal
        appointment={appointmentTable.selectedAppointment}
        isOpen={appointmentTable.isStatusOpen}
        onClose={appointmentTable.actions.closeStatus}
      />

      <div className='flex h-full min-h-0 flex-1 flex-col gap-4'>
        <DataTable
          table={appointmentTable.table}
          onRowClick={appointmentTable.actions.openDetail}
          entityName='appointment'
          bulkActions={<DefaultBulkActions />}
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
      {/* Toolbar Skeleton */}
      <div className='flex w-full items-center justify-between gap-2 overflow-auto p-1'>
        <div className='flex flex-1 items-center gap-2'>
          <Skeleton className='h-8 w-56 rounded-md' />
          <Skeleton className='h-8 w-24 border-dashed rounded-md' />
          <Skeleton className='h-8 w-24 border-dashed rounded-md' />
        </div>
        <Skeleton className='h-8 w-20 rounded-md' />
      </div>

      {/* Clean Borderless Table Skeleton matching reference image */}
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
              <Skeleton className='h-4 w-16 rounded-full bg-muted/40' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
