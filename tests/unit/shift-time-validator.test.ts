import { describe, it, expect } from 'bun:test';
import {
  isValidTimeString,
  formatTimeToHHmm,
  generateBaseTimeOptions,
  getEffectiveTimeOptions,
  parseTimeToMinutes,
  parseTimeEndToMinutes,
  minutesToTimeString,
  calculateShiftDurationHours,
  detectSessionDefsOverlaps
} from '../../src/features/jadwal-dokter/utils/shift-time-validator';
import type { SessionDefConfig } from '../../src/features/jadwal-dokter/api/admin-schedule-configuration.api';

describe('shift-time-validator', () => {
  describe('isValidTimeString', () => {
    it('validates 24-hour time strings correctly', () => {
      expect(isValidTimeString('00:00')).toBe(true);
      expect(isValidTimeString('08:00')).toBe(true);
      expect(isValidTimeString('08:30')).toBe(true);
      expect(isValidTimeString('23:59')).toBe(true);
      expect(isValidTimeString('24:00')).toBe(true);

      expect(isValidTimeString('24:01')).toBe(false);
      expect(isValidTimeString('25:00')).toBe(false);
      expect(isValidTimeString('8:00')).toBe(false);
      expect(isValidTimeString('08:60')).toBe(false);
      expect(isValidTimeString('invalid')).toBe(false);
      expect(isValidTimeString('')).toBe(false);
      expect(isValidTimeString(null)).toBe(false);
    });
  });

  describe('formatTimeToHHmm', () => {
    it('extracts HH:mm from various formats', () => {
      expect(formatTimeToHHmm('08:00:00')).toBe('08:00');
      expect(formatTimeToHHmm('14:30')).toBe('14:30');
      expect(formatTimeToHHmm('24:00:00')).toBe('24:00');
      expect(formatTimeToHHmm(null, '08:00')).toBe('08:00');
      expect(formatTimeToHHmm('', '12:00')).toBe('12:00');
      expect(formatTimeToHHmm('invalid', '08:00')).toBe('08:00');
    });
  });

  describe('generateBaseTimeOptions', () => {
    it('generates standard 30-minute intervals ending in 24:00', () => {
      const options = generateBaseTimeOptions(30);
      expect(options.length).toBe(49); // 48 intervals from 00:00 to 23:30, plus 24:00
      expect(options[0]).toBe('00:00');
      expect(options[16]).toBe('08:00');
      expect(options[options.length - 1]).toBe('24:00');
    });
  });

  describe('getEffectiveTimeOptions', () => {
    it('returns base options if current time is already included or empty', () => {
      const base = generateBaseTimeOptions(30);
      expect(getEffectiveTimeOptions('08:00')).toEqual(base);
      expect(getEffectiveTimeOptions(null)).toEqual(base);
    });

    it('injects non-standard custom time in sorted order', () => {
      const options = getEffectiveTimeOptions('07:15');
      expect(options.includes('07:15')).toBe(true);
      const index0700 = options.indexOf('07:00');
      const index0715 = options.indexOf('07:15');
      const index0730 = options.indexOf('07:30');
      expect(index0715).toBeGreaterThan(index0700);
      expect(index0715).toBeLessThan(index0730);
    });
  });

  describe('parseTimeToMinutes and parseTimeEndToMinutes', () => {
    it('converts strings to minutes accurately', () => {
      expect(parseTimeToMinutes('00:00')).toBe(0);
      expect(parseTimeToMinutes('08:30')).toBe(510);
      expect(parseTimeToMinutes('23:59')).toBe(1439);
      expect(parseTimeToMinutes(null)).toBe(0);

      expect(parseTimeEndToMinutes('24:00')).toBe(1440);
      expect(parseTimeEndToMinutes('00:00', 720)).toBe(1440);
    });
  });

  describe('minutesToTimeString', () => {
    it('converts minutes to HH:mm string', () => {
      expect(minutesToTimeString(0)).toBe('00:00');
      expect(minutesToTimeString(510)).toBe('08:30');
      expect(minutesToTimeString(1440)).toBe('24:00');
    });
  });

  describe('calculateShiftDurationHours', () => {
    it('calculates duration correctly', () => {
      expect(calculateShiftDurationHours('08:00', '12:00')).toBe(4);
      expect(calculateShiftDurationHours('08:00', '12:30')).toBe(4.5);
      expect(calculateShiftDurationHours('20:00', '24:00')).toBe(4);
    });
  });

  describe('detectSessionDefsOverlaps', () => {
    it('detects inverted start/end times', () => {
      const defs: SessionDefConfig[] = [
        {
          id: 'def-1',
          clinicId: 'clinic-1',
          name: 'Pagi',
          label: 'Pagi',
          codePrefix: 'P',
          sortOrder: 1,
          defaultStartsAt: '12:00:00',
          defaultEndsAt: '08:00:00',
          isActive: true
        }
      ];

      const result = detectSessionDefsOverlaps(defs);
      expect(result.isValid).toBe(false);
      expect(result.conflictingIds).toContain('def-1');
    });

    it('detects overlapping shift definitions', () => {
      const defs: SessionDefConfig[] = [
        {
          id: 'def-1',
          clinicId: 'clinic-1',
          name: 'Pagi',
          label: 'Pagi',
          codePrefix: 'P',
          sortOrder: 1,
          defaultStartsAt: '08:00:00',
          defaultEndsAt: '12:00:00',
          isActive: true
        },
        {
          id: 'def-2',
          clinicId: 'clinic-1',
          name: 'Siang',
          label: 'Siang',
          codePrefix: 'S',
          sortOrder: 2,
          defaultStartsAt: '11:00:00',
          defaultEndsAt: '15:00:00',
          isActive: true
        }
      ];

      const result = detectSessionDefsOverlaps(defs);
      expect(result.isValid).toBe(false);
      expect(result.conflictingIds).toEqual(['def-1', 'def-2']);
    });

    it('allows valid sequential and gapped shifts', () => {
      const defs: SessionDefConfig[] = [
        {
          id: 'def-1',
          clinicId: 'clinic-1',
          name: 'Pagi',
          label: 'Pagi',
          codePrefix: 'P',
          sortOrder: 1,
          defaultStartsAt: '08:00:00',
          defaultEndsAt: '12:00:00',
          isActive: true
        },
        {
          id: 'def-2',
          clinicId: 'clinic-1',
          name: 'Siang',
          label: 'Siang',
          codePrefix: 'S',
          sortOrder: 2,
          defaultStartsAt: '13:00:00',
          defaultEndsAt: '17:00:00',
          isActive: true
        }
      ];

      const result = detectSessionDefsOverlaps(defs);
      expect(result.isValid).toBe(true);
      expect(result.conflictingIds).toHaveLength(0);
    });
  });
});
