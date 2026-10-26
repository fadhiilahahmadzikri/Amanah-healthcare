'use client';

import { useCallback, useMemo } from 'react';
import { parseAsString, useQueryStates } from 'nuqs';
import type { ReplacementOpportunityItem } from '../api/types';

export interface UseReplacementFiltersProps {
  opportunities: ReplacementOpportunityItem[];
}

export interface UseReplacementFiltersResult {
  searchQuery: string;
  statusFilter: string[];
  sessionFilter: string[];
  filteredOpportunities: ReplacementOpportunityItem[];
  hasActiveFilters: boolean;
  counts: {
    all: number;
    open: number;
    claimed: number;
    completed: number;
    cancelled: number;
  };
  actions: {
    changeSearch: (value: string) => void;
    changeStatusFilter: (statusList: string[]) => void;
    changeSessionFilter: (sessionList: string[]) => void;
    resetFilters: () => void;
  };
}

export function useReplacementFilters(
  { opportunities = [] }: UseReplacementFiltersProps = { opportunities: [] }
): UseReplacementFiltersResult {
  const [params, setParams] = useQueryStates(
    {
      search: parseAsString.withDefault(''),
      status: parseAsString.withDefault(''),
      session: parseAsString.withDefault('')
    },
    { shallow: true }
  );

  const statusFilter = useMemo(() => toList(params.status), [params.status]);
  const sessionFilter = useMemo(() => toList(params.session), [params.session]);

  const hasActiveFilters = [
    Boolean(params.search?.trim()),
    statusFilter.length > 0,
    sessionFilter.length > 0
  ].some(Boolean);

  const filteredOpportunities = useMemo(() => {
    const query = (params.search || '').trim().toLowerCase();

    return opportunities.filter((item) => {
      // 1. Status filter
      if (statusFilter.length > 0 && !statusFilter.includes(item.status)) {
        return false;
      }

      // 2. Session code filter (morning, afternoon, night, early_morning)
      if (sessionFilter.length > 0) {
        const code = item.sessionCode?.toLowerCase() || '';
        if (!code || !sessionFilter.includes(code)) {
          return false;
        }
      }

      // 3. Search query filter (matches original staff, claimed staff, role, leave reason, notes)
      if (query) {
        const searchableFields = [
          item.originalStaffName,
          item.originalStaffRole,
          item.claimedByName,
          item.claimedByRole,
          item.leaveReason,
          item.notes,
          item.sessionCode
        ];

        const match = searchableFields.some(
          (field) => typeof field === 'string' && field.toLowerCase().includes(query)
        );

        if (!match) {
          return false;
        }
      }

      return true;
    });
  }, [opportunities, statusFilter, sessionFilter, params.search]);

  const counts = useMemo(() => {
    let open = 0;
    let claimed = 0;
    let completed = 0;
    let cancelled = 0;

    for (const item of opportunities) {
      if (item.status === 'open') open += 1;
      else if (item.status === 'claimed') claimed += 1;
      else if (item.status === 'completed') completed += 1;
      else if (item.status === 'cancelled') cancelled += 1;
    }

    return {
      all: opportunities.length,
      open,
      claimed,
      completed,
      cancelled
    };
  }, [opportunities]);

  const changeSearch = useCallback(
    (value: string) => {
      setParams({ search: value ? value : null }, { shallow: true });
    },
    [setParams]
  );

  const changeStatusFilter = useCallback(
    (statusList: string[]) => {
      setParams({ status: toParam(statusList) }, { shallow: true });
    },
    [setParams]
  );

  const changeSessionFilter = useCallback(
    (sessionList: string[]) => {
      setParams({ session: toParam(sessionList) }, { shallow: true });
    },
    [setParams]
  );

  const resetFilters = useCallback(() => {
    setParams(
      {
        search: null,
        status: null,
        session: null
      },
      { shallow: true }
    );
  }, [setParams]);

  const actions = useMemo(
    () => ({
      changeSearch,
      changeStatusFilter,
      changeSessionFilter,
      resetFilters
    }),
    [changeSearch, changeStatusFilter, changeSessionFilter, resetFilters]
  );

  return {
    searchQuery: params.search,
    statusFilter,
    sessionFilter,
    filteredOpportunities,
    hasActiveFilters,
    counts,
    actions
  };
}

function toList(value: string): string[] {
  return value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function toParam(value: string[]): string | null {
  const clean = value.map((item) => item.trim()).filter(Boolean);
  return clean.length > 0 ? clean.join(',') : null;
}
