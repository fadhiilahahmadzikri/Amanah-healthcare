'use client';

import React, { useMemo, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, parseAsArrayOf, useQueryStates } from 'nuqs';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { doctorScheduleQueryOptions } from '../../api/queries';
import { getColumns } from './columns';
import { DoctorScheduleDetailModal } from '../doctor-schedule-detail-modal';
import { DoctorScheduleEditModal } from '../doctor-schedule-edit-modal';
import { DoctorExportButton } from '../doctor-export-button';
import type { DoctorSchedule } from '../../api/types';

export function DoctorScheduleTable() {
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorSchedule | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    search: parseAsString,
    poli: parseAsArrayOf(parseAsString, ','),
    status: parseAsArrayOf(parseAsString, ',')
  });

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(params.search && { search: params.search }),
    ...(params.poli && params.poli.length > 0 && { poli: params.poli }),
    ...(params.status && params.status.length > 0 && { status: params.status })
  };

  const { data } = useSuspenseQuery(doctorScheduleQueryOptions(filters));

  const pageCount = Math.ceil(data.total_doctors / params.perPage);

  const columns = useMemo(
    () =>
      getColumns({
        onOpenDetail: (doc) => {
          setSelectedDoctor(doc);
          setDetailOpen(true);
        },
        onOpenEdit: (doc) => {
          setSelectedDoctor(doc);
          setEditOpen(true);
        }
      }),
    []
  );

  const { table } = useDataTable({
    data: data.doctors,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 300,
    initialState: {
      columnPinning: { right: ['actions'] }
    }
  });

  const handleRowClick = (doctor: DoctorSchedule) => {
    setSelectedDoctor(doctor);
    setDetailOpen(true);
  };

  return (
    <>
      <DoctorScheduleDetailModal
        doctor={selectedDoctor}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onOpenEdit={(doc) => {
          setSelectedDoctor(doc);
          setDetailOpen(false);
          setEditOpen(true);
        }}
      />

      <DoctorScheduleEditModal
        doctor={selectedDoctor}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
      />

      <div className='flex h-full flex-1 flex-col gap-4'>
        <DataTable table={table} onRowClick={handleRowClick} entityName='dokter'>
          <DataTableToolbar table={table}>
            <DoctorExportButton data={data.doctors} />
          </DataTableToolbar>
        </DataTable>
      </div>
    </>
  );
}
