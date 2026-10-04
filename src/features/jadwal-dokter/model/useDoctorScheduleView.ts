'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { doctorScheduleQueryOptions } from '../api/queries';
import type { DoctorSchedule, DoctorScheduleFilters } from '../api/types';
import {
  useDoctorConflictNavigation,
  type DoctorConflictReturnContext
} from './useDoctorConflictNavigation';

export type ReturnDoctorContext = DoctorConflictReturnContext;

interface UseDoctorScheduleViewResult {
  doctors: DoctorSchedule[];
  totalDoctors: number;
  selectedDoctor: DoctorSchedule | null;
  selectedDoctorId: string;
  highlightSlotTime: string;
  returnContext: ReturnDoctorContext | null;
  isDetailOpen: boolean;
  isEditOpen: boolean;
  isRescheduleOpen: boolean;
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
    openDoctorScheduleById: (
      doctorId: string,
      highlightTime?: string,
      returnCtx?: ReturnDoctorContext
    ) => void;
    returnToSourceModal: () => void;
    clearHighlightSlotTime: () => void;
    clearReturnContext: () => void;
    openEdit: (doctor: DoctorSchedule) => void;
    closeEdit: () => void;
    openEditFromDetail: (doctor: DoctorSchedule) => void;
    openReschedule: (doctor: DoctorSchedule) => void;
    closeReschedule: () => void;
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
  const conflictNav = useDoctorConflictNavigation();
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorSchedule | null>(null);
  const [returnContext, setReturnContext] = useState<ReturnDoctorContext | null>(null);
  const [activeDialog, setActiveDialog] = useState<'detail' | 'edit' | 'reschedule' | null>(null);
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
      highlightSlotTime: parseAsString.withDefault('')
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
      ...(selectedPoli.length > 0 ? { poli: selectedPoli } : {}),
      ...(selectedStatuses.length > 0 ? { status: selectedStatuses } : {})
    }),
    [params.page, params.perPage, params.search, params.month, effectiveDate, selectedPoli, selectedStatuses]
  );

  const { data, isFetching, isLoading } = useQuery(doctorScheduleQueryOptions(filters));

  useEffect(() => {
    if (!params.selectedDoctorId) {
      return;
    }

    const targetId = params.selectedDoctorId;
    const found = data?.doctors?.find(
      (d) => d.id === targetId || d.practitioner_id === targetId
    );
    if (found) {
      setSelectedDoctor(found);
      setActiveDialog('detail');
    } else {
      setSelectedDoctor((prev) => {
        if (prev && (prev.id === targetId || prev.practitioner_id === targetId)) {
          return prev;
        }
        return {
          id: targetId,
          nama_dokter: '',
          spesialisasi: '',
          status_dokter: 'Buka',
          ruang_praktik: '',
          slot_tersedia: 0,
          kapasitas_per_hari: 0,
          jadwal_hari_ini: '',
          status_jadwal: 'Buka',
          is_cuti: false
        };
      });
      setActiveDialog('detail');
    }
  }, [params.selectedDoctorId, data?.doctors]);

  const openEdit = (doctor: DoctorSchedule) => {
    setSelectedDoctor(doctor);
    setActiveDialog('edit');
    setParams({ selectedDoctorId: doctor.id }, { shallow: true });
  };

  const openReschedule = (doctor: DoctorSchedule) => {
    setSelectedDoctor(doctor);
    setActiveDialog('reschedule');
    setParams({ selectedDoctorId: doctor.id }, { shallow: true });
  };

  const openDoctorScheduleById = (
    doctorId: string,
    highlightTime?: string,
    returnCtx?: ReturnDoctorContext
  ) => {
    if (returnCtx) {
      setReturnContext(returnCtx);
    }
    setParams(
      {
        selectedDoctorId: doctorId,
        highlightSlotTime: highlightTime || null
      },
      { shallow: true }
    );
    const found = data?.doctors?.find(
      (d) => d.id === doctorId || d.practitioner_id === doctorId
    );
    if (found) {
      setSelectedDoctor(found);
    } else {
      setSelectedDoctor({
        id: doctorId,
        nama_dokter: '',
        spesialisasi: '',
        status_dokter: 'Buka',
        ruang_praktik: '',
        slot_tersedia: 0,
        kapasitas_per_hari: 0,
        jadwal_hari_ini: '',
        status_jadwal: 'Buka',
        is_cuti: false
      });
    }
    setActiveDialog('detail');
  };

  const returnToSourceModal = () => {
    const effectiveContext = returnContext || conflictNav.returnContext;
    if (!effectiveContext) return;
    const targetSourceId = effectiveContext.sourceDoctorId;
    const sourceDoctor = data?.doctors?.find(
      (d) => d.id === targetSourceId || d.practitioner_id === targetSourceId
    );
    if (sourceDoctor) {
      setSelectedDoctor(sourceDoctor);
    }
    setActiveDialog('detail');
    setParams(
      {
        selectedDoctorId: targetSourceId,
        highlightSlotTime: null
      },
      { shallow: true }
    );
    conflictNav.returnToSourceWizard();
  };

  const clearHighlightSlotTime = () => {
    setParams({ highlightSlotTime: null }, { shallow: true });
    conflictNav.setHighlightSlotTime(null);
  };

  return {
    doctors: data?.doctors ?? [],
    totalDoctors: data?.total_doctors ?? 0,
    selectedDoctor,
    selectedDoctorId: params.selectedDoctorId,
    highlightSlotTime: params.highlightSlotTime || conflictNav.highlightSlotTime || '',
    returnContext: returnContext || conflictNav.returnContext,
    isDetailOpen: activeDialog === 'detail',
    isEditOpen: activeDialog === 'edit',
    isRescheduleOpen: activeDialog === 'reschedule',
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
        setActiveDialog('detail');
        setParams({ selectedDoctorId: doctor.id }, { shallow: true });
      },
      closeDetail: () => {
        setActiveDialog(null);
        setSelectedDoctor(null);
        setReturnContext(null);
        conflictNav.clearConflictNavigation();
        setParams({ selectedDoctorId: null, highlightSlotTime: null }, { shallow: true });
      },
      openDoctorScheduleById,
      returnToSourceModal,
      clearHighlightSlotTime,
      clearReturnContext: () => {
        setReturnContext(null);
        conflictNav.clearConflictNavigation();
      },
      openEdit,
      closeEdit: () => {
        setActiveDialog(null);
        setSelectedDoctor(null);
        setParams({ selectedDoctorId: null }, { shallow: true });
      },
      openEditFromDetail: openEdit,
      openReschedule,
      closeReschedule: () => {
        setActiveDialog(null);
        setSelectedDoctor(null);
        setParams({ selectedDoctorId: null }, { shallow: true });
      },
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
