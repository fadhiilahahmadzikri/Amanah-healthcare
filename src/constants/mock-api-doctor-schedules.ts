export type ScheduleDayStatus = 'Buka' | 'Penuh' | 'Cuti';
export type SessionStatus = 'Buka' | 'Penuh' | 'Cuti';

export interface DoctorDailySession {
  id: string;
  nama_sesi: string; // e.g. "Sesi Pagi", "Sesi Siang", "Sesi Sore", "Sesi Malam", "Shift Dini Hari"
  jam_mulai: string; // e.g. "07:00"
  jam_selesai: string; // e.g. "11:00"
  waktu: string; // e.g. "07:00 - 11:00"
  kuota_pasien: number;
  slot_tersedia: number;
  status_sesi: SessionStatus;
  ruang?: string;
}

export interface MonthlyScheduleDay {
  day: number;
  date: string;
  status: ScheduleDayStatus;
  notes?: string;
}

export interface DoctorSchedule {
  id: string;
  nama_dokter: string;
  spesialisasi: string;
  status_dokter: 'Buka' | 'Penuh' | 'Cuti' | string;
  email: string;
  nomor_telepon: string;
  ruang_praktik: string;
  tanggal_praktik?: string;
  avatar: string;
  slot_tersedia: number;
  kapasitas_per_hari: number;
  jadwal_hari_ini: string;
  status_jadwal: 'Buka' | 'Penuh' | 'Cuti' | string;
  bulan_jadwal: string; // e.g. "Mei 2026"
  monthly_schedule: MonthlyScheduleDay[];
  sesi_harian: DoctorDailySession[];
  is_cuti: boolean;
  cuti_reason?: string;
  cuti_start?: string;
  cuti_end?: string;
}

// Helper multi-sesi untuk klinik 24 jam
export const generate24hSessions = (
  docId: string,
  isCuti: boolean,
  ruang: string
): DoctorDailySession[] => {
  if (isCuti) {
    return [
      {
        id: `${docId}-s1`,
        nama_sesi: 'Sesi Pagi',
        jam_mulai: '07:30',
        jam_selesai: '11:30',
        waktu: '07:30 - 11:30',
        kuota_pasien: 15,
        slot_tersedia: 0,
        status_sesi: 'Cuti',
        ruang
      },
      {
        id: `${docId}-s2`,
        nama_sesi: 'Sesi Sore',
        jam_mulai: '14:00',
        jam_selesai: '18:00',
        waktu: '14:00 - 18:00',
        kuota_pasien: 15,
        slot_tersedia: 0,
        status_sesi: 'Cuti',
        ruang
      },
      {
        id: `${docId}-s3`,
        nama_sesi: 'Sesi Malam',
        jam_mulai: '19:00',
        jam_selesai: '23:00',
        waktu: '19:00 - 23:00',
        kuota_pasien: 10,
        slot_tersedia: 0,
        status_sesi: 'Cuti',
        ruang
      }
    ];
  }

  if (docId === 'doc-001') {
    return [
      {
        id: `${docId}-s1`,
        nama_sesi: 'Sesi Pagi',
        jam_mulai: '07:30',
        jam_selesai: '11:30',
        waktu: '07:30 - 11:30',
        kuota_pasien: 12,
        slot_tersedia: 4,
        status_sesi: 'Buka',
        ruang
      },
      {
        id: `${docId}-s2`,
        nama_sesi: 'Sesi Sore',
        jam_mulai: '14:00',
        jam_selesai: '17:30',
        waktu: '14:00 - 17:30',
        kuota_pasien: 15,
        slot_tersedia: 7,
        status_sesi: 'Buka',
        ruang
      },
      {
        id: `${docId}-s3`,
        nama_sesi: 'Sesi Malam',
        jam_mulai: '19:00',
        jam_selesai: '22:00',
        waktu: '19:00 - 22:00',
        kuota_pasien: 10,
        slot_tersedia: 0,
        status_sesi: 'Penuh',
        ruang
      }
    ];
  }

  if (docId === 'doc-002') {
    return [
      {
        id: `${docId}-s1`,
        nama_sesi: 'Sesi Pagi',
        jam_mulai: '08:00',
        jam_selesai: '12:00',
        waktu: '08:00 - 12:00',
        kuota_pasien: 10,
        slot_tersedia: 0,
        status_sesi: 'Penuh',
        ruang
      },
      {
        id: `${docId}-s2`,
        nama_sesi: 'Sesi Siang',
        jam_mulai: '13:00',
        jam_selesai: '17:00',
        waktu: '13:00 - 17:00',
        kuota_pasien: 15,
        slot_tersedia: 3,
        status_sesi: 'Buka',
        ruang
      },
      {
        id: `${docId}-s3`,
        nama_sesi: 'Shift Dini Hari',
        jam_mulai: '23:00',
        jam_selesai: '06:00',
        waktu: '23:00 - 06:00',
        kuota_pasien: 8,
        slot_tersedia: 8,
        status_sesi: 'Buka',
        ruang
      }
    ];
  }

  return [
    {
      id: `${docId}-s1`,
      nama_sesi: 'Sesi Pagi',
      jam_mulai: '08:00',
      jam_selesai: '11:30',
      waktu: '08:00 - 11:30',
      kuota_pasien: 10,
      slot_tersedia: 2,
      status_sesi: 'Buka',
      ruang
    },
    {
      id: `${docId}-s2`,
      nama_sesi: 'Sesi Sore',
      jam_mulai: '14:30',
      jam_selesai: '18:00',
      waktu: '14:30 - 18:00',
      kuota_pasien: 12,
      slot_tersedia: 6,
      status_sesi: 'Buka',
      ruang
    },
    {
      id: `${docId}-s3`,
      nama_sesi: 'Sesi Malam',
      jam_mulai: '19:30',
      jam_selesai: '23:00',
      waktu: '19:30 - 23:00',
      kuota_pasien: 8,
      slot_tersedia: 4,
      status_sesi: 'Buka',
      ruang
    }
  ];
};

