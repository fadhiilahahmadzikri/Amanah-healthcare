import { describe, expect, it } from 'bun:test';
import { isDoctorOnLeaveOnDay } from '../utils/leave-calculator';
import { getUpcomingScheduleTime, getDoctorCardStatus } from '../components/doctor-schedule-card';
import { doctorScheduleKeys } from './query-keys';
import {
  normalizeScheduleShift,
  resolveShiftFromTime,
  SCHEDULE_SHIFT,
  SCHEDULE_STATUS
} from '../constants/schedule-shift.constants';
import {
  adminDoctorScheduleListResponseSchema,
  adminDoctorScheduleDetailResponseSchema,
  clinicalPractitionersResponseSchema,
  createAdminDoctorSessionPayloadSchema,
  updateAdminDayStatusPayloadSchema,
  timelineIntervalSchema,
  rescheduleAdminDoctorSessionPayloadSchema,
  updateAdminDoctorDurationPayloadSchema
} from '@/server/contracts/schedules/doctor-schedules.dto';
import { buildOccupancyOverview as generateFallbackOccupancyOverview } from '../utils/shift-slot-builder';
import type { DoctorSchedule, DoctorDailySession } from './types';

describe('Doctor Schedule Business Logic & Leave Resolution', () => {
  const baseDoctor: DoctorSchedule = {
    id: 'doc-uuid-1',
    nama_dokter: 'dr. Sarah Putri, Sp.PD',
    spesialisasi: 'Penyakit Dalam',
    status_dokter: 'Buka',
    ruang_praktik: 'Poli Penyakit Dalam, Room 201',
    slot_tersedia: 15,
    kapasitas_per_hari: 30,
    is_cuti: false,
    monthly_schedule: [
      { day: 1, date: '2026-09-01', status: 'Buka' },
      { day: 15, date: '2026-09-15', status: 'Cuti', notes: 'Seminar Spesialis' }
    ],
    sesi_harian: [
      {
        id: 'ses-1',
        nama_sesi: 'Sesi Pagi',
        jam_mulai: '07:30',
        jam_selesai: '11:30',
        waktu: '07:30 - 11:30',
        kuota_pasien: 15,
        slot_tersedia: 8,
        status_sesi: 'Buka'
      },
      {
        id: 'ses-2',
        nama_sesi: 'Sesi Sore',
        jam_mulai: '14:00',
        jam_selesai: '17:30',
        waktu: '14:00 - 17:30',
        kuota_pasien: 15,
        slot_tersedia: 7,
        status_sesi: 'Buka'
      }
    ]
  };

  it('resolves doctor as not on leave on normal operating days', () => {
    const result = isDoctorOnLeaveOnDay(baseDoctor, 1);
    expect(result.isLeave).toBe(false);
  });

  it('resolves doctor on leave when specific calendar date status is Cuti', () => {
    const result = isDoctorOnLeaveOnDay(baseDoctor, 15);
    expect(result.isLeave).toBe(true);
    expect(result.reason).toBe('Seminar Spesialis');
  });

  it('resolves doctor on leave when is_cuti flag is globally true', () => {
    const leaveDoctor: DoctorSchedule = {
      ...baseDoctor,
      is_cuti: true,
      cuti_reason: 'Cuti Tahunan',
      status_dokter: 'Cuti'
    };
    const result = isDoctorOnLeaveOnDay(leaveDoctor, 10);
    expect(result.isLeave).toBe(true);
    expect(result.reason).toBe('Cuti Tahunan');
  });

  it('resolves doctor on leave within specified cuti date range', () => {
    const rangeDoctor: DoctorSchedule = {
      ...baseDoctor,
      is_cuti: true,
      cuti_start: '2026-09-20',
      cuti_end: '2026-09-25',
      cuti_reason: 'Izin Medis'
    };
    expect(isDoctorOnLeaveOnDay(rangeDoctor, 22).isLeave).toBe(true);
    expect(isDoctorOnLeaveOnDay(rangeDoctor, 26).isLeave).toBe(false);
  });
});

describe('Upcoming Schedule Time Evaluation', () => {
  it('returns default schedule time if sessions array is empty', () => {
    const result = getUpcomingScheduleTime('08:00 - 12:00', []);
    expect(result.upcomingTime).toBe('08.00 – 08.30');
  });

  it('extracts session label from available non-cuti sessions', () => {
    const sessions: DoctorDailySession[] = [
      {
        id: 's1',
        nama_sesi: 'Sesi Malam',
        jam_mulai: '19:00',
        jam_selesai: '22:00',
        waktu: '19:00 - 22:00',
        kuota_pasien: 10,
        slot_tersedia: 5,
        status_sesi: 'Buka'
      }
    ];
    const result = getUpcomingScheduleTime('07:30 - 17:30', sessions);
    expect(result.sessionName).toBe('Sesi Malam');
  });
});

