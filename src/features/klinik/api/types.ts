export type AppointmentStatus = 'CONFIRMED' | 'PENDING' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';

export interface Doctor {
  name: string;
  spec: string;
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
  date: string;
  time: string;
  complaint: string;
  status: AppointmentStatus;
  visit_type?: string;
  service?: string;
  created_at: string;
  updated_at: string;
}

export type QueueStatus = 'SELESAI' | 'DIPANGGIL' | 'MENUNGGU';

export interface QueueItem {
  queue_number: string;
  patient_name: string;
  patient_avatar: string;
  doctor_name: string;
  poli: string;
  estimated_time: string;
  status: QueueStatus;
  is_user: boolean;
  called_time?: string;
  waiting_count?: number;
  room?: string;
}

export interface AppointmentFormData {
  visitType: 'Pemeriksaan Baru' | 'Kontrol Ulang' | string;
  service: string;
  doctor: string;
  dateStr: string;
  timeSlot: string;
  complaint: string;
}

export interface RegionItem {
  id: string;
  name: string;
}

export type MainViewType = 'janji-temu' | 'cek-antrean';
