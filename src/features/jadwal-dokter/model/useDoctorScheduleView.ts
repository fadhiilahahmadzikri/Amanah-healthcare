'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { parseAsString, useQueryStates } from 'nuqs';
import { doctorScheduleInfiniteQueryOptions } from '../api/queries';
import type { DoctorSchedule, DoctorScheduleFilters } from '../api/types';
import { DOCTOR_DIALOG_TYPE, type DoctorDialogType } from '../constants/doctor-dialog.constants';

export interface UseDoctorScheduleViewResult {
  doctors: DoctorSchedule[];
  totalDoctors: number;
  selectedDoctor: DoctorSchedule | null;
  selectedDoctorId: string;
  openPatients: boolean;
  isDetailOpen: boolean;
  isFetching: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  searchQuery: string;
  monthFilter: string;
  dateFilter?: Date;
  selectedPoli: string[];
  selectedSessions: string[];
  selectedStatuses: string[];
  hasActiveFilters: boolean;
  actions: {
    openDetail: (doctor: DoctorSchedule) => void;
    closeDetail: () => void;
    clearOpenPatients: () => void;
    openDoctorScheduleById: (doctorId: string) => void;
    changeSearch: (value: string) => void;
    changeMonthFilter: (month: string) => void;
    changeDateFilter: (date?: Date) => void;
    changeSelectedPoli: (poliList: string[]) => void;
    changeSelectedSessions: (sessionList: string[]) => void;
    changeSelectedStatuses: (statusList: string[]) => void;
    resetFilters: () => void;
  };
}