describe('Doctor Schedule Detail Query', () => {
  it('keys detail queries by doctor id and requested calendar date', () => {
    const queryKey = doctorScheduleKeys.detail('doctor-1', {
      month: '2026-09',
      date: '2026-09-22'
    });

    expect(queryKey).toEqual([
      'doctor-schedules',
      'detail',
      'doctor-1',
      { month: '2026-09', date: '2026-09-22' }
    ]);
  });
});

describe('Backend DTO Contract Alignment', () => {
  it('validates successful admin doctor schedules list response envelope', () => {
    const mockBackendResponse = {
      success: true,
      data: {
        doctors: [
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            nama_dokter: 'dr. Sarah Putri, Sp.PD',
            spesialisasi: 'Penyakit Dalam',
            status_dokter: 'Buka',
            ruang_praktik: 'Poli Penyakit Dalam, Room 201',
            slot_tersedia: 18,
            kapasitas_per_hari: 30,
            is_cuti: false
          }
        ],
        meta: {
          page: 1,
          limit: 6,
          total_doctors: 1,
          total_pages: 1
        }
      }
    };

    const parsed = adminDoctorScheduleListResponseSchema.safeParse(mockBackendResponse);
    expect(parsed.success).toBe(true);
  });

  it('normalizes nullable doctor avatar values from backend responses', () => {
    const mockBackendResponse = {
      success: true,
      data: {
        doctors: [
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            nama_dokter: 'dr. Sarah Putri, Sp.PD',
            spesialisasi: 'Penyakit Dalam',
            status_dokter: 'Buka',
            ruang_praktik: 'Poli Penyakit Dalam, Room 201',
            avatar: null,
            slot_tersedia: 18,
            kapasitas_per_hari: 30,
            is_cuti: false
          }
        ],
        meta: {
          page: 1,
          limit: 6,
          total_doctors: 1,
          total_pages: 1
        }
      }
    };

    const parsed = adminDoctorScheduleListResponseSchema.safeParse(mockBackendResponse);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.data.doctors[0].avatar).toBe('');
    }
  });

  it('validates detail response with monthly calendar and Tutup status', () => {
    const mockDetail = {
      success: true,
      data: {
        id: '123e4567-e89b-12d3-a456-426614174001',
        nama_dokter: 'dr. Sarah Putri, Sp.PD',
        spesialisasi: 'Penyakit Dalam',
        status_dokter: 'Buka',
        ruang_praktik: 'Room 201',
        slot_tersedia: 18,
        kapasitas_per_hari: 30,
        is_cuti: false,
        monthly_schedule: [
          { day: 1, date: '2026-09-01', status: 'Buka' },
          { day: 2, date: '2026-09-02', status: 'Tutup', notes: 'Hari Libur Nasional' }
        ]
      }
    };

    const parsed = adminDoctorScheduleDetailResponseSchema.safeParse(mockDetail);
    expect(parsed.success).toBe(true);
  });

  it('normalizes nullable clinical practitioner avatars from backend responses', () => {
    const mockBackendResponse = {
      success: true,
      data: [
        {
          id: '77bbb45a-18df-4311-b2a4-a4b6f22870ca',
          name: 'dr. Ahmad Santoso',
          spec: 'Dokter Umum',
          avatar: null,
          location: 'Poli Umum',
          schedule: '08:00 - 12:00 WIB',
          is_available: true
        }
      ]
    };

    const parsed = clinicalPractitionersResponseSchema.safeParse(mockBackendResponse);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.data[0].avatar).toBe('');
    }
  });

  it('validates create session payload correctly', () => {
    const payload = {
      schedule_date: '2026-09-22',
      nama_sesi: 'Sesi Malam',
      jam_mulai: '19:00',
      jam_selesai: '22:00',
      kuota_pasien: 10,
      slot_tersedia: 10,
      status_sesi: 'Buka',
      ruang: 'Poli Umum 101'
    };

    const parsed = createAdminDoctorSessionPayloadSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });

  it('validates update day status payload with Tutup and Cuti', () => {
    const cutiPayload = { date: '2026-09-25', status: 'Cuti', reason: 'Izin Medis' };
    const tutupPayload = { date: '2026-09-26', status: 'Tutup' };

    expect(updateAdminDayStatusPayloadSchema.safeParse(cutiPayload).success).toBe(true);
    expect(updateAdminDayStatusPayloadSchema.safeParse(tutupPayload).success).toBe(true);
  });

  it('validates Schedule V2 timeline interval schema with OCCUPIED status and queue info', () => {
    const intervalData = {
      intervalIndex: 1,
      startTime: '08:45',
      endTime: '09:15',
      status: 'OCCUPIED',
      displayLabel: '08:45 - 09:15',
      isOccupied: true,
      appointmentRef: {
        appointmentId: 'apt-v2-101',
        queueNumber: 1,
        status: 'CONFIRMED'
      },
      closedReason: null
    };

    const parsed = timelineIntervalSchema.safeParse(intervalData);
    expect(parsed.success).toBe(true);
  });

  it('validates reschedule doctor session payload schema', () => {
    const reschedulePayload = {
      targetDate: '2026-09-25',
      targetStartTime: '09:00',
      targetRoomId: 'room-102',
      reason: 'Penyesuaian jadwal dokter',
      rescheduleActiveAppointments: true
    };

    const parsed = rescheduleAdminDoctorSessionPayloadSchema.safeParse(reschedulePayload);
    expect(parsed.success).toBe(true);
  });

  it('validates update doctor duration payload schema', () => {
    const durationPayload = {
      consultationDurationMinutes: 30
    };

    const parsed = updateAdminDoctorDurationPayloadSchema.safeParse(durationPayload);
    expect(parsed.success).toBe(true);
  });
});

