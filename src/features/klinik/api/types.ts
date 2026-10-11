import {
  APPOINTMENT_STATUS,
  type CanonicalAppointmentStatus
} from '@/constants/appointment-status.constants';

export { APPOINTMENT_STATUS };
export type AppointmentStatus = CanonicalAppointmentStatus;

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
  doctor_name?: string | null;
  doctor_specialty?: string;
  poliklinik_name?: string;
  room_name?: string;
  room_location?: string;
  scheduled_start_time?: string;
  scheduled_end_time?: string;
  checked_in_at?: string | null;
  checkedInAt?: string | null;
  actual_started_at?: string;
  actual_completed_at?: string;
  consultation_elapsed_seconds?: number | null;
  consultation_duration_formatted?: string | null;
  estimated_duration_minutes?: number;
  date: string;
  time: string;
  patient_id?: string;
  patient_phone?: string;
  session?: string;
  session_name?: string | null;
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
  eta_range?: string | null;
  ahead_count?: number | null;
  allowedActions?: string[];
  created_at: string;
  updated_at?: string;
}

export const QUEUE_STATUS = {
  WAITING: 'WAITING',
  CALLED: 'CALLED',
  IN_SERVICE: 'IN_SERVICE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW'
} as const;

export type QueueStatus = (typeof QUEUE_STATUS)[keyof typeof QUEUE_STATUS] | string;

export const QUEUE_STATUS_LABELS: Readonly<Record<string, string>> = {
  [QUEUE_STATUS.WAITING]: 'Menunggu',
  [QUEUE_STATUS.CALLED]: 'Dipanggil',
  [QUEUE_STATUS.IN_SERVICE]: 'Sedang Diperiksa',
  [QUEUE_STATUS.COMPLETED]: 'Selesai',
  [QUEUE_STATUS.CANCELLED]: 'Batal',
  [QUEUE_STATUS.NO_SHOW]: 'Tidak Hadir'
};

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
  actual_started_at?: string | null;
  actual_completed_at?: string | null;
  consultation_elapsed_seconds?: number | null;
  consultation_duration_formatted?: string | null;
  estimated_duration_minutes?: number;
  created_at?: string;
  service?: string;
}

export interface AppointmentFormData {
  visitType: 'Pemeriksaan Baru' | 'Kontrol Ulang' | string;
  service: string;
  doctor: string;
  dateStr: string;
  session: string;
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
