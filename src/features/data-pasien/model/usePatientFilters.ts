'use client';

import { useMemo, useCallback, useRef, useEffect } from 'react';
import { useQueryStates } from 'nuqs';
import type { ColumnFiltersState, Updater } from '@tanstack/react-table';
import {
  patientSearchParamsParsers,
  PATIENT_RESET_PARAMS,
  type PatientSearchParams,
} from './patient-search-params';
import { paramsToColumnFilters, columnFiltersToParams } from './patient-filter-codec';

export interface UsePatientFiltersResult {
  params: PatientSearchParams;
  setParams: ReturnType<typeof useQueryStates<typeof patientSearchParamsParsers>>[1];
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: (updaterOrValue: Updater<ColumnFiltersState>) => void;
  reset: () => void;
  setFilter: (key: keyof typeof PATIENT_RESET_PARAMS, value: unknown) => void;
  hasFilters: boolean;
  cancelDebounce: () => void;
}

export function usePatientFilters(): UsePatientFiltersResult {
  const [params, setParams] = useQueryStates(patientSearchParamsParsers, {
    shallow: true,
  });

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelDebounce = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => cancelDebounce(), [cancelDebounce]);

  // SSOT: ColumnFilters derived purely from URL search params - NO local mirror state!
  const columnFilters = useMemo<ColumnFiltersState>(
    () => paramsToColumnFilters(params as PatientSearchParams),
    [params]
  );

  const reset = useCallback(() => {
    cancelDebounce();
    void setParams(PATIENT_RESET_PARAMS);
  }, [cancelDebounce, setParams]);

  const onColumnFiltersChange = useCallback(
    (updaterOrValue: Updater<ColumnFiltersState>) => {
      const nextFilters =
        typeof updaterOrValue === 'function' ? updaterOrValue(columnFilters) : updaterOrValue;

      const nextParams = columnFiltersToParams(nextFilters);

      // If reset / empty filters, cancel pending debounce and write immediately
      if (nextFilters.length === 0) {
        cancelDebounce();
        void setParams(nextParams);
        return;
      }

      // Check if text search (name) changed vs current params
      const currentSearch = (params.name || params.search || params.patient || '').trim();
      const nextSearch = String(nextParams.name ?? '').trim();
      const isSearchChanging = currentSearch !== nextSearch;

      if (isSearchChanging) {
        cancelDebounce();
        debounceTimerRef.current = setTimeout(() => {
          void setParams(nextParams);
        }, 300);
      } else {
        cancelDebounce();
        void setParams(nextParams);
      }
    },
    [columnFilters, params, cancelDebounce, setParams]
  );

  const setFilter = useCallback(
    (key: keyof typeof PATIENT_RESET_PARAMS, value: unknown) => {
      cancelDebounce();
      void setParams({ [key]: value, page: 1 });
    },
    [cancelDebounce, setParams]
  );

  const hasFilters = useMemo(() => {
    const hasSearch = Boolean(
      (params.search && params.search.trim()) ||
      (params.name && params.name.trim()) ||
      (params.patient && params.patient.trim())
    );
    const hasGender = params.gender.length > 0;
    const hasStatus = params.account_status.length > 0 || params.status.length > 0;
    const hasBlood = params.blood_type.length > 0;
    const hasProfile = params.profile_type.length > 0;
    return hasSearch || hasGender || hasStatus || hasBlood || hasProfile;
  }, [params]);

  return {
    params: params as PatientSearchParams,
    setParams,
    columnFilters,
    onColumnFiltersChange,
    reset,
    setFilter,
    hasFilters,
    cancelDebounce,
  };
}
