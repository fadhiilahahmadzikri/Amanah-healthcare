import { describe, it, expect } from 'vitest';
import { evaluateShiftAvailability } from './useScheduleShiftAvailability';
import { SCHEDULE_SHIFT } from '../constants/schedule-shift.constants';
import type { DoctorDailySession } from '../api/types';

describe('evaluateShiftAvailability', () => {
  it('locks all shifts when selected date is in the past', () => {
    const result = evaluateShiftAvailability({
      selectedDate: '2020-01-01',
      existingSessions: []
    });

    expect(result[SCHEDULE_SHIFT.PAGI].isUnavailable).toBe(true);
    expect(result[SCHEDULE_SHIFT.SIANG].isUnavailable).toBe(true);
    expect(result[SCHEDULE_SHIFT.MALAM].isUnavailable).toBe(true);
    expect(result[SCHEDULE_SHIFT.DINI_HARI].isUnavailable).toBe(true);
  });

  it('marks shift as unavailable with "Sudah Ada Jadwal" badge when doctor already has schedule', () => {
    const result = evaluateShiftAvailability({
      selectedDate: '2030-10-15',
      existingSessions: [
        {
          id: 'sched-1',
          nama_sesi: 'Siang',
          jam_mulai: '12:00',
          jam_selesai: '18:00'
        } as unknown as DoctorDailySession
      ]
    });

    expect(result[SCHEDULE_SHIFT.SIANG].isUnavailable).toBe(true);
    expect(result[SCHEDULE_SHIFT.SIANG].badgeLabel).toBe('Sudah Ada Jadwal');
    expect(result[SCHEDULE_SHIFT.MALAM].isUnavailable).toBe(false);
  });

  it('marks shift as unavailable with "Sudah Berlalu" when date is in the past', () => {
    const result = evaluateShiftAvailability({
      selectedDate: '2020-01-01',
      existingSessions: []
    });

    expect(result[SCHEDULE_SHIFT.PAGI].isUnavailable).toBe(true);
    expect(result[SCHEDULE_SHIFT.PAGI].badgeLabel).toBe('Sudah Berlalu');
  });
});
