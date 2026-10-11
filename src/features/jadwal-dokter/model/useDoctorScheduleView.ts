'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { doctorScheduleQueryOptions } from '../api/queries';
import type { DoctorSchedule, DoctorScheduleFilters } from '../api/types';
import { DOCTOR_DIALOG_TYPE, type DoctorDialogType } from '../constants/doctor-dialog.constants';

interface UseDoctorScheduleViewResult {
  doctors: DoctorSchedule[];
  totalDoctors: number;
  selectedDoctor: DoctorSchedule | null;
  selectedDoctorId: string;
  openPatients: boolean;
  isDetailOpen: boolean;
  isFetching: boolean;
  isLoading: boolean;
  searchQuery: string;
  monthFilter: string;
  dateFilter?: Date;
  selectedPoli: string[];
  selectedStatuses: string[];
  hasActiveFilters: boolean;
  page: number;
  pageSize: number;
  actions: {
    openDetail: (doctor: DoctorSchedule) => void;
    closeDetail: () => void;
    clearOpenPatients: () => void;
    openDoctorScheduleById: (doctorId: string) => void;
    changeSearch: (value: string) => void;
    changeMonthFilter: (month: string) => void;
    changeDateFilter: (date?: Date) => void;
    changeSelectedPoli: (poliList: string[]) => void;
    changeSelectedStatuses: (statusList: string[]) => void;
    resetFilters: () => void;
    changePage: (page: number) => void;
    changePageSize: (pageSize: number) => void;
  };
}

export function useDoctorScheduleView(): UseDoctorScheduleViewResult {
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorSchedule | null>(null);
  const [activeDialog, setActiveDialog] = useState<DoctorDialogType | null>(null);
  const [params, setParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      perPage: parseAsInteger.withDefault(6),
      search: parseAsString.withDefault(''),
      month: parseAsString.withDefault('ALL'),
      date: parseAsString.withDefault(''),
      poli: parseAsString.withDefault(''),
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
  const selectedStatuses = useMemo(() => toList(params.status), [params.status]);
  const dateFilter = useMemo(() => parseDateParam(effectiveDate), [effectiveDate]);
  const filters = useMemo<DoctorScheduleFilters>(
    () => ({
      page: params.page,
      limit: params.perPage,
      ...(params.search ? { search: params.search } : {}),
      ...(params.month && params.month !== 'ALL' ? { month: params.month } : {}),
      date: effectiveDate,
      ...(params.poli ? { poliklinik: selectedPoli } : {}),
      ...(params.status ? { status: selectedStatuses } : {})
    }),
    [
      effectiveDate,
      params.month,
      params.page,
      params.perPage,
      params.poli,
      params.search,
      params.status,
      selectedPoli,
      selectedStatuses
    ]
  );

  const { data, isFetching, isLoading } = useQuery(doctorScheduleQueryOptions(filters));

  useEffect(() => {
    if (!params.selectedDoctorId) {
      if (activeDialog === DOCTOR_DIALOG_TYPE.DETAIL_SHEET) {
        setActiveDialog(null);
      }
      return;
    }

    const targetId = params.selectedDoctorId;
    const found = data?.doctors?.find((d) => d.id === targetId || d.practitioner_id === targetId);

    if (found) {
      setSelectedDoctor(found);
    }

    if (params.dialog) {
      setActiveDialog(params.dialog as DoctorDialogType);
    }
  }, [params.selectedDoctorId, params.dialog, data?.doctors, activeDialog]);

  const openDoctorScheduleById = (doctorId: string) => {
    setParams(
      {
        selectedDoctorId: doctorId,
        dialog: DOCTOR_DIALOG_TYPE.DETAIL_SHEET
      },
      { shallow: true }
    );
    const found = data?.doctors?.find((d) => d.id === doctorId || d.practitioner_id === doctorId);
    if (found) {
      setSelectedDoctor(found);
    }
    setActiveDialog(DOCTOR_DIALOG_TYPE.DETAIL_SHEET);
  };

  const currentDialog =
    activeDialog !== null ? activeDialog : (params.dialog as DoctorDialogType) || null;

  return {
    doctors: data?.doctors ?? [],
    totalDoctors: data?.total_doctors ?? 0,
    selectedDoctor,
    selectedDoctorId: params.selectedDoctorId,
    openPatients: Boolean(params.openPatients === 'true' || params.openPatients === '1'),
    isDetailOpen: currentDialog === DOCTOR_DIALOG_TYPE.DETAIL_SHEET,
    isFetching,
    isLoading,
    searchQuery: params.search,
    monthFilter: params.month || 'ALL',
    dateFilter,
    selectedPoli,
    selectedStatuses,
    hasActiveFilters: Boolean(
      params.search ||
      (params.month && params.month !== 'ALL') ||
      (params.date && params.date !== todayStr) ||
      params.poli ||
      params.status
    ),
    page: params.page,
    pageSize: params.perPage,
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
      changeSearch: (value) => setParams({ search: value || null, page: 1 }, { shallow: true }),
      changeMonthFilter: (month) =>
        setParams({ month: month === 'ALL' ? null : month, page: 1 }, { shallow: true }),
      changeDateFilter: (date) => setParams({ date: date ? toDateParam(date) : null, page: 1 }),
      changeSelectedPoli: (poliList) =>
        setParams({ poli: toParam(poliList), page: 1 }, { shallow: true }),
      changeSelectedStatuses: (statusList) =>
        setParams({ status: toParam(statusList), page: 1 }, { shallow: true }),
      resetFilters: () =>
        setParams(
          { search: null, month: null, date: null, poli: null, status: null, page: 1 },
          { shallow: true }
        ),
      changePage: (page) => setParams({ page }, { shallow: true }),
      changePageSize: (perPage) => setParams({ perPage, page: 1 }, { shallow: true })
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
