import type { StaffAttendance, AttendanceMetrics, QRPresenceConfig } from '../api/types';

export const INITIAL_STAFF_ATTENDANCE: StaffAttendance[] = [
  {
    id: 'att-01',
    id_staf: 'STF-001',
    nama_staf: 'Sarah Wijayati',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    kategori: 'Staf',
    tanggal_presensi: '23 Agustus 2026',
    waktu_presensi: 'Selasa, 23 Agustus 2026',
    waktu: '08:00 WIB',
    status: 'Hadir',
    shift: 'Pagi'
  },
  {
    id: 'att-02',
    id_staf: 'STF-002',
    nama_staf: 'Siska Rahmawati',
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
    kategori: 'Staf',
    tanggal_presensi: '23 Agustus 2026',
    waktu_presensi: 'Selasa, 23 Agustus 2026',
    waktu: '08:02 WIB',
    status: 'Hadir',
    shift: 'Pagi'
  },
  {
    id: 'att-03',
    id_staf: 'DOC-001',
    nama_staf: 'dr. Fenti, Sp.D',
    avatar:
      'https://images.unsplash.com/photo-1594824813620-4a0b2241cf13?auto=format&fit=crop&q=80&w=150',
    kategori: 'Dokter',
    tanggal_presensi: '23 Agustus 2026',
    waktu_presensi: 'Selasa, 23 Agustus 2026',
    waktu: '-',
    status: 'Tidak Hadir',
    shift: 'Pagi'
  },
  {
    id: 'att-05',
    id_staf: 'STF-003',
    nama_staf: 'Rina Marlina',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    kategori: 'Staf',
    tanggal_presensi: '23 Agustus 2026',
    waktu_presensi: 'Selasa, 23 Agustus 2026',
    waktu: '08:05 WIB',
    status: 'Hadir',
    shift: 'Pagi'
  },
  {
    id: 'att-06',
    id_staf: 'STF-004',
    nama_staf: 'Andi Setiawan',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    kategori: 'Staf',
    tanggal_presensi: '23 Agustus 2026',
    waktu_presensi: 'Selasa, 23 Agustus 2026',
    waktu: '08:07 WIB',
    status: 'Hadir',
    shift: 'Pagi'
  },
  {
    id: 'att-07',
    id_staf: 'STF-005',
    nama_staf: 'Dewi Lestari',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    kategori: 'Staf',
    tanggal_presensi: '23 Agustus 2026',
    waktu_presensi: 'Selasa, 23 Agustus 2026',
    waktu: '08:10 WIB',
    status: 'Hadir',
    shift: 'Pagi'
  },
  {
    id: 'att-08',
    id_staf: 'STF-006',
    nama_staf: 'Fajar Nugroho',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    kategori: 'Staf',
    tanggal_presensi: '23 Agustus 2026',
    waktu_presensi: 'Selasa, 23 Agustus 2026',
    waktu: '-',
    status: 'Tidak Hadir',
    shift: 'Pagi'
  },
  {
    id: 'att-09',
    id_staf: 'STF-007',
    nama_staf: 'Budi Santoso',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    kategori: 'Staf',
    tanggal_presensi: '23 Agustus 2026',
    waktu_presensi: 'Selasa, 23 Agustus 2026',
    waktu: '08:12 WIB',
    status: 'Hadir',
    shift: 'Pagi'
  },
  {
    id: 'att-10',
    id_staf: 'DOC-003',
    nama_staf: 'dr. Hendra, Sp.A',
    avatar:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150',
    kategori: 'Dokter',
    tanggal_presensi: '23 Agustus 2026',
    waktu_presensi: 'Selasa, 23 Agustus 2026',
    waktu: '08:15 WIB',
    status: 'Hadir',
    shift: 'Pagi'
  }
];

export const ATTENDANCE_METRICS_DATA: AttendanceMetrics = {
  total_staf: 10,
  staf_hadir: 8,
  staf_tidak_hadir: 2,
  tingkat_kehadiran: 80,
  perubahan_total_staf: 25,
  perubahan_staf_hadir: 14.3,
  perubahan_staf_tidak_hadir: -33.3,
  perubahan_tingkat_kehadiran: 14.3,
  sparkline_total_staf: [
    { label: 'Sen', value: 8 },
    { label: 'Sel', value: 8 },
    { label: 'Rab', value: 9 },
    { label: 'Kam', value: 8 },
    { label: 'Jum', value: 10 },
    { label: 'Sab', value: 9 },
    { label: 'Min', value: 10 }
  ],
  sparkline_staf_hadir: [
    { label: 'Sen', value: 6 },
    { label: 'Sel', value: 7 },
    { label: 'Rab', value: 7 },
    { label: 'Kam', value: 8 },
    { label: 'Jum', value: 7 },
    { label: 'Sab', value: 8 },
    { label: 'Min', value: 8 }
  ],
  sparkline_staf_tidak_hadir: [
    { label: 'Sen', value: 2 },
    { label: 'Sel', value: 1 },
    { label: 'Rab', value: 2 },
    { label: 'Kam', value: 3 },
    { label: 'Jum', value: 3 },
    { label: 'Sab', value: 1 },
    { label: 'Min', value: 2 }
  ],
  sparkline_tingkat_kehadiran: [
    { label: 'Sen', value: 75 },
    { label: 'Sel', value: 87.5 },
    { label: 'Rab', value: 77.8 },
    { label: 'Kam', value: 70 },
    { label: 'Jum', value: 70 },
    { label: 'Sab', value: 88.9 },
    { label: 'Min', value: 80 }
  ]
};

export const INITIAL_QR_CONFIG: QRPresenceConfig = {
  status_presensi: 'Aktif hingga 16:00 WIB',
  qr_code_identifier: 'K54TYU',
  qr_context: 'Shift Pagi',
  qr_validity: 'QR Code akan berubah setiap pergantian shift',
  rotation_seconds: 30
};
