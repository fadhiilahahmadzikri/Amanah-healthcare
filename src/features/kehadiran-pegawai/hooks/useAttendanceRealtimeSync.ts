'use client';

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { attendanceKeys } from '../api/queries';

export interface AttendanceRealtimeEventPayload {
  attendanceId?: string;
  staffId?: string;
  staffName?: string;
  staffCode?: string;
  status?: string;
  action?: 'check_in' | 'manual_check_in' | 'check_out';
  date?: string;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  duration?: number;
}

export interface UseAttendanceRealtimeSyncOptions {
  onAttendanceEvent?: (payload: AttendanceRealtimeEventPayload) => void;
  refetch?: () => void | Promise<unknown>;
  enabled?: boolean;
}

/**
 * Architectural Custom Hook for Real-time Attendance Synchronization.
 * Decouples WebSocket transport events, TanStack query cache invalidation,
 * and live refetch orchestration from presentation components.
 */
export function useAttendanceRealtimeSync(options?: UseAttendanceRealtimeSyncOptions) {
  const queryClient = useQueryClient();
  const { onAttendanceEvent, refetch, enabled = true } = options ?? {};

  const handleRealtimeEvent = useCallback(
    (e: Event) => {
      const customEvent = e as CustomEvent<AttendanceRealtimeEventPayload>;
      const payload = customEvent.detail;

      // 1. Invalidate authoritative attendance cache in TanStack Query
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });

      // 2. Invoke optional refetch callback
      if (refetch) {
        void refetch();
      }

      // 3. Invoke optional domain callback
      if (onAttendanceEvent && payload) {
        onAttendanceEvent(payload);
      }
    },
    [queryClient, refetch, onAttendanceEvent]
  );

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    window.addEventListener('clinic:attendance_updated', handleRealtimeEvent);
    return () => {
      window.removeEventListener('clinic:attendance_updated', handleRealtimeEvent);
    };
  }, [enabled, handleRealtimeEvent]);
}
