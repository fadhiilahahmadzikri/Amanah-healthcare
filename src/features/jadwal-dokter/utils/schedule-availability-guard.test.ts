import { describe, it, expect } from 'vitest';
import {
  isSessionShiftUnavailable,
  parseTimeToMinutes
} from './schedule-availability-guard';
import {
  SCHEDULE_SHIFT_BOUNDARIES,
  SCHEDULE_SHIFT,
  SCHEDULE_UNAVAILABLE_REASONS
} from '../constants/schedule-shift.constants';

describe('schedule-availability-guard', () => {
  const morningBounds = {
    startMinutes: SCHEDULE_SHIFT_BOUNDARIES[SCHEDULE_SHIFT.PAGI].startHour * 60,
    endMinutes: SCHEDULE_SHIFT_BOUNDARIES[SCHEDULE_SHIFT.PAGI].endHour * 60,
    defaultStart: SCHEDULE_SHIFT_BOUNDARIES[SCHEDULE_SHIFT.PAGI].startTime,
    defaultEnd: SCHEDULE_SHIFT_BOUNDARIES[SCHEDULE_SHIFT.PAGI].endTime
  };

  it('parses valid time strings to minutes', () => {
    expect(parseTimeToMinutes('08:00')).toBe(480);
    expect(parseTimeToMinutes('08:30 WIB')).toBe(510);
    expect(parseTimeToMinutes('18:00')).toBe(1080);
    expect(parseTimeToMinutes('')).toBeNull();
    expect(parseTimeToMinutes(null)).toBeNull();
  });

  it('locks shift when isPastFromBackend is true', () => {
    const result = isSessionShiftUnavailable({
      selectedDate: '2026-09-25',
      isPastFromBackend: true,
      bounds: morningBounds
    });

    expect(result.unavailable).toBe(true);
    expect(result.reason).toBe(SCHEDULE_UNAVAILABLE_REASONS.PAST);
  });

  it('locks shift when date is in the past', () => {
    const pastDate = new Date('2026-01-01');
    const fixedNow = new Date('2026-09-25T10:00:00');

    const result = isSessionShiftUnavailable({
      selectedDate: pastDate,
      bounds: morningBounds,
      referenceNow: fixedNow
    });

    expect(result.unavailable).toBe(true);
    expect(result.reason).toBe(SCHEDULE_UNAVAILABLE_REASONS.PAST);
  });

  it('locks shift when availableSlotsCount is 0', () => {
    const futureDate = new Date('2026-10-01');
    const fixedNow = new Date('2026-09-25T10:00:00');

    const result = isSessionShiftUnavailable({
      selectedDate: futureDate,
      occupancy: {
        totalSlots: 12,
        availableSlotsCount: 0
      },
      bounds: morningBounds,
      referenceNow: fixedNow
    });

    expect(result.unavailable).toBe(true);
    expect(result.reason).toBe(SCHEDULE_UNAVAILABLE_REASONS.FULL);
  });

  it('locks shift on today when current time exceeds shift boundary', () => {
    // Current time: 13:00 (780 min), Morning end: 12:00 (720 min)
    const today = new Date('2026-09-25T13:00:00');

    const result = isSessionShiftUnavailable({
      selectedDate: '2026-09-25',
      bounds: morningBounds,
      referenceNow: today
    });

    expect(result.unavailable).toBe(true);
    expect(result.reason).toBe(SCHEDULE_UNAVAILABLE_REASONS.PAST);
  });

  it('locks shift on today when remaining shift time is less than consultation duration', () => {
    // Morning end: 12:00 (720 min), Current time: 11:45 (705 min), remaining = 15m < 30m
    const today = new Date('2026-09-25T11:45:00');

    const result = isSessionShiftUnavailable({
      selectedDate: '2026-09-25',
      bounds: morningBounds,
      consultationDuration: 30,
      referenceNow: today
    });

    expect(result.unavailable).toBe(true);
    expect(result.reason).toBe(SCHEDULE_UNAVAILABLE_REASONS.TIME_EXHAUSTED);
  });

  it('locks shift on today when all remaining future slots are occupied or past', () => {
    // Morning end: 12:00, Current time: 10:00
    const today = new Date('2026-09-25T10:00:00');

    const result = isSessionShiftUnavailable({
      selectedDate: '2026-09-25',
      bounds: morningBounds,
      occupancy: {
        totalSlots: 12,
        availableSlotsCount: 1, // 1 slot available in the past
        slots: [
          { startTime: '08:00', isAvailable: true }, // past
          { startTime: '10:00', isAvailable: false }, // occupied
          { startTime: '10:30', isAvailable: false }, // occupied
          { startTime: '11:00', isAvailable: false } // occupied
        ]
      },
      consultationDuration: 30,
      referenceNow: today
    });

    expect(result.unavailable).toBe(true);
    expect(result.reason).toBe(SCHEDULE_UNAVAILABLE_REASONS.FULL);
  });

  it('enables shift when future slots are available', () => {
    // Current time: 07:00, morning shift starting 08:00 has available slots
    const today = new Date('2026-09-25T07:00:00');

    const result = isSessionShiftUnavailable({
      selectedDate: '2026-09-25',
      bounds: morningBounds,
      occupancy: {
        totalSlots: 12,
        availableSlotsCount: 8,
        slots: [
          { startTime: '08:00', isAvailable: true },
          { startTime: '08:30', isAvailable: true }
        ]
      },
      consultationDuration: 30,
      referenceNow: today
    });

    expect(result.unavailable).toBe(false);
    expect(result.reason).toBeNull();
  });

  it('permits editing doctor own session even if rooms are fully occupied', () => {
    const today = new Date('2026-09-25T10:00:00');
    const result = isSessionShiftUnavailable({
      selectedDate: '2026-09-25',
      bounds: morningBounds,
      occupancy: {
        totalSlots: 12,
        availableSlotsCount: 0
      },
      isEditingThisSession: true,
      referenceNow: today
    });

    expect(result.unavailable).toBe(false);
    expect(result.reason).toBeNull();
  });

  it('locks editing doctor own session if date is in the past', () => {
    const pastDate = new Date('2026-01-01');
    const fixedNow = new Date('2026-09-25T10:00:00');

    const result = isSessionShiftUnavailable({
      selectedDate: pastDate,
      bounds: morningBounds,
      isEditingThisSession: true,
      referenceNow: fixedNow
    });

    expect(result.unavailable).toBe(true);
    expect(result.reason).toBe(SCHEDULE_UNAVAILABLE_REASONS.PAST);
  });

  it('locks shift when all rooms in clinic are occupied', () => {
    const futureDate = new Date('2026-10-01');
    const fixedNow = new Date('2026-09-25T10:00:00');

    const result = isSessionShiftUnavailable({
      selectedDate: futureDate,
      bounds: morningBounds,
      allRoomsOccupied: true,
      referenceNow: fixedNow
    });

    expect(result.unavailable).toBe(true);
    expect(result.reason).toBe(SCHEDULE_UNAVAILABLE_REASONS.FULL);
  });

  it('locks shift when doctor already has an existing schedule in this shift', () => {
    const futureDate = new Date('2026-10-01');
    const fixedNow = new Date('2026-09-25T10:00:00');

    const result = isSessionShiftUnavailable({
      selectedDate: futureDate,
      bounds: morningBounds,
      hasExistingSchedule: true,
      referenceNow: fixedNow
    });

    expect(result.unavailable).toBe(true);
    expect(result.reason).toBe(SCHEDULE_UNAVAILABLE_REASONS.FULL);
  });
});
