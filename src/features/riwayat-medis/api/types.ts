export interface MedicalRecordPatient {
  id: string;
  fullName: string;
  medicalRecordNumber: string | null;
  nik: string | null;
  gender: 'male' | 'female' | string | null;
  birthDate: string | null;
  phone: string | null;
}

export interface MedicalRecordPractitioner {
  id: string;
  fullName: string;
  profession: string | null;
  staffCode: string | null;
  sipNumber: string | null;
}

export interface MedicalRecordService {
  id: string;
  name: string;
  serviceCode: string | null;
}

export interface MedicalRecordEntity {
  id: string;
  kunjunganId: string | null;
  patientId: string;
  staffId: string | null;
  serviceId: string | null;
  sourceIntakeId: string | null;
  encounterDate: string;
  status: string;
  subjective: string | null;
  objectiveNotes: string | null;
  vitalSigns: Record<string, unknown> | null;
  diagnosis: string | null;
  diagnosisIcd10Code: string | null;
  diagnosisIcd10Name: string | null;
  tindakan: string | null;
  resepObat: string | null;
  prescriptions: unknown[] | null;
  catatanMedis: string | null;
  flowType: string;
  motherNik: string | null;
  partnerNik: string | null;
  childNik: string | null;
  formData: Record<string, unknown>;
  computedData: Record<string, unknown>;
  patient: MedicalRecordPatient | null;
  practitioner: MedicalRecordPractitioner | null;
  service: MedicalRecordService | null;
  createdAt: string;
  updatedAt: string;
  version: string;
}

export interface MedicalRecordFilterOptions {
  page?: number;
  limit?: number;
  search?: string | null;
  patientId?: string | null;
  practitionerId?: string | null;
  serviceId?: string | null;
  status?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  cursor?: string | null;
}

export interface MedicalRecordListResponse {
  data: MedicalRecordEntity[];
  total: number;
  page: number;
  limit: number;
  meta: {
    nextCursor: string | null;
    hasNextPage: boolean;
    limit: number;
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface HistoricalPatientAppointment {
  id: string;
  bookingCode: string;
  status: string;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  estimatedDurationMinutes: number;
  poliklinikName: string;
  doctorName: string | null;
  complaint: string;
  callAttemptsCount: number;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  updatedAt: string;
  hasAssociatedForm: boolean;
  associatedFormType: 'maternal' | 'immunization' | 'general' | null;
}

export interface PatientAppointmentHistoryResponse {
  data: HistoricalPatientAppointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
