import { describe, it, expect } from 'vitest';
import { evaluateShiftAvailability } from './useScheduleShiftAvailability';
import { SCHEDULE_SHIFT } from '../constants/schedule-shift.constants';
import type { DoctorDailySession } from '../api/types';
import type { ScheduleReferenceShiftOption } from '@/server/contracts/schedules/doctor-schedules.dto';

describe('evaluateShiftAvailability', () => {
  const mockShifts: ScheduleReferenceShiftOption[] = [
    {
      id: 'DINI_HARI',
      shift: 'DINI_HARI',
      label: 'Dini Hari',
      startTime: '00:00',
      endTime: '06:00',
      startHour: 0,
      endHour: 6,
      durationMinutes: 30,
      totalSlots: 12
    },
    {
      id: 'PAGI',
      shift: 'PAGI',
      label: 'Pagi',
      startTime: '06:00',
      endTime: '12:00',
      startHour: 6,
      endHour: 12,
      durationMinutes: 30,
      totalSlots: 12
    },
    {
      id: 'SIANG',
      shift: 'SIANG',
      label: 'Siang',
      startTime: '12:00',
      endTime: '18:00',
      startHour: 12,
      endHour: 18,
      durationMinutes: 30,
      totalSlots: 12
    },
    {
      id: 'MALAM',
      shift: 'MALAM',
      label: 'Malam',
      startTime: '18:00',
      endTime: '24:00',
      startHour: 18,
      endHour: 24,
      durationMinutes: 30,
      totalSlots: 12
    }
  ];

  it('locks all shifts when selected date is in the past', () => {
    const result = evaluateShiftAvailability({
      selectedDate: '2020-01-01',
      existingSessions: [],
      shifts: mockShifts
    });

    expect(result[SCHEDULE_SHIFT.PAGI].isUnavailable).toBe(true);
    expect(result[SCHEDULE_SHIFT.SIANG].isUnavailable).toBe(true);
    expect(result[SCHEDULE_SHIFT.MALAM].isUnavailable).toBe(true);
    expect(result[SCHEDULE_SHIFT.DINI_HARI].isUnavailable).toBe(true);
  });

  it('marks shift as unavailable with "Penuh" badge when doctor already occupied the full shift duration', () => {
    const result = evaluateShiftAvailability({
      selectedDate: '2030-10-15',
      existingSessions: [
        {
          id: 'sched-1',
          nama_sesi: 'Siang',
          jam_mulai: '12:00',
          jam_selesai: '18:00'
        } as unknown as DoctorDailySession
      ],
      shifts: mockShifts
    });

    expect(result[SCHEDULE_SHIFT.SIANG].isUnavailable).toBe(true);
    expect(result[SCHEDULE_SHIFT.SIANG].badgeLabel).toBe('Penuh');
    expect(result[SCHEDULE_SHIFT.MALAM].isUnavailable).toBe(false);
  });

  it('allows selecting shift when doctor has one session but remaining slots are open', () => {
    const result = evaluateShiftAvailability({
      selectedDate: '2030-10-15',
      existingSessions: [
        {
          id: 'sched-1',
          nama_sesi: 'Malam',
          jam_mulai: '18:00',
          jam_selesai: '18:30'
        } as unknown as DoctorDailySession
      ],
      consultationDuration: 30,
      shifts: mockShifts
    });

    expect(result[SCHEDULE_SHIFT.MALAM].isUnavailable).toBe(false);
    expect(result[SCHEDULE_SHIFT.MALAM].badgeLabel).toBeNull();
  });

  it('marks shift as unavailable with "Sudah Berlalu" when date is in the past', () => {
    const result = evaluateShiftAvailability({
      selectedDate: '2020-01-01',
      existingSessions: [],
      shifts: mockShifts
    });

    expect(result[SCHEDULE_SHIFT.PAGI].isUnavailable).toBe(true);
    expect(result[SCHEDULE_SHIFT.PAGI].badgeLabel).toBe('Sudah Berlalu');
  });
});
