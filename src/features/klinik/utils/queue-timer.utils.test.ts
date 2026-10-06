import { describe, expect, it } from 'bun:test';
import {
  computeConsultationElapsedSeconds,
  formatConsultationTimer,
  formatConsultationSummary,
  isConsultationOvertime
} from './queue-timer.utils';

describe('Queue Timer Utilities', () => {
  it('returns 0 elapsed seconds when startedAt is missing or invalid', () => {
    expect(computeConsultationElapsedSeconds(null)).toBe(0);
    expect(computeConsultationElapsedSeconds(undefined)).toBe(0);
    expect(computeConsultationElapsedSeconds('invalid-date')).toBe(0);
  });

  it('computes elapsed seconds correctly between start and completed dates', () => {
    const start = '2026-10-06T10:00:00.000Z';
    const end = '2026-10-06T10:15:30.000Z';
    expect(computeConsultationElapsedSeconds(start, end)).toBe(930);
  });

  it('computes elapsed seconds against referenceNow for active consultations', () => {
    const start = new Date('2026-10-06T10:00:00.000Z');
    const referenceNow = new Date('2026-10-06T10:20:00.000Z');
    expect(computeConsultationElapsedSeconds(start, null, referenceNow)).toBe(1200);
  });

  it('formats consultation timer accurately', () => {
    expect(formatConsultationTimer(0)).toBe('0 Menit');
    expect(formatConsultationTimer(-10)).toBe('0 Menit');
    expect(formatConsultationTimer(45)).toBe('45 Dtk');
    expect(formatConsultationTimer(120)).toBe('2 Menit');
    expect(formatConsultationTimer(125)).toBe('2 Menit 5 Dtk');
    expect(formatConsultationTimer(1800)).toBe('30 Menit');
  });

  it('formats consultation summary in rounded minutes', () => {
    expect(formatConsultationSummary(0)).toBe('0 Menit');
    expect(formatConsultationSummary(30)).toBe('1 Menit');
    expect(formatConsultationSummary(900)).toBe('15 Menit');
    expect(formatConsultationSummary(1800)).toBe('30 Menit');
  });

  it('detects consultation overtime according to policy minutes', () => {
    expect(isConsultationOvertime(1799, 30)).toBe(false);
    expect(isConsultationOvertime(1800, 30)).toBe(false);
    expect(isConsultationOvertime(1801, 30)).toBe(true);
    expect(isConsultationOvertime(2400, 30)).toBe(true);
    expect(isConsultationOvertime(2400)).toBe(false);
    expect(isConsultationOvertime(2400, 0)).toBe(false);
  });
});
