import { matchSorter } from 'match-sorter';
import { delay } from './mock-api';

export type Patient = {
  id: number;
  patient_id: string; // ID Pasien / Rekam Medis (e.g. 'RM-2024-0047')
  name: string; // Patient Name (e.g. 'Ahmad Fauzi')
  avatar: string; // Avatar URL
  nik: string; // 16 digit NIK
  nik_ktp?: string;
  nama_ibu_kandung?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  pekerjaan?: string;
  domisili?: string;
  nomor_telepon_wa?: string;
  email_pasien?: string;
  phone: string; // Phone number
  email: string;
  gender: 'Laki-laki' | 'Perempuan';
  age: number; // e.g. 41
  birth_date: string;
  blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  address: string;
  emergency_contact: string;
  allergies: string[];
  medical_history: string;
  account_status: 'Aktif' | 'Nonaktif' | 'AKTIF' | 'NONAKTIF';
  tanggal_registrasi_akun?: string;
  login_pertama_kali?: string;
  kunjungan_terakhir?: string;
  total_kunjungan?: number;
  created_at: string; // ISO / YYYY-MM-DD
  updated_at: string;
};

export type PatientSummary = {
  total: number;
  active: number;
  inactive: number;
};

// The exact patient records
const initialSeedPatients: Patient[] = [
  {
    id: 1,
    patient_id: 'RM-2024-0047',
    name: 'Ahmad Fauzi',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    nik: '3171022207850003',
    nik_ktp: '3171022207850003',
    nama_ibu_kandung: 'Aminah',
    tempat_lahir: 'Jakarta',
    tanggal_lahir: '22/07/1985',
    pekerjaan: 'Wiraswasta',
    domisili: 'Jl. Sudirman No. 45, Blok C, Jakarta Pusat',
    nomor_telepon_wa: '0821-5678-9012',
    phone: '0821-5678-9012',
    email_pasien: 'fauzi.ahmad@yahoo.com',
    email: 'fauzi.ahmad@yahoo.com',
    gender: 'Laki-laki',
    age: 41,
    birth_date: '1985-07-22',
    blood_type: 'O+',
    address: 'Jl. Sudirman No. 45, Blok C, Jakarta Pusat',
    emergency_contact: 'Aminah (Ibu) - 0812-9876-5432',
    allergies: ['Penicillin', 'Aspirin'],
    medical_history: 'Hipertensi Ringan, Riwayat Pemeriksaan Jantung Berkala',
    account_status: 'AKTIF',
    tanggal_registrasi_akun: '05/03/2024',
    login_pertama_kali: '5 Maret 2024, 08:30 WIB',
    kunjungan_terakhir: '14 Agustus 2026',
    total_kunjungan: 9,
    created_at: '2024-03-05T08:30:00.000Z',
    updated_at: '2024-03-05T08:30:00.000Z'
  },
  {
    id: 2,
    patient_id: 'RM-2025-0012',
    name: 'Budi Kurniawan',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    nik: '3174092104730004',
    nik_ktp: '3174092104730004',
    nama_ibu_kandung: 'Siti Maryam',
    tempat_lahir: 'Surabaya',
    tanggal_lahir: '21/04/1973',
    pekerjaan: 'Pegawai Swasta',
    domisili: 'Jl. Sudirman Kav. 22, Jakarta Pusat',
    nomor_telepon_wa: '0813-8899-2211',
    phone: '0813-8899-2211',
    email_pasien: 'budi.kurniawan@example.com',
    email: 'budi.kurniawan@example.com',
    gender: 'Laki-laki',
    age: 51,
    birth_date: '1973-04-21',
    blood_type: 'B+',
    address: 'Jl. Sudirman Kav. 22, Jakarta Pusat',
    emergency_contact: 'Ratna Kurniawan (Istri) - 0813-1122-3344',
    allergies: ['Sulfonamida'],
    medical_history: 'Diabetes Melitus Tipe 2, Terapi Insulin Terjadwal',
    account_status: 'NONAKTIF',
    tanggal_registrasi_akun: '22/01/2025',
    login_pertama_kali: '22 Januari 2025, 09:15 WIB',
    kunjungan_terakhir: '10 Juli 2026',
    total_kunjungan: 4,
    created_at: '2025-01-22T09:15:00.000Z',
    updated_at: '2025-01-22T09:15:00.000Z'
  },
  {
    id: 3,
    patient_id: 'RM-2024-0089',
    name: 'Dewi Rahayu',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    nik: '3273114508970002',
    nik_ktp: '3273114508970002',
    nama_ibu_kandung: 'Kartini',
    tempat_lahir: 'Bandung',
    tanggal_lahir: '15/08/1997',
    pekerjaan: 'Desainer Grafis',
    domisili: 'Jl. Gandaria No. 8, Bandung',
    nomor_telepon_wa: '0857-1234-9876',
    phone: '0857-1234-9876',
    email_pasien: 'dewi.rahayu@example.com',
    email: 'dewi.rahayu@example.com',
    gender: 'Perempuan',
    age: 27,
    birth_date: '1997-08-15',
    blood_type: 'A+',
    address: 'Jl. Gandaria No. 8, Bandung',
    emergency_contact: 'Bambang Rahayu (Ayah) - 0857-4321-8765',
    allergies: ['Seafood', 'Debu'],
    medical_history: 'Asma Bronkial Terkontrol',
    account_status: 'AKTIF',
    tanggal_registrasi_akun: '18/05/2024',
    login_pertama_kali: '18 Mei 2024, 10:00 WIB',
    kunjungan_terakhir: '02 Agustus 2026',
    total_kunjungan: 12,
    created_at: '2024-05-18T10:00:00.000Z',
    updated_at: '2024-05-18T10:00:00.000Z'
  },
  {
    id: 4,
    patient_id: 'RM-2024-0000',
    name: 'Madonna Sari',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    nik: '3171025010880005',
    nik_ktp: '3171025010880005',
    nama_ibu_kandung: 'Ratnasari',
    tempat_lahir: 'Medan',
    tanggal_lahir: '20/10/1988',
    pekerjaan: 'Dosen',
    domisili: 'Jl. Cempaka Putih Timur No. 3A, Jakarta Pusat',
    nomor_telepon_wa: '0818-7654-3210',
    phone: '0818-7654-3210',
    email_pasien: 'madonna.sari@example.com',
    email: 'madonna.sari@example.com',
    gender: 'Perempuan',
    age: 36,
    birth_date: '1988-10-20',
    blood_type: 'AB+',
    address: 'Jl. Cempaka Putih Timur No. 3A, Jakarta Pusat',
    emergency_contact: 'Indra Gunawan (Suami) - 0818-1234-5678',
    allergies: ['Tidak ada'],
    medical_history: 'Pemeriksaan Rutin Kehamilan (Obstetri & Ginekologi)',
    account_status: 'AKTIF',
    tanggal_registrasi_akun: '10/01/2024',
    login_pertama_kali: '10 Januari 2024, 11:45 WIB',
    kunjungan_terakhir: '28 Juli 2026',
    total_kunjungan: 7,
    created_at: '2024-01-10T11:45:00.000Z',
    updated_at: '2024-01-10T11:45:00.000Z'
  },
  {
    id: 5,
    patient_id: 'RM-2026-0031',
    name: 'Rizky Pratama',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    nik: '3204151202920008',
    nik_ktp: '3204151202920008',
    nama_ibu_kandung: 'Endang',
    tempat_lahir: 'Surabaya',
    tanggal_lahir: '12/02/1992',
    pekerjaan: 'Arsitek',
    domisili: 'Jl. Diponegoro No. 88, Surabaya',
    nomor_telepon_wa: '0821-4567-8901',
    phone: '0821-4567-8901',
    email_pasien: 'rizky.pratama@example.com',
    email: 'rizky.pratama@example.com',
    gender: 'Laki-laki',
    age: 34,
    birth_date: '1992-02-12',
    blood_type: 'O+',
    address: 'Jl. Diponegoro No. 88, Surabaya',
    emergency_contact: 'Citra Kirana (Istri) - 0821-9876-1234',
    allergies: ['Amoksisilin'],
    medical_history: 'Pasca Tindakan Ortopedi Ligamen Lutut',
    account_status: 'AKTIF',
    tanggal_registrasi_akun: '12/02/2026',
    login_pertama_kali: '12 Februari 2026, 14:20 WIB',
    kunjungan_terakhir: '18 Agustus 2026',
    total_kunjungan: 5,
    created_at: '2026-02-12T14:20:00.000Z',
    updated_at: '2026-02-12T14:20:00.000Z'
  }
];

