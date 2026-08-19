export type ScheduleDayStatus = 'Aktif' | 'Sebagian' | 'Cuti / Tutup' | 'Tutup' | 'Libur' | 'Off';

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
  status_dokter: 'Aktif' | 'Pending' | 'Selesai' | 'Terkoneksi' | 'Cuti' | 'Libur' | string;
  email: string;
  nomor_telepon: string;
  ruang_praktik: string;
  tanggal_praktik?: string;
  avatar: string;
  slot_tersedia: number;
  kapasitas_per_hari: number;
  jadwal_hari_ini: string;
  status_jadwal: 'Aktif' | 'Sebagian' | 'Cuti / Tutup' | 'Tutup' | string;
  bulan_jadwal: string; // e.g. "Mei 2026"
  monthly_schedule: MonthlyScheduleDay[];
  is_cuti: boolean;
  cuti_reason?: string;
  cuti_start?: string;
  cuti_end?: string;
}

// Generate Dataset 3 monthly schedule for Sarah Putri (Mei 2026)
const generateSarahSchedule = (): MonthlyScheduleDay[] => {
  const scheduleMap: Record<number, ScheduleDayStatus> = {
    1: 'Aktif',
    2: 'Aktif',
    3: 'Aktif',
    4: 'Aktif',
    5: 'Sebagian',
    6: 'Sebagian',
    7: 'Aktif',
    8: 'Aktif',
    9: 'Aktif',
    10: 'Off',
    11: 'Aktif',
    12: 'Aktif',
    13: 'Cuti / Tutup',
    14: 'Aktif',
    15: 'Aktif',
    16: 'Aktif',
    17: 'Off',
    18: 'Aktif',
    19: 'Aktif',
    20: 'Tutup',
    21: 'Aktif',
    22: 'Aktif',
    23: 'Aktif',
    24: 'Off',
    25: 'Cuti / Tutup',
    26: 'Aktif',
    27: 'Off',
    28: 'Aktif',
    29: 'Aktif',
    30: 'Aktif',
    31: 'Off'
  };

  return Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const dateStr = `2026-05-${String(day).padStart(2, '0')}`;
    return {
      day,
      date: dateStr,
      status: scheduleMap[day] || 'Aktif'
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
      status: isOff ? 'Off' : day % 7 === 0 ? 'Sebagian' : 'Aktif'
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
        : generateStandardSchedule([3 + (idx % 4), 10 + (idx % 4), 17 + (idx % 4), 24 + (idx % 4)])
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
          doc.ruang_praktik.toLowerCase().includes(q) ||
          doc.email.toLowerCase().includes(q) ||
          doc.nomor_telepon.includes(q)
      );
    }

    if (params.month && params.month !== 'ALL') {
      const m = params.month.toLowerCase();
      result = result.filter((doc) => doc.bulan_jadwal?.toLowerCase().includes(m));
    }

    if (params.date) {
      result = result.filter(
        (doc) =>
          doc.tanggal_praktik?.toLowerCase().includes(params.date!.toLowerCase()) ||
          doc.monthly_schedule?.some((d) => d.date === params.date && d.status === 'Aktif')
      );
    }

    if (params.poli && params.poli.length > 0) {
      result = result.filter((doc) =>
        params.poli?.some((p) => doc.spesialisasi.toLowerCase().includes(p.toLowerCase()))
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
      updated.status_jadwal = 'Cuti / Tutup';
      updated.slot_tersedia = 0;
    } else if (payload.is_cuti === false && current.is_cuti === true) {
      updated.status_dokter = 'Aktif';
      updated.status_jadwal = 'Aktif';
      updated.slot_tersedia = updated.kapasitas_per_hari;
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
