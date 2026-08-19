import { matchSorter } from 'match-sorter';
import { delay } from './mock-api';

export type LiveStatus =
  | 'SUDAH BUAT JANJI'
  | 'SUDAH DATANG'
  | 'MENUNGGU'
  | 'SEDANG PERIKSA'
  | 'SELESAI'
  | 'TIDAK ADA DOKTER'
  | 'Sudah Buat Janji'
  | 'Sudah Datang'
  | 'Menunggu'
  | 'Sedang Periksa'
  | 'Selesai'
  | 'Tidak Ada Dokter';

export type AdminAppointment = {
  id: number;
  no_antrian: string; // 'A-002' or '-'
  nomor_antrian: string;
  pasien: string; // 'Ahmad Fauzi'
  nama_pasien: string;
  nama_lengkap: string;
  id_pasien: string; // 'RM-2024-0047'
  avatar: string;
  tanggal_booking: string; // 'Jumat, 21 Ags 2026'
  tanggal_reservasi: string;
  jam_booking: string; // '13:00 - 13:30 WIB'
  jam_slot_booking: string;
  dokter: string; // 'dr. Hendra Wijaya, Sp.OT'
  dokter_tujuan: string;
  layanan_poli: string; // 'Poli Orthopedi'
  poliklinik_layanan: string;
  live_status: LiveStatus;
  status_kunjungan: string;
  tipe_kunjungan: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  nomor_telepon_wa: string;
  email_pasien: string;
  keluhan_pasien: string;
  created_at: string;
  updated_at: string;
};

export type AppointmentSummary = {
  total: number;
  sudah_datang: number;
  sudah_buat_janji: number;
  menunggu: number;
  sedang_periksa: number;
  selesai: number;
  tidak_ada_dokter: number;
};

