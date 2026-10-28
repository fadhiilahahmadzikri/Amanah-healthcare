'use client';

import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { ColumnDef, Table } from '@tanstack/react-table';
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useDataTable } from '@/hooks/use-data-table';
import { getSortingStateParser } from '@/lib/parsers';
import { appointmentInfiniteQueryOptions } from '../api/queries';
import { normalizeFilters, type AdminAppointment, type AppointmentFilters } from '../api/types';
import {
  useAppointmentDialogs,
  type AppointmentDialogType,
  type UseAppointmentDialogsResult
} from './useAppointmentDialogs';

export type { AppointmentDialogType };

interface UseAppointmentTableParams {
  columns: ColumnDef<AdminAppointment>[];
  columnIds: string[];
}

export interface UseAppointmentTableResult {
  table: Table<AdminAppointment>;
  selectedAppointment: AdminAppointment | null;
  activeDialog: AppointmentDialogType;
  dialogs: UseAppointmentDialogsResult;
  isRecordDetailOpen: boolean;
  isTimelineOpen: boolean;
  isMilestoneOpen: boolean;
  isDetailOpen: boolean;
  isStatusOpen: boolean;
  isChangeDoctorOpen: boolean;
  isChangeRoomOpen: boolean;
  isQrOpen: boolean;
  isRescheduleOpen: boolean;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  totalAppointments: number;
  hasFilters: boolean;
  currentUnitId: string | null;
  currentDoctorId: string | null;
  formattedDate?: string;
  setUnitId: (unitId: string | null) => Promise<unknown>;
  setDoctorId: (doctorId: string | null) => Promise<unknown>;
  resetFilters: () => void;
  actions: {
    openRecordDetail: (appointment: AdminAppointment) => void;
    closeRecordDetail: () => void;
    openTimeline: (appointment: AdminAppointment) => void;
    closeTimeline: () => void;
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
    openReschedule: (appointment: AdminAppointment) => void;
    closeReschedule: () => void;
    openPatientDetailFromRecord: () => void;
    openTimelineFromRecord: () => void;
    openPatientDetailFromMilestone: () => void;
    openPatientDetailFromQr: () => void;
    openStatusFromRecord: () => void;
    openChangeDoctorFromRecord: () => void;
    openChangeRoomFromRecord: () => void;
    openQrFromRecord: () => void;
    openRescheduleFromRecord: () => void;
    openStatusFromMilestone: () => void;
    openChangeDoctorFromMilestone: () => void;
    openChangeRoomFromMilestone: () => void;
    openQrFromMilestone: () => void;
    openRescheduleFromMilestone: () => void;
  };
}

