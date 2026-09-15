'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { DefaultBulkActions } from '@/components/ui/table/default-bulk-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { usePatientTable } from '../../model/usePatientTable';
import { columns } from './columns';
import { PatientDetailsModal } from '../patient-details-modal';
import { PatientFormModal } from '../patient-form-modal';

const columnIds = columns.map((c) => c.id).filter(Boolean) as string[];

export function PatientTable() {
  const patientTable = usePatientTable({ columns, columnIds });

  return (
    <>
      <PatientDetailsModal
        patient={patientTable.selectedPatient}
        isOpen={patientTable.isDetailOpen}
        onClose={patientTable.actions.closeDetail}
        onEdit={patientTable.actions.openEditFromDetail}
      />

      <PatientFormModal
        patient={patientTable.selectedPatient}
        isOpen={patientTable.isEditOpen}
        onClose={patientTable.actions.closeEdit}
      />

      <div className='flex h-full flex-1 flex-col gap-4'>
        <DataTable
          table={patientTable.table}
          onRowClick={patientTable.actions.openDetail}
          entityName='pasien'
          bulkActions={<DefaultBulkActions />}
        >
          <DataTableToolbar table={patientTable.table} />
        </DataTable>
      </div>
    </>
  );
}

export function PatientTableSkeleton() {
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

      {/* Clean Borderless Table Skeleton */}
      <div className='flex-1 overflow-hidden'>
        <div className='border-b border-border/60 px-4 py-3 flex items-center justify-between gap-6'>
          <Skeleton className='size-4 rounded-[4px]' />
          <Skeleton className='h-4 w-20 rounded-md' />
          <Skeleton className='h-4 w-32 rounded-md' />
          <Skeleton className='h-4 w-16 rounded-md' />
          <Skeleton className='h-4 w-16 rounded-md' />
          <Skeleton className='h-4 w-24 rounded-md' />
          <Skeleton className='h-4 w-24 rounded-md' />
          <Skeleton className='h-4 w-16 rounded-md' />
        </div>
        <div className='divide-y divide-border/40'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className='px-4 py-3.5 flex items-center justify-between gap-6'>
              <Skeleton className='size-4 rounded-[4px]' />
              <Skeleton className='h-4 w-16 rounded-full bg-muted/40' />
              <Skeleton className='h-4 w-36 rounded-full bg-muted/40' />
              <Skeleton className='h-4 w-14 rounded-full bg-muted/40' />
              <Skeleton className='h-4 w-12 rounded-full bg-muted/40' />
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