// Additional synthetic records to form exactly 35 patients: 29 AKTIF and 6 NONAKTIF
const additionalPatientsData: Array<{
  name: string;
  gender: 'Laki-laki' | 'Perempuan';
  age: number;
  year: number;
  month: number;
  day: number;
  status: 'AKTIF' | 'NONAKTIF';
  rm_num: string;
}> = [
  {
    name: 'Siti Aminah',
    gender: 'Perempuan',
    age: 29,
    year: 2024,
    month: 6,
    day: 14,
    status: 'AKTIF',
    rm_num: 'RM-2024-0102'
  },
  {
    name: 'Fajar Nugraha',
    gender: 'Laki-laki',
    age: 45,
    year: 2024,
    month: 7,
    day: 2,
    status: 'AKTIF',
    rm_num: 'RM-2024-0118'
  },
  {
    name: 'Putri Handayani',
    gender: 'Perempuan',
    age: 31,
    year: 2024,
    month: 8,
    day: 19,
    status: 'AKTIF',
    rm_num: 'RM-2024-0145'
  },
  {
    name: 'Eko Prasetyo',
    gender: 'Laki-laki',
    age: 38,
    year: 2024,
    month: 9,
    day: 10,
    status: 'NONAKTIF',
    rm_num: 'RM-2024-0167'
  },
  {
    name: 'Maya Anggraini',
    gender: 'Perempuan',
    age: 24,
    year: 2024,
    month: 10,
    day: 5,
    status: 'AKTIF',
    rm_num: 'RM-2024-0190'
  },
  {
    name: 'Hendra Wijaya',
    gender: 'Laki-laki',
    age: 53,
    year: 2024,
    month: 11,
    day: 12,
    status: 'AKTIF',
    rm_num: 'RM-2024-0210'
  },
  {
    name: 'Anisa Lestari',
    gender: 'Perempuan',
    age: 33,
    year: 2024,
    month: 12,
    day: 1,
    status: 'AKTIF',
    rm_num: 'RM-2024-0234'
  },
  {
    name: 'Dedi Kusuma',
    gender: 'Laki-laki',
    age: 48,
    year: 2025,
    month: 1,
    day: 15,
    status: 'AKTIF',
    rm_num: 'RM-2025-0044'
  },
  {
    name: 'Rina Marlina',
    gender: 'Perempuan',
    age: 28,
    year: 2025,
    month: 2,
    day: 8,
    status: 'NONAKTIF',
    rm_num: 'RM-2025-0062'
  },
  {
    name: 'Bayu Saputra',
    gender: 'Laki-laki',
    age: 30,
    year: 2025,
    month: 3,
    day: 20,
    status: 'AKTIF',
    rm_num: 'RM-2025-0088'
  },
  {
    name: 'Wulan Guritno',
    gender: 'Perempuan',
    age: 42,
    year: 2025,
    month: 4,
    day: 11,
    status: 'AKTIF',
    rm_num: 'RM-2025-0112'
  },
  {
    name: 'Agus Setiawan',
    gender: 'Laki-laki',
    age: 50,
    year: 2025,
    month: 5,
    day: 17,
    status: 'AKTIF',
    rm_num: 'RM-2025-0130'
  },
  {
    name: 'Nadia Safitri',
    gender: 'Perempuan',
    age: 26,
    year: 2025,
    month: 6,
    day: 23,
    status: 'AKTIF',
    rm_num: 'RM-2025-0155'
  },
  {
    name: 'Arif Wibowo',
    gender: 'Laki-laki',
    age: 39,
    year: 2025,
    month: 7,
    day: 9,
    status: 'NONAKTIF',
    rm_num: 'RM-2025-0176'
  },
  {
    name: 'Fitriani Hasan',
    gender: 'Perempuan',
    age: 35,
    year: 2025,
    month: 8,
    day: 14,
    status: 'AKTIF',
    rm_num: 'RM-2025-0198'
  },
  {
    name: 'Reza Rahardian',
    gender: 'Laki-laki',
    age: 37,
    year: 2025,
    month: 9,
    day: 28,
    status: 'AKTIF',
    rm_num: 'RM-2025-0220'
  },
  {
    name: 'Dian Sastro',
    gender: 'Perempuan',
    age: 40,
    year: 2025,
    month: 10,
    day: 16,
    status: 'AKTIF',
    rm_num: 'RM-2025-0245'
  },
  {
    name: 'Dimas Anggara',
    gender: 'Laki-laki',
    age: 32,
    year: 2025,
    month: 11,
    day: 4,
    status: 'AKTIF',
    rm_num: 'RM-2025-0270'
  },
  {
    name: 'Kartika Sari',
    gender: 'Perempuan',
    age: 44,
    year: 2025,
    month: 12,
    day: 19,
    status: 'NONAKTIF',
    rm_num: 'RM-2025-0294'
  },
  {
    name: 'Galih Ramadhan',
    gender: 'Laki-laki',
    age: 29,
    year: 2026,
    month: 1,
    day: 8,
    status: 'AKTIF',
    rm_num: 'RM-2026-0005'
  },
  {
    name: 'Ratna Galih',
    gender: 'Perempuan',
    age: 31,
    year: 2026,
    month: 1,
    day: 22,
    status: 'AKTIF',
    rm_num: 'RM-2026-0018'
  },
  {
    name: 'Taufik Hidayat',
    gender: 'Laki-laki',
    age: 43,
    year: 2026,
    month: 2,
    day: 3,
    status: 'AKTIF',
    rm_num: 'RM-2026-0025'
  },
  {
    name: 'Yulia Rachman',
    gender: 'Perempuan',
    age: 46,
    year: 2026,
    month: 2,
    day: 18,
    status: 'AKTIF',
    rm_num: 'RM-2026-0040'
  },
  {
    name: 'Bambang Soesatyo',
    gender: 'Laki-laki',
    age: 55,
    year: 2026,
    month: 2,
    day: 27,
    status: 'NONAKTIF',
    rm_num: 'RM-2026-0052'
  },
  {
    name: 'Indah Permatasari',
    gender: 'Perempuan',
    age: 25,
    year: 2026,
    month: 3,
    day: 5,
    status: 'AKTIF',
    rm_num: 'RM-2026-0068'
  },
  {
    name: 'Rio Dewanto',
    gender: 'Laki-laki',
    age: 36,
    year: 2026,
    month: 3,
    day: 14,
    status: 'AKTIF',
    rm_num: 'RM-2026-0080'
  },
  {
    name: 'Astri Nurdin',
    gender: 'Perempuan',
    age: 39,
    year: 2026,
    month: 3,
    day: 21,
    status: 'AKTIF',
    rm_num: 'RM-2026-0095'
  },
  {
    name: 'Irfan Hakim',
    gender: 'Laki-laki',
    age: 47,
    year: 2026,
    month: 3,
    day: 29,
    status: 'AKTIF',
    rm_num: 'RM-2026-0110'
  },
  {
    name: 'Chelsea Islan',
    gender: 'Perempuan',
    age: 28,
    year: 2026,
    month: 4,
    day: 3,
    status: 'AKTIF',
    rm_num: 'RM-2026-0125'
  },
  {
    name: 'Vino Bastian',
    gender: 'Laki-laki',
    age: 41,
    year: 2026,
    month: 4,
    day: 10,
    status: 'AKTIF',
    rm_num: 'RM-2026-0140'
  }
];

