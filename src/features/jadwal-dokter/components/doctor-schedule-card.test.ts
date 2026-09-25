import { describe, expect, it } from 'vitest';
import {
  getDoctorCardStatus,
  getUpcomingScheduleTime,
  hasConfiguredDoctorSchedule
} from './doctor-schedule-card';
import type { DoctorSchedule } from '../api/types';

describe('DoctorScheduleCard Logic & Status Contracts', () => {
  const baseDoctor: DoctorSchedule = {
    id: 'doc-1',
    nama_dokter: 'dr. Ahmad Pratama',
    spesialisasi: 'Poli Umum',
    status_dokter: 'OPEN',
    status_jadwal: 'OPEN',
    ruang_praktik: 'Ruang Poli 1',
    tanggal_praktik: '2026-09-24',
    slot_tersedia: 12,
    kapasitas_per_hari: 12,
    jadwal_hari_ini: '08:00 - 12:00',
    is_cuti: false,
    sesi_harian: [
      {
        id: 'sess-1',
        nama_sesi: 'Sesi Pagi',
        jam_mulai: '08:00',
        jam_selesai: '12:00',
        kuota_pasien: 12,
        slot_tersedia: 12,
        status_sesi: 'OPEN'
      }
    ]
  };

  it('correctly identifies OPEN doctor as Buka', () => {
    expect(getDoctorCardStatus(baseDoctor)).toBe('Buka');
  });

  it('correctly identifies CLOSED doctor (canonical backend enum) as Tutup even with configured sessions', () => {
    const closedDoctor: DoctorSchedule = {
      ...baseDoctor,
      status_dokter: 'CLOSED',
      status_jadwal: 'CLOSED',
      slot_tersedia: 0,
      kapasitas_per_hari: 0
    };
    expect(getDoctorCardStatus(closedDoctor)).toBe('Tutup');
  });

  it('correctly identifies legacy Tutup doctor as Tutup', () => {
    const closedDoctor: DoctorSchedule = {
      ...baseDoctor,
      status_dokter: 'Tutup',
      status_jadwal: 'Tutup'
    };
    expect(getDoctorCardStatus(closedDoctor)).toBe('Tutup');
  });

  it('correctly identifies OCCUPIED doctor as Terisi', () => {
    const occupiedDoctor: DoctorSchedule = {
      ...baseDoctor,
      status_dokter: 'OCCUPIED',
      status_jadwal: 'OCCUPIED'
    };
    expect(getDoctorCardStatus(occupiedDoctor)).toBe('Terisi');
  });

  it('correctly identifies doctor on leave as Cuti', () => {
    const cutiDoctor: DoctorSchedule = {
      ...baseDoctor,
      is_cuti: true,
      cuti_reason: 'Cuti Tahunan'
    };
    expect(getDoctorCardStatus(cutiDoctor)).toBe('Cuti');
  });

  it('correctly identifies unconfigured doctor as Belum Diatur', () => {
    const unconfiguredDoctor: DoctorSchedule = {
      ...baseDoctor,
      sesi_harian: [],
      jadwal_hari_ini: ''
    };
    expect(hasConfiguredDoctorSchedule(unconfiguredDoctor)).toBe(false);
    expect(getDoctorCardStatus(unconfiguredDoctor)).toBe('Belum Diatur');
  });

  it('retrieves upcoming schedule time from active sessions', () => {
    const sessions = [
      {
        id: 's-1',
        nama_sesi: 'Sesi Siang',
        jam_mulai: '13:00',
        jam_selesai: '17:00',
        kuota_pasien: 10,
        slot_tersedia: 10,
        status_sesi: 'OPEN'
      }
    ];
    const fixedMorning = new Date('2026-09-25T08:00:00');
    const upcoming = getUpcomingScheduleTime('13:00 - 17:00', sessions, undefined, fixedMorning);
    expect(upcoming.labelTime).toBe('13.00 – 13.30');
    expect(upcoming.sessionName).toBe('Sesi Siang');
  });

  it('correctly detects active session and upcoming session when time matches', () => {
    const now = new Date();
    const curH = String(now.getHours()).padStart(2, '0');
    const nextH = String((now.getHours() + 1) % 24).padStart(2, '0');
    const afterNextH = String((now.getHours() + 2) % 24).padStart(2, '0');

    const sessions = [
      {
        id: 's-now',
        nama_sesi: 'Sesi Sekarang',
        jam_mulai: `${curH}:00`,
        jam_selesai: `${nextH}:00`,
        kuota_pasien: 10,
        slot_tersedia: 5,
        status_sesi: 'OPEN'
      },
      {
        id: 's-next',
        nama_sesi: 'Sesi Mendatang',
        jam_mulai: `${nextH}:00`,
        jam_selesai: `${afterNextH}:00`,
        kuota_pasien: 10,
        slot_tersedia: 10,
        status_sesi: 'OPEN'
      }
    ];

    const result = getUpcomingScheduleTime(`${curH}:00 - ${afterNextH}:00`, sessions);
    expect(result.hasActive).toBe(true);
    expect(result.activeTime).toBeDefined();
    expect(result.upcomingTime).toBeDefined();
  });
});
