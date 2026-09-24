import { describe, expect, it } from 'vitest';
import { resolveDayStatus } from '../utils/leave-calculator';
import { generateFallbackSlots, generateFallbackOccupancyOverview } from './doctor-schedule-service';
import type { DoctorSchedule } from './types';

describe('Doctor Schedule & Occupancy SSOT Hierarchy', () => {
  const baseDoctor: DoctorSchedule = {
    id: 'doc-1',
    nama_dokter: 'dr. Ahmad Pratama',
    spesialisasi: 'Dokter Umum',
    status_dokter: 'Tutup',
    slot_tersedia: 0,
    kapasitas_per_hari: 0,
    jadwal_hari_ini: '',
    status_jadwal: 'Tutup',
    bulan_jadwal: 'September 2026',
    ruang_praktik: 'Poli Umum 1',
    avatar: '',
    sesi_harian: [],
    monthly_schedule: [
      { day: 24, status: 'Tutup' },
      { day: 25, status: 'Buka' },
      { day: 26, status: 'Cuti' }
    ]
  };

  describe('resolveDayStatus (SSOT Day-level status)', () => {
    it('resolves day 24 as "tutup" when set to Tutup in monthly_schedule', () => {
      const status = resolveDayStatus(24, baseDoctor);
      expect(status).toBe('tutup');
    });

    it('resolves day 25 as "buka" when set to Buka in monthly_schedule', () => {
      const status = resolveDayStatus(25, baseDoctor);
      expect(status).toBe('buka');
    });

    it('resolves day 26 as "cuti" when set to Cuti in monthly_schedule', () => {
      const status = resolveDayStatus(26, baseDoctor);
      expect(status).toBe('cuti');
    });

    it('resolves unconfigured days (not present in monthly_schedule) as "tutup" without fallback to buka', () => {
      // Day 10 is not configured for this doctor
      const status = resolveDayStatus(10, baseDoctor);
      expect(status).toBe('tutup');
    });

    it('resolves day as "tutup" when doctor is undefined', () => {
      const status = resolveDayStatus(25, undefined);
      expect(status).toBe('tutup');
    });

    it('resolves day as "tutup" when rescheduled day has status Tutup', () => {
      const rescheduledDoctor: DoctorSchedule = {
        ...baseDoctor,
        monthly_schedule: [
          { day: 25, status: 'Tutup' },
          { day: 26, status: 'Buka' }
        ]
      };
      expect(resolveDayStatus(25, rescheduledDoctor)).toBe('tutup');
      expect(resolveDayStatus(26, rescheduledDoctor)).toBe('buka');
    });
  });

  describe('generateFallbackSlots (Default slot initialization)', () => {
    it('initializes all unassigned slots as CLOSED (Tutup), NEVER AVAILABLE (Buka)', () => {
      const { slots, totalSlots } = generateFallbackSlots(0, 6);
      expect(totalSlots).toBe(12); // 6 hours * 2 slots/hr
      expect(slots).toHaveLength(12);

      // Verify that every unassigned slot is strictly CLOSED and unavailable
      for (const slot of slots) {
        expect(slot.isAvailable).toBe(false);
        expect(slot.status).toBe('CLOSED');
        expect(slot.displayLabel).toBe('Tutup');
        expect(slot.conflictInfo).toBeNull();
      }
    });
  });

  describe('generateFallbackOccupancyOverview', () => {
    it('calculates 0 available slots across all shifts when doctor has no sessions', () => {
      const overview = generateFallbackOccupancyOverview('2026-09-24', 'doc-1', []);
      expect(overview.summary.availableSlots).toBe(0);
      expect(overview.summary.occupiedSlots).toBe(0);

      // All shifts must have 0 availableSlotsCount
      for (const shift of overview.shifts) {
        expect(shift.availableSlotsCount).toBe(0);
      }
    });

    it('correctly reports 0 available slots when sessions are closed by day closure cascading', () => {
      const closedSessions = [
        {
          id: 'sess-1',
          nama_sesi: 'Dini Hari',
          jam_mulai: '00:00',
          jam_selesai: '00:30',
          kuota_pasien: 1,
          slot_tersedia: 0,
          status_sesi: 'Tutup' as const,
          ruang: 'Poli Umum 1'
        },
        {
          id: 'sess-2',
          nama_sesi: 'Pagi',
          jam_mulai: '06:00',
          jam_selesai: '06:30',
          kuota_pasien: 1,
          slot_tersedia: 0,
          status_sesi: 'Tutup' as const,
          ruang: 'Poli Umum 1'
        }
      ];

      const overview = generateFallbackOccupancyOverview('2026-09-24', 'doc-1', closedSessions);
      expect(overview.summary.availableSlots).toBe(0);

      // Early morning shift (00:00 - 06:00) contains sess-1 which is closed
      const earlyMorning = overview.shifts.find((s) => s.contextId === 'early_morning');
      expect(earlyMorning).toBeDefined();
      expect(earlyMorning!.availableSlotsCount).toBe(0);

      // The slot 00:00 - 00:30 must be CLOSED
      const firstSlot = earlyMorning!.slots.find((s) => s.startTime === '00:00');
      expect(firstSlot?.status).toBe('CLOSED');
      expect(firstSlot?.displayLabel).toBe('Tutup');
      expect(firstSlot?.isAvailable).toBe(false);

      // Unassigned slot 00:30 - 01:00 must also be CLOSED, not AVAILABLE
      const secondSlot = earlyMorning!.slots.find((s) => s.startTime === '00:30');
      expect(secondSlot?.status).toBe('CLOSED');
      expect(secondSlot?.displayLabel).toBe('Tutup');
      expect(secondSlot?.isAvailable).toBe(false);
    });

    it('reports available slots only for actual open sessions with capacity', () => {
      const openSessions = [
        {
          id: 'sess-pagi',
          nama_sesi: 'Sesi Pagi',
          jam_mulai: '08:00',
          jam_selesai: '09:00',
          kuota_pasien: 4,
          slot_tersedia: 3,
          status_sesi: 'Buka' as const,
          ruang: 'Poli Umum 1'
        }
      ];

      const overview = generateFallbackOccupancyOverview('2026-09-24', 'doc-1', openSessions);
      expect(overview.summary.availableSlots).toBeGreaterThan(0);

      const morningShift = overview.shifts.find((s) => s.contextId === 'morning');
      expect(morningShift).toBeDefined();

      const activeSlot = morningShift!.slots.find((s) => s.startTime === '08:00');
      expect(activeSlot?.status).toBe('AVAILABLE');
      expect(activeSlot?.isAvailable).toBe(true);
      expect(activeSlot?.displayLabel).toBe('Buka');

      // But an unassigned slot in the same shift must still be CLOSED
      const unassignedSlot = morningShift!.slots.find((s) => s.startTime === '07:00');
      expect(unassignedSlot?.status).toBe('CLOSED');
      expect(unassignedSlot?.isAvailable).toBe(false);
    });
  });
});
