'use client';

import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { staffsQueryOptions, staffInvitationsQueryOptions } from '../api/queries';
import type { StaffMember, StaffInvitation } from '../api/staff-management.api';

export type StaffTabType = 'members' | 'invitations';

export interface UseStaffManagementViewResult {
  activeTab: StaffTabType;
  searchQuery: string;
  allStaffs: StaffMember[];
  filteredStaffs: StaffMember[];
  allInvitations: StaffInvitation[];
  filteredInvitations: StaffInvitation[];
  loading: boolean;
  isFetching: boolean;
  actions: {
    changeTab: (tab: StaffTabType) => void;
    changeSearch: (value: string) => void;
    resetSearch: () => void;
  };
}

export function useStaffManagementView(): UseStaffManagementViewResult {
  const [params, setParams] = useQueryStates(
    {
      tab: parseAsStringLiteral(['members', 'invitations'] as const).withDefault('members'),
      search: parseAsString.withDefault('')
    },
    { shallow: true }
  );

  const {
    data: allStaffs = [],
    isLoading: isLoadingStaffs,
    isFetching: isFetchingStaffs
  } = useQuery(staffsQueryOptions());

  const {
    data: allInvitations = [],
    isLoading: isLoadingInvitations,
    isFetching: isFetchingInvitations
  } = useQuery(staffInvitationsQueryOptions());

  const q = params.search.trim().toLowerCase();

  const filteredStaffs = useMemo(() => {
    const list = q
      ? allStaffs.filter(
          (s) => s.fullName.toLowerCase().includes(q) || Boolean(s.email?.toLowerCase().includes(q))
        )
      : allStaffs;

    return [...list].sort((a, b) => {
      const activeA = a.isActive ? 1 : 0;
      const activeB = b.isActive ? 1 : 0;
      if (activeA !== activeB) return activeB - activeA;
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeA !== timeB) return timeB - timeA;
      return a.fullName.localeCompare(b.fullName);
    });
  }, [allStaffs, q]);

  const filteredInvitations = useMemo(() => {
    const list = q
      ? allInvitations.filter((inv) => inv.email.toLowerCase().includes(q))
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

  const resetSearch = useCallback(() => {
    setParams({ search: null }, { shallow: true });
  }, [setParams]);

  return {
    activeTab: params.tab,
    searchQuery: params.search,
    allStaffs,
    filteredStaffs,
    allInvitations,
    filteredInvitations,
    loading: isLoadingStaffs || isLoadingInvitations,
    isFetching: isFetchingStaffs || isFetchingInvitations,
    actions: {
      changeTab,
      changeSearch,
      resetSearch
    }
  };
}
