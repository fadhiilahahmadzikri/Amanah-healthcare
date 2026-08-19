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

export const initialDoctorSchedules: DoctorSchedule[] = [
  {
    id: 'doc-001',
    nama_dokter: 'dr. Sarah Putri, Sp.PD',
    spesialisasi: 'Penyakit Dalam',
    status_dokter: 'Aktif',
    email: 'sarah.putri@amikomclinic.id',
    nomor_telepon: '0812 3456 7890',
    ruang_praktik: 'Poli Penyakit Dalam, Room 201',
    tanggal_praktik: 'Selasa, 20 Mei 2026',
    avatar: '/assets/avatar/docter/woman-docter-1.png',
    slot_tersedia: 18,
    kapasitas_per_hari: 30,
    jadwal_hari_ini: '09.00 – 09.30',
    status_jadwal: 'Aktif',
    bulan_jadwal: 'Mei 2026',
    monthly_schedule: generateSarahSchedule(),
    is_cuti: false
  },
  {
    id: 'doc-002',
    nama_dokter: 'dr. Andika Perkasa, Sp.A',
    spesialisasi: 'Spesialis Anak',
    status_dokter: 'Pending',
    email: 'andika.perkasa@amikomclinic.id',
    nomor_telepon: '0812 9876 5432',
    ruang_praktik: 'Poli Anak, Room 102',
    tanggal_praktik: 'Rabu, 21 Mei 2026',
    avatar: '/assets/avatar/docter/man-docter-1.png',
    slot_tersedia: 12,
    kapasitas_per_hari: 30,
    jadwal_hari_ini: '10.30 – 11.00',
    status_jadwal: 'Sebagian',
    bulan_jadwal: 'Mei 2026',
    monthly_schedule: generateStandardSchedule([4, 11, 18, 25]),
    is_cuti: false
  },
  {
    id: 'doc-003',
    nama_dokter: 'drg. Budi Santoso',
    spesialisasi: 'Dokter Gigi',
    status_dokter: 'Selesai',
    email: 'budi.santoso@amikomclinic.id',
    nomor_telepon: '0813 1122 3344',
    ruang_praktik: 'Poli Gigi, Room 105',
    tanggal_praktik: 'Kamis, 22 Mei 2026',
    avatar: '/assets/avatar/docter/man-docter-2.png',
    slot_tersedia: 20,
    kapasitas_per_hari: 30,
    jadwal_hari_ini: '13.00 – 13.30',
    status_jadwal: 'Aktif',
    bulan_jadwal: 'Mei 2026',
    monthly_schedule: generateStandardSchedule([5, 12, 19, 26]),
    is_cuti: false
  },
  {
    id: 'doc-004',
    nama_dokter: 'dr. Pratama Agung, Sp.OT',
    spesialisasi: 'Ortopedi & Traumatologi',
    status_dokter: 'Terkoneksi',
    email: 'pratama.agung@amikomclinic.id',
    nomor_telepon: '0815 4433 2211',
    ruang_praktik: 'Poli Bedah, Room 408',
    tanggal_praktik: 'Kamis, 22 Mei 2026',
    avatar: '/assets/avatar/docter/man-docter-1.png',
    slot_tersedia: 16,
    kapasitas_per_hari: 30,
    jadwal_hari_ini: '15.00 – 15.30',
    status_jadwal: 'Aktif',
    bulan_jadwal: 'Mei 2026',
    monthly_schedule: generateStandardSchedule([6, 13, 20, 27]),
    is_cuti: false
  },
  {
    id: 'doc-005',
    nama_dokter: 'dr. Ratna Sari, Sp.DVE',
    spesialisasi: 'Dermatologi',
    status_dokter: 'Cuti',
    email: 'ratna.sari@amikomclinic.id',
    nomor_telepon: '0817 9988 7766',
    ruang_praktik: 'Poli Kulit, Room 108',
    tanggal_praktik: 'Jumat, 23 Mei 2026',
    avatar: '/assets/avatar/docter/woman-docter-2.png',
    slot_tersedia: 0,
    kapasitas_per_hari: 30,
    jadwal_hari_ini: 'Tutup (Cuti)',
    status_jadwal: 'Cuti / Tutup',
    bulan_jadwal: 'Mei 2026',
    monthly_schedule: generateStandardSchedule().map((d) =>
      d.day >= 10 && d.day <= 20 ? { ...d, status: 'Cuti / Tutup' as const } : d
    ),
    is_cuti: true,
    cuti_reason: 'Cuti Tahunan',
    cuti_start: '10 Mei 2026',
    cuti_end: '20 Mei 2026'
  },
  {
    id: 'doc-006',
    nama_dokter: 'dr. Maya Indah, Sp.OG',
    spesialisasi: 'Kebidanan & Kandungan',
    status_dokter: 'Aktif',
    email: 'maya.indah@amikomclinic.id',
    nomor_telepon: '0818 5544 3322',
    ruang_praktik: 'Poli Obgyn, Room 301',
    tanggal_praktik: 'Sabtu, 24 Mei 2026',
    avatar: '/assets/avatar/docter/woman-docter-3.png',
    slot_tersedia: 22,
    kapasitas_per_hari: 30,
    jadwal_hari_ini: '08.30 – 09.00',
    status_jadwal: 'Aktif',
    bulan_jadwal: 'Mei 2026',
    monthly_schedule: generateStandardSchedule([7, 14, 21, 28]),
    is_cuti: false
  }
];

class MockDoctorScheduleService {
  private items: DoctorSchedule[] = [...initialDoctorSchedules];

  async getAll(params: {
    search?: string;
    poli?: string[];
    status?: string[];
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

    const updatedMonthly = doc.monthly_schedule.map((d) => (d.day === day ? { ...d, status } : d));

    return this.updateSchedule(doctorId, { monthly_schedule: updatedMonthly });
  }
}

export const fakeDoctorSchedules = new MockDoctorScheduleService();
