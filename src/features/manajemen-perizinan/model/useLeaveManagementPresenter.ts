'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAllLeavesQuery, useReplacementsQuery } from '../api/queries';
import { useLeaveRealtimeSync } from '../hooks/useLeaveRealtimeSync';
import { useLeaveManagementView } from './useLeaveManagementView';
import type { LeaveRequestItem, ReplacementOpportunityItem } from '../api/types';

export function useLeaveManagementPresenter() {
  const searchParams = useSearchParams();
  const leaveIdParam = searchParams.get('leaveId');

  const {
    data: leaves = [],
    isLoading: isLeavesLoading,
    refetch: refetchLeaves
  } = useAllLeavesQuery();
  const {
    data: replacements = [],
    isLoading: isReplacementsLoading,
    refetch: refetchReplacements
  } = useReplacementsQuery('all');

  // Architectural decoupled real-time synchronization
  useLeaveRealtimeSync({
    refetch: () => {
      void refetchLeaves();
      void refetchReplacements();
    }
  });

  const view = useLeaveManagementView({ leaves, replacements });

  // Modal / Sheet visibility states
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequestItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedReplacement, setSelectedReplacement] = useState<ReplacementOpportunityItem | null>(
    null
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPayrollOpen, setIsPayrollOpen] = useState(false);

  // Auto-open detail sheet when leaveId query param matches a leave request
  useEffect(() => {
    if (leaveIdParam && leaves.length > 0) {
      const matched = leaves.find((l) => l.id === leaveIdParam);
      if (matched) {
        setSelectedLeave(matched);
        setIsDetailOpen(true);
      }
    }
  }, [leaveIdParam, leaves]);

  const openDetail = (leave: LeaveRequestItem) => {
    setSelectedLeave(leave);
    setIsDetailOpen(true);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedLeave(null);
  };

  const openReplacement = (rep: ReplacementOpportunityItem) => {
    setSelectedReplacement(rep);
  };

  const closeReplacement = () => {
    setSelectedReplacement(null);
  };

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  const openPayroll = () => setIsPayrollOpen(true);
  const closePayroll = () => setIsPayrollOpen(false);

  const isLoading = isLeavesLoading || isReplacementsLoading;

  return {
    view,
    leaves,
    replacements,
    isLoading,
    detailModal: {
      selectedLeave,
      isOpen: isDetailOpen,
      open: openDetail,
      close: closeDetail
    },
    replacementModal: {
      selectedReplacement,
      isOpen: Boolean(selectedReplacement),
      open: openReplacement,
      close: closeReplacement
    },
    settingsModal: {
      isOpen: isSettingsOpen,
      open: openSettings,
      close: closeSettings
    },
    payrollModal: {
      isOpen: isPayrollOpen,
      open: openPayroll,
      close: closePayroll
    }
  };
}

export type UseLeaveManagementPresenterReturn = ReturnType<typeof useLeaveManagementPresenter>;