export function useDoctorScheduleView(): UseDoctorScheduleViewResult {
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorSchedule | null>(null);
  const [activeDialog, setActiveDialog] = useState<DoctorDialogType | null>(null);
  const [params, setParams] = useQueryStates(
    {
      search: parseAsString.withDefault(''),
      month: parseAsString.withDefault('ALL'),
      date: parseAsString.withDefault(''),
      poli: parseAsString.withDefault(''),
      session: parseAsString.withDefault(''),
      status: parseAsString.withDefault(''),
      selectedDoctorId: parseAsString.withDefault(''),
      dialog: parseAsString.withDefault(''),
      openPatients: parseAsString.withDefault('')
    },
    { shallow: true }
  );

  const todayStr = useMemo(() => getTodayDateParam(), []);
  const effectiveDate = params.date || todayStr;
  const selectedPoli = useMemo(() => toList(params.poli), [params.poli]);
  const selectedSessions = useMemo(() => toList(params.session), [params.session]);
  const selectedStatuses = useMemo(() => toList(params.status), [params.status]);
  const dateFilter = useMemo(() => parseDateParam(effectiveDate), [effectiveDate]);

  const filters = useMemo<DoctorScheduleFilters>(
    () => ({
      limit: 20,
      ...(params.search ? { search: params.search } : {}),
      ...(params.month && params.month !== 'ALL' ? { month: params.month } : {}),
      date: effectiveDate,
      ...(selectedPoli.length > 0 ? { poli: selectedPoli } : {}),
      ...(selectedSessions.length > 0 ? { session: selectedSessions } : {}),
      ...(selectedStatuses.length > 0 ? { status: selectedStatuses } : {})
    }),
    [effectiveDate, params.month, params.search, selectedPoli, selectedSessions, selectedStatuses]
  );

  const infiniteQuery = useInfiniteQuery(doctorScheduleInfiniteQueryOptions(filters));

  const doctors = useMemo(() => {
    if (!infiniteQuery.data?.pages) return [];
    return infiniteQuery.data.pages.flatMap((page) => page.doctors ?? []);
  }, [infiniteQuery.data?.pages]);

  const totalDoctors = useMemo(() => {
    return infiniteQuery.data?.pages[0]?.totalDoctors ?? doctors.length;
  }, [infiniteQuery.data?.pages, doctors.length]);

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

  useEffect(() => {
    if (!params.selectedDoctorId) {
      if (activeDialog === DOCTOR_DIALOG_TYPE.DETAIL_SHEET) {
        setActiveDialog(null);
      }
      return;
    }

    const targetId = params.selectedDoctorId;
    const found = doctors.find((d) => d.id === targetId);

    if (found) {
      setSelectedDoctor(found);
    }

    if (params.dialog) {
      setActiveDialog(params.dialog as DoctorDialogType);
    }
  }, [params.selectedDoctorId, params.dialog, doctors, activeDialog]);

  const openDoctorScheduleById = (doctorId: string) => {
    setParams(
      {
        selectedDoctorId: doctorId,
        dialog: DOCTOR_DIALOG_TYPE.DETAIL_SHEET
      },
      { shallow: true }
    );
    const found = doctors.find((d) => d.id === doctorId);
    if (found) {
      setSelectedDoctor(found);
    }
    setActiveDialog(DOCTOR_DIALOG_TYPE.DETAIL_SHEET);
  };

  const currentDialog =
    activeDialog !== null ? activeDialog : (params.dialog as DoctorDialogType) || null;

  return {
    doctors,
    totalDoctors,
    selectedDoctor,
    selectedDoctorId: params.selectedDoctorId,
    openPatients: Boolean(params.openPatients === 'true' || params.openPatients === '1'),
    isDetailOpen: currentDialog === DOCTOR_DIALOG_TYPE.DETAIL_SHEET,
    isFetching: infiniteQuery.isFetching,
    isLoading: infiniteQuery.isLoading,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    hasNextPage: Boolean(infiniteQuery.hasNextPage),
    sentinelRef,
    searchQuery: params.search,
    monthFilter: params.month || 'ALL',
    dateFilter,
    selectedPoli,
    selectedSessions,
    selectedStatuses,
    hasActiveFilters: [
      Boolean(params.search.trim()),
      Boolean(params.month && params.month !== 'ALL'),
      Boolean(params.date && params.date !== todayStr),
      selectedPoli.length > 0,
      selectedSessions.length > 0,
      selectedStatuses.length > 0
    ].some(Boolean),
    actions: {
      openDetail: (doctor) => {
        setSelectedDoctor(doctor);
        setActiveDialog(DOCTOR_DIALOG_TYPE.DETAIL_SHEET);
        setParams(
          { selectedDoctorId: doctor.id, dialog: DOCTOR_DIALOG_TYPE.DETAIL_SHEET },
          { shallow: true }
        );
      },
      closeDetail: () => {
        setActiveDialog(null);
        setParams({ selectedDoctorId: null, dialog: null, openPatients: null }, { shallow: true });
      },
      clearOpenPatients: () => setParams({ openPatients: null }, { shallow: true }),
      openDoctorScheduleById,
      changeSearch: (value) => setParams({ search: value || null }, { shallow: true }),
      changeMonthFilter: (month) =>
        setParams({ month: month === 'ALL' ? null : month }, { shallow: true }),
      changeDateFilter: (date) => setParams({ date: date ? toDateParam(date) : null }),
      changeSelectedPoli: (poliList) => setParams({ poli: toParam(poliList) }, { shallow: true }),
      changeSelectedSessions: (sessionList) =>
        setParams({ session: toParam(sessionList) }, { shallow: true }),
      changeSelectedStatuses: (statusList) =>
        setParams({ status: toParam(statusList) }, { shallow: true }),
      resetFilters: () =>
        setParams(
          { search: null, month: null, date: null, poli: null, session: null, status: null },
          { shallow: true }
        )
    }
  };
}

function toList(value: string): string[] {
  return value ? value.split(',').filter(Boolean) : [];
}

function toParam(value: string[]): string | null {
  return value.length > 0 ? value.join(',') : null;
}

export function getTodayDateParam(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateParam(value: string): Date | undefined {
  if (!value) return undefined;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function toDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