// Generate Dataset 3 monthly schedule for Sarah Putri (Mei 2026)
const generateSarahSchedule = (): MonthlyScheduleDay[] => {
  const scheduleMap: Record<number, ScheduleDayStatus> = {
    1: 'Buka',
    2: 'Buka',
    3: 'Buka',
    4: 'Penuh',
    5: 'Penuh',
    6: 'Penuh',
    7: 'Buka',
    8: 'Buka',
    9: 'Buka',
    10: 'Cuti',
    11: 'Buka',
    12: 'Buka',
    13: 'Cuti',
    14: 'Buka',
    15: 'Buka',
    16: 'Buka',
    17: 'Cuti',
    18: 'Buka',
    19: 'Buka',
    20: 'Penuh',
    21: 'Buka',
    22: 'Buka',
    23: 'Buka',
    24: 'Cuti',
    25: 'Cuti',
    26: 'Buka',
    27: 'Cuti',
    28: 'Buka',
    29: 'Buka',
    30: 'Buka',
    31: 'Cuti'
  };

  return Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const dateStr = `2026-05-${String(day).padStart(2, '0')}`;
    return {
      day,
      date: dateStr,
      status: scheduleMap[day] || 'Buka'
    };
  });
};

const generateStandardSchedule = (
  offDays: number[] = [3, 10, 17, 24, 31]
): MonthlyScheduleDay[] => {
  return Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const dateStr = `2026-05-${String(day).padStart(2, '0')}`;
    const isOff = offDays.includes(day);
    return {
      day,
      date: dateStr,
      status: isOff ? 'Cuti' : day % 7 === 0 ? 'Penuh' : 'Buka'
    };
  });
};

const generateCutiSchedule = (startDay = 10, endDay = 20): MonthlyScheduleDay[] => {
  return Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const dateStr = `2026-05-${String(day).padStart(2, '0')}`;
    const isCuti = day >= startDay && day <= endDay;
    return {
      day,
      date: dateStr,
      status: isCuti ? 'Cuti' : day % 7 === 0 ? 'Penuh' : 'Buka'
    };
  });
};

