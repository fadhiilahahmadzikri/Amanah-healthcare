import { clientFetch } from '@/lib/client-fetch';
import { normalizeGender } from '@/constants/gender.constants';
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

export function mapBackendPatient(r: any): Patient {
  const rawAffiliates = Array.isArray(r.affiliates) ? r.affiliates : [];
  const mappedAffiliates = rawAffiliates.map(mapBackendPatient);

  return {
    id: r.id,
    patient_id: r.medicalRecordNumber || r.medical_record_number || r.patient_id,
    name: r.fullName || r.full_name || r.name,
    masked_nik:
      r.maskedNik ||
      r.masked_nik ||
      (r.nik ? `${r.nik.slice(0, 4)}********${r.nik.slice(-4)}` : '****************'),
    nik: r.nik || r.nationalIdHash || r.nationalIdEncrypted,
    nik_ktp: r.nik || r.nationalIdHash || r.nationalIdEncrypted,
    nama_ibu_kandung: r.motherName || r.namaIbuKandung || r.nama_ibu_kandung,
    tempat_lahir: r.birthPlace || r.birth_place || r.tempat_lahir,
    tanggal_lahir: r.birthDate || r.birth_date || r.tanggal_lahir,
    pekerjaan: r.occupation || r.pekerjaan,
    domisili: r.fullAddress || r.address || r.domisili,
    nomor_telepon_wa: r.phoneNumber || r.phone || r.nomor_telepon_wa,
    email_pasien: r.email || r.email_pasien,
    phone: r.phoneNumber || r.phone || '',
    email: r.email || r.email_pasien || '',
    gender: (normalizeGender(r.gender) ?? 'male') as any,
    age: Number(r.age ?? 0),
    birth_date: r.birthDate || r.birth_date,
    blood_type: (r.bloodType || r.blood_type || 'unknown') as any,
    address: r.fullAddress || r.address || '',
    provinsi: r.provinsi || r.addressDetail?.provinceName || null,
    provinsi_id: r.provinsiId || r.addressDetail?.provinceCode || null,
    kabupaten: r.kabupaten || r.addressDetail?.regencyName || null,
    kabupaten_id: r.kabupatenId || r.addressDetail?.regencyCode || null,
    kecamatan: r.kecamatan || r.addressDetail?.districtName || null,
    kecamatan_id: r.kecamatanId || r.addressDetail?.districtCode || null,
    kelurahan: r.kelurahan || r.addressDetail?.villageName || null,
    kelurahan_id: r.kelurahanId || r.addressDetail?.villageCode || null,
    alamat_detail: r.alamatDetail || r.addressDetail?.line1 || null,
    emergency_contact: r.emergencyContactPhone
      ? `${r.emergencyContactName || ''} (${r.emergencyContactPhone})`
      : r.emergency_contact || '',
    allergies: Array.isArray(r.allergies) ? r.allergies : [],
    medical_history: r.medicalHistorySummary || r.medicalHistory || r.medical_history || '',
    account_status: (r.status === 'inactive' ? 'inactive' : 'active') as PatientAccountStatus,
    tanggal_registrasi_akun: r.registeredAt || r.registered_at || r.createdAt || r.created_at,
    login_pertama_kali: r.firstLoginAt || r.first_login_at || r.lastLoginAt || r.last_login_at,
    kunjungan_terakhir: r.lastVisitDate || r.last_visit_date,

    // Affiliation Paradigm Fields
    is_master: r.isMaster ?? r.is_master ?? true,
    has_own_account: r.hasOwnAccount ?? r.has_own_account ?? false,
    affiliate_count: Number(r.affiliateCount ?? r.affiliate_count ?? mappedAffiliates.length),
    relationship_type: r.relationshipType ?? r.relationship_type ?? null,
    relation_label: r.relationLabel ?? r.relation_label ?? null,
    master_patient_id: r.masterPatientId ?? r.master_patient_id ?? null,
    master_patient_name: r.masterPatientName ?? r.master_patient_name ?? null,
    affiliates: mappedAffiliates.length > 0 ? mappedAffiliates : undefined,

    total_appointments: Number(r.totalAppointments ?? r.total_appointments ?? 0),
    completed_visits: Number(r.completedVisits ?? r.completed_visits ?? 0),
    missed_appointments: Number(r.missedAppointments ?? r.missed_appointments ?? 0),
    cancelled_appointments: Number(r.cancelledAppointments ?? r.cancelled_appointments ?? 0),
    last_visit_date: r.lastVisitDate ?? r.last_visit_date ?? null,
    created_at: r.registeredAt || r.createdAt || r.created_at,
    updated_at: r.updatedAt || r.updated_at
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
    const normalized = normalizeGender(rawGender);
    if (normalized) {
      queryParams.gender = normalized;
    }
  }

  if (filters.status) {
    const rawStatus = Array.isArray(filters.status) ? filters.status[0] : filters.status;
    if (rawStatus === 'Aktif' || rawStatus === 'active') {
      queryParams.status = 'active';
    } else if (rawStatus === 'Nonaktif' || rawStatus === 'inactive' || rawStatus === 'Non-Aktif') {
      queryParams.status = 'inactive';
    }
  }

  if (filters.bloodType) {
    const rawBlood = Array.isArray(filters.bloodType) ? filters.bloodType[0] : filters.bloodType;
    if (rawBlood && rawBlood !== 'all') {
      queryParams.bloodType = rawBlood === 'Belum Tahu' ? 'unknown' : rawBlood;
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
    data: any[];
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
    total: response?.summary?.totalPatients ?? response?.meta?.total ?? patients.length,
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
    const record = await clientFetch<any>(`/api/v1/patients/${id}`);
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
  } catch (error: any) {
    return {
      success: false,
      patient: null,
      message: error?.message || `Gagal mengambil data pasien`
    };
  }
}

export async function getPatientHistory(
  patientId: string
): Promise<{ data: PatientTimelineItem[]; total: number }> {
  const response = await clientFetch<{
    data: any[];
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
  const payload: Record<string, any> = {
    fullName: data.name,
    nik: data.nik || data.nik_ktp,
    gender: (normalizeGender(data.gender) ?? 'male') as any,
    birthDate: data.birth_date || data.tanggal_lahir,
    birthPlace: data.tempat_lahir || '',
    bloodType: (data.blood_type || 'unknown').toLowerCase(),
    namaIbuKandung: data.nama_ibu_kandung || '',
    pekerjaan: data.pekerjaan || '',
    phoneNumber: data.phone || data.nomor_telepon_wa || '',
    address: data.address || data.domisili || '',
    medicalHistory: data.medical_history || ''
  };

  const record = await clientFetch<any>('/api/v1/patients', {
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
  const payload: Record<string, any> = {};

  if (data.name !== undefined) payload.fullName = data.name;
  if (data.nik !== undefined && data.nik.trim() !== '') {
    payload.nik = data.nik.trim();
  }
  if (data.phone !== undefined) payload.phoneNumber = data.phone;
  if (data.emergency_contact !== undefined && data.emergency_contact.trim() !== '') {
    payload.nomor_kontak_darurat = data.emergency_contact.trim();
  }
  if (data.address !== undefined) payload.address = data.address;
  if (data.pekerjaan !== undefined) payload.pekerjaan = data.pekerjaan;
  if (data.nama_ibu_kandung !== undefined) payload.namaIbuKandung = data.nama_ibu_kandung;
  if (data.tempat_lahir !== undefined) payload.birthPlace = data.tempat_lahir;
  if (data.birth_date !== undefined) payload.birthDate = data.birth_date;
  if (data.gender !== undefined) payload.gender = data.gender;
  if (data.blood_type !== undefined) payload.bloodType = data.blood_type;
  if (data.provinsi !== undefined) payload.provinsi = data.provinsi;
  if (data.provinsi_id !== undefined) payload.provinsiId = data.provinsi_id;
  if (data.kabupaten !== undefined) payload.kabupaten = data.kabupaten;
  if (data.kabupaten_id !== undefined) payload.kabupatenId = data.kabupaten_id;
  if (data.kecamatan !== undefined) payload.kecamatan = data.kecamatan;
  if (data.kecamatan_id !== undefined) payload.kecamatanId = data.kecamatan_id;
  if (data.kelurahan !== undefined) payload.kelurahan = data.kelurahan;
  if (data.kelurahan_id !== undefined) payload.kelurahanId = data.kelurahan_id;
  if (data.alamat_detail !== undefined) payload.alamatDetail = data.alamat_detail;
  if (data.account_status !== undefined) {
    payload.status = data.account_status === 'inactive' ? 'inactive' : 'active';
  }

  const updatedRecord = await clientFetch<any>(`/api/v1/patients/${id}`, {
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