describe('Doctor Card Status & Unconfigured Zero-Quota Handling', () => {
  it('returns "Belum Diatur" for newly created doctors with 0 capacity and 0 sessions', () => {
    const newDoctor: DoctorSchedule = {
      id: 'doc-new-1',
      nama_dokter: 'dr. Budi Baru, Sp.A',
      spesialisasi: 'Anak',
      status_dokter: 'Aktif',
      ruang_praktik: 'Poli Anak',
      slot_tersedia: 0,
      kapasitas_per_hari: 0,
      jadwal_hari_ini: '',
      status_jadwal: 'Belum Diatur',
      is_cuti: false,
      sesi_harian: []
    };

    expect(getDoctorCardStatus(newDoctor)).toBe('Belum Diatur');
  });

  it('returns "Belum Diatur" when quota exists but no real session or schedule time exists', () => {
    const quotaOnlyDoctor: DoctorSchedule = {
      id: 'doc-quota-only-1',
      nama_dokter: 'dr. Kuota Tanpa Jadwal',
      spesialisasi: 'Umum',
      status_dokter: 'Buka',
      ruang_praktik: 'Poli Umum',
      slot_tersedia: 8,
      kapasitas_per_hari: 8,
      jadwal_hari_ini: '-',
      status_jadwal: 'Buka',
      is_cuti: false,
      sesi_harian: []
    };

    expect(getDoctorCardStatus(quotaOnlyDoctor)).toBe('Belum Diatur');
  });

  it('returns "Terisi" for scheduled doctors whose slots are completely filled', () => {
    const fullDoctor: DoctorSchedule = {
      id: 'doc-full-1',
      nama_dokter: 'dr. Siti, Sp.OG',
      spesialisasi: 'Kebidanan',
      status_dokter: 'Aktif',
      ruang_praktik: 'Poli Kandungan',
      slot_tersedia: 0,
      kapasitas_per_hari: 20,
      jadwal_hari_ini: '08:00 - 12:00',
      status_jadwal: 'Penuh',
      is_cuti: false
    };

    expect(getDoctorCardStatus(fullDoctor)).toBe('Terisi');
  });

  it('returns "Buka" for scheduled doctors with available slots', () => {
    const openDoctor: DoctorSchedule = {
      id: 'doc-open-1',
      nama_dokter: 'dr. Andi, Sp.B',
      spesialisasi: 'Bedah',
      status_dokter: 'Aktif',
      ruang_praktik: 'Poli Bedah',
      slot_tersedia: 10,
      kapasitas_per_hari: 20,
      jadwal_hari_ini: '08:00 - 12:00',
      status_jadwal: 'Buka',
      is_cuti: false
    };

    expect(getDoctorCardStatus(openDoctor)).toBe('Buka');
  });

  it('returns "Cuti" when is_cuti is true regardless of quota', () => {
    const cutiDoctor: DoctorSchedule = {
      id: 'doc-cuti-1',
      nama_dokter: 'dr. Rina, Sp.M',
      spesialisasi: 'Mata',
      status_dokter: 'Cuti',
      ruang_praktik: 'Poli Mata',
      slot_tersedia: 0,
      kapasitas_per_hari: 0,
      jadwal_hari_ini: '',
      status_jadwal: 'Cuti',
      is_cuti: true
    };

    expect(getDoctorCardStatus(cutiDoctor)).toBe('Cuti');
  });
});

