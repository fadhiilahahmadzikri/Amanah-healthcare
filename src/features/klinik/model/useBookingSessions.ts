'use client';

import { useState, useEffect, useRef } from 'react';
import {
  patientAffiliationService,
  type BookingOptionShift
} from '@/features/data-pasien/api/patient-affiliation-service';

export interface UseBookingSessionsParams {
  dateStr: string;
  poliklinikId?: string;
  staffId?: string;
  currentSession?: string;
}

export interface UseBookingSessionsOptions {
  onSessionChange?: (session: string) => void;
  onSessionIdChange?: (id: string) => void;
  onSessionLabelChange?: (label: string) => void;
}

/**
 * Single source of truth for booking session availability.
 *
 * Fetches from GET /api/v1/schedules/booking-options with the correct
 * query parameters: date + poliklinikId (plus optional staffId).
 *
 * Handles auto-selection: if the current session is disabled or absent after a
 * fetch, advances to the first available session (or clears if none exist).
 */
export function useBookingSessions(
  { dateStr, poliklinikId, staffId, currentSession }: UseBookingSessionsParams,
  { onSessionChange, onSessionIdChange, onSessionLabelChange }: UseBookingSessionsOptions
): { sessions: BookingOptionShift[]; isLoading: boolean } {
  const [sessions, setSessions] = useState<BookingOptionShift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const effectiveSession = currentSession ?? '';
  const currentSessionRef = useRef(effectiveSession);
  currentSessionRef.current = effectiveSession;

  const onSessionChangeRef = useRef(onSessionChange);
  onSessionChangeRef.current = onSessionChange;

  const onSessionIdChangeRef = useRef(onSessionIdChange);
  onSessionIdChangeRef.current = onSessionIdChange;

  const onSessionLabelChangeRef = useRef(onSessionLabelChange);
  onSessionLabelChangeRef.current = onSessionLabelChange;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const result = await patientAffiliationService.getBookingOptions(
          dateStr,
          poliklinikId,
          staffId
        );
        if (cancelled) return;

        setSessions(result);

        const current = result.find((s) => s.session === currentSessionRef.current);
        const currentIsValid = current && !current.isDisabled;

        if (!currentIsValid) {
          const firstAvailable = result.find((s) => !s.isDisabled);
          if (firstAvailable) {
            onSessionChangeRef.current?.(firstAvailable.session);
            onSessionLabelChangeRef.current?.(firstAvailable.label);
            if (firstAvailable.practitioners[0]?.sessionId) {
              onSessionIdChangeRef.current?.(firstAvailable.practitioners[0].sessionId);
            }
          } else {
            onSessionChangeRef.current?.('');
            onSessionLabelChangeRef.current?.('');
            onSessionIdChangeRef.current?.('');
          }
        } else {
          onSessionLabelChangeRef.current?.(current.label);
          if (current.practitioners[0]?.sessionId) {
            onSessionIdChangeRef.current?.(current.practitioners[0].sessionId);
          }
        }
      } catch (err) {
        console.error('[useBookingSessions] Failed to load booking options:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [dateStr, poliklinikId, staffId]);

  return { sessions, isLoading };
}
