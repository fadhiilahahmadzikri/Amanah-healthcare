'use client';

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { leaveManagementKeys } from '../api/query-keys';

export interface LeaveRealtimeEventPayload {
  leaveRequestId?: string;
  id?: string;
  staffId?: string;
  staffProfileId?: string;
  staffName?: string;
  status?: string;
  type?: string;
}

export interface UseLeaveRealtimeSyncOptions {
  onLeaveEvent?: (payload: LeaveRealtimeEventPayload) => void;
  refetch?: () => void | Promise<unknown>;
  enabled?: boolean;
}

/**
 * Architectural Custom Hook for Real-time Leave & Replacement Synchronization.
 * Decouples WebSocket transport events, TanStack query cache invalidation,
 * and live refetch orchestration from presentation components.
 */
export function useLeaveRealtimeSync(options?: UseLeaveRealtimeSyncOptions) {
  const queryClient = useQueryClient();
  const { onLeaveEvent, refetch, enabled = true } = options ?? {};

  const handleRealtimeEvent = useCallback(
    (e: Event) => {
      const customEvent = e as CustomEvent<LeaveRealtimeEventPayload>;
      const payload = customEvent.detail;

      // 1. Invalidate authoritative leave and replacement cache in TanStack Query
      queryClient.invalidateQueries({ queryKey: leaveManagementKeys.all });
      queryClient.invalidateQueries({ queryKey: leaveManagementKeys.replacements() });

      // 2. Invoke optional refetch callback
      if (refetch) {
        void refetch();
      }

      // 3. Invoke optional domain callback
      if (onLeaveEvent && payload) {
        onLeaveEvent(payload);
      }
    },
    [queryClient, refetch, onLeaveEvent]
  );

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    window.addEventListener('clinic:leave_updated', handleRealtimeEvent);
    return () => {
      window.removeEventListener('clinic:leave_updated', handleRealtimeEvent);
    };
  }, [enabled, handleRealtimeEvent]);
}
