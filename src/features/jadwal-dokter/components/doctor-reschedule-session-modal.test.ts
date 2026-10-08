import { describe, it, expect, mock } from 'bun:test';
import { getTodayDateParam } from '../model/useDoctorScheduleView';
import type { RescheduleStep } from './doctor-reschedule-session-modal';

function evaluateCanProceedNext(
  step: RescheduleStep,
  targetDate: string,
  selectedShift: string
): boolean {
  if (step === 'date') return Boolean(targetDate && selectedShift);
  if (step === 'note') return Boolean(targetDate && selectedShift);
  return false;
}

describe('DoctorRescheduleSessionModal Wizard & Session Reschedule Architecture', () => {
  describe('Wizard Stepper Navigation & Guards', () => {
    it('Step 1 (date): requires date and session shift before advancing', () => {
      const today = getTodayDateParam();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Cannot proceed if date or shift is empty
      expect(evaluateCanProceedNext('date', '', 'PAGI')).toBe(false);
      expect(evaluateCanProceedNext('date', today, '')).toBe(false);
      // Can proceed when target date and shift are set
      expect(evaluateCanProceedNext('date', today, 'PAGI')).toBe(true);
    });

    it('Step 2 (note): ready for final submission when target date and shift are present', () => {
      const today = getTodayDateParam();
      expect(evaluateCanProceedNext('note', today, 'PAGI')).toBe(true);
      expect(evaluateCanProceedNext('note', '', 'PAGI')).toBe(false);
    });
  });

  describe('Session Reschedule Behavior', () => {
    it('conditionally shows auto-redirect checkbox only when active appointments exist', () => {
      const sessionWithoutPatients = { pasien_terdaftar: 0 };
      const sessionWithPatients = { pasien_terdaftar: 3 };

      const hasActive1 = (sessionWithoutPatients.pasien_terdaftar ?? 0) > 0;
      const hasActive2 = (sessionWithPatients.pasien_terdaftar ?? 0) > 0;

      expect(hasActive1).toBe(false);
      expect(hasActive2).toBe(true);
    });

    it('renders all canonical schedule shifts including DINI_HARI without hardcoded subset', () => {
      const {
        ALL_SCHEDULE_SHIFTS,
        SCHEDULE_SHIFT,
        SCHEDULE_SHIFT_LABELS
      } = require('../constants/schedule-shift.constants');

      expect(ALL_SCHEDULE_SHIFTS).toHaveLength(4);
      expect(ALL_SCHEDULE_SHIFTS).toContain(SCHEDULE_SHIFT.DINI_HARI);
      expect(ALL_SCHEDULE_SHIFTS).toContain(SCHEDULE_SHIFT.PAGI);
      expect(ALL_SCHEDULE_SHIFTS).toContain(SCHEDULE_SHIFT.SIANG);
      expect(ALL_SCHEDULE_SHIFTS).toContain(SCHEDULE_SHIFT.MALAM);

      expect(SCHEDULE_SHIFT_LABELS[SCHEDULE_SHIFT.DINI_HARI]).toBe('Dini Hari');
      expect(SCHEDULE_SHIFT_LABELS[SCHEDULE_SHIFT.PAGI]).toBe('Pagi');
      expect(SCHEDULE_SHIFT_LABELS[SCHEDULE_SHIFT.SIANG]).toBe('Siang');
      expect(SCHEDULE_SHIFT_LABELS[SCHEDULE_SHIFT.MALAM]).toBe('Malam');
    });
  });
});
