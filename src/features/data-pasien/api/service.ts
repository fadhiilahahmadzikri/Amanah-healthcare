import { clientFetch } from '@/lib/client-fetch';
import type {
  Patient,
  PatientAccountStatus,
  PatientDetailResponse,
  PatientFilters,
  PatientMutationPayload,
  PatientsResponse,
  PatientSummary,
  PatientTimelineItem
} from './types';

export interface BackendPatientRecord {
  id: string;
  medicalRecordNumber: string;
  fullName: string;
  avatarUrl?: string;
  maskedNik?: string;
  nik?: string;
  motherName?: string | null;
  birthPlace?: string | null;
  occupation?: string | null;
  phone?: string | null;
  email?: string | null;
  gender: Patient['gender'];
  age?: number | string | null;
  birthDate?: string | null;
  bloodType?: string | null;
  fullAddress?: string | null;
  line1?: string | null;
  provinceName?: string | null;
  provinceCode?: string | null;
  regencyName?: string | null;
  regencyCode?: string | null;
  districtName?: string | null;
  districtCode?: string | null;
  villageName?: string | null;
  villageCode?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelationship?: string | null;
  allergies?: string[];
  medicalHistory?: string | null;
  status?: string;
  registeredAt?: string | null;
  firstLoginAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  isMaster?: boolean;
  hasOwnAccount?: boolean;
  affiliateCount?: number;
  relationshipType?: string | null;
  relationLabel?: string | null;
  masterPatientId?: string | null;
  masterPatientName?: string | null;
  affiliates?: BackendPatientRecord[];
  totalAppointments?: number;
  completedVisits?: number;
  missedAppointments?: number;
  cancelledAppointments?: number;
  lastVisitDate?: string | null;
}

export function mapBackendPatient(r: BackendPatientRecord): Patient {
  const rawAffiliates = Array.isArray(r.affiliates) ? r.affiliates : [];
  const mappedAffiliates = rawAffiliates.map(mapBackendPatient);

  const phone = r.phone ?? '';
  const email = r.email ?? '';
  const fullAddress = r.fullAddress ?? '';
  const motherName = r.motherName ?? '';
  const occupation = r.occupation ?? '';
  const birthPlace = r.birthPlace ?? '';
  const birthDate = r.birthDate ?? '';

  return {
    id: r.id,
    patient_id: r.medicalRecordNumber,
    name: r.fullName,
    avatarUrl: r.avatarUrl,
    masked_nik: r.maskedNik || '****************',
    nik: r.nik,
    mother_name: motherName,
    birth_place: birthPlace,
    occupation,
    phone,
    email,
    gender: r.gender,
    age: Number(r.age ?? 0),
    birth_date: birthDate,
    blood_type: r.bloodType ?? '',
    address: fullAddress,
    line1: r.line1 ?? null,
    province_name: r.provinceName ?? null,
    province_code: r.provinceCode ?? null,
    regency_name: r.regencyName ?? null,
    regency_code: r.regencyCode ?? null,
    district_name: r.districtName ?? null,
    district_code: r.districtCode ?? null,
    village_name: r.villageName ?? null,
    village_code: r.villageCode ?? null,
    emergency_contact: r.emergencyContactPhone
      ? `${r.emergencyContactName || ''} (${r.emergencyContactPhone})`
      : '',
    emergencyContactName: r.emergencyContactName ?? null,
    emergencyContactPhone: r.emergencyContactPhone ?? null,
    emergencyContactRelationship: r.emergencyContactRelationship ?? null,
    allergies: Array.isArray(r.allergies) ? r.allergies : [],
    medical_history: r.medicalHistory || '',
    status: (r.status === 'inactive' ? 'inactive' : 'active') as PatientAccountStatus,
    registered_at: r.registeredAt,
    first_login_at: r.firstLoginAt,

    // Affiliation Paradigm Fields
    is_master: r.isMaster ?? true,
    has_own_account: r.hasOwnAccount ?? false,
    affiliate_count: Number(r.affiliateCount ?? mappedAffiliates.length),
    relationship_type: r.relationshipType ?? null,
    relation_label: r.relationLabel ?? null,
    master_patient_id: r.masterPatientId ?? null,
    master_patient_name: r.masterPatientName ?? null,
    affiliates: mappedAffiliates.length > 0 ? mappedAffiliates : undefined,

    total_appointments: Number(r.totalAppointments ?? 0),
    completed_visits: Number(r.completedVisits ?? 0),
    missed_appointments: Number(r.missedAppointments ?? 0),
    cancelled_appointments: Number(r.cancelledAppointments ?? 0),
    last_visit_date: r.lastVisitDate ?? null,
    created_at: r.registeredAt ?? undefined,
    updated_at: r.updatedAt ?? undefined
  };
}

