'use client';

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { replacementKeys } from '../api/query-keys';

export interface ReplacementRealtimeEventPayload {
  opportunityId?: string;
  id?: string;
  status?: string;
  workDate?: string;
}

export interface UseReplacementRealtimeSyncOptions {
  onReplacementEvent?: (payload: ReplacementRealtimeEventPayload) => void;
  refetch?: () => void | Promise<unknown>;
  enabled?: boolean;
}

/**
 * Architectural Custom Hook for Real-time Replacement Synchronization.
 * Decouples WebSocket transport events, TanStack query cache invalidation,
 * and live refetch orchestration for replacement opportunities.
 */
export function useReplacementRealtimeSync(options?: UseReplacementRealtimeSyncOptions) {
  const queryClient = useQueryClient();
  const { onReplacementEvent, refetch, enabled = true } = options ?? {};

  const handleRealtimeEvent = useCallback(
    (e: Event) => {
      const customEvent = e as CustomEvent<ReplacementRealtimeEventPayload>;
      const payload = customEvent.detail;

      // 1. Invalidate replacement opportunities query cache
      queryClient.invalidateQueries({ queryKey: replacementKeys.all });

      // 2. Invoke optional refetch callback
      if (refetch) {
        void refetch();
      }

      // 3. Invoke optional domain callback
      if (onReplacementEvent && payload) {
        onReplacementEvent(payload);
      }
    },
    [queryClient, refetch, onReplacementEvent]
  );

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    window.addEventListener('clinic:replacement_updated', handleRealtimeEvent);
    window.addEventListener('clinic:leave_updated', handleRealtimeEvent);

    return () => {
      window.removeEventListener('clinic:replacement_updated', handleRealtimeEvent);
      window.removeEventListener('clinic:leave_updated', handleRealtimeEvent);
    };
  }, [enabled, handleRealtimeEvent]);
}
