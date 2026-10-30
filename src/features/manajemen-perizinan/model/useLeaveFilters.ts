'use client';

import { useCallback, useMemo } from 'react';
import { parseAsString, useQueryStates } from 'nuqs';
import type { LeaveRequestItem } from '../api/types';

export interface UseLeaveFiltersProps {
  leaves: LeaveRequestItem[];
}

export interface UseLeaveFiltersResult {
  searchQuery: string;
  statusFilter: string[];
  staffTypeFilter: string[];
  leaveTypeFilter: string[];
  filteredLeaves: LeaveRequestItem[];
  hasActiveFilters: boolean;
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  actions: {
    changeSearch: (value: string) => void;
    changeStatusFilter: (statusList: string[]) => void;
    changeStaffTypeFilter: (staffTypeList: string[]) => void;
    changeLeaveTypeFilter: (leaveTypeList: string[]) => void;
    resetFilters: () => void;
  };
}

export type UseLeaveFiltersReturn = UseLeaveFiltersResult;

export function useLeaveFilters(
  { leaves = [] }: UseLeaveFiltersProps = { leaves: [] }
): UseLeaveFiltersResult {
  const [params, setParams] = useQueryStates(
    {
      search: parseAsString.withDefault(''),
      status: parseAsString.withDefault(''),
      staffType: parseAsString.withDefault(''),
      leaveType: parseAsString.withDefault('')
    },
    { shallow: true }
  );

  const statusFilter = useMemo(() => toList(params.status), [params.status]);
  const staffTypeFilter = useMemo(() => toList(params.staffType), [params.staffType]);
  const leaveTypeFilter = useMemo(() => toList(params.leaveType), [params.leaveType]);

  const hasActiveFilters = [
    Boolean(params.search?.trim()),
    statusFilter.length > 0,
    staffTypeFilter.length > 0,
    leaveTypeFilter.length > 0
  ].some(Boolean);

  const filteredLeaves = useMemo(() => {
    const query = (params.search || '').trim().toLowerCase();

    return leaves.filter((leave) => {
      // 1. Status filter
      if (statusFilter.length > 0 && !statusFilter.includes(leave.status)) {
        return false;
      }

      // 2. Staff role filter
      if (staffTypeFilter.length > 0) {
        const roleKey = leave.staff?.roleId || leave.staff?.roleCode;
        if (!roleKey || !staffTypeFilter.includes(roleKey)) {
          return false;
        }
      }

      // 3. Leave type filter
      if (leaveTypeFilter.length > 0 && !leaveTypeFilter.includes(leave.type)) {
        return false;
      }

      // 4. Search query filter (matches staff name, profession, idCardNumber, reason, leave ID)
      if (query) {
        const staffName = leave.staff?.fullName?.toLowerCase() || '';
        const staffProfession = leave.staff?.profession?.toLowerCase() || '';
        const staffIdCardNumber = leave.staff?.idCardNumber?.toLowerCase() || '';
        const reason = leave.reason?.toLowerCase() || '';
        const leaveId = leave.id?.toLowerCase() || '';

        const searchTargets = [staffName, staffProfession, staffIdCardNumber, reason, leaveId];
        const match = searchTargets.some((target) => target.includes(query));

        if (!match) {
          return false;
        }
      }

      return true;
    });
  }, [leaves, statusFilter, staffTypeFilter, leaveTypeFilter, params.search]);

  const counts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    for (const leave of leaves) {
      if (leave.status === 'pending') {
        pending += 1;
      } else if (leave.status === 'approved') {
        approved += 1;
      } else if (leave.status === 'rejected') {
        rejected += 1;
      }
    }

    return {
      all: leaves.length,
      pending,
      approved,
      rejected
    };
  }, [leaves]);

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

  const changeStaffTypeFilter = useCallback(
    (staffTypeList: string[]) => {
      setParams({ staffType: toParam(staffTypeList) }, { shallow: true });
    },
    [setParams]
  );

  const changeLeaveTypeFilter = useCallback(
    (leaveTypeList: string[]) => {
      setParams({ leaveType: toParam(leaveTypeList) }, { shallow: true });
    },
    [setParams]
  );

  const resetFilters = useCallback(() => {
    setParams(
      {
        search: null,
        status: null,
        staffType: null,
        leaveType: null
      },
      { shallow: true }
    );
  }, [setParams]);

  const actions = useMemo(
    () => ({
      changeSearch,
      changeStatusFilter,
      changeStaffTypeFilter,
      changeLeaveTypeFilter,
      resetFilters
    }),
    [changeSearch, changeStatusFilter, changeStaffTypeFilter, changeLeaveTypeFilter, resetFilters]
  );

  return {
    searchQuery: params.search,
    statusFilter,
    staffTypeFilter,
    leaveTypeFilter,
    filteredLeaves,
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
