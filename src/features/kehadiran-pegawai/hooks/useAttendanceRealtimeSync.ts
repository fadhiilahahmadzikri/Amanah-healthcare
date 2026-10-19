'use client';

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { attendanceKeys } from '../api/queries';

import type { AttendanceListResponse, StaffAttendance } from '../api/types';

export type AttendanceAction = 'check_in' | 'manual_check_in' | 'check_out';

export interface AttendanceRealtimeEventPayload extends StaffAttendance {
  action: AttendanceAction;
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
      if (!payload?.id) return;

      // 1. Optimistic, idempotent update on in-memory query cache (< 1ms trading terminal speed)
      queryClient.setQueriesData<AttendanceListResponse>(
        { queryKey: attendanceKeys.all },
        (old) => {
          if (!old) return old;
          const records = [...old.records];
          const matchIdx = records.findIndex(
            (r) => r.id === payload.id || r.id_staf === payload.id_staf
          );

          if (payload.action === 'check_out' && matchIdx !== -1) {
            records[matchIdx] = {
              ...records[matchIdx],
              checkOutAt: payload.checkOutAt,
              validatedDurationHours: payload.validatedDurationHours
            };
          } else if (matchIdx !== -1) {
            records[matchIdx] = { ...records[matchIdx], ...payload };
          } else {
            records.unshift(payload);
          }

          const isNewRow = matchIdx === -1;
          const newTotal = isNewRow ? old.total + 1 : old.total;

          const updatedSummary = old.summary
            ? {
                ...old.summary,
                staf_hadir: isNewRow ? old.summary.staf_hadir + 1 : old.summary.staf_hadir,
                staf_tidak_hadir: isNewRow
                  ? Math.max(0, old.summary.staf_tidak_hadir - 1)
                  : old.summary.staf_tidak_hadir,
                tingkat_kehadiran:
                  old.summary.total_staf > 0
                    ? Math.round(
                        ((isNewRow ? old.summary.staf_hadir + 1 : old.summary.staf_hadir) /
                          old.summary.total_staf) *
                          100
                      )
                    : 0
              }
            : old.summary;

          return {
            ...old,
            records,
            total: newTotal,
            summary: updatedSummary
          };
        }
      );

      // 2. Mark queries stale for future navigations without immediate network flash
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all, refetchType: 'none' });

      // 3. Optional callbacks
      if (refetch) {
        void refetch();
      }

      if (onAttendanceEvent) {
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
