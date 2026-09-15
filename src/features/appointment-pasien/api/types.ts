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

export interface AdminAppointment {
  id: number;
  no_antrian: string;
  nomor_antrian: string;
  pasien: string;
  nama_pasien: string;
  nama_lengkap: string;
  id_pasien: string;
  avatar: string;
  tanggal_booking: string;
  tanggal_reservasi: string;
  jam_booking: string;
  jam_slot_booking: string;
  dokter: string;
  dokter_tujuan: string;
  layanan_poli: string;
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
}

export interface AppointmentSummary {
  total: number;
  sudah_datang: number;
  sudah_buat_janji: number;
  menunggu: number;
  sedang_periksa: number;
  selesai: number;
  tidak_ada_dokter: number;
}

export type AppointmentFilters = {
  page?: number;
  limit?: number;
  status?: string | string[];
  poli?: string | string[];
  search?: string;
  sort?: string;
};

export type AppointmentResponse = {
  success: boolean;
  time: string;
  total_appointments: number;
  offset: number;
  limit: number;
  appointments: AdminAppointment[];
  summary: AppointmentSummary;
};

export type AppointmentDetailResponse = {
  success: boolean;
  appointment: AdminAppointment | null;
  message?: string;
};

export type UpdateStatusPayload = {
  id: number;
  status: LiveStatus;
};
