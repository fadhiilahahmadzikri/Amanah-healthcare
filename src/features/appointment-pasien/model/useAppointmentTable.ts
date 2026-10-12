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
  currentUnitId: string | null;
  currentDoctorId: string | null;
  formattedDate?: string;
  setUnitId: (unitId: string | null) => Promise<unknown>;
  setDoctorId: (doctorId: string | null) => Promise<unknown>;
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

  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    search: parseAsString,
    patientName: parseAsString,
    status: parseAsArrayOf(parseAsString, ','),
    poli: parseAsArrayOf(parseAsString, ','),
    poliklinikName: parseAsArrayOf(parseAsString, ','),
    poliklinikId: parseAsString,
    service: parseAsArrayOf(parseAsString, ','),
    serviceName: parseAsArrayOf(parseAsString, ','),
    layanan: parseAsArrayOf(parseAsString, ','),
    layananName: parseAsArrayOf(parseAsString, ','),
    scheduledDate: parseAsString,
    date: parseAsString,
    doctorId: parseAsString,
    doctorName: parseAsArrayOf(parseAsString, ','),
    roomName: parseAsArrayOf(parseAsString, ','),
    sort: getSortingStateParser<AdminAppointment>(columnIds).withDefault([])
  });

  const querySearch = params.search || params.patientName;
  const queryPoli = params.poli || params.poliklinikName;
  const queryService = params.service || params.serviceName || params.layanan || params.layananName;
  const rawDate = params.date || params.scheduledDate;
  let formattedDate: string | undefined;
  if (rawDate) {
    const num = Number(rawDate);
    if (!Number.isNaN(num) && num > 100000) {
      const d = new Date(num);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      formattedDate = `${y}-${m}-${day}`;
    } else {
      formattedDate = rawDate;
    }
  }

  const hasFilters = Boolean(
    (querySearch && querySearch.trim().length > 0) ||
    (params.status && params.status.length > 0) ||
    params.poliklinikId ||
    (queryPoli && queryPoli.length > 0) ||
    (queryService && queryService.length > 0) ||
    formattedDate ||
    params.doctorId ||
    (params.doctorName && params.doctorName.length > 0) ||
    (params.roomName && params.roomName.length > 0)
  );

  const filters: AppointmentFilters = normalizeFilters({
    page: params.page,
    limit: params.perPage,
    ...(querySearch && { search: querySearch }),
    ...(params.status && params.status.length > 0 && { status: params.status }),
    ...(params.poliklinikId && { poliklinikId: params.poliklinikId }),
    ...(queryPoli && queryPoli.length > 0 && { poli: queryPoli }),
    ...(queryService && queryService.length > 0 && { serviceName: queryService }),
    ...(formattedDate && { date: formattedDate }),
    ...(params.doctorId && { doctorId: params.doctorId }),
    ...(params.doctorName && params.doctorName.length > 0 && { doctorName: params.doctorName }),
    ...(params.roomName && params.roomName.length > 0 && { roomName: params.roomName }),
    ...(params.sort.length > 0 && { sort: JSON.stringify(params.sort) })
  });

  const { data, isFetching } = useSuspenseQuery(appointmentQueryOptions(filters));
  const pageCount = Math.ceil(data.total_appointments / params.perPage);

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

  const { table } = useDataTable({
    data: data.appointments,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 300,
    initialState: {
      columnPinning: { left: ['select'], right: ['actions'] }
    },
    meta: {
      onAssignDoctor: openChangeDoctor,
      onAssignRoom: openChangeRoom
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
    currentUnitId: params.poliklinikId,
    currentDoctorId: params.doctorId,
    formattedDate,
    setUnitId: (unitId: string | null) => setParams({ poliklinikId: unitId, doctorId: null, page: 1 }),
    setDoctorId: (doctorId: string | null) => setParams({ doctorId, page: 1 }),
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
