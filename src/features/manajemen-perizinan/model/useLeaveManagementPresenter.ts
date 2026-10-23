'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAllLeavesQuery } from '../api/queries';
import { useReviewLeaveMutation } from '../api/mutations';
import { useLeaveRealtimeSync } from '../hooks/useLeaveRealtimeSync';
import { useLeaveFilters } from './useLeaveFilters';
import type { LeaveRequestItem } from '../api/types';
import type { LeaveConfigurationCategory } from '../components/leave-settings-button';

export function useLeaveManagementPresenter() {
  const searchParams = useSearchParams();
  const leaveIdParam = searchParams.get('leaveId');

  const { data: leaves = [], isLoading, refetch: refetchLeaves } = useAllLeavesQuery();
  const reviewMutation = useReviewLeaveMutation();

  // Architectural decoupled real-time synchronization
  useLeaveRealtimeSync({
    refetch: () => {
      void refetchLeaves();
    }
  });

  const filters = useLeaveFilters({ leaves });

  // View mode preference (Kanban vs List)
  const [viewPreference, setViewPreference] = useState<'kanban' | 'list'>('kanban');

  // Modal / Sheet visibility states
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequestItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsCategory, setSettingsCategory] = useState<LeaveConfigurationCategory>('policy');
  const [isReplacementOpportunitiesOpen, setIsReplacementOpportunitiesOpen] = useState(false);

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

  const openSettings = (category: LeaveConfigurationCategory = 'policy') => {
    setSettingsCategory(category);
    setIsSettingsOpen(true);
  };
  const closeSettings = () => setIsSettingsOpen(false);

  const openReplacementOpportunities = () => setIsReplacementOpportunitiesOpen(true);
  const closeReplacementOpportunities = () => setIsReplacementOpportunitiesOpen(false);

  const handleReviewLeave = useCallback(
    (id: string, status: 'approved' | 'rejected', approvalNotes?: string) => {
      reviewMutation.mutate({ id, status, approvalNotes });
    },
    [reviewMutation]
  );

  const isFlattenMode = filters.hasActiveFilters || viewPreference === 'list';

  return {
    filters,
    leaves,
    isLoading,
    viewMode: {
      preference: viewPreference,
      setPreference: setViewPreference,
      isFlattenMode
    },
    reviewLeave: handleReviewLeave,
    isReviewing: reviewMutation.isPending,
    detailModal: {
      selectedLeave,
      isOpen: isDetailOpen,
      open: openDetail,
      close: closeDetail
    },
    settingsModal: {
      isOpen: isSettingsOpen,
      category: settingsCategory,
      open: openSettings,
      close: closeSettings
    },
    replacementOpportunitiesModal: {
      isOpen: isReplacementOpportunitiesOpen,
      open: openReplacementOpportunities,
      close: closeReplacementOpportunities
    }
  };
}

export type UseLeaveManagementPresenterReturn = ReturnType<typeof useLeaveManagementPresenter>;
