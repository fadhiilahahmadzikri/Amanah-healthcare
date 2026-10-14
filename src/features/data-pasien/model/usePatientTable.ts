'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type {
  ColumnDef,
  PaginationState,
  SortingState,
  Table,
  Updater,
} from '@tanstack/react-table';
import { useControlledDataTable } from '@/hooks/use-controlled-data-table';
import { patientsQueryOptions } from '../api/queries';
import type { Patient, PatientFilters } from '../api/types';
import { usePatientInfiniteSearch } from './usePatientInfiniteSearch';
import { usePatientFilters, type UsePatientFiltersResult } from './usePatientFilters';
import type { ExtendedColumnSort } from '@/types/data-table';

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
  patientFilters: UsePatientFiltersResult;
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
}: UsePatientTableParams): UsePatientTableResult {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatients, setSelectedPatients] = useState<Patient[]>([]);
  const [activeDialog, setActiveDialog] = useState<
    'detail' | 'edit' | 'history' | 'delete' | 'bulkDelete' | null
  >(null);

  // SSOT: Centralized filters management facade
  const patientFilters = usePatientFilters();
  const { params, setParams } = patientFilters;

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

  // 1. Paginated Query (Active when not in global search mode)
  const filters: PatientFilters = {
    page: params.page,
    limit: params.perPage,
    ...(querySearch && { search: querySearch }),
    ...(queryGender && { gender: queryGender }),
    ...(queryStatus && { status: queryStatus }),
    ...(queryBloodType && { bloodType: queryBloodType }),
    ...(queryProfileType && { profileType: queryProfileType }),
    ...(querySort && { sort: querySort }),
  };

  const paginatedQuery = useQuery({
    ...patientsQueryOptions(filters),
    enabled: !isInfiniteSearch,
  });

  // 2. Infinite Query (Active when global toolbar search is active)
  const infiniteSearch = usePatientInfiniteSearch({
    searchQuery: querySearch,
    gender: queryGender,
    status: queryStatus,
    bloodType: queryBloodType,
    profileType: queryProfileType,
    sort: querySort,
    enabled: isInfiniteSearch,
  });

  const activePatients = useMemo(() => {
    if (isInfiniteSearch) {
      return infiniteSearch.patients;
    }
    return paginatedQuery.data?.patients || [];
  }, [isInfiniteSearch, infiniteSearch.patients, paginatedQuery.data?.patients]);

  const totalPatients = useMemo(() => {
    if (isInfiniteSearch) {
      return infiniteSearch.totalPatients;
    }
    return paginatedQuery.data?.total_patients ?? 0;
  }, [isInfiniteSearch, infiniteSearch.totalPatients, paginatedQuery.data?.total_patients]);

  const pageCount = useMemo(() => {
    if (isInfiniteSearch) return -1;
    return Math.ceil((paginatedQuery.data?.total_patients ?? 0) / params.perPage);
  }, [isInfiniteSearch, paginatedQuery.data?.total_patients, params.perPage]);

  // Reactive derivation of selected patient
  const selectedPatient = useMemo(() => {
    if (!selectedPatientId) return null;
    const findInTree = (list: Patient[]): Patient | null => {
      for (const p of list) {
        if (p.id === selectedPatientId) return p;
        if (p.affiliates && p.affiliates.length > 0) {
          const found = findInTree(p.affiliates);
          if (found) return found;
        }
      }
      return null;
    };
    return findInTree(activePatients);
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
    onDelete: openDelete,
  };

  // Controlled Pagination & Sorting
  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: params.page - 1,
      pageSize: params.perPage,
    }),
    [params.page, params.perPage]
  );

  const onPaginationChange = useCallback(
    (updaterOrValue: Updater<PaginationState>) => {
      if (typeof updaterOrValue === 'function') {
        const next = updaterOrValue(pagination);
        void setParams({ page: next.pageIndex + 1, perPage: next.pageSize });
      } else {
        void setParams({ page: updaterOrValue.pageIndex + 1, perPage: updaterOrValue.pageSize });
      }
    },
    [pagination, setParams]
  );

  const onSortingChange = useCallback(
    (updaterOrValue: Updater<SortingState>) => {
      const next =
        typeof updaterOrValue === 'function' ? updaterOrValue(params.sort) : updaterOrValue;
      void setParams({ sort: next as ExtendedColumnSort<Patient>[] });
    },
    [params.sort, setParams]
  );

  // Pure controlled TanStack table
  const { table } = useControlledDataTable({
    data: activePatients,
    columns,
    pageCount,
    pagination,
    onPaginationChange,
    sorting: params.sort,
    onSortingChange,
    columnFilters: patientFilters.columnFilters,
    onColumnFiltersChange: patientFilters.onColumnFiltersChange,
    meta,
    manualFiltering: true,
    manualSorting: false,
    filterFromLeafRows: true,
    getSubRows: (row) => row.affiliates,
    initialState: {
      columnPinning: { left: ['select'], right: ['actions'] },
      expanded: true,
    },
  });

  const resetFilters = useCallback(() => {
    table.resetSorting();
    patientFilters.reset();
  }, [patientFilters, table]);

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
    hidePagination: isInfiniteSearch,
    sentinelRef: infiniteSearch.sentinelRef,
    isFetchingNextPage: infiniteSearch.isFetchingNextPage,
    hasNextPage: infiniteSearch.hasNextPage,
    totalPatients,
    resetFilters,
    patientFilters,
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
      closeBulkDelete,
    },
  };
}
