'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sessionPatientsQueryOptions, doctorShiftPatientsQueryOptions } from '../api/queries';
import type { BookedPatientItem } from '@/server/contracts/schedules/doctor-schedules.dto';
import { APPOINTMENT_STATUS } from '@/constants/appointment-status.constants';

export type FilterStatusType =
  | 'all'
  | 'waiting'
  | 'in_service'
  | 'no_show'
  | 'completed'
  | 'cancelled';

export const PATIENT_STATUS_OPTIONS: readonly {
  value: FilterStatusType;
  label: string;
  dotColor: string;
}[] = [
  { value: 'all', label: 'Semua Status', dotColor: 'bg-primary' },
  {
    value: APPOINTMENT_STATUS.WAITING.toLowerCase() as FilterStatusType,
    label: 'Menunggu',
    dotColor: 'bg-amber-500'
  },
  {
    value: APPOINTMENT_STATUS.IN_SERVICE.toLowerCase() as FilterStatusType,
    label: 'Di Sesi',
    dotColor: 'bg-sky-500'
  },
  { value: 'no_show', label: 'Terlambat', dotColor: 'bg-orange-500' },
  {
    value: APPOINTMENT_STATUS.COMPLETED.toLowerCase() as FilterStatusType,
    label: 'Selesai',
    dotColor: 'bg-emerald-500'
  },
  {
    value: APPOINTMENT_STATUS.CANCELLED.toLowerCase() as FilterStatusType,
    label: 'Batal',
    dotColor: 'bg-rose-500'
  }
];

export interface UseDoctorSessionPatientsProps {
  doctorId: string;
  sessionId?: string;
  date?: string;
  sessionShift?: string;
  isOpen: boolean;
  slotStartTime?: string;
  initialCapacity?: number;
  pageSize?: number;
}

export function useDoctorSessionPatients({
  doctorId,
  sessionId,
  date,
  sessionShift,
  isOpen,
  slotStartTime,
  initialCapacity = 0,
  pageSize = 10
}: UseDoctorSessionPatientsProps) {
  const [selectedStatus, setSelectedStatus] = useState<FilterStatusType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatientForDetail, setSelectedPatientForDetail] =
    useState<BookedPatientItem | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, debouncedSearch, slotStartTime]);

  const queryFilters = useMemo(
    () => ({
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      search: debouncedSearch !== '' ? debouncedSearch : undefined
    }),
    [selectedStatus, debouncedSearch]
  );

  const isShiftMode = Boolean(date && sessionShift);

  const sessionQuery = useQuery({
    ...sessionPatientsQueryOptions(doctorId, sessionId || '', queryFilters),
    enabled: isOpen && Boolean(doctorId && sessionId && !isShiftMode),
    placeholderData: (previousData) => previousData
  });

  const shiftQuery = useQuery({
    ...doctorShiftPatientsQueryOptions(doctorId, {
      date: date || '',
      sessionShift,
      status: queryFilters.status,
      search: queryFilters.search
    }),
    enabled: isOpen && Boolean(doctorId && date && isShiftMode),
    placeholderData: (previousData) => previousData
  });

  const sessionData = isShiftMode ? shiftQuery.data : sessionQuery.data;
  const isLoading = isShiftMode ? shiftQuery.isLoading : sessionQuery.isLoading;
  const isFetching = isShiftMode ? shiftQuery.isFetching : sessionQuery.isFetching;
  const isError = isShiftMode ? shiftQuery.isError : sessionQuery.isError;
  const error = isShiftMode ? shiftQuery.error : sessionQuery.error;
  const refetch = isShiftMode ? shiftQuery.refetch : sessionQuery.refetch;

  const rawPatientsList: BookedPatientItem[] = useMemo(
    () => sessionData?.patients ?? [],
    [sessionData?.patients]
  );

  const patientsList: BookedPatientItem[] = useMemo(() => {
    if (!slotStartTime || isShiftMode) return rawPatientsList;
    return rawPatientsList.filter((p) => {
      if (!p.timeSlot) return true;
      const start = p.timeSlot.split('-')[0].trim().replace(/wib/i, '').trim();
      return start === slotStartTime || p.timeSlot.startsWith(slotStartTime);
    });
  }, [rawPatientsList, slotStartTime, isShiftMode]);

  const capacity = sessionData?.capacity ?? initialCapacity;
  const bookedCount = sessionData?.bookedCount ?? patientsList.length;

  const totalPatients = patientsList.length;
  const totalPages = Math.max(1, Math.ceil(totalPatients / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPatients = useMemo(
    () => patientsList.slice(startIndex, startIndex + pageSize),
    [patientsList, startIndex, pageSize]
  );

  const isFiltered = Boolean(searchQuery.trim()) || selectedStatus !== 'all';
  const hasNoPatients =
    !isLoading &&
    !isError &&
    patientsList.length === 0 &&
    selectedStatus === 'all' &&
    !searchQuery.trim();

  const resetFilters = () => {
    setSelectedStatus('all');
    setSearchQuery('');
    setDebouncedSearch('');
    setCurrentPage(1);
  };

  return {
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    pageSize,
    selectedPatientForDetail,
    setSelectedPatientForDetail,
    patientsList,
    paginatedPatients,
    capacity,
    bookedCount,
    scheduleDate: sessionData?.scheduleDate,
    totalPatients,
    totalPages,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    isFiltered,
    hasNoPatients,
    resetFilters
  };
}
