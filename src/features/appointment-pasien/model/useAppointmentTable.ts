'use client';

import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { ColumnDef, Table } from '@tanstack/react-table';
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useDataTable } from '@/hooks/use-data-table';
import { getSortingStateParser } from '@/lib/parsers';
import { appointmentQueryOptions } from '../api/queries';
import type { AdminAppointment, AppointmentFilters } from '../api/types';

interface UseAppointmentTableParams {
  columns: ColumnDef<AdminAppointment>[];
  columnIds: string[];
}

export interface UseAppointmentTableResult {
  table: Table<AdminAppointment>;
  selectedAppointment: AdminAppointment | null;
  isDetailOpen: boolean;
  isStatusOpen: boolean;
  actions: {
    openDetail: (appointment: AdminAppointment) => void;
    closeDetail: () => void;
    openStatus: (appointment: AdminAppointment) => void;
    closeStatus: () => void;
    openStatusFromDetail: (appointment: AdminAppointment) => void;
  };
}

export function useAppointmentTable({
  columns,
  columnIds
}: UseAppointmentTableParams): UseAppointmentTableResult {
  const [selectedAppointment, setSelectedAppointment] = useState<AdminAppointment | null>(null);
  const [activeDialog, setActiveDialog] = useState<'detail' | 'status' | null>(null);

  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    pasien: parseAsString,
    search: parseAsString,
    live_status: parseAsArrayOf(parseAsString, ','),
    status: parseAsArrayOf(parseAsString, ','),
    layanan_poli: parseAsArrayOf(parseAsString, ','),
    poli: parseAsArrayOf(parseAsString, ','),
    sort: getSortingStateParser<AdminAppointment>(columnIds).withDefault([])
  });

  const querySearch = params.pasien || params.search;
  const queryStatus = params.live_status || params.status;
  const queryPoli = params.layanan_poli || params.poli;
  const filters: AppointmentFilters = {
    page: params.page,
    limit: params.perPage,
    ...(querySearch && { search: querySearch }),
    ...(queryStatus && queryStatus.length > 0 && { status: queryStatus }),
    ...(queryPoli && queryPoli.length > 0 && { poli: queryPoli }),
    ...(params.sort.length > 0 && { sort: JSON.stringify(params.sort) })
  };

  const { data } = useSuspenseQuery(appointmentQueryOptions(filters));
  const pageCount = Math.ceil(data.total_appointments / params.perPage);

  const { table } = useDataTable({
    data: data.appointments,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 300,
    initialState: {
      columnPinning: { left: ['select'], right: ['actions'] }
    }
  });

  const openDetail = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setActiveDialog('detail');
  };

  const closeDetail = () => {
    setActiveDialog(null);
  };

  const openStatus = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setActiveDialog('status');
  };

  const closeStatus = () => {
    setActiveDialog(null);
  };

  const openStatusFromDetail = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setActiveDialog('status');
  };

  return {
    table,
    selectedAppointment,
    isDetailOpen: activeDialog === 'detail',
    isStatusOpen: activeDialog === 'status',
    actions: {
      openDetail,
      closeDetail,
      openStatus,
      closeStatus,
      openStatusFromDetail
    }
  };
}
