'use client';

import { useMemo, useCallback } from 'react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import type { ColumnDef, Table } from '@tanstack/react-table';
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useDataTable } from '@/hooks/use-data-table';
import { patientAffiliationService } from '@/features/data-pasien/api/patient-affiliation-service';
import {
  CLINICAL_HISTORY_TAB,
  type ClinicalHistoryTabType,
  type MaternalHistoryItem,
  type ImmunizationHistoryItem,
  type ClinicalHistoryFilters,
  maternalHistoryQueryOptions,
  immunizationHistoryQueryOptions
} from '../api/history-queries';
import {
  useClinicalHistoryDialogs,
  type UseClinicalHistoryDialogsResult
} from './useClinicalHistoryDialogs';

export interface UseClinicalHistoryTableParams {
  maternityColumns: ColumnDef<MaternalHistoryItem>[];
  immunizationColumns: ColumnDef<ImmunizationHistoryItem>[];
  dialogs?: UseClinicalHistoryDialogsResult;
}

export interface UseClinicalHistoryTableResult {
  activeTab: ClinicalHistoryTabType;
  setActiveTab: (tab: ClinicalHistoryTabType) => void;
  maternalTable: Table<MaternalHistoryItem>;
  immunizationTable: Table<ImmunizationHistoryItem>;
  activeTable: Table<MaternalHistoryItem> | Table<ImmunizationHistoryItem>;
  maternalRows: MaternalHistoryItem[];
  immunizationRows: ImmunizationHistoryItem[];
  familyMembers: Array<{
    id: string;
    fullName: string;
    relationshipLabel?: string;
    relationship: string;
  }>;
  search: string;
  setSearch: (search: string) => void;
  patientId: string;
  setPatientId: (id: string) => void;
  hasFilters: boolean;
  resetFilters: () => void;
  isLoading: boolean;
  isFetching: boolean;
  totalMaternal: number;
  totalImmunization: number;
  totalActive: number;
  dialogs: UseClinicalHistoryDialogsResult;
}

export function useClinicalHistoryTable({
  maternityColumns,
  immunizationColumns,
  dialogs: customDialogs
}: UseClinicalHistoryTableParams): UseClinicalHistoryTableResult {
  const internalDialogs = useClinicalHistoryDialogs();
  const dialogs = customDialogs || internalDialogs;

  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    search: parseAsString.withDefault(''),
    patientId: parseAsString.withDefault(''),
    tab: parseAsStringLiteral(['maternity', 'immunization'] as const).withDefault('maternity')
  });

  const activeTab = params.tab as ClinicalHistoryTabType;

  const setActiveTab = useCallback(
    (tab: ClinicalHistoryTabType) => {
      setParams({ tab, page: 1 });
    },
    [setParams]
  );

  const setSearch = useCallback(
    (search: string) => {
      setParams({ search, page: 1 });
    },
    [setParams]
  );

  const setPatientId = useCallback(
    (patientId: string) => {
      setParams({ patientId, page: 1 });
    },
    [setParams]
  );

  // Load family members for patient filtering
  const { data: familyMembers = [] } = useQuery({
    queryKey: ['patient-affiliations', 'me'],
    queryFn: () => patientAffiliationService.getMyAffiliations(),
    staleTime: 60_000
  });

  const filters: ClinicalHistoryFilters = useMemo(
    () => ({
      page: params.page,
      limit: params.perPage,
      search: params.search.trim() || undefined,
      patientId: params.patientId || undefined
    }),
    [params.page, params.perPage, params.search, params.patientId]
  );

  const { data: maternalData, isFetching: isMaternalFetching } = useSuspenseQuery(
    maternalHistoryQueryOptions(filters)
  );
  const { data: immunizationData, isFetching: isImmunizationFetching } = useSuspenseQuery(
    immunizationHistoryQueryOptions(filters)
  );

  const maternalRows = maternalData.data ?? [];
  const immunizationRows = immunizationData.data ?? [];
  const totalMaternal = maternalData.total ?? 0;
  const totalImmunization = immunizationData.total ?? 0;
  const totalActive =
    activeTab === CLINICAL_HISTORY_TAB.MATERNITY ? totalMaternal : totalImmunization;

  const maternalPageCount = Math.max(1, Math.ceil(totalMaternal / params.perPage));
  const immunizationPageCount = Math.max(1, Math.ceil(totalImmunization / params.perPage));

  const { table: maternalTable } = useDataTable({
    data: maternalRows,
    columns: maternityColumns,
    pageCount: maternalPageCount,
    shallow: true,
    debounceMs: 300,
    initialState: {
      columnPinning: { right: ['actions'] }
    }
  });

  const { table: immunizationTable } = useDataTable({
    data: immunizationRows,
    columns: immunizationColumns,
    pageCount: immunizationPageCount,
    shallow: true,
    debounceMs: 300,
    initialState: {
      columnPinning: { right: ['actions'] }
    }
  });

  const activeTable =
    activeTab === CLINICAL_HISTORY_TAB.MATERNITY ? maternalTable : immunizationTable;

  const hasFilters = Boolean(params.search.trim() || params.patientId);

  const resetFilters = useCallback(() => {
    setParams({
      search: '',
      patientId: '',
      page: 1
    });
  }, [setParams]);

  const isLoading = false;

  const isFetching =
    activeTab === CLINICAL_HISTORY_TAB.MATERNITY ? isMaternalFetching : isImmunizationFetching;

  return {
    activeTab,
    setActiveTab,
    maternalTable,
    immunizationTable,
    activeTable,
    maternalRows,
    immunizationRows,
    familyMembers,
    search: params.search,
    setSearch,
    patientId: params.patientId,
    setPatientId,
    hasFilters,
    resetFilters,
    isLoading,
    isFetching,
    totalMaternal,
    totalImmunization,
    totalActive,
    dialogs
  };
}
