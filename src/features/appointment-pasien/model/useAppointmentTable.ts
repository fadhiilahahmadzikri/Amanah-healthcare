'use client';

import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { ColumnDef, Table } from '@tanstack/react-table';
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useDataTable } from '@/hooks/use-data-table';
import { getSortingStateParser } from '@/lib/parsers';
import { appointmentQueryOptions } from '../api/queries';
import { normalizeFilters, type AdminAppointment, type AppointmentFilters } from '../api/types';

interface UseAppointmentTableParams {
  columns: ColumnDef<AdminAppointment>[];
  columnIds: string[];
}

export interface UseAppointmentTableResult {
  table: Table<AdminAppointment>;
  selectedAppointment: AdminAppointment | null;
  isDetailOpen: boolean;
  isStatusOpen: boolean;
  isFetching: boolean;
  totalAppointments: number;
  hasFilters: boolean;
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
  const [returnToDetail, setReturnToDetail] = useState(false);

  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    search: parseAsString,
    patientName: parseAsString,
    status: parseAsArrayOf(parseAsString, ','),
    poli: parseAsArrayOf(parseAsString, ','),
    poliklinikName: parseAsArrayOf(parseAsString, ','),
    service: parseAsArrayOf(parseAsString, ','),
    serviceName: parseAsArrayOf(parseAsString, ','),
    layanan: parseAsArrayOf(parseAsString, ','),
    layananName: parseAsArrayOf(parseAsString, ','),
    sort: getSortingStateParser<AdminAppointment>(columnIds).withDefault([])
  });

  const querySearch = params.search || params.patientName;
  const queryPoli = params.poli || params.poliklinikName;
  const queryService = params.service || params.serviceName || params.layanan || params.layananName;
  const hasFilters = Boolean(
    (querySearch && querySearch.trim().length > 0) ||
    (params.status && params.status.length > 0) ||
    (queryPoli && queryPoli.length > 0) ||
    (queryService && queryService.length > 0)
  );

  const filters: AppointmentFilters = normalizeFilters({
    page: params.page,
    limit: params.perPage,
    ...(querySearch && { search: querySearch }),
    ...(params.status && params.status.length > 0 && { status: params.status }),
    ...(queryPoli && queryPoli.length > 0 && { poli: queryPoli }),
    ...(queryService && queryService.length > 0 && { serviceName: queryService }),
    ...(params.sort.length > 0 && { sort: JSON.stringify(params.sort) })
  });

  const { data, isFetching } = useSuspenseQuery(appointmentQueryOptions(filters));
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
    setReturnToDetail(false);
    setActiveDialog('detail');
  };

  const closeDetail = () => {
    setReturnToDetail(false);
    setActiveDialog(null);
  };

  const openStatus = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setReturnToDetail(false);
    setActiveDialog('status');
  };

  const closeStatus = () => {
    if (returnToDetail) {
      setReturnToDetail(false);
      setActiveDialog('detail');
    } else {
      setActiveDialog(null);
    }
  };

  const openStatusFromDetail = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setReturnToDetail(true);
    setActiveDialog('status');
  };

  return {
    table,
    selectedAppointment,
    isDetailOpen: activeDialog === 'detail',
    isStatusOpen: activeDialog === 'status',
    isFetching,
    totalAppointments: data.total_appointments,
    hasFilters,
    actions: {
      openDetail,
      closeDetail,
      openStatus,
      closeStatus,
      openStatusFromDetail
    }
  };
}
