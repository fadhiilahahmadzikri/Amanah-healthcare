'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { ColumnDef, Table } from '@tanstack/react-table';
import { parseAsArrayOf, parseAsString, useQueryStates } from 'nuqs';
import { useDataTable } from '@/hooks/use-data-table';
import { getSortingStateParser } from '@/lib/parsers';
import { patientInfiniteQueryOptions } from '../api/queries';
import type { Patient, PatientFilters } from '../api/types';

export interface PatientTableMeta {
  onViewDetail?: (patient: Patient) => void;
  onViewHistory?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
  onDelete?: (patient: Patient) => void;
}

interface UsePatientTableParams {
  columns: ColumnDef<Patient>[];
  columnIds: string[];
}

export interface UsePatientTableResult {
  table: Table<Patient>;
  activePatients: Patient[];
  selectedPatient: Patient | null;
  selectedPatients: Patient[];
  isDetailOpen: boolean;
  isEditOpen: boolean;
  isHistoryOpen: boolean;
  isDeleteOpen: boolean;
  isBulkDeleteOpen: boolean;
  isInfiniteSearch: boolean;
  hidePagination: boolean;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  totalPatients: number;
  resetFilters: () => void;
  actions: {
    openDetail: (patient: Patient) => void;
    closeDetail: () => void;
    openEdit: (patient: Patient) => void;
    closeEdit: () => void;
    openEditFromDetail: (patient: Patient) => void;
    openHistory: (patient: Patient) => void;
    closeHistory: () => void;
    openDelete: (patient: Patient) => void;
    closeDelete: () => void;
    openBulkDelete: (patients?: Patient[]) => void;
    closeBulkDelete: () => void;
  };
}

export function usePatientTable({
  columns,
  columnIds
}: UsePatientTableParams): UsePatientTableResult {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatients, setSelectedPatients] = useState<Patient[]>([]);
  const [activeDialog, setActiveDialog] = useState<
    'detail' | 'edit' | 'history' | 'delete' | 'bulkDelete' | null
  >(null);

  const [params, setParams] = useQueryStates({
    patient: parseAsString,
    name: parseAsString,
    search: parseAsString,
    gender: parseAsArrayOf(parseAsString, ','),
    account_status: parseAsArrayOf(parseAsString, ','),
    status: parseAsArrayOf(parseAsString, ','),
    blood_type: parseAsArrayOf(parseAsString, ','),
    profile_type: parseAsArrayOf(parseAsString, ','),
    sort: getSortingStateParser<Patient>(columnIds).withDefault([])
  });

  const querySearch = params.patient || params.name || params.search || '';
  const queryGender = params.gender?.[0] || null;
  const queryStatus = params.account_status?.[0] || params.status?.[0] || null;
  const queryBloodType = params.blood_type?.[0] || null;
  const queryProfileType = params.profile_type?.[0] || null;
  const querySort =
    params.sort && params.sort.length > 0
      ? `${params.sort[0].id}:${params.sort[0].desc ? 'desc' : 'asc'}`
      : null;

  const isInfiniteSearch = Boolean(querySearch && querySearch.trim().length > 0);

  // Unified Infinite Query (Continuous Scroll Feed like YouTube / Social Media)
  const filters: PatientFilters = {
    limit: 30,
    ...(querySearch && { search: querySearch }),
    ...(queryGender && { gender: queryGender }),
    ...(queryStatus && { status: queryStatus }),
    ...(queryBloodType && { bloodType: queryBloodType }),
    ...(queryProfileType && { profileType: queryProfileType }),
    ...(querySort && { sort: querySort })
  };

  const infiniteQuery = useInfiniteQuery(patientInfiniteQueryOptions(filters));

  const activePatients = useMemo(() => {
    if (!infiniteQuery.data?.pages) return [];
    return infiniteQuery.data.pages.flatMap((page) => page.patients || []);
  }, [infiniteQuery.data?.pages]);

  const totalPatients = useMemo(() => {
    return infiniteQuery.data?.pages[0]?.total_patients ?? activePatients.length;
  }, [infiniteQuery.data?.pages, activePatients.length]);

  // Sentinel intersection observer for continuous scrolling
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

  // Reactive flat derivation of selected patient
  const selectedPatient = useMemo(() => {
    if (!selectedPatientId) return null;
    return activePatients.find((p) => p.id === selectedPatientId) ?? null;
  }, [activePatients, selectedPatientId]);

  const openDetail = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setActiveDialog('detail');
  };

  const closeDetail = () => {
    setActiveDialog(null);
  };

  const openEdit = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setActiveDialog('edit');
  };

  const closeEdit = () => {
    setActiveDialog(null);
  };

  const openEditFromDetail = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setActiveDialog('edit');
  };

  const openHistory = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setActiveDialog('history');
  };

  const closeHistory = () => {
    setActiveDialog(null);
  };

  const openDelete = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setActiveDialog('delete');
  };

  const closeDelete = () => {
    setActiveDialog(null);
  };

  const openBulkDelete = (patients?: Patient[]) => {
    if (patients && patients.length > 0) {
      setSelectedPatients(patients);
    }
    setActiveDialog('bulkDelete');
  };

  const closeBulkDelete = () => {
    setActiveDialog(null);
  };

  const meta: PatientTableMeta = {
    onViewDetail: openDetail,
    onViewHistory: openHistory,
    onEdit: openEdit,
    onDelete: openDelete
  };

  const { table } = useDataTable({
    data: activePatients,
    columns,
    pageCount: -1,
    shallow: true,
    debounceMs: 300,
    meta,
    manualFiltering: true,
    manualSorting: false,
    initialState: {
      columnPinning: { left: ['select'], right: ['actions'] }
    }
  });

  const resetFilters = useCallback(() => {
    table.resetColumnFilters();
    table.resetSorting();
    void setParams({
      search: null,
      patient: null,
      name: null,
      gender: null,
      account_status: null,
      status: null,
      blood_type: null,
      profile_type: null,
      sort: []
    });
  }, [setParams, table]);

  return {
    table,
    activePatients,
    selectedPatient,
    selectedPatients,
    isDetailOpen: activeDialog === 'detail',
    isEditOpen: activeDialog === 'edit',
    isHistoryOpen: activeDialog === 'history',
    isDeleteOpen: activeDialog === 'delete',
    isBulkDeleteOpen: activeDialog === 'bulkDelete',
    isInfiniteSearch,
    hidePagination: true,
    sentinelRef,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    hasNextPage: Boolean(infiniteQuery.hasNextPage),
    totalPatients,
    resetFilters,
    actions: {
      openDetail,
      closeDetail,
      openEdit,
      closeEdit,
      openEditFromDetail,
      openHistory,
      closeHistory,
      openDelete,
      closeDelete,
      openBulkDelete,
      closeBulkDelete
    }
  };
}
