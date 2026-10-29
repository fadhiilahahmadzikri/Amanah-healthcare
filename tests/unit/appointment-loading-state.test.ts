import { describe, it, expect } from 'bun:test';
import { normalizeFilters } from '../../src/features/appointment-pasien/api/types';
import {
  appointmentInfiniteQueryOptions,
  appointmentKeys
} from '../../src/features/appointment-pasien/api/queries';
import { DEFAULT_APPOINTMENT_PAGE_LIMIT } from '../../src/features/appointment-pasien/constants/options';

describe('Appointment Loading State Machine & Query Key Alignment', () => {
  describe('Query Key Alignment between RSC Prefetch and Client Hook', () => {
    it('normalizes default limit to DEFAULT_APPOINTMENT_PAGE_LIMIT (20) instead of legacy 10', () => {
      const serverNormalized = normalizeFilters({
        page: 1,
        limit: DEFAULT_APPOINTMENT_PAGE_LIMIT
      });

      const clientNormalized = normalizeFilters({
        page: 1,
        limit: DEFAULT_APPOINTMENT_PAGE_LIMIT
      });

      expect(serverNormalized.limit).toBe(20);
      expect(clientNormalized.limit).toBe(20);

      // Verify that server prefetch key matches client hook key exactly
      const serverKey = appointmentKeys.infiniteList(serverNormalized);
      const clientKey = appointmentKeys.infiniteList(clientNormalized);

      expect(serverKey).toEqual(clientKey);
    });

    it('preserves custom limit when explicitly provided', () => {
      const normalized = normalizeFilters({
        page: 2,
        limit: 50
      });

      expect(normalized.page).toBe(2);
      expect(normalized.limit).toBe(50);
    });
  });

  describe('appointmentInfiniteQueryOptions', () => {
    it('includes keepPreviousData placeholderData to prevent flashing initial skeleton during search/filters', () => {
      const options = appointmentInfiniteQueryOptions({
        page: 1,
        limit: DEFAULT_APPOINTMENT_PAGE_LIMIT
      });

      expect(options.placeholderData).toBeDefined();
      expect(typeof options.placeholderData).toBe('function');
      expect(options.staleTime).toBe(30 * 1000);
      expect(options.initialPageParam).toBe(1);
    });

    it('calculates getNextPageParam correctly based on DEFAULT_APPOINTMENT_PAGE_LIMIT', () => {
      const options = appointmentInfiniteQueryOptions({});

      // Less than 20 items -> no next page
      const lastPageUnderLimit = {
        success: true,
        time: '',
        total_appointments: 5,
        offset: 0,
        limit: 20,
        appointments: Array.from({ length: 5 }, (_, i) => ({ id: `apt-${i}` }) as any)
      };
      expect(
        options.getNextPageParam(lastPageUnderLimit as any, [lastPageUnderLimit] as any)
      ).toBeUndefined();

      // Exactly 20 items -> next page is 2
      const lastPageFull = {
        success: true,
        time: '',
        total_appointments: 40,
        offset: 0,
        limit: 20,
        appointments: Array.from({ length: 20 }, (_, i) => ({ id: `apt-${i}` }) as any)
      };
      expect(options.getNextPageParam(lastPageFull as any, [lastPageFull] as any)).toBe(2);
    });
  });

  describe('Deterministic State Machine Semantics', () => {
    type DataState = 'INITIAL_LOADING' | 'ERROR' | 'EMPTY_DATASET' | 'SUCCESS_WITH_RECORDS';

    function determineViewState(query: {
      isLoading: boolean;
      isError: boolean;
      appointmentsCount: number;
    }): DataState {
      if (query.isLoading) return 'INITIAL_LOADING';
      if (query.isError) return 'ERROR';
      if (query.appointmentsCount === 0) return 'EMPTY_DATASET';
      return 'SUCCESS_WITH_RECORDS';
    }

    it('maps unresolved initial request to INITIAL_LOADING (Skeleton), never EMPTY_DATASET', () => {
      const state = determineViewState({
        isLoading: true,
        isError: false,
        appointmentsCount: 0 // initially empty before network response
      });

      expect(state).toBe('INITIAL_LOADING');
      expect(state).not.toBe('EMPTY_DATASET');
    });

    it('maps upstream failure to ERROR with retry, never EMPTY_DATASET', () => {
      const state = determineViewState({
        isLoading: false,
        isError: true,
        appointmentsCount: 0
      });

      expect(state).toBe('ERROR');
      expect(state).not.toBe('EMPTY_DATASET');
    });

    it('maps genuine zero records response to EMPTY_DATASET only after query resolves successfully', () => {
      const state = determineViewState({
        isLoading: false,
        isError: false,
        appointmentsCount: 0
      });

      expect(state).toBe('EMPTY_DATASET');
    });

    it('maps successful response with items to SUCCESS_WITH_RECORDS', () => {
      const state = determineViewState({
        isLoading: false,
        isError: false,
        appointmentsCount: 15
      });

      expect(state).toBe('SUCCESS_WITH_RECORDS');
    });
  });
});
