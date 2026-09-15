import { describe, expect, it } from 'bun:test';
import { toggleItem } from '@/shared/lib/array/toggle-item';
import { formatShortDate } from '@/shared/lib/date/format-short-date';
import { buildMonthOptions, isAppointmentFilterActive } from './appointment-filters.rules';
import type { AppointmentFilterState } from './appointmentViewModel';

describe('appointment-filters rules and pure utilities', () => {
  describe('toggleItem', () => {
    it('adds an item if not present', () => {
      const initial = ['Penyakit Dalam'];
      const result = toggleItem(initial, 'Spesialis Anak');
      expect(result).toEqual(['Penyakit Dalam', 'Spesialis Anak']);
    });

    it('removes an item if already present', () => {
      const initial = ['Penyakit Dalam', 'Spesialis Anak'];
      const result = toggleItem(initial, 'Penyakit Dalam');
      expect(result).toEqual(['Spesialis Anak']);
    });

    it('preserves immutability of original array', () => {
      const initial = ['Penyakit Dalam'];
      toggleItem(initial, 'Spesialis Anak');
      expect(initial).toEqual(['Penyakit Dalam']);
    });
  });

  describe('formatShortDate', () => {
    it('formats dates consistently in Indonesian locale', () => {
      const testDate = new Date(2026, 7, 17); // 17 Agustus 2026
      expect(formatShortDate(testDate)).toBe('17 Ags');
    });

    it('formats first day of month correctly', () => {
      const testDate = new Date(2026, 0, 1); // 1 Januari 2026
      expect(formatShortDate(testDate)).toBe('1 Jan');
    });
  });

  describe('isAppointmentFilterActive', () => {
    const emptyState: AppointmentFilterState = {
      searchQuery: '',
      monthFilter: 'ALL',
      dateFilter: undefined,
      selectedServices: [],
      selectedStatuses: []
    };

    it('returns false when all filter values are default', () => {
      expect(isAppointmentFilterActive(emptyState)).toBe(false);
    });

    it('returns true when searchQuery has non-whitespace content', () => {
      expect(isAppointmentFilterActive({ ...emptyState, searchQuery: 'dr. Sarah' })).toBe(true);
      expect(isAppointmentFilterActive({ ...emptyState, searchQuery: '   ' })).toBe(false);
    });

    it('returns true when monthFilter is selected', () => {
      expect(isAppointmentFilterActive({ ...emptyState, monthFilter: 'Ags 2026' })).toBe(true);
    });

    it('returns true when dateFilter is set', () => {
      expect(isAppointmentFilterActive({ ...emptyState, dateFilter: new Date() })).toBe(true);
    });

    it('returns true when services or statuses are selected', () => {
      expect(
        isAppointmentFilterActive({
          ...emptyState,
          selectedServices: ['Gigi']
        })
      ).toBe(true);
      expect(
        isAppointmentFilterActive({
          ...emptyState,
          selectedStatuses: ['CONFIRMED']
        })
      ).toBe(true);
    });
  });

  describe('buildMonthOptions', () => {
    it('includes "Semua Bulan" as the first ALL option', () => {
      const options = buildMonthOptions(new Date(2026, 8, 1));
      expect(options[0]).toEqual({ value: 'ALL', label: 'Semua Bulan' });
    });

    it('generates dynamic month options around the target date range', () => {
      const baseDate = new Date(2026, 8, 15); // September 2026
      const options = buildMonthOptions(baseDate, { pastMonths: 1, futureMonths: 2 });

      const values = options.map((opt) => opt.value);
      expect(values).toContain('ALL');
      expect(values).toContain('Ags 2026');
      expect(values).toContain('Sep 2026');
      expect(values).toContain('Okt 2026');
      expect(values).toContain('Nov 2026');
    });
  });
});
