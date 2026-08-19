'use client';

import React, { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, parseAsArrayOf, useQueryStates } from 'nuqs';
import { getSortingStateParser } from '@/lib/parsers';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { DefaultBulkActions } from '@/components/ui/table/default-bulk-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { patientsQueryOptions } from '../../api/queries';
import { columns } from './columns';
import type { Patient } from '../../api/types';
import { PatientDetailsModal } from '../patient-details-modal';
import { PatientFormModal } from '../patient-form-modal';

const columnIds = columns.map((c) => c.id).filter(Boolean) as string[];

export function PatientTable() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    patient: parseAsString,
    name: parseAsString,
    search: parseAsString,
    gender: parseAsArrayOf(parseAsString, ','),
    account_status: parseAsArrayOf(parseAsString, ','),
    status: parseAsArrayOf(parseAsString, ','),
    sort: getSortingStateParser(columnIds).withDefault([])
  });

  const querySearch = params.patient || params.name || params.search;
  const queryStatus = params.account_status || params.status;

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(querySearch && { search: querySearch }),
    ...(params.gender && params.gender.length > 0 && { gender: params.gender }),
    ...(queryStatus && queryStatus.length > 0 && { status: queryStatus }),
    ...(params.sort.length > 0 && { sort: JSON.stringify(params.sort) })
  };

  const { data } = useSuspenseQuery(patientsQueryOptions(filters));

  const pageCount = Math.ceil(data.total_patients / params.perPage);

  const { table } = useDataTable({
    data: data.patients,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 300,
    initialState: {
      columnPinning: { left: ['select'], right: ['actions'] }
    }
  });

  const handleRowClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setDetailOpen(true);
  };

  return (
    <>
      <PatientDetailsModal
        patient={selectedPatient}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={(p) => {
          setSelectedPatient(p);
          setDetailOpen(false);
          setEditOpen(true);
        }}
      />

      <PatientFormModal
        patient={selectedPatient}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
      />

      <div className='flex h-full flex-1 flex-col gap-4'>
        <DataTable
          table={table}
          onRowClick={handleRowClick}
          entityName='pasien'
          bulkActions={<DefaultBulkActions />}
        >
          <DataTableToolbar table={table} />
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
