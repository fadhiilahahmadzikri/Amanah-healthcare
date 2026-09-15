'use client';

import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { ColumnDef, Table } from '@tanstack/react-table';
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useDataTable } from '@/hooks/use-data-table';
import { getSortingStateParser } from '@/lib/parsers';
import { patientsQueryOptions } from '../api/queries';
import type { Patient, PatientFilters } from '../api/types';

interface UsePatientTableParams {
  columns: ColumnDef<Patient>[];
  columnIds: string[];
}

export interface UsePatientTableResult {
  table: Table<Patient>;
  selectedPatient: Patient | null;
  isDetailOpen: boolean;
  isEditOpen: boolean;
  actions: {
    openDetail: (patient: Patient) => void;
    closeDetail: () => void;
    openEdit: (patient: Patient) => void;
    closeEdit: () => void;
    openEditFromDetail: (patient: Patient) => void;
  };
}

export function usePatientTable({
  columns,
  columnIds
}: UsePatientTableParams): UsePatientTableResult {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeDialog, setActiveDialog] = useState<'detail' | 'edit' | null>(null);

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

  const { table } = useDataTable({
    data: data.patients,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 300,
    initialState: {
      columnPinning: { left: ['select'], right: ['actions'] }
    }
  });

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

  return {
    table,
    selectedPatient,
    isDetailOpen: activeDialog === 'detail',
    isEditOpen: activeDialog === 'edit',
    actions: {
      openDetail,
      closeDetail,
      openEdit,
      closeEdit,
      openEditFromDetail
    }
  };
}