describe('Occupancy Overview Session Status Mapping', () => {
  it('correctly maps Tutup sessions to CLOSED status and Tutup label', () => {
    const overview = generateFallbackOccupancyOverview('2026-09-24', 'doc-1', [
      {
        id: 'sess-dini-hari',
        nama_sesi: 'Dini Hari',
        jam_mulai: '00:00',
        jam_selesai: '00:30',
        status_sesi: SCHEDULE_STATUS.CLOSED,
        slot_tersedia: 0
      }
    ]);

    const earlyMorningShift = overview.shifts.find((s) => s.contextId === 'early_morning');
    expect(earlyMorningShift).toBeDefined();

    const targetSlot = earlyMorningShift?.slots.find((s) => s.startTime === '00:00');
    expect(targetSlot).toBeDefined();
    expect(targetSlot?.status).toBe('CLOSED');
    expect(targetSlot?.displayLabel).toBe('Tutup');
    expect(targetSlot?.isAvailable).toBe(false);
  });

  it('correctly maps Cuti sessions to CLOSED_LEAVE status and Cuti label', () => {
    const overview = generateFallbackOccupancyOverview('2026-09-24', 'doc-1', [
      {
        id: 'sess-pagi',
        nama_sesi: 'Pagi',
        jam_mulai: '08:00',
        jam_selesai: '08:30',
        status_sesi: SCHEDULE_STATUS.CUTI,
        slot_tersedia: 0
      }
    ]);

    const morningShift = overview.shifts.find((s) => s.contextId === 'morning');
    const targetSlot = morningShift?.slots.find((s) => s.startTime === '08:00');
    expect(targetSlot?.status).toBe('CLOSED_LEAVE');
    expect(targetSlot?.displayLabel).toBe('Cuti');
    expect(targetSlot?.isAvailable).toBe(false);
  });

  it('correctly maps Buka sessions with available slots to AVAILABLE status', () => {
    const overview = generateFallbackOccupancyOverview('2026-09-24', 'doc-1', [
      {
        id: 'sess-siang',
        nama_sesi: 'Siang',
        jam_mulai: '13:00',
        jam_selesai: '13:30',
        status_sesi: SCHEDULE_STATUS.OPEN,
        slot_tersedia: 5
      }
    ]);

    const afternoonShift = overview.shifts.find((s) => s.contextId === 'afternoon');
    const targetSlot = afternoonShift?.slots.find((s) => s.startTime === '13:00');
    expect(targetSlot?.status).toBe('AVAILABLE');
    expect(targetSlot?.displayLabel).toBe('Buka');
    expect(targetSlot?.isAvailable).toBe(true);
  });
});

describe('Time-Based Shift Resolution (resolveShiftFromTime)', () => {
  it('correctly maps hours across shifts', () => {
    expect(resolveShiftFromTime('00:30')).toBe(SCHEDULE_SHIFT.DINI_HARI);
    expect(resolveShiftFromTime('02:00')).toBe(SCHEDULE_SHIFT.DINI_HARI);
    expect(resolveShiftFromTime('05:59')).toBe(SCHEDULE_SHIFT.DINI_HARI);
    expect(resolveShiftFromTime('06:00')).toBe(SCHEDULE_SHIFT.PAGI);
    expect(resolveShiftFromTime('08:30')).toBe(SCHEDULE_SHIFT.PAGI);
    expect(resolveShiftFromTime('11:59')).toBe(SCHEDULE_SHIFT.PAGI);
    expect(resolveShiftFromTime('12:00')).toBe(SCHEDULE_SHIFT.SIANG);
    expect(resolveShiftFromTime('14:30')).toBe(SCHEDULE_SHIFT.SIANG);
    expect(resolveShiftFromTime('17:59')).toBe(SCHEDULE_SHIFT.SIANG);
    expect(resolveShiftFromTime('18:00')).toBe(SCHEDULE_SHIFT.MALAM);
    expect(resolveShiftFromTime('20:00')).toBe(SCHEDULE_SHIFT.MALAM);
    expect(resolveShiftFromTime('23:30')).toBe(SCHEDULE_SHIFT.MALAM);
  });

  it('preserves existing canonical shift name and aliases', () => {
    expect(normalizeScheduleShift('DINI_HARI')).toBe(SCHEDULE_SHIFT.DINI_HARI);
    expect(normalizeScheduleShift('early_morning')).toBe(SCHEDULE_SHIFT.DINI_HARI);
    expect(normalizeScheduleShift('PAGI')).toBe(SCHEDULE_SHIFT.PAGI);
    expect(normalizeScheduleShift('morning')).toBe(SCHEDULE_SHIFT.PAGI);
    expect(normalizeScheduleShift('SIANG')).toBe(SCHEDULE_SHIFT.SIANG);
    expect(normalizeScheduleShift('afternoon')).toBe(SCHEDULE_SHIFT.SIANG);
    expect(normalizeScheduleShift('MALAM')).toBe(SCHEDULE_SHIFT.MALAM);
    expect(normalizeScheduleShift('night')).toBe(SCHEDULE_SHIFT.MALAM);
  });
});
