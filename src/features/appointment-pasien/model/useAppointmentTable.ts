'use client';

import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { ColumnDef, Table } from '@tanstack/react-table';
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useDataTable } from '@/hooks/use-data-table';
import { getSortingStateParser } from '@/lib/parsers';
import { appointmentQueryOptions } from '../api/queries';
import { normalizeFilters, type AdminAppointment, type AppointmentFilters } from '../api/types';

export type AppointmentDialogType =
  | 'milestone'
  | 'patientDetail'
  | 'status'
  | 'changeDoctor'
  | 'changeRoom'
  | 'qr'
  | null;

interface UseAppointmentTableParams {
  columns: ColumnDef<AdminAppointment>[];
  columnIds: string[];
}

export interface UseAppointmentTableResult {
  table: Table<AdminAppointment>;
  selectedAppointment: AdminAppointment | null;
  activeDialog: AppointmentDialogType;
  isMilestoneOpen: boolean;
  isDetailOpen: boolean;
  isStatusOpen: boolean;
  isChangeDoctorOpen: boolean;
  isChangeRoomOpen: boolean;
  isQrOpen: boolean;
  isFetching: boolean;
  totalAppointments: number;
  hasFilters: boolean;
  actions: {
    openMilestone: (appointment: AdminAppointment) => void;
    closeMilestone: () => void;
    openDetail: (appointment: AdminAppointment) => void;
    closeDetail: () => void;
    openStatus: (appointment: AdminAppointment) => void;
    closeStatus: () => void;
    openChangeDoctor: (appointment: AdminAppointment) => void;
    closeChangeDoctor: () => void;
    openChangeRoom: (appointment: AdminAppointment) => void;
    closeChangeRoom: () => void;
    openQr: (appointment: AdminAppointment) => void;
    closeQr: () => void;
    openPatientDetailFromMilestone: () => void;
    openStatusFromMilestone: () => void;
    openChangeDoctorFromMilestone: () => void;
    openChangeRoomFromMilestone: () => void;
    openQrFromMilestone: () => void;
  };
}

export function useAppointmentTable({
  columns,
  columnIds
}: UseAppointmentTableParams): UseAppointmentTableResult {
  const [selectedAppointment, setSelectedAppointment] = useState<AdminAppointment | null>(null);
  const [activeDialog, setActiveDialog] = useState<AppointmentDialogType>(null);
  const [returnToMilestone, setReturnToMilestone] = useState(false);

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

  const openMilestone = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setReturnToMilestone(false);
    setActiveDialog('milestone');
  };

  const closeMilestone = () => {
    setReturnToMilestone(false);
    setActiveDialog(null);
  };

  const openDetail = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setReturnToMilestone(false);
    setActiveDialog('patientDetail');
  };

  const closeDetail = () => {
    if (returnToMilestone) {
      setReturnToMilestone(false);
      setActiveDialog('milestone');
    } else {
      setActiveDialog(null);
    }
  };

  const openStatus = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setReturnToMilestone(false);
    setActiveDialog('status');
  };

  const closeStatus = () => {
    if (returnToMilestone) {
      setReturnToMilestone(false);
      setActiveDialog('milestone');
    } else {
      setActiveDialog(null);
    }
  };

  const openChangeDoctor = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setReturnToMilestone(false);
    setActiveDialog('changeDoctor');
  };

  const closeChangeDoctor = () => {
    if (returnToMilestone) {
      setReturnToMilestone(false);
      setActiveDialog('milestone');
    } else {
      setActiveDialog(null);
    }
  };

  const openChangeRoom = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setReturnToMilestone(false);
    setActiveDialog('changeRoom');
  };

  const closeChangeRoom = () => {
    if (returnToMilestone) {
      setReturnToMilestone(false);
      setActiveDialog('milestone');
    } else {
      setActiveDialog(null);
    }
  };

  const openQr = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setReturnToMilestone(false);
    setActiveDialog('qr');
  };

  const closeQr = () => {
    if (returnToMilestone) {
      setReturnToMilestone(false);
      setActiveDialog('milestone');
    } else {
      setActiveDialog(null);
    }
  };

  const openPatientDetailFromMilestone = () => {
    setReturnToMilestone(true);
    setActiveDialog('patientDetail');
  };

  const openStatusFromMilestone = () => {
    setReturnToMilestone(true);
    setActiveDialog('status');
  };

  const openChangeDoctorFromMilestone = () => {
    setReturnToMilestone(true);
    setActiveDialog('changeDoctor');
  };

  const openChangeRoomFromMilestone = () => {
    setReturnToMilestone(true);
    setActiveDialog('changeRoom');
  };

  const openQrFromMilestone = () => {
    setReturnToMilestone(true);
    setActiveDialog('qr');
  };

  return {
    table,
    selectedAppointment,
    activeDialog,
    isMilestoneOpen: activeDialog === 'milestone',
    isDetailOpen: activeDialog === 'patientDetail',
    isStatusOpen: activeDialog === 'status',
    isChangeDoctorOpen: activeDialog === 'changeDoctor',
    isChangeRoomOpen: activeDialog === 'changeRoom',
    isQrOpen: activeDialog === 'qr',
    isFetching,
    totalAppointments: data.total_appointments,
    hasFilters,
    actions: {
      openMilestone,
      closeMilestone,
      openDetail,
      closeDetail,
      openStatus,
      closeStatus,
      openChangeDoctor,
      closeChangeDoctor,
      openChangeRoom,
      closeChangeRoom,
      openQr,
      closeQr,
      openPatientDetailFromMilestone,
      openStatusFromMilestone,
      openChangeDoctorFromMilestone,
      openChangeRoomFromMilestone,
      openQrFromMilestone
    }
  };
}