export async function getPatients(
  filters: PatientFilters,
  signal?: AbortSignal
): Promise<PatientsResponse> {
  const limit = filters.limit ?? 10;
  const page = filters.page ?? 1;

  const queryParams: Record<string, unknown> = {
    page,
    limit
  };

  if (filters.search && filters.search.trim()) {
    queryParams.search = filters.search.trim();
  }

  if (filters.gender) {
    const rawGender = Array.isArray(filters.gender) ? filters.gender[0] : filters.gender;
    if (rawGender) {
      queryParams.gender = rawGender;
    }
  }

  if (filters.status) {
    const rawStatus = Array.isArray(filters.status) ? filters.status[0] : filters.status;
    if (rawStatus === 'active' || rawStatus === 'inactive') {
      queryParams.status = rawStatus;
    }
  }

  if (filters.bloodType) {
    const rawBlood = Array.isArray(filters.bloodType) ? filters.bloodType[0] : filters.bloodType;
    if (rawBlood && rawBlood !== 'all') {
      queryParams.bloodType = rawBlood;
    }
  }

  if (filters.profileType) {
    const rawProfile = Array.isArray(filters.profileType)
      ? filters.profileType[0]
      : filters.profileType;
    if (rawProfile && rawProfile !== 'all') {
      queryParams.profileType = rawProfile;
    }
  }

  if (filters.sort) {
    queryParams.sort = filters.sort;
  }

  const response = await clientFetch<{
    data: BackendPatientRecord[];
    meta: { total: number; page: number; limit: number; totalPages: number };
    summary: {
      totalPatients: number;
      totalAppointments: number;
      totalCompletedVisits: number;
      totalMissedOrCancelled: number;
    };
  }>('/api/v1/patients/directory', {
    query: queryParams,
    signal
  });

  const rawList = Array.isArray(response?.data) ? response.data : [];
  const patients = rawList.map(mapBackendPatient);

  const summary: PatientSummary = {
    total: response?.meta?.total ?? patients.length,
    active: response?.summary?.totalPatients ?? patients.length,
    inactive: 0,
    total_appointments: response?.summary?.totalAppointments ?? 0,
    completed_visits: response?.summary?.totalCompletedVisits ?? 0,
    missed_or_cancelled: response?.summary?.totalMissedOrCancelled ?? 0
  };

  return {
    success: true,
    time: new Date().toISOString(),
    total_patients: response?.meta?.total ?? patients.length,
    offset: (page - 1) * limit,
    limit,
    patients,
    summary
  };
}

export async function getPatientSummary(): Promise<PatientSummary> {
  const res = await getPatients({ limit: 1 });
  return res.summary;
}

export async function getPatientById(id: string): Promise<PatientDetailResponse> {
  try {
    const record = await clientFetch<BackendPatientRecord>(`/api/v1/patients/${id}`);
    if (!record) {
      return {
        success: false,
        patient: null,
        message: `Pasien dengan ID ${id} tidak ditemukan`
      };
    }
    return {
      success: true,
      patient: mapBackendPatient(record)
    };
  } catch (error: unknown) {
    return {
      success: false,
      patient: null,
      message: error instanceof Error ? error.message : `Gagal mengambil data pasien`
    };
  }
}

export async function getPatientHistory(
  patientId: string
): Promise<{ data: PatientTimelineItem[]; total: number }> {
  const response = await clientFetch<{
    data: Array<{
      id: string;
      bookingCode: string;
      status: string;
      scheduledDate: string;
      scheduledStartTime: string;
      scheduledEndTime?: string | null;
      poliklinikName?: string | null;
      doctorName?: string | null;
      complaint?: string | null;
      completedAt?: string | null;
      cancelledAt?: string | null;
      cancelReason?: string | null;
      hasAssociatedForm?: boolean;
      associatedFormType?: 'maternal' | 'immunization' | 'general' | null;
    }>;
    total: number;
    page: number;
    limit: number;
  }>(`/api/v1/appointments/history/patient/${patientId}`);

  const rawList = Array.isArray(response?.data) ? response.data : [];
  const data: PatientTimelineItem[] = rawList.map((item) => ({
    id: item.id,
    booking_code: item.bookingCode,
    status: item.status,
    scheduled_date: item.scheduledDate,
    scheduled_start_time: item.scheduledStartTime,
    scheduled_end_time: item.scheduledEndTime,
    poliklinik_name: item.poliklinikName,
    doctor_name: item.doctorName,
    complaint: item.complaint,
    completed_at: item.completedAt,
    cancelled_at: item.cancelledAt,
    cancel_reason: item.cancelReason,
    has_associated_form: Boolean(item.hasAssociatedForm),
    associated_form_type: item.associatedFormType ?? null
  }));

  return {
    data,
    total: response?.total ?? data.length
  };
}

