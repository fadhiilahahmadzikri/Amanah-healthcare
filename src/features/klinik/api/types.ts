export type AppointmentStatus =
  | 'CONFIRMED'
  | 'PENDING'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'Sudah Buat Janji'
  | 'Menunggu'
  | 'Sedang Diperiksa'
  | 'Selesai'
  | 'Batal'
  | 'Tidak Hadir'
  | string;

export interface Doctor {
  name: string;
  spec: string;
  specialty?: string;
  avatar: string;
  location: string;
  rating: string;
  tags: string[];
  schedule: string;
}

export interface Appointment {
  id: string;
  booking_code: string;
  patient_name: string;
  patient_email: string;
  patient_avatar: string;
  doctor_name: string;
  doctor_specialty?: string;
  poliklinik_name?: string;
  room_name?: string;
  room_location?: string;
  scheduled_start_time?: string;
  scheduled_end_time?: string;
  date: string;
  time: string;
  /** Canonical session shift from backend: DINI_HARI | PAGI | SIANG | MALAM */
  session?: string;
  complaint: string;
  status: AppointmentStatus;
  visit_type?: string;
  service?: string;
  queue_number?: string;
  doctor_id?: string;
  staff_id?: string;
  poliklinik_id?: string;
  layanan_id?: string;
  medical_flow?: MedicalAppointmentFlow;
  medical_intake?: MedicalIntakeRecord;
  created_at: string;
  updated_at?: string;
}

export type QueueStatus =
  | 'SELESAI'
  | 'DIPANGGIL'
  | 'MENUNGGU'
  | 'SEDANG_DIPERIKSA'
  | 'BATAL'
  | 'NO_SHOW'
  | string;

export interface QueueItem {
  id: string;
  queue_number: string;
  appointment_id?: string;
  patient_name: string;
  patient_avatar?: string;
  doctor_name: string;
  poli?: string;
  estimated_time?: string;
  status: QueueStatus;
  is_user?: boolean;
  called_time?: string;
  waiting_count?: number;
  room?: string;
  call_count?: number;
  called_at?: string | null;
  created_at?: string;
  service?: string;
}

export interface AppointmentFormData {
  visitType: 'Pemeriksaan Baru' | 'Kontrol Ulang' | string;
  service: string;
  doctor: string;
  dateStr: string;
  timeSlot: string;
  complaint: string;
  patientName?: string;
  patientEmail?: string;
  patientAvatar?: string;
  medicalFlow?: MedicalAppointmentFlow;
  medicalIntake?: MedicalIntakeRecord;
}

export type MedicalAppointmentFlow = 'pregnancy' | 'immunization';

export interface MedicalIntakeRecord {
  flow: MedicalAppointmentFlow;
  schemaTitle: string;
  submittedAt: string;
  answersByFieldId: Record<string, string>;
  automatic: Record<string, string>;
}

export interface RegionItem {
  id: string;
  name: string;
}

export type MainViewType = 'janji-temu' | 'cek-antrean';