// The exact 10 records from the dataset
const initialSeedAppointments: AdminAppointment[] = [
  {
    id: 1,
    no_antrian: 'A-002',
    nomor_antrian: 'A-002',
    pasien: 'Ahmad Fauzi',
    nama_pasien: 'Ahmad Fauzi',
    nama_lengkap: 'Ahmad Fauzi',
    id_pasien: 'RM-2024-0047',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    tanggal_booking: 'Jumat, 21 Ags 2026',
    tanggal_reservasi: 'Jumat, 21 Ags 2026',
    jam_booking: '13:00 - 13:30 WIB',
    jam_slot_booking: '13:00 - 13:30 WIB',
    dokter: 'dr. Hendra Wijaya, Sp.OT',
    dokter_tujuan: 'dr. Hendra Wijaya, Sp.OT',
    layanan_poli: 'Poli Orthopedi',
    poliklinik_layanan: 'Poli Orthopedi',
    live_status: 'SUDAH DATANG',
    status_kunjungan: 'SUDAH DATANG',
    tipe_kunjungan: 'Kontrol Ulang',
    jenis_kelamin: 'Laki-laki',
    nomor_telepon_wa: '0821-5678-9012',
    email_pasien: 'fauzi.ahmad@yahoo.com',
    keluhan_pasien: 'Punggung bawah masih terasa kaku saat duduk lama',
    created_at: '2026-08-21T13:00:00.000Z',
    updated_at: '2026-08-21T13:00:00.000Z'
  },
  {
    id: 2,
    no_antrian: 'A-001',
    nomor_antrian: 'A-001',
    pasien: 'Madonna Sari',
    nama_pasien: 'Madonna Sari',
    nama_lengkap: 'Madonna Sari',
    id_pasien: 'RM-2024-0000',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    tanggal_booking: 'Kamis, 20 Ags 2026',
    tanggal_reservasi: 'Kamis, 20 Ags 2026',
    jam_booking: '09:00 - 09:30 WIB',
    jam_slot_booking: '09:00 - 09:30 WIB',
    dokter: 'dr. Sarah Putri, Sp.PD',
    dokter_tujuan: 'dr. Sarah Putri, Sp.PD',
    layanan_poli: 'Poliklinik Kulit & Kelamin',
    poliklinik_layanan: 'Poliklinik Kulit & Kelamin',
    live_status: 'SUDAH BUAT JANJI',
    status_kunjungan: 'SUDAH BUAT JANJI',
    tipe_kunjungan: 'Pemeriksaan Baru',
    jenis_kelamin: 'Perempuan',
    nomor_telepon_wa: '0818-7654-3210',
    email_pasien: 'madonna.sari@example.com',
    keluhan_pasien: 'Ruam gatal pada kulit lengan kanan sejak 2 hari lalu',
    created_at: '2026-08-20T09:00:00.000Z',
    updated_at: '2026-08-20T09:00:00.000Z'
  },
  {
    id: 3,
    no_antrian: '-',
    nomor_antrian: '-',
    pasien: 'Nadia Putri',
    nama_pasien: 'Nadia Putri',
    nama_lengkap: 'Nadia Putri',
    id_pasien: 'RM-2025-0155',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    tanggal_booking: 'Kamis, 20 Ags 2026',
    tanggal_reservasi: 'Kamis, 20 Ags 2026',
    jam_booking: '08:00 - 08:30 WIB',
    jam_slot_booking: '08:00 - 08:30 WIB',
    dokter: 'dr. Salsabila Putri',
    dokter_tujuan: 'dr. Salsabila Putri',
    layanan_poli: 'Poli Umum',
    poliklinik_layanan: 'Poli Umum',
    live_status: 'SUDAH BUAT JANJI',
    status_kunjungan: 'SUDAH BUAT JANJI',
    tipe_kunjungan: 'Pemeriksaan Baru',
    jenis_kelamin: 'Perempuan',
    nomor_telepon_wa: '0812-9988-7766',
    email_pasien: 'nadia.putri@example.com',
    keluhan_pasien: 'Demam dan pusing sejak semalam',
    created_at: '2026-08-20T08:00:00.000Z',
    updated_at: '2026-08-20T08:00:00.000Z'
  },
  {
    id: 4,
    no_antrian: 'A-003',
    nomor_antrian: 'A-003',
    pasien: 'Dewi Rahayu',
    nama_pasien: 'Dewi Rahayu',
    nama_lengkap: 'Dewi Rahayu',
    id_pasien: 'RM-2024-0089',
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    tanggal_booking: 'Sabtu, 22 Ags 2026',
    tanggal_reservasi: 'Sabtu, 22 Ags 2026',
    jam_booking: '14:30 - 15:00 WIB',
    jam_slot_booking: '14:30 - 15:00 WIB',
    dokter: 'dr. Ratna Sari, Sp.DVE',
    dokter_tujuan: 'dr. Ratna Sari, Sp.DVE',
    layanan_poli: 'Poliklinik Kulit & Kelamin',
    poliklinik_layanan: 'Poliklinik Kulit & Kelamin',
    live_status: 'MENUNGGU',
    status_kunjungan: 'MENUNGGU',
    tipe_kunjungan: 'Kontrol Ulang',
    jenis_kelamin: 'Perempuan',
    nomor_telepon_wa: '0857-1234-9876',
    email_pasien: 'dewi.rahayu@example.com',
    keluhan_pasien: 'Pemeriksaan lanjutan alergi kosmetik',
    created_at: '2026-08-22T14:30:00.000Z',
    updated_at: '2026-08-22T14:30:00.000Z'
  },
  {
    id: 5,
    no_antrian: 'A-008',
    nomor_antrian: 'A-008',
    pasien: 'Ilsa Namaga',
    nama_pasien: 'Ilsa Namaga',
    nama_lengkap: 'Ilsa Namaga',
    id_pasien: 'RM-2024-0190',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    tanggal_booking: 'Selasa, 18 Ags 2026',
    tanggal_reservasi: 'Selasa, 18 Ags 2026',
    jam_booking: '13:30 - 14:00 WIB',
    jam_slot_booking: '13:30 - 14:00 WIB',
    dokter: 'dr. Farhan Malik, Sp.THT',
    dokter_tujuan: 'dr. Farhan Malik, Sp.THT',
    layanan_poli: 'Poli THT',
    poliklinik_layanan: 'Poli THT',
    live_status: 'MENUNGGU',
    status_kunjungan: 'MENUNGGU',
    tipe_kunjungan: 'Pemeriksaan Baru',
    jenis_kelamin: 'Perempuan',
    nomor_telepon_wa: '0813-4455-6677',
    email_pasien: 'ilsa.namaga@example.com',
    keluhan_pasien: 'Telinga berdenging dan hidung tersumbat',
    created_at: '2026-08-18T13:30:00.000Z',
    updated_at: '2026-08-18T13:30:00.000Z'
  },
  {
    id: 6,
    no_antrian: 'A-021',
    nomor_antrian: 'A-021',
    pasien: 'Chelsea Lailasari',
    nama_pasien: 'Chelsea Lailasari',
    nama_lengkap: 'Chelsea Lailasari',
    id_pasien: 'RM-2026-0125',
    avatar:
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
    tanggal_booking: 'Senin, 26 Ags 2026',
    tanggal_reservasi: 'Senin, 26 Ags 2026',
    jam_booking: '16:00 - 16:30 WIB',
    jam_slot_booking: '16:00 - 16:30 WIB',
    dokter: 'dr. Sarah Putri, Sp.PD',
    dokter_tujuan: 'dr. Sarah Putri, Sp.PD',
    layanan_poli: 'Poliklinik Kulit & Kelamin',
    poliklinik_layanan: 'Poliklinik Kulit & Kelamin',
    live_status: 'SUDAH BUAT JANJI',
    status_kunjungan: 'SUDAH BUAT JANJI',
    tipe_kunjungan: 'Pemeriksaan Baru',
    jenis_kelamin: 'Perempuan',
    nomor_telepon_wa: '0819-3322-1100',
    email_pasien: 'chelsea.lailasari@example.com',
    keluhan_pasien: 'Konsultasi kesehatan kulit rutin',
    created_at: '2026-08-26T16:00:00.000Z',
    updated_at: '2026-08-26T16:00:00.000Z'
  },
  {
    id: 7,
    no_antrian: 'A-016',
    nomor_antrian: 'A-016',
    pasien: 'Kasim Marpaung',
    nama_pasien: 'Kasim Marpaung',
    nama_lengkap: 'Kasim Marpaung',
    id_pasien: 'RM-2024-0210',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    tanggal_booking: 'Jumat, 25 Ags 2026',
    tanggal_reservasi: 'Jumat, 25 Ags 2026',
    jam_booking: '08:00 - 08:30 WIB',
    jam_slot_booking: '08:00 - 08:30 WIB',
    dokter: 'dr. Andi Nugroho, Sp.JP',
    dokter_tujuan: 'dr. Andi Nugroho, Sp.JP',
    layanan_poli: 'Poli Jantung',
    poliklinik_layanan: 'Poli Jantung',
    live_status: 'SUDAH BUAT JANJI',
    status_kunjungan: 'SUDAH BUAT JANJI',
    tipe_kunjungan: 'Kontrol Ulang',
    jenis_kelamin: 'Laki-laki',
    nomor_telepon_wa: '0812-7788-9900',
    email_pasien: 'kasim.marpaung@example.com',
    keluhan_pasien: 'Pemeriksaan ritme detak jantung pasca operasi',
    created_at: '2026-08-25T08:00:00.000Z',
    updated_at: '2026-08-25T08:00:00.000Z'
  },
  {
    id: 8,
    no_antrian: 'A-010',
    nomor_antrian: 'A-010',
    pasien: 'Maria Anandya',
    nama_pasien: 'Maria Anandya',
    nama_lengkap: 'Maria Anandya',
    id_pasien: 'RM-2025-0088',
    avatar:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    tanggal_booking: 'Selasa, 22 Ags 2026',
    tanggal_reservasi: 'Selasa, 22 Ags 2026',
    jam_booking: '10:30 - 11:00 WIB',
    jam_slot_booking: '10:30 - 11:00 WIB',
    dokter: 'dr. Farhan Malik, Sp.THT',
    dokter_tujuan: 'dr. Farhan Malik, Sp.THT',
    layanan_poli: 'Poli THT',
    poliklinik_layanan: 'Poli THT',
    live_status: 'SUDAH BUAT JANJI',
    status_kunjungan: 'SUDAH BUAT JANJI',
    tipe_kunjungan: 'Pemeriksaan Baru',
    jenis_kelamin: 'Perempuan',
    nomor_telepon_wa: '0858-6677-8899',
    email_pasien: 'maria.anandya@example.com',
    keluhan_pasien: 'Radang tenggorokan dan batuk kering',
    created_at: '2026-08-22T10:30:00.000Z',
    updated_at: '2026-08-22T10:30:00.000Z'
  },
  {
    id: 9,
    no_antrian: 'A-019',
    nomor_antrian: 'A-019',
    pasien: 'Cakrawala Himawan',
    nama_pasien: 'Cakrawala Himawan',
    nama_lengkap: 'Cakrawala Himawan',
    id_pasien: 'RM-2025-0130',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    tanggal_booking: 'Jumat, 26 Ags 2026',
    tanggal_reservasi: 'Jumat, 26 Ags 2026',
    jam_booking: '14:00 - 14:30 WIB',
    jam_slot_booking: '14:00 - 14:30 WIB',
    dokter: 'dr. Maya Indah, Sp.OG',
    dokter_tujuan: 'dr. Maya Indah, Sp.OG',
    layanan_poli: 'Poli Kandungan',
    poliklinik_layanan: 'Poli Kandungan',
    live_status: 'SUDAH DATANG',
    status_kunjungan: 'SUDAH DATANG',
    tipe_kunjungan: 'Kontrol Ulang',
    jenis_kelamin: 'Laki-laki',
    nomor_telepon_wa: '0822-1133-5577',
    email_pasien: 'cakrawala.himawan@example.com',
    keluhan_pasien: 'Pendampingan USG trimester kedua',
    created_at: '2026-08-26T14:00:00.000Z',
    updated_at: '2026-08-26T14:00:00.000Z'
  },
  {
    id: 10,
    no_antrian: '-',
    nomor_antrian: '-',
    pasien: 'Umar Rahardian',
    nama_pasien: 'Umar Rahardian',
    nama_lengkap: 'Umar Rahardian',
    id_pasien: 'RM-2026-0005',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    tanggal_booking: 'Rabu, 19 Ags 2026',
    tanggal_reservasi: 'Rabu, 19 Ags 2026',
    jam_booking: '16:30 - 17:00 WIB',
    jam_slot_booking: '16:30 - 17:00 WIB',
    dokter: 'dr. Hendra Wijaya, Sp.OT',
    dokter_tujuan: 'dr. Hendra Wijaya, Sp.OT',
    layanan_poli: 'Poli Orthopedi',
    poliklinik_layanan: 'Poli Orthopedi',
    live_status: 'MENUNGGU',
    status_kunjungan: 'MENUNGGU',
    tipe_kunjungan: 'Pemeriksaan Baru',
    jenis_kelamin: 'Laki-laki',
    nomor_telepon_wa: '0812-4433-2211',
    email_pasien: 'umar.rahardian@example.com',
    keluhan_pasien: 'Nyeri sendi lutut kanan saat berjalan',
    created_at: '2026-08-19T16:30:00.000Z',
    updated_at: '2026-08-19T16:30:00.000Z'
  }
];

