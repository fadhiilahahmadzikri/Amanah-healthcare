export type LiveStatus =
  | 'SUDAH BUAT JANJI'
  | 'SUDAH DATANG'
  | 'MENUNGGU'
  | 'SEDANG PERIKSA'
  | 'SELESAI'
  | 'TIDAK ADA DOKTER';

export interface AdminAppointment {
  id: number | string;
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
  id: number | string;
  status: LiveStatus;
};

export interface BackendAppointmentRecord {
  id: string | number;
  status?: string;
  patientName?: string;
  patientProfile?: { fullName?: string };
  doctorName?: string;
  practitioner?: { staffProfile?: { fullName?: string } };
  poliklinikName?: string;
  clinicRoom?: { clinicUnit?: { name?: string } };
  queueNumber?: string;
  queueTickets?: Array<{ queueNumber?: string }>;
  appointmentDate?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  scheduledStartTime?: string;
  session?: string;
  patientId?: string;
  visitType?: string;
  gender?: string;
  phone?: string;
  email?: string;
  complaint?: string;
  [key: string]: unknown;
}

export interface DoctorCandidateItem {
  id: string;
  name: string;
  specialty: string;
  staffType: string;
  availability: 'AVAILABLE' | 'SCHEDULE_REQUIRED';
  existingSessionId: string | null;
  defaultRoomName: string | null;
}

export interface DoctorCandidateGroup {
  id: string;
  name: string;
  doctors: DoctorCandidateItem[];
}

export interface DoctorCandidatesResult {
  appointmentId: string;
  currentDoctorId: string | null;
  scheduledDate: string;
  scheduledTime: string;
  groups: DoctorCandidateGroup[];
}

export interface RoomCandidateItem {
  id: string;
  name: string;
  code?: string | null;
  location?: string | null;
  isAvailable: boolean;
  occupantDetails?: {
    practitionerId?: string;
    doctorName?: string;
    bookingCode?: string;
    startTime?: string;
  } | null;
}

export interface ChangeDoctorPayload {
  appointmentId: string;
  doctorId: string;
  closeOldSchedule?: boolean;
  reason?: string;
}


export interface ChangeRoomPayload {
  appointmentId: string;
  roomId: string;
}
