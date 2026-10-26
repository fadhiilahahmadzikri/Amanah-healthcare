'use client';

import { useMemo, useState } from 'react';
import type { LeaveRequestItem, ReplacementOpportunityItem } from '../api/types';

export type LeaveTabKey = 'all' | 'practitioners' | 'workers' | 'replacements';

export interface UseLeaveManagementViewProps {
  leaves: LeaveRequestItem[];
  replacements: ReplacementOpportunityItem[];
}

export function useLeaveManagementView({
  leaves = [],
  replacements = []
}: UseLeaveManagementViewProps) {
  const [activeTab, setActiveTab] = useState<LeaveTabKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [staffTypeFilter, setStaffTypeFilter] = useState('all');

  const hasActiveFilters = [
    Boolean(searchQuery.trim()),
    statusFilter !== 'all',
    staffTypeFilter !== 'all'
  ].some(Boolean);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setStaffTypeFilter('all');
  };

  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      // 1. Tab-based partition
      if (activeTab === 'practitioners') {
        const type = leave.staff?.staffType;
        if (type !== 'doctor' && type !== 'midwife') return false;
      } else if (activeTab === 'workers') {
        if (leave.staff?.staffType !== 'worker') return false;
      }

      // 2. Status filter
      if (statusFilter !== 'all' && leave.status !== statusFilter) {
        return false;
      }

      // 3. Staff category filter (from dropdown)
      if (staffTypeFilter !== 'all' && leave.staff?.staffType !== staffTypeFilter) {
        return false;
      }

      // 4. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const staffName = (leave.staff?.fullName || '').toLowerCase();
        const staffCode = (leave.staff?.idCardNumber || '').toLowerCase();
        const reason = (leave.reason || '').toLowerCase();
        const leaveType = (leave.type || '').toLowerCase();

        const searchTargets = [staffName, staffCode, reason, leaveType];
        const match = searchTargets.some((target) => target.includes(query));

        if (!match) return false;
      }

      return true;
    });
  }, [leaves, activeTab, statusFilter, staffTypeFilter, searchQuery]);

  const counts = useMemo(() => {
    const practitionerCount = leaves.filter(
      (l) => l.staff?.staffType === 'doctor' || l.staff?.staffType === 'midwife'
    ).length;
    const workerCount = leaves.filter((l) => l.staff?.staffType === 'worker').length;

    return {
      all: leaves.length,
      practitioners: practitionerCount,
      workers: workerCount,
      replacements: replacements.length
    };
  }, [leaves, replacements]);

  return {
    activeTab,
    searchQuery,
    statusFilter,
    staffTypeFilter,
    hasActiveFilters,
    filteredLeaves,
    counts,
    actions: {
      changeTab: setActiveTab,
      changeSearch: setSearchQuery,
      changeStatusFilter: setStatusFilter,
      changeStaffTypeFilter: setStaffTypeFilter,
      resetFilters
    }
  };
}

export type UseLeaveManagementViewReturn = ReturnType<typeof useLeaveManagementView>;