export function useAppointmentTable({
  columns,
  columnIds
}: UseAppointmentTableParams): UseAppointmentTableResult {
  const dialogs = useAppointmentDialogs();

  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(20),
    search: parseAsString,
    status: parseAsArrayOf(parseAsString, ','),
    poliklinikId: parseAsString,
    poliklinikName: parseAsArrayOf(parseAsString, ','),
    serviceName: parseAsArrayOf(parseAsString, ','),
    date: parseAsString,
    doctorId: parseAsString,
    doctorName: parseAsArrayOf(parseAsString, ','),
    roomName: parseAsArrayOf(parseAsString, ','),
    sort: getSortingStateParser<AdminAppointment>(columnIds).withDefault([])
  });

  const querySearch = params.search?.trim();
  const queryPoli = params.poliklinikName;
  const queryService = params.serviceName;
  const rawDate = params.date;
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

  const hasFilters = [
    querySearch && querySearch.length > 0,
    params.status && params.status.length > 0,
    params.poliklinikId,
    queryPoli && queryPoli.length > 0,
    queryService && queryService.length > 0,
    formattedDate,
    params.doctorId,
    params.doctorName && params.doctorName.length > 0,
    params.roomName && params.roomName.length > 0
  ].some(Boolean);

  const filters: AppointmentFilters = normalizeFilters({
    page: 1,
    limit: 20,
    ...(querySearch && { search: querySearch }),
    ...(params.status && params.status.length > 0 && { status: params.status }),
    ...(params.poliklinikId && { poliklinikId: params.poliklinikId }),
    ...(queryPoli && queryPoli.length > 0 && { poliklinikName: queryPoli }),
    ...(queryService && queryService.length > 0 && { serviceName: queryService }),
    ...(formattedDate && { date: formattedDate }),
    ...(params.doctorId && { doctorId: params.doctorId }),
    ...(params.doctorName && params.doctorName.length > 0 && { doctorName: params.doctorName }),
    ...(params.roomName && params.roomName.length > 0 && { roomName: params.roomName }),
    ...(params.sort.length > 0 && { sort: JSON.stringify(params.sort) })
  });

  const infiniteQuery = useInfiniteQuery(appointmentInfiniteQueryOptions(filters));

  const appointments = useMemo(() => {
    if (!infiniteQuery.data?.pages) return [];
    return infiniteQuery.data.pages.flatMap((page) => page.appointments || []);
  }, [infiniteQuery.data?.pages]);

  const totalAppointments = useMemo(() => {
    return infiniteQuery.data?.pages[0]?.total_appointments ?? appointments.length;
  }, [infiniteQuery.data?.pages, appointments.length]);

  // Sentinel intersection observer for continuous infinite scrolling
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (
        target?.isIntersecting &&
        infiniteQuery.hasNextPage &&
        !infiniteQuery.isFetchingNextPage
      ) {
        void infiniteQuery.fetchNextPage();
      }
    },
    [infiniteQuery]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !infiniteQuery.hasNextPage) return;

    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: '200px',
      threshold: 0.1
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver, infiniteQuery.hasNextPage]);

  const { table } = useDataTable({
    data: appointments,
    columns,
    pageCount: 1,
    shallow: true,
    debounceMs: 300,
    initialState: {
      columnPinning: { left: ['select'], right: ['actions'] }
    },
    meta: {
      onAssignDoctor: dialogs.actions.openChangeDoctor,
      onAssignRoom: dialogs.actions.openChangeRoom,
      onUpdateStatus: dialogs.actions.openStatus,
      onQrCheckIn: dialogs.actions.openQr,
      onReschedule: dialogs.actions.openReschedule,
      onViewDetail: dialogs.actions.openPatientDetail,
      onViewRecord: dialogs.actions.openRecordDetail,
      onViewTimeline: dialogs.actions.openTimeline,
      onViewMilestone: dialogs.actions.openTimeline
    }
  });

  const resetFilters = useCallback(() => {
    table.resetColumnFilters();
    void setParams({
      search: null,
      status: null,
      poliklinikId: null,
      poliklinikName: null,
      serviceName: null,
      date: null,
      doctorId: null,
      doctorName: null,
      roomName: null,
      page: 1
    });
  }, [table, setParams]);

  return {
    table,
    dialogs,
    selectedAppointment: dialogs.selectedAppointment,
    activeDialog: dialogs.activeDialog,
    isRecordDetailOpen: dialogs.isRecordDetailOpen,
    isTimelineOpen: dialogs.isTimelineOpen,
    isMilestoneOpen: dialogs.isRecordDetailOpen,
    isDetailOpen: dialogs.isDetailOpen,
    isStatusOpen: dialogs.isStatusOpen,
    isChangeDoctorOpen: dialogs.isChangeDoctorOpen,
    isChangeRoomOpen: dialogs.isChangeRoomOpen,
    isQrOpen: dialogs.isQrOpen,
    isRescheduleOpen: dialogs.isRescheduleOpen,
    isFetching: infiniteQuery.isFetching,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    hasNextPage: Boolean(infiniteQuery.hasNextPage),
    sentinelRef,
    totalAppointments,
    hasFilters,
    currentUnitId: params.poliklinikId,
    currentDoctorId: params.doctorId,
    formattedDate,
    setUnitId: (unitId: string | null) =>
      setParams({ poliklinikId: unitId, doctorId: null, page: 1 }),
    setDoctorId: (doctorId: string | null) => setParams({ doctorId, page: 1 }),
    resetFilters,
    actions: {
      openRecordDetail: dialogs.actions.openRecordDetail,
      closeRecordDetail: dialogs.actions.closeRecordDetail,
      openTimeline: dialogs.actions.openTimeline,
      closeTimeline: dialogs.actions.closeTimeline,
      openMilestone: dialogs.actions.openRecordDetail,
      closeMilestone: dialogs.actions.closeRecordDetail,
      openDetail: dialogs.actions.openPatientDetail,
      closeDetail: dialogs.actions.closePatientDetail,
      openStatus: dialogs.actions.openStatus,
      closeStatus: dialogs.actions.closeStatus,
      openChangeDoctor: dialogs.actions.openChangeDoctor,
      closeChangeDoctor: dialogs.actions.closeChangeDoctor,
      openChangeRoom: dialogs.actions.openChangeRoom,
      closeChangeRoom: dialogs.actions.closeChangeRoom,
      openQr: dialogs.actions.openQr,
      closeQr: dialogs.actions.closeQr,
      openReschedule: dialogs.actions.openReschedule,
      closeReschedule: dialogs.actions.closeReschedule,
      openPatientDetailFromRecord: dialogs.actions.openPatientDetailFromRecord,
      openTimelineFromRecord: dialogs.actions.openTimelineFromRecord,
      openPatientDetailFromMilestone: dialogs.actions.openPatientDetailFromRecord,
      openPatientDetailFromQr: dialogs.actions.openPatientDetailFromQr,
      openStatusFromRecord: dialogs.actions.openStatusFromRecord,
      openChangeDoctorFromRecord: dialogs.actions.openChangeDoctorFromRecord,
      openChangeRoomFromRecord: dialogs.actions.openChangeRoomFromRecord,
      openQrFromRecord: dialogs.actions.openQrFromRecord,
      openRescheduleFromRecord: dialogs.actions.openRescheduleFromRecord,
      openStatusFromMilestone: dialogs.actions.openStatusFromRecord,
      openChangeDoctorFromMilestone: dialogs.actions.openChangeDoctorFromRecord,
      openChangeRoomFromMilestone: dialogs.actions.openChangeRoomFromRecord,
      openQrFromMilestone: dialogs.actions.openQrFromRecord,
      openRescheduleFromMilestone: dialogs.actions.openRescheduleFromRecord
    }
  };
}