export const fakeAdminAppointments = {
  records: [] as AdminAppointment[],

  initialize() {
    this.records = [...initialSeedAppointments];
  },

  async getSummary(): Promise<AppointmentSummary> {
    const total = this.records.length;
    const sudah_datang = this.records.filter(
      (a) => a.live_status.toUpperCase() === 'SUDAH DATANG'
    ).length;
    const sudah_buat_janji = this.records.filter(
      (a) => a.live_status.toUpperCase() === 'SUDAH BUAT JANJI'
    ).length;
    const menunggu = this.records.filter((a) => a.live_status.toUpperCase() === 'MENUNGGU').length;
    const sedang_periksa = this.records.filter(
      (a) => a.live_status.toUpperCase() === 'SEDANG PERIKSA'
    ).length;
    const selesai = this.records.filter((a) => a.live_status.toUpperCase() === 'SELESAI').length;
    const tidak_ada_dokter = this.records.filter(
      (a) => a.live_status.toUpperCase() === 'TIDAK ADA DOKTER'
    ).length;
    return {
      total,
      sudah_datang,
      sudah_buat_janji,
      menunggu,
      sedang_periksa,
      selesai,
      tidak_ada_dokter
    };
  },

  async getAll({
    status,
    poli,
    search
  }: {
    status?: string | string[];
    poli?: string | string[];
    search?: string;
  }) {
    let appointments = [...this.records];

    if (status) {
      const statusArr = Array.isArray(status) ? status : [status];
      if (statusArr.length > 0) {
        appointments = appointments.filter((a) =>
          statusArr.some((s) => s.toUpperCase() === a.live_status.toUpperCase())
        );
      }
    }

    if (poli) {
      const poliArr = Array.isArray(poli) ? poli : [poli];
      if (poliArr.length > 0) {
        appointments = appointments.filter((a) =>
          poliArr.some((p) => p.toLowerCase() === a.layanan_poli.toLowerCase())
        );
      }
    }

    if (search && search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      const sorted = matchSorter(appointments, q, {
        keys: [
          'pasien',
          'nama_pasien',
          'id_pasien',
          'no_antrian',
          'dokter',
          'layanan_poli',
          'email_pasien',
          'nomor_telepon_wa',
          'keluhan_pasien',
          'live_status'
        ],
        threshold: matchSorter.rankings.CONTAINS
      });

      if (sorted.length > 0) {
        appointments = sorted;
      } else {
        appointments = appointments.filter((a) => {
          return (
            a.pasien.toLowerCase().includes(q) ||
            a.id_pasien.toLowerCase().includes(q) ||
            a.no_antrian.toLowerCase().includes(q) ||
            a.dokter.toLowerCase().includes(q) ||
            a.layanan_poli.toLowerCase().includes(q) ||
            a.email_pasien.toLowerCase().includes(q) ||
            a.nomor_telepon_wa.toLowerCase().includes(q) ||
            a.keluhan_pasien.toLowerCase().includes(q)
          );
        });
      }
    }

    return appointments;
  },

  async getAppointments({
    page = 1,
    limit = 10,
    status,
    poli,
    search,
    sort
  }: {
    page?: number;
    limit?: number;
    status?: string | string[];
    poli?: string | string[];
    search?: string;
    sort?: string;
  }) {
    await delay(350);

    const allFiltered = await this.getAll({
      status,
      poli,
      search
    });

    if (sort) {
      try {
        const sortItems = JSON.parse(sort) as {
          id: string;
          desc: boolean;
        }[];

        if (sortItems.length > 0) {
          const { id, desc } = sortItems[0];
          allFiltered.sort((a, b) => {
            let aVal: unknown = (a as Record<string, unknown>)[id];
            let bVal: unknown = (b as Record<string, unknown>)[id];

            if (id === 'pasien' || id === 'nama_pasien') {
              aVal = a.pasien;
              bVal = b.pasien;
            } else if (id === 'no_antrian') {
              aVal = a.no_antrian;
              bVal = b.no_antrian;
            }

            if (typeof aVal === 'number' && typeof bVal === 'number') {
              return desc ? bVal - aVal : aVal - bVal;
            }
            const aStr = String(aVal ?? '').toLowerCase();
            const bStr = String(bVal ?? '').toLowerCase();
            return desc ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
          });
        }
      } catch {}
    }

    const totalAppointments = allFiltered.length;
    const offset = (page - 1) * limit;
    const paginatedAppointments = allFiltered.slice(offset, offset + limit);

    return {
      success: true,
      time: new Date().toISOString(),
      total_appointments: totalAppointments,
      offset,
      limit,
      appointments: paginatedAppointments,
      summary: await this.getSummary()
    };
  },

  async getAppointmentById(id: number) {
    await delay(300);
    const appointment = this.records.find((a) => a.id === id);
    if (!appointment) {
      return {
        success: false,
        message: `Appointment dengan ID ${id} tidak ditemukan`,
        appointment: null
      };
    }
    return { success: true, appointment };
  },

  async updateLiveStatus(id: number, newStatus: LiveStatus) {
    await delay(400);
    const index = this.records.findIndex((a) => a.id === id);
    if (index === -1) {
      return { success: false, message: `Appointment dengan ID ${id} tidak ditemukan` };
    }

    this.records[index] = {
      ...this.records[index],
      live_status: newStatus,
      status_kunjungan: newStatus,
      updated_at: new Date().toISOString()
    };

    return {
      success: true,
      message: 'Status live antrean berhasil diperbarui',
      appointment: this.records[index]
    };
  },

  async createAppointment(data: Omit<AdminAppointment, 'id' | 'created_at' | 'updated_at'>) {
    await delay(500);
    const newId = this.records.length > 0 ? Math.max(...this.records.map((a) => a.id)) + 1 : 1;
    const nowIso = new Date().toISOString();
    const newRecord: AdminAppointment = {
      ...data,
      id: newId,
      created_at: nowIso,
      updated_at: nowIso
    };
    this.records.unshift(newRecord);
    return {
      success: true,
      message: 'Appointment berhasil ditambahkan',
      appointment: newRecord
    };
  },

  async deleteAppointment(id: number) {
    await delay(400);
    const index = this.records.findIndex((a) => a.id === id);
    if (index === -1) {
      return { success: false, message: `Appointment dengan ID ${id} tidak ditemukan` };
    }
    this.records.splice(index, 1);
    return {
      success: true,
      message: 'Appointment berhasil dihapus'
    };
  }
};

fakeAdminAppointments.initialize();
