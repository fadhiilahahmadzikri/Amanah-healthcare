import { describe, expect, it } from 'vitest';
import { resolveDayStatus } from '../utils/leave-calculator';
import {
  buildDiscreteSlots as generateFallbackSlots,
  buildOccupancyOverview as generateFallbackOccupancyOverview,
  buildShiftsFromTimelineIntervals,
  normalizeDateParam,
  STATUS_CONFIG,
  UI_VARIANT_CONFIG
} from '../utils/shift-slot-builder';
import { occupancyShiftSchema } from '@/server/contracts/schedules/doctor-schedules.dto';
import type { DoctorSchedule, TimelineInterval } from './types';
import {
  SHIFT_OPERATIONAL_STATUS,
  SLOT_UI_STATUS,
  SLOT_UI_VARIANT,
  SLOT_ACTION_TYPE
} from '../constants/schedule-shift.constants';

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

  describe('Multi-Dimensional Schedule Projection & Minimalist Status Alignment', () => {
    it('accurately maps all 4 multi-dimensional availability states from backend intervals', () => {
      const mockIntervals: TimelineInterval[] = [
        {
          intervalIndex: 1,
          slotIndex: 1,
          startTime: '08:00',
          endTime: '08:30',
          timeRange: '08:00 - 08:30 WIB',
          status: 'UNSCHEDULED',
          displayLabel: 'Belum Terjadwal',
          isOccupied: false,
          temporalState: 'FUTURE',
          availabilityState: 'UNSCHEDULED',
          effectiveStatus: 'UNSCHEDULED',
          isSelectable: true
        },
        {
          intervalIndex: 2,
          slotIndex: 2,
          startTime: '08:30',
          endTime: '09:00',
          timeRange: '08:30 - 09:00 WIB',
          status: 'AVAILABLE',
          displayLabel: 'Tersedia',
          isOccupied: false,
          temporalState: 'FUTURE',
          availabilityState: 'AVAILABLE',
          effectiveStatus: 'AVAILABLE',
          isSelectable: true
        },
        {
          intervalIndex: 3,
          slotIndex: 3,
          startTime: '09:00',
          endTime: '09:30',
          timeRange: '09:00 - 09:30 WIB',
          status: 'OCCUPIED',
          displayLabel: 'Terisi',
          isOccupied: true,
          temporalState: 'FUTURE',
          availabilityState: 'OCCUPIED',
          effectiveStatus: 'OCCUPIED',
          isSelectable: false,
          appointmentRef: {
            appointmentId: 'apt-1',
            queueNumber: 1,
            status: 'CONFIRMED',
            patientName: 'Ny. Siti Rahma'
          }
        },
        {
          intervalIndex: 4,
          slotIndex: 4,
          startTime: '09:30',
          endTime: '10:00',
          timeRange: '09:30 - 10:00 WIB',
          status: 'CLOSED',
          displayLabel: 'Ditutup',
          isOccupied: false,
          temporalState: 'FUTURE',
          availabilityState: 'CLOSED',
          effectiveStatus: 'CLOSED',
          isSelectable: false,
          closure: {
            category: 'OTHER',
            reasonCode: 'MEETING',
            reasonText: 'Rapat Komite Medis'
          },
          reschedule: {
            isRescheduled: true,
            sourceDate: '2026-09-24',
            sourceStartTime: '08:00',
            reasonText: 'Penyesuaian jadwal'
          }
        }
      ];

      const shifts = buildShiftsFromTimelineIntervals(mockIntervals, [], 'buka');
      const morningShift = shifts.find((s) => s.contextId === 'morning');
      expect(morningShift).toBeDefined();

      const slots = morningShift!.slots;
      expect(slots).toHaveLength(4);

      // 1. UNSCHEDULED slot
      expect(slots[0].status).toBe('UNSCHEDULED');
      expect(slots[0].displayLabel).toBe('Belum Terjadwal');
      expect(slots[0].isAvailable).toBe(false);

      // 2. AVAILABLE slot
      expect(slots[1].status).toBe('AVAILABLE');
      expect(slots[1].displayLabel).toBe('Tersedia');
      expect(slots[1].isAvailable).toBe(true);

      // 3. OCCUPIED slot
      expect(slots[2].status).toBe('OCCUPIED');
      expect(slots[2].displayLabel).toContain('Ny. Siti Rahma');
      expect(slots[2].appointmentRef?.patientName).toBe('Ny. Siti Rahma');

      // 4. CLOSED slot with reschedule and closure metadata
      expect(slots[3].status).toBe('CLOSED');
      expect(slots[3].displayLabel).toBe('Rapat Komite Medis');
      expect(slots[3].closure?.reasonCode).toBe('MEETING');
      expect(slots[3].reschedule?.isRescheduled).toBe(true);

      // Check metrics calculation
      expect(morningShift!.metrics).toBeDefined();
      expect(morningShift!.metrics!.totalSlots).toBe(4);
      expect(morningShift!.metrics!.unscheduledSlots).toBe(1);
      expect(morningShift!.metrics!.availableSlots).toBe(1);
      expect(morningShift!.metrics!.occupiedSlots).toBe(1);
      expect(morningShift!.metrics!.closedSlots).toBe(1);
      expect(morningShift!.metrics!.scheduledSlots).toBe(3); // 1 available + 1 occupied + 1 closed

      // Coverage: 3 / 4 = 75%
      expect(morningShift!.metrics!.scheduleCoverage.percentage).toBe(75);
      // Occupancy: 1 / 2 = 50%
      expect(morningShift!.metrics!.occupancy.percentage).toBe(50);
    });

    it('STATUS_CONFIG contains all expected semantic tokens without hardcoded values', () => {
      const keys = ['UNSCHEDULED', 'AVAILABLE', 'OCCUPIED', 'CLOSED', 'CLOSED_LEAVE', 'EXPIRED'];
      for (const k of keys) {
        expect(STATUS_CONFIG[k]).toBeDefined();
        expect(STATUS_CONFIG[k].label).toBeTypeOf('string');
        expect(STATUS_CONFIG[k].cellBg).toBeTypeOf('string');
        expect(STATUS_CONFIG[k].border).toBeTypeOf('string');
        expect(STATUS_CONFIG[k].text).toBeTypeOf('string');
        expect(STATUS_CONFIG[k].dotBg).toBeTypeOf('string');
      }
    });

    it('UI_VARIANT_CONFIG defines all 8 canonical UI-ready variants from backend changelog', () => {
      const expectedVariants = [
        'neutral_disabled',
        'dashed_border',
        'muted_gray',
        'success_green',
        'info_blue',
        'warning_amber',
        'sky_badge',
        'danger_red'
      ];
      for (const variant of expectedVariants) {
        expect(UI_VARIANT_CONFIG[variant]).toBeDefined();
        expect(UI_VARIANT_CONFIG[variant].cellBg).toBeTypeOf('string');
        expect(UI_VARIANT_CONFIG[variant].border).toBeTypeOf('string');
        expect(UI_VARIANT_CONFIG[variant].text).toBeTypeOf('string');
        expect(UI_VARIANT_CONFIG[variant].dotBg).toBeTypeOf('string');
        expect(UI_VARIANT_CONFIG[variant].timeText).toBeTypeOf('string');
      }
    });

    it('UI_VARIANT_CONFIG defines purple_other variant with purple semantic tokens', () => {
      expect(UI_VARIANT_CONFIG.purple_other).toBeDefined();
      expect(UI_VARIANT_CONFIG.purple_other.cellBg).toContain('purple');
      expect(UI_VARIANT_CONFIG.purple_other.border).toContain('purple');
      expect(STATUS_CONFIG.OCCUPIED_BY_OTHER.cellBg).toContain('purple');
      expect(STATUS_CONFIG.OCCUPIED_BY_OTHER.label).toBe('Terisi Dokter Lain');
    });

    it('occupancyShiftSchema validates shifts with operationalStatus and UI-ready slots', () => {
      const parsedShift = occupancyShiftSchema.parse({
        shiftId: 'early_morning',
        shiftName: 'Dini Hari',
        timeRange: '00:00 - 06:00 WIB',
        operationalStatus: SHIFT_OPERATIONAL_STATUS.NO_PRACTICE,
        operationalLabel: 'Tidak Ada Praktik',
        activeSessionsCount: 0,
        registeredPatientsCount: 0,
        totalShiftSlots: 12,
        slots: [
          {
            slotIndex: 1,
            startTime: '00:00',
            endTime: '00:30',
            timeRange: '00:00 - 00:30 WIB',
            uiStatus: SLOT_UI_STATUS.UNSCHEDULED_PAST,
            uiLabel: 'Belum Terjadwal',
            uiSubLabel: '00:30',
            uiVariant: SLOT_UI_VARIANT.NEUTRAL_DISABLED,
            isClickable: false,
            actionType: SLOT_ACTION_TYPE.NONE
          }
        ]
      });

      expect(parsedShift.contextId).toBe('early_morning');
      expect(parsedShift.contextLabel).toBe('Dini Hari');
      expect(parsedShift.operationalStatus).toBe(SHIFT_OPERATIONAL_STATUS.NO_PRACTICE);
      expect(parsedShift.operationalLabel).toBe('Tidak Ada Praktik');
      expect(parsedShift.slots[0].uiStatus).toBe(SLOT_UI_STATUS.UNSCHEDULED_PAST);
      expect(parsedShift.slots[0].uiLabel).toBe('Belum Terjadwal');
      expect(parsedShift.slots[0].uiVariant).toBe(SLOT_UI_VARIANT.NEUTRAL_DISABLED);
      expect(parsedShift.slots[0].isClickable).toBe(false);
      expect(parsedShift.slots[0].actionType).toBe(SLOT_ACTION_TYPE.NONE);
    });

    describe('Date Normalization & Query Parameter Contracts (Anti-422 Regression)', () => {
      it('normalizes valid YYYY-MM-DD date without alteration', () => {
        expect(normalizeDateParam('2026-09-24')).toBe('2026-09-24');
        expect(normalizeDateParam('  2026-10-15  ')).toBe('2026-10-15');
      });

      it('extracts date from ISO datetime string', () => {
        expect(normalizeDateParam('2026-09-25T07:47:15.763Z')).toBe('2026-09-25');
      });

      it('parses Indonesian localized dates accurately', () => {
        expect(normalizeDateParam('Jumat, 25 Sep 2026')).toBe('2026-09-25');
        expect(normalizeDateParam('24 September 2026')).toBe('2026-09-24');
        expect(normalizeDateParam('15 Oktober 2026')).toBe('2026-10-15');
      });

      it('falls back to today in YYYY-MM-DD when date is missing or empty (preventing 422 validation failure)', () => {
        const today = new Date();
        const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        expect(normalizeDateParam('')).toBe(expected);
        expect(normalizeDateParam(undefined)).toBe(expected);
        expect(normalizeDateParam(null)).toBe(expected);
        expect(normalizeDateParam('   ')).toBe(expected);
        expect(normalizeDateParam('invalid-date')).toBe(expected);
      });
    });
  });
});
