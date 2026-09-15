'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { doctorScheduleQueryOptions } from '../api/queries';
import type { DoctorSchedule, DoctorScheduleFilters } from '../api/types';

interface UseDoctorScheduleViewResult {
  doctors: DoctorSchedule[];
  totalDoctors: number;
  selectedDoctor: DoctorSchedule | null;
  isDetailOpen: boolean;
  isEditOpen: boolean;
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
    openEdit: (doctor: DoctorSchedule) => void;
    closeEdit: () => void;
    openEditFromDetail: (doctor: DoctorSchedule) => void;
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
  const [activeDialog, setActiveDialog] = useState<'detail' | 'edit' | null>(null);
  const [params, setParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      perPage: parseAsInteger.withDefault(6),
      search: parseAsString.withDefault(''),
      month: parseAsString.withDefault('ALL'),
      date: parseAsString.withDefault(''),
      poli: parseAsString.withDefault(''),
      status: parseAsString.withDefault('')
    },
    { shallow: true }
  );

  const selectedPoli = useMemo(() => toList(params.poli), [params.poli]);
  const selectedStatuses = useMemo(() => toList(params.status), [params.status]);
  const dateFilter = useMemo(() => parseDateParam(params.date), [params.date]);
  const filters = useMemo<DoctorScheduleFilters>(
    () => ({
      page: params.page,
      limit: params.perPage,
      ...(params.search ? { search: params.search } : {}),
      ...(params.month && params.month !== 'ALL' ? { month: params.month } : {}),
      ...(params.date ? { date: params.date } : {}),
      ...(selectedPoli.length > 0 ? { poli: selectedPoli } : {}),
      ...(selectedStatuses.length > 0 ? { status: selectedStatuses } : {})
    }),
    [params, selectedPoli, selectedStatuses]
  );

  const { data, isFetching, isLoading } = useQuery(doctorScheduleQueryOptions(filters));

  const openEdit = (doctor: DoctorSchedule) => {
    setSelectedDoctor(doctor);
    setActiveDialog('edit');
  };

  return {
    doctors: data?.doctors ?? [],
    totalDoctors: data?.total_doctors ?? 0,
    selectedDoctor,
    isDetailOpen: activeDialog === 'detail',
    isEditOpen: activeDialog === 'edit',
    isFetching,
    isLoading,
    searchQuery: params.search,
    monthFilter: params.month || 'ALL',
    dateFilter,
    selectedPoli,
    selectedStatuses,
    hasActiveFilters: Boolean(
      params.search || params.month !== 'ALL' || params.date || params.poli || params.status
    ),
    page: params.page,
    pageSize: params.perPage,
    actions: {
      openDetail: (doctor) => {
        setSelectedDoctor(doctor);
        setActiveDialog('detail');
      },
      closeDetail: () => setActiveDialog(null),
      openEdit,
      closeEdit: () => setActiveDialog(null),
      openEditFromDetail: openEdit,
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

function parseDateParam(value: string): Date | undefined {
  if (!value) return undefined;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function toDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
