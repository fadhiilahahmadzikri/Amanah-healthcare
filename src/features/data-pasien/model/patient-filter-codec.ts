import type { ColumnFiltersState } from '@tanstack/react-table';
import type { PatientSearchParams } from './patient-search-params';
import { PATIENT_RESET_PARAMS } from './patient-search-params';

/**
 * Pure function: converts nuqs URL search params to TanStack ColumnFiltersState.
 */
export function paramsToColumnFilters(params: PatientSearchParams): ColumnFiltersState {
  const filters: ColumnFiltersState = [];

  const searchVal = params.name || params.search || params.patient;
  if (searchVal && searchVal.trim().length > 0) {
    filters.push({ id: 'name', value: searchVal.trim() });
  }

  if (params.gender && params.gender.length > 0) {
    filters.push({ id: 'gender', value: params.gender });
  }

  const statusVal =
    params.account_status && params.account_status.length > 0
      ? params.account_status
      : params.status;
  if (statusVal && statusVal.length > 0) {
    filters.push({ id: 'account_status', value: statusVal });
  }

  if (params.blood_type && params.blood_type.length > 0) {
    filters.push({ id: 'blood_type', value: params.blood_type });
  }

  if (params.profile_type && params.profile_type.length > 0) {
    filters.push({ id: 'profile_type', value: params.profile_type });
  }

  return filters;
}

/**
 * Pure function: converts TanStack ColumnFiltersState back into URL search params.
 * Ensures all non-present filters are explicitly set to null (cleared from URL).
 */
export function columnFiltersToParams(
  filters: ColumnFiltersState
): Record<string, string | string[] | number | null> {
  const next: Record<string, string | string[] | number | null> = {
    ...PATIENT_RESET_PARAMS,
    page: 1, // Any filter change resets pagination
  };

  for (const filter of filters) {
    if (filter.value === undefined || filter.value === null || filter.value === '') {
      continue;
    }

    switch (filter.id) {
      case 'name':
      case 'search':
      case 'patient': {
        const str = String(filter.value).trim();
        next.name = str || null;
        next.search = null;
        next.patient = null;
        break;
      }
      case 'gender': {
        const arr = Array.isArray(filter.value)
          ? filter.value.filter(Boolean).map(String)
          : [String(filter.value)];
        next.gender = arr.length > 0 ? arr : null;
        break;
      }
      case 'account_status':
      case 'status': {
        const arr = Array.isArray(filter.value)
          ? filter.value.filter(Boolean).map(String)
          : [String(filter.value)];
        next.account_status = arr.length > 0 ? arr : null;
        next.status = null;
        break;
      }
      case 'blood_type': {
        const arr = Array.isArray(filter.value)
          ? filter.value.filter(Boolean).map(String)
          : [String(filter.value)];
        next.blood_type = arr.length > 0 ? arr : null;
        break;
      }
      case 'profile_type': {
        const arr = Array.isArray(filter.value)
          ? filter.value.filter(Boolean).map(String)
          : [String(filter.value)];
        next.profile_type = arr.length > 0 ? arr : null;
        break;
      }
    }
  }

  return next;
}