export async function createPatient(data: PatientMutationPayload) {
  const line1 = data.line1 ?? '';
  const payload: Record<string, unknown> = {
    fullName: data.name,
    nik: data.nik,
    gender: data.gender,
    birthDate: data.birth_date,
    birthPlace: data.birth_place ?? '',
    bloodType: data.blood_type,
    motherName: data.mother_name ?? '',
    occupation: data.occupation ?? '',
    phone: data.phone ?? '',
    line1,
    provinceName: data.province_name,
    provinceCode: data.province_code,
    regencyName: data.regency_name,
    regencyCode: data.regency_code,
    districtName: data.district_name,
    districtCode: data.district_code,
    villageName: data.village_name,
    villageCode: data.village_code,
    medicalHistory: data.medical_history ?? ''
  };

  const record = await clientFetch<BackendPatientRecord>('/api/v1/patients', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return {
    success: true,
    message: 'Data pasien berhasil ditambahkan',
    patient: mapBackendPatient(record)
  };
}

export async function updatePatient(id: string, data: Partial<PatientMutationPayload>) {
  const payload: Record<string, unknown> = {};

  if (data.medical_record_number !== undefined && data.medical_record_number.trim() !== '') {
    payload.medicalRecordNumber = data.medical_record_number.trim();
  } else if (data.medicalRecordNumber !== undefined && data.medicalRecordNumber.trim() !== '') {
    payload.medicalRecordNumber = data.medicalRecordNumber.trim();
  }
  if (data.name !== undefined) payload.fullName = data.name;
  if (data.nik !== undefined && data.nik.trim() !== '') {
    payload.nik = data.nik.trim();
  }
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.email !== undefined) payload.email = data.email ? data.email.trim() : null;
  if (data.emergency_contact !== undefined && data.emergency_contact.trim() !== '') {
    payload.emergencyContactPhone = data.emergency_contact.trim();
  }
  if (data.emergencyContactName !== undefined) {
    payload.emergencyContactName = data.emergencyContactName
      ? data.emergencyContactName.trim()
      : null;
  }
  if (data.emergencyContactPhone !== undefined) {
    payload.emergencyContactPhone = data.emergencyContactPhone
      ? data.emergencyContactPhone.trim()
      : null;
  }
  if (data.emergencyContactRelationship !== undefined) {
    payload.emergencyContactRelationship = data.emergencyContactRelationship
      ? data.emergencyContactRelationship.trim()
      : null;
  }
  if (data.line1 !== undefined) payload.line1 = data.line1;
  if (data.occupation !== undefined) payload.occupation = data.occupation;
  if (data.mother_name !== undefined) payload.motherName = data.mother_name;
  if (data.birth_place !== undefined) payload.birthPlace = data.birth_place;
  if (data.birth_date !== undefined) payload.birthDate = data.birth_date;
  if (data.gender !== undefined) payload.gender = data.gender;
  if (data.blood_type !== undefined) payload.bloodType = data.blood_type;
  if (data.province_name !== undefined) payload.provinceName = data.province_name;
  if (data.province_code !== undefined) payload.provinceCode = data.province_code;
  if (data.regency_name !== undefined) payload.regencyName = data.regency_name;
  if (data.regency_code !== undefined) payload.regencyCode = data.regency_code;
  if (data.district_name !== undefined) payload.districtName = data.district_name;
  if (data.district_code !== undefined) payload.districtCode = data.district_code;
  if (data.village_name !== undefined) payload.villageName = data.village_name;
  if (data.village_code !== undefined) payload.villageCode = data.village_code;
  if (data.status !== undefined) {
    payload.status = data.status === 'inactive' ? 'inactive' : 'active';
  }

  const updatedRecord = await clientFetch<BackendPatientRecord>(`/api/v1/patients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });

  return {
    success: true,
    message: 'Data pasien berhasil diperbarui',
    patient: mapBackendPatient(updatedRecord)
  };
}

export async function deletePatient(id: string) {
  await clientFetch<void>(`/api/v1/patients/${id}`, {
    method: 'DELETE'
  });

  return {
    success: true,
    message: 'Data pasien berhasil dinonaktifkan'
  };
}

export async function bulkDeletePatients(ids: string[]) {
  const res = await clientFetch<{ count: number }>('/api/v1/patients/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids })
  });

  return {
    success: true,
    count: res.count,
    message: `${res.count} pasien berhasil dinonaktifkan`
  };
}
