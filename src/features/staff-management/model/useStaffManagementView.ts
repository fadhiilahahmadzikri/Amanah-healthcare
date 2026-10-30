'use client';

import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { staffsQueryOptions, staffInvitationsQueryOptions } from '../api/queries';
import type { StaffMember, StaffInvitation } from '../api/staff-management.api';

export type StaffTabType = 'members' | 'invitations';
export type StaffViewMode = 'grid' | 'kanban';

function toList(param: string | null | undefined): string[] {
  if (!param) return [];
  return param
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function toParam(list: string[]): string | null {
  return list.length > 0 ? list.join(',') : null;
}

export interface UseStaffManagementViewResult {
  activeTab: StaffTabType;
  searchQuery: string;
  viewMode: StaffViewMode;
  selectedRoles: string[];
  selectedStatuses: string[];
  selectedPoli: string[];
  hasActiveFilters: boolean;
  allStaffs: StaffMember[];
  filteredStaffs: StaffMember[];
  allInvitations: StaffInvitation[];
  filteredInvitations: StaffInvitation[];
  loading: boolean;
  isFetching: boolean;
  refetch: () => Promise<unknown>;
  actions: {
    changeTab: (tab: StaffTabType) => void;
    changeSearch: (value: string) => void;
    changeViewMode: (mode: StaffViewMode) => void;
    changeSelectedRoles: (roles: string[]) => void;
    changeSelectedStatuses: (statuses: string[]) => void;
    changeSelectedPoli: (poliList: string[]) => void;
    resetSearch: () => void;
    resetFilters: () => void;
  };
}

export function useStaffManagementView(): UseStaffManagementViewResult {
  const [params, setParams] = useQueryStates(
    {
      tab: parseAsStringLiteral(['members', 'invitations'] as const).withDefault('members'),
      search: parseAsString.withDefault(''),
      view: parseAsStringLiteral(['grid', 'kanban'] as const).withDefault('grid'),
      role: parseAsString.withDefault(''),
      status: parseAsString.withDefault(''),
      poli: parseAsString.withDefault('')
    },
    { shallow: true }
  );

  const selectedRoles = useMemo(() => toList(params.role), [params.role]);
  const selectedStatuses = useMemo(() => toList(params.status), [params.status]);
  const selectedPoli = useMemo(() => toList(params.poli), [params.poli]);

  const {
    data: allStaffs = [],
    isLoading: isLoadingStaffs,
    isFetching: isFetchingStaffs,
    refetch: refetchStaffs
  } = useQuery(staffsQueryOptions());

  const {
    data: allInvitations = [],
    isLoading: isLoadingInvitations,
    isFetching: isFetchingInvitations,
    refetch: refetchInvitations
  } = useQuery(staffInvitationsQueryOptions());

  const q = params.search.trim().toLowerCase();

  const filteredStaffs = useMemo(() => {
    let list = allStaffs;

    // Search query matching name, email, code, profession, or clinic unit
    if (q) {
      list = list.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          Boolean(s.email?.toLowerCase().includes(q)) ||
          Boolean(s.staffCode?.toLowerCase().includes(q)) ||
          Boolean(s.profession?.toLowerCase().includes(q)) ||
          Boolean(s.poliklinikName?.toLowerCase().includes(q))
      );
    }

    // Dynamic Role filter
    if (selectedRoles.length > 0) {
      list = list.filter((s) => {
        const key = s.roleId || s.roleCode;
        return key && selectedRoles.includes(key);
      });
    }

    // Operational Status filter
    if (selectedStatuses.length > 0) {
      list = list.filter((s) => selectedStatuses.includes(s.status));
    }

    // Poliklinik filter
    if (selectedPoli.length > 0) {
      list = list.filter(
        (s) =>
          (s.poliklinikId && selectedPoli.includes(s.poliklinikId)) ||
          (s.poliklinikName && selectedPoli.includes(s.poliklinikName))
      );
    }

    // Deterministic sorting: pending > active > on_leave > inactive, then createdAt desc
    return [...list].sort((a, b) => {
      const getPriority = (st?: string) => {
        if (st === 'pending') return 4;
        if (st === 'active') return 3;
        if (st === 'on_leave') return 2;
        return 1;
      };
      const diff = getPriority(b.status) - getPriority(a.status);
      if (diff !== 0) return diff;
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeA !== timeB) return timeB - timeA;
      return a.fullName.localeCompare(b.fullName);
    });
  }, [allStaffs, q, selectedRoles, selectedStatuses, selectedPoli]);

  const filteredInvitations = useMemo(() => {
    const list = q
      ? allInvitations.filter(
          (inv) =>
            inv.email.toLowerCase().includes(q) || Boolean(inv.roleCode?.toLowerCase().includes(q))
        )
      : allInvitations;

    return [...list].sort((a, b) => {
      const isPendingA = a.status === 'pending' ? 1 : 0;
      const isPendingB = b.status === 'pending' ? 1 : 0;
      if (isPendingA !== isPendingB) return isPendingB - isPendingA;
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [allInvitations, q]);

  const hasActiveFilters = Boolean(
    q || selectedRoles.length > 0 || selectedStatuses.length > 0 || selectedPoli.length > 0
  );

  const changeTab = useCallback(
    (tab: StaffTabType) => {
      setParams({ tab }, { shallow: true });
    },
    [setParams]
  );

  const changeSearch = useCallback(
    (search: string) => {
      setParams({ search: search || null }, { shallow: true });
    },
    [setParams]
  );

  const changeViewMode = useCallback(
    (view: StaffViewMode) => {
      setParams({ view }, { shallow: true });
    },
    [setParams]
  );

  const changeSelectedRoles = useCallback(
    (roles: string[]) => {
      setParams({ role: toParam(roles) }, { shallow: true });
    },
    [setParams]
  );

  const changeSelectedStatuses = useCallback(
    (statuses: string[]) => {
      setParams({ status: toParam(statuses) }, { shallow: true });
    },
    [setParams]
  );

  const changeSelectedPoli = useCallback(
    (poliList: string[]) => {
      setParams({ poli: toParam(poliList) }, { shallow: true });
    },
    [setParams]
  );

  const resetSearch = useCallback(() => {
    setParams({ search: null }, { shallow: true });
  }, [setParams]);

  const resetFilters = useCallback(() => {
    setParams({ search: null, role: null, status: null, poli: null }, { shallow: true });
  }, [setParams]);

  const refetch = useCallback(async () => {
    await Promise.all([refetchStaffs(), refetchInvitations()]);
  }, [refetchStaffs, refetchInvitations]);

  return {
    activeTab: params.tab,
    searchQuery: params.search,
    viewMode: params.view,
    selectedRoles,
    selectedStatuses,
    selectedPoli,
    hasActiveFilters,
    allStaffs,
    filteredStaffs,
    allInvitations,
    filteredInvitations,
    loading: isLoadingStaffs || isLoadingInvitations,
    isFetching: isFetchingStaffs || isFetchingInvitations,
    refetch,
    actions: {
      changeTab,
      changeSearch,
      changeViewMode,
      changeSelectedRoles,
      changeSelectedStatuses,
      changeSelectedPoli,
      resetSearch,
      resetFilters
    }
  };
}
