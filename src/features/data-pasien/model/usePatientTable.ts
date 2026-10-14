'use client';

import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { ColumnDef, Table } from '@tanstack/react-table';
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useDataTable } from '@/hooks/use-data-table';
import { getSortingStateParser } from '@/lib/parsers';
import { patientsQueryOptions } from '../api/queries';
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
  selectedPatient: Patient | null;
  selectedPatients: Patient[];
  isDetailOpen: boolean;
  isEditOpen: boolean;
  isHistoryOpen: boolean;
  isDeleteOpen: boolean;
  isBulkDeleteOpen: boolean;
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
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedPatients, setSelectedPatients] = useState<Patient[]>([]);
  const [activeDialog, setActiveDialog] = useState<
    'detail' | 'edit' | 'history' | 'delete' | 'bulkDelete' | null
  >(null);

  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    patient: parseAsString,
    name: parseAsString,
    search: parseAsString,
    gender: parseAsArrayOf(parseAsString, ','),
    account_status: parseAsArrayOf(parseAsString, ','),
    status: parseAsArrayOf(parseAsString, ','),
    sort: getSortingStateParser<Patient>(columnIds).withDefault([])
  });

  const querySearch = params.patient || params.name || params.search;
  const queryStatus = params.account_status || params.status;
  const filters: PatientFilters = {
    page: params.page,
    limit: params.perPage,
    ...(querySearch && { search: querySearch }),
    ...(params.gender && params.gender.length > 0 && { gender: params.gender }),
    ...(queryStatus && queryStatus.length > 0 && { status: queryStatus }),
    ...(params.sort.length > 0 && { sort: JSON.stringify(params.sort) })
  };

  const { data } = useSuspenseQuery(patientsQueryOptions(filters));
  const pageCount = Math.ceil(data.total_patients / params.perPage);

  const openDetail = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveDialog('detail');
  };

  const closeDetail = () => {
    setActiveDialog(null);
  };

  const openEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveDialog('edit');
  };

  const closeEdit = () => {
    setActiveDialog(null);
  };

  const openEditFromDetail = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveDialog('edit');
  };

  const openHistory = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveDialog('history');
  };

  const closeHistory = () => {
    setActiveDialog(null);
  };

  const openDelete = (patient: Patient) => {
    setSelectedPatient(patient);
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
    data: data.patients,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 300,
    meta,
    getSubRows: (row) => row.affiliates,
    initialState: {
      columnPinning: { left: ['select'], right: ['actions'] },
      expanded: true
    }
  });

  return {
    table,
    selectedPatient,
    selectedPatients,
    isDetailOpen: activeDialog === 'detail',
    isEditOpen: activeDialog === 'edit',
    isHistoryOpen: activeDialog === 'history',
    isDeleteOpen: activeDialog === 'delete',
    isBulkDeleteOpen: activeDialog === 'bulkDelete',
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