const avatarUrls = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80'
];

export const fakePatients = {
  records: [] as Patient[],

  initialize() {
    const list: Patient[] = [...initialSeedPatients];
    let currentId = 6;

    for (const item of additionalPatientsData) {
      const birthYear = 2026 - item.age;
      const dateIso = new Date(
        Date.UTC(item.year, item.month - 1, item.day, 9, 30, 0)
      ).toISOString();
      const birthIso = `${birthYear}-${String(item.month).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`;
      const birthDateFormatted = `${String(item.day).padStart(2, '0')}/${String(item.month).padStart(2, '0')}/${birthYear}`;
      const avatar = avatarUrls[(currentId - 6) % avatarUrls.length];
      const regDateFormatted = `${String(item.day).padStart(2, '0')}/${String(item.month).padStart(2, '0')}/${item.year}`;

      list.push({
        id: currentId,
        patient_id: item.rm_num,
        name: item.name,
        avatar,
        nik: `3201${String(item.age)}${String(item.year).slice(2)}${String(currentId).padStart(6, '0')}`,
        nik_ktp: `3201${String(item.age)}${String(item.year).slice(2)}${String(currentId).padStart(6, '0')}`,
        nama_ibu_kandung: item.gender === 'Laki-laki' ? 'Siti Rahma' : 'Maryam',
        tempat_lahir: 'Jakarta',
        tanggal_lahir: birthDateFormatted,
        pekerjaan: 'Wiraswasta',
        domisili: `Jl. Kesehatan No. ${currentId * 2}, Jakarta`,
        nomor_telepon_wa: `0812-${String(1000 + currentId)}-${String(4000 + currentId * 3)}`,
        email_pasien: `${item.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: `0812-${String(1000 + currentId)}-${String(4000 + currentId * 3)}`,
        email: `${item.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        gender: item.gender,
        age: item.age,
        birth_date: birthIso,
        blood_type:
          item.age % 4 === 0 ? 'O+' : item.age % 4 === 1 ? 'A+' : item.age % 4 === 2 ? 'B+' : 'AB+',
        address: `Jl. Kesehatan No. ${currentId * 2}, Jakarta`,
        emergency_contact: `Keluarga ${item.name} - 0819-${String(2000 + currentId)}-${String(5000 + currentId)}`,
        allergies:
          item.age % 5 === 0 ? ['Alergi Dingin'] : item.age % 7 === 0 ? ['Sulfa'] : ['Tidak ada'],
        medical_history:
          item.status === 'AKTIF' ? 'Pemeriksaan Rutin Berkala' : 'Rekam Medis Nonaktif Sementara',
        account_status: item.status,
        tanggal_registrasi_akun: regDateFormatted,
        login_pertama_kali: `${item.day} ${['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][item.month - 1]} ${item.year}, 08:30 WIB`,
        kunjungan_terakhir: '14 Agustus 2026',
        total_kunjungan: ((currentId * 3) % 15) + 1,
        created_at: dateIso,
        updated_at: dateIso
      });
      currentId++;
    }

    this.records = list;
  },

  async getSummary(): Promise<PatientSummary> {
    const total = this.records.length;
    const active = this.records.filter(
      (p) =>
        p.account_status.toUpperCase() === 'AKTIF' || p.account_status.toUpperCase() === 'ACTIVE'
    ).length;
    const inactive = this.records.filter(
      (p) =>
        p.account_status.toUpperCase() === 'NONAKTIF' ||
        p.account_status.toUpperCase() === 'INACTIVE'
    ).length;
    return { total, active, inactive };
  },

  async getAll({
    gender,
    account_status,
    search
  }: {
    gender?: string | string[];
    account_status?: string | string[];
    search?: string;
  }) {
    let patients = [...this.records];

    if (gender) {
      const genderArr = Array.isArray(gender) ? gender : [gender];
      if (genderArr.length > 0) {
        patients = patients.filter((p) =>
          genderArr.some((g) => g.toLowerCase() === p.gender.toLowerCase())
        );
      }
    }

    if (account_status) {
      const statusArr = Array.isArray(account_status) ? account_status : [account_status];
      if (statusArr.length > 0) {
        patients = patients.filter((p) =>
          statusArr.some((s) => s.toUpperCase() === p.account_status.toUpperCase())
        );
      }
    }

    if (search && search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      // First pass matchSorter with comprehensive keys
      const sorted = matchSorter(patients, q, {
        keys: [
          'name',
          'patient_id',
          'nik',
          'nik_ktp',
          'phone',
          'nomor_telepon_wa',
          'email',
          'email_pasien',
          'pekerjaan',
          'domisili',
          'address',
          'nama_ibu_kandung',
          'tempat_lahir',
          'gender',
          'blood_type',
          'medical_history',
          'emergency_contact'
        ],
        threshold: matchSorter.rankings.CONTAINS
      });

      if (sorted.length > 0) {
        patients = sorted;
      } else {
        // Fallback substring contains check
        patients = patients.filter((p) => {
          return (
            p.name.toLowerCase().includes(q) ||
            p.patient_id.toLowerCase().includes(q) ||
            p.nik.toLowerCase().includes(q) ||
            (p.nik_ktp && p.nik_ktp.toLowerCase().includes(q)) ||
            p.phone.toLowerCase().includes(q) ||
            (p.nomor_telepon_wa && p.nomor_telepon_wa.toLowerCase().includes(q)) ||
            p.email.toLowerCase().includes(q) ||
            (p.email_pasien && p.email_pasien.toLowerCase().includes(q)) ||
            (p.domisili && p.domisili.toLowerCase().includes(q)) ||
            p.address.toLowerCase().includes(q) ||
            (p.pekerjaan && p.pekerjaan.toLowerCase().includes(q)) ||
            (p.nama_ibu_kandung && p.nama_ibu_kandung.toLowerCase().includes(q)) ||
            (p.tempat_lahir && p.tempat_lahir.toLowerCase().includes(q))
          );
        });
      }
    }

    return patients;
  },

  async getPatients({
    page = 1,
    limit = 10,
    gender,
    status,
    search,
    sort
  }: {
    page?: number;
    limit?: number;
    gender?: string | string[];
    status?: string | string[];
    search?: string;
    sort?: string;
  }) {
    await delay(350);

    const allFiltered = await this.getAll({
      gender,
      account_status: status,
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

            if (id === 'patient' || id === 'name') {
              aVal = a.name;
              bVal = b.name;
            } else if (id === 'created_at' || id === 'dibuat_pada') {
              aVal = new Date(a.created_at).getTime();
              bVal = new Date(b.created_at).getTime();
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

    const totalPatients = allFiltered.length;
    const offset = (page - 1) * limit;
    const paginatedPatients = allFiltered.slice(offset, offset + limit);

    return {
      success: true,
      time: new Date().toISOString(),
      total_patients: totalPatients,
      offset,
      limit,
      patients: paginatedPatients,
      summary: await this.getSummary()
    };
  },

  async getPatientById(id: number) {
    await delay(300);
    const patient = this.records.find((p) => p.id === id);
    if (!patient) {
      return { success: false, message: `Patient with ID ${id} not found`, patient: null };
    }
    return { success: true, patient };
  },

  async createPatient(data: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) {
    await delay(500);
    const newId = this.records.length > 0 ? Math.max(...this.records.map((p) => p.id)) + 1 : 1;
    const nowIso = new Date().toISOString();
    const newPatient: Patient = {
      ...data,
      id: newId,
      created_at: nowIso,
      updated_at: nowIso
    };
    this.records.unshift(newPatient);
    return {
      success: true,
      message: 'Data pasien berhasil ditambahkan',
      patient: newPatient
    };
  },

  async updatePatient(id: number, data: Partial<Omit<Patient, 'id' | 'created_at'>>) {
    await delay(500);
    const index = this.records.findIndex((p) => p.id === id);
    if (index === -1) {
      return { success: false, message: `Pasien dengan ID ${id} tidak ditemukan` };
    }
    this.records[index] = {
      ...this.records[index],
      ...data,
      updated_at: new Date().toISOString()
    };
    return {
      success: true,
      message: 'Data pasien berhasil diperbarui',
      patient: this.records[index]
    };
  },

  async deletePatient(id: number) {
    await delay(400);
    const index = this.records.findIndex((p) => p.id === id);
    if (index === -1) {
      return { success: false, message: `Pasien dengan ID ${id} tidak ditemukan` };
    }
    this.records.splice(index, 1);
    return {
      success: true,
      message: 'Data pasien berhasil dihapus'
    };
  }
};

fakePatients.initialize();