import doctorSchedulesData from '@/constants/mock-data/doctor-schedules.json';

export const initialDoctorSchedules: DoctorSchedule[] = (
  doctorSchedulesData as unknown as DoctorSchedule[]
).map((doc, idx) => ({
  ...doc,
  monthly_schedule:
    doc.monthly_schedule && doc.monthly_schedule.length > 0
      ? doc.monthly_schedule
      : doc.id === 'doc-001'
        ? generateSarahSchedule()
        : doc.is_cuti
          ? generateCutiSchedule(10, 20)
          : generateStandardSchedule([
              3 + (idx % 4),
              10 + (idx % 4),
              17 + (idx % 4),
              24 + (idx % 4)
            ]),
  sesi_harian: generate24hSessions(doc.id, doc.is_cuti, doc.ruang_praktik)
}));

class MockDoctorScheduleService {
  private items: DoctorSchedule[] = [...initialDoctorSchedules];

  async getAll(params: {
    search?: string;
    poli?: string[];
    status?: string[];
    month?: string;
    date?: string;
    page?: number;
    limit?: number;
  }) {
    let result = [...this.items];

    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.nama_dokter.toLowerCase().includes(q) ||
          doc.spesialisasi.toLowerCase().includes(q) ||
          doc.ruang_praktik.toLowerCase().includes(q)
      );
    }

    if (params.poli && params.poli.length > 0) {
      result = result.filter((doc) =>
        params.poli?.some(
          (p) =>
            doc.spesialisasi.toLowerCase().includes(p.toLowerCase()) ||
            doc.ruang_praktik.toLowerCase().includes(p.toLowerCase())
        )
      );
    }

    if (params.status && params.status.length > 0) {
      result = result.filter((doc) =>
        params.status?.some(
          (s) =>
            doc.status_dokter.toLowerCase() === s.toLowerCase() ||
            doc.status_jadwal.toLowerCase() === s.toLowerCase()
        )
      );
    }

    const total = result.length;
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;
    const paginated = result.slice(offset, offset + limit);

    return {
      doctors: paginated,
      total_doctors: total
    };
  }

  async getById(id: string): Promise<DoctorSchedule | undefined> {
    return this.items.find((d) => d.id === id);
  }

  async updateSchedule(id: string, payload: Partial<DoctorSchedule>): Promise<DoctorSchedule> {
    const idx = this.items.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error('Doctor not found');

    const current = this.items[idx];
    const updated: DoctorSchedule = {
      ...current,
      ...payload
    };

    // If doctor is set to cuti, adjust seat availability & status
    if (payload.is_cuti === true) {
      updated.status_dokter = 'Cuti';
      updated.status_jadwal = 'Cuti';
      updated.slot_tersedia = 0;
      updated.sesi_harian = generate24hSessions(id, true, current.ruang_praktik);
    } else if (payload.is_cuti === false && current.is_cuti === true) {
      updated.status_dokter = 'Buka';
      updated.status_jadwal = 'Buka';
      updated.slot_tersedia = updated.kapasitas_per_hari;
      updated.sesi_harian = generate24hSessions(id, false, current.ruang_praktik);
    }

    this.items[idx] = updated;
    return updated;
  }

  async updateDayStatus(
    doctorId: string,
    day: number,
    status: ScheduleDayStatus
  ): Promise<DoctorSchedule> {
    const doc = await this.getById(doctorId);
    if (!doc) throw new Error('Doctor not found');

    const currentMonthly = doc.monthly_schedule || generateStandardSchedule();
    const updatedMonthly = currentMonthly.map((d) => (d.day === day ? { ...d, status } : d));

    return this.updateSchedule(doctorId, { monthly_schedule: updatedMonthly });
  }
}

export const fakeDoctorSchedules = new MockDoctorScheduleService();
