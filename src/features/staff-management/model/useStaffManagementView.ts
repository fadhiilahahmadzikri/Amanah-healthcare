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
    if (!q) return allStaffs;
    return allStaffs.filter(
      (s) => s.fullName.toLowerCase().includes(q) || Boolean(s.email?.toLowerCase().includes(q))
    );
  }, [allStaffs, q]);

  const filteredInvitations = useMemo(() => {
    if (!q) return allInvitations;
    return allInvitations.filter((inv) => inv.email.toLowerCase().includes(q));
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
