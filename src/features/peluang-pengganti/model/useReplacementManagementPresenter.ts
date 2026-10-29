'use client';

import { useState, useCallback } from 'react';
import { useReplacementsQuery } from '../api/queries';
import { useAssignReplacementMutation, useCancelReplacementMutation } from '../api/mutations';
import { useReplacementFilters } from './useReplacementFilters';
import { useReplacementRealtimeSync } from '../hooks/useReplacementRealtimeSync';
import type { ReplacementOpportunityItem } from '../api/types';

export function useReplacementManagementPresenter() {
  const {
    data: opportunities = [],
    isLoading,
    refetch
  } = useReplacementsQuery({
    status: 'all',
    date: 'all'
  });

  useReplacementRealtimeSync({ refetch });

  const assignMutation = useAssignReplacementMutation();
  const cancelMutation = useCancelReplacementMutation();

  const filters = useReplacementFilters({ opportunities });

  // View mode preference (Kanban vs List)
  const [viewPreference, setViewPreference] = useState<'kanban' | 'list'>('kanban');

  // Modal states
  const [selectedOpportunity, setSelectedOpportunity] = useState<ReplacementOpportunityItem | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [assigningOpportunity, setAssigningOpportunity] =
    useState<ReplacementOpportunityItem | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const openDetail = useCallback((item: ReplacementOpportunityItem) => {
    setSelectedOpportunity(item);
    setIsDetailOpen(true);
  }, []);

  const closeDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedOpportunity(null);
  }, []);

  const openAssign = useCallback((item: ReplacementOpportunityItem) => {
    setAssigningOpportunity(item);
    setIsAssignOpen(true);
  }, []);

  const closeAssign = useCallback(() => {
    setIsAssignOpen(false);
    setAssigningOpportunity(null);
  }, []);

  const handleAssign = useCallback(
    (opportunityId: string, staffProfileId: string, practitionerId?: string, notes?: string) => {
      assignMutation.mutate(
        {
          id: opportunityId,
          payload: { staffProfileId, practitionerId, notes }
        },
        {
          onSuccess: () => {
            closeAssign();
            closeDetail();
          }
        }
      );
    },
    [assignMutation, closeAssign, closeDetail]
  );

  const handleCancel = useCallback(
    (opportunityId: string, reason?: string) => {
      cancelMutation.mutate(
        {
          id: opportunityId,
          payload: { reason }
        },
        {
          onSuccess: () => {
            closeDetail();
          }
        }
      );
    },
    [cancelMutation, closeDetail]
  );

  const isFlattenMode = filters.hasActiveFilters || viewPreference === 'list';

  return {
    filters,
    opportunities,
    isLoading,
    refetch,
    viewMode: {
      preference: viewPreference,
      setPreference: setViewPreference,
      isFlattenMode
    },
    detailModal: {
      selectedOpportunity,
      isOpen: isDetailOpen,
      open: openDetail,
      close: closeDetail
    },
    assignModal: {
      opportunity: assigningOpportunity,
      isOpen: isAssignOpen,
      open: openAssign,
      close: closeAssign
    },
    actions: {
      assign: handleAssign,
      cancel: handleCancel,
      isAssigning: assignMutation.isPending,
      isCancelling: cancelMutation.isPending
    }
  };
}

export type UseReplacementManagementPresenterReturn = ReturnType<
  typeof useReplacementManagementPresenter
>;
