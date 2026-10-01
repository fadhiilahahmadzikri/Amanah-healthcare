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
  currentTimeSlot: string;
}

export interface UseBookingSessionsResult {
  sessions: BookingOptionShift[];
  isLoading: boolean;
  setTimeSlot: (slot: string) => void;
  setSessionId: (id: string) => void;
}

export interface UseBookingSessionsOptions {
  onTimeSlotChange: (slot: string) => void;
  onSessionIdChange?: (id: string) => void;
}

/**
 * Single source of truth for booking session availability.
 *
 * Fetches from GET /api/v1/schedules/booking-options with the correct
 * query parameters for both create and reschedule contexts:
 *   - Create:     date + poliklinikId (no staffId — clinic-level availability)
 *   - Reschedule: date + poliklinikId + staffId (doctor-specific availability)
 *
 * Handles auto-selection: if the current slot is disabled or absent after a
 * fetch, advances to the first available slot (or clears if none exist).
 */
export function useBookingSessions(
  { dateStr, poliklinikId, staffId, currentTimeSlot }: UseBookingSessionsParams,
  { onTimeSlotChange, onSessionIdChange }: UseBookingSessionsOptions
): { sessions: BookingOptionShift[]; isLoading: boolean } {
  const [sessions, setSessions] = useState<BookingOptionShift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentTimeSlotRef = useRef(currentTimeSlot);
  currentTimeSlotRef.current = currentTimeSlot;

  const onTimeSlotChangeRef = useRef(onTimeSlotChange);
  onTimeSlotChangeRef.current = onTimeSlotChange;

  const onSessionIdChangeRef = useRef(onSessionIdChange);
  onSessionIdChangeRef.current = onSessionIdChange;

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

        const current = result.find((s) => s.session === currentTimeSlotRef.current);
        const currentIsValid = current && !current.isDisabled;

        if (!currentIsValid) {
          const firstAvailable = result.find((s) => !s.isDisabled);
          if (firstAvailable) {
            onTimeSlotChangeRef.current(firstAvailable.session);
            if (firstAvailable.practitioners[0]?.sessionId) {
              onSessionIdChangeRef.current?.(firstAvailable.practitioners[0].sessionId);
            }
          } else {
            onTimeSlotChangeRef.current('');
            onSessionIdChangeRef.current?.('');
          }
        } else if (current.practitioners[0]?.sessionId) {
          onSessionIdChangeRef.current?.(current.practitioners[0].sessionId);
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
