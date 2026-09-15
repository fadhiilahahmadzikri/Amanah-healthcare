import type {
  PatientFilters,
  PatientsResponse,
  PatientSummary,
  PatientMutationPayload,
  PatientDetailResponse,
  Patient
} from './types';

const patientRecords: Patient[] = [];

const emptyPatientSummary: PatientSummary = {
  total: 0,
  active: 0,
  inactive: 0
};

export async function getPatients(filters: PatientFilters): Promise<PatientsResponse> {
  const limit = filters.limit ?? 10;
  const page = filters.page ?? 1;
  const filteredPatients = sortPatients(filterPatients(patientRecords, filters), filters.sort);
  const offset = (page - 1) * limit;
  const patients = filteredPatients.slice(offset, offset + limit);

  return {
    success: true,
    time: new Date().toISOString(),
    total_patients: filteredPatients.length,
    offset,
    limit,
    patients,
    summary: getPatientSummaryFromRecords()
  };
}

export async function getPatientSummary(): Promise<PatientSummary> {
  return getPatientSummaryFromRecords();
}

export async function getPatientById(id: number): Promise<PatientDetailResponse> {
  const patient = patientRecords.find((record) => record.id === id) ?? null;

  return {
    success: Boolean(patient),
    patient,
    ...(patient ? {} : { message: `Pasien dengan ID ${id} tidak ditemukan` })
  };
}

export async function createPatient(data: PatientMutationPayload) {
  const newPatient: Patient = {
    ...data,
    id: getNextPatientId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  patientRecords.unshift(newPatient);

  return {
    success: true,
    message: 'Data pasien berhasil ditambahkan',
    patient: newPatient
  };
}

export async function updatePatient(id: number, data: Partial<PatientMutationPayload>) {
  const index = patientRecords.findIndex((record) => record.id === id);

  if (index === -1) {
    return {
      success: false,
      message: `Pasien dengan ID ${id} tidak ditemukan`
    };
  }

  const updatedPatient = {
    ...patientRecords[index],
    ...data,
    updated_at: new Date().toISOString()
  };

  patientRecords[index] = updatedPatient;

  return {
    success: true,
    message: 'Data pasien berhasil diperbarui',
    patient: updatedPatient
  };
}

export async function deletePatient(id: number) {
  const index = patientRecords.findIndex((record) => record.id === id);

  if (index === -1) {
    return {
      success: false,
      message: `Pasien dengan ID ${id} tidak ditemukan`
    };
  }

  patientRecords.splice(index, 1);

  return {
    success: true,
    message: 'Data pasien berhasil dihapus'
  };
}

function getPatientSummaryFromRecords(): PatientSummary {
  if (patientRecords.length === 0) {
    return emptyPatientSummary;
  }

  const active = patientRecords.filter((record) => isActivePatient(record.account_status)).length;

  return {
    total: patientRecords.length,
    active,
    inactive: patientRecords.length - active
  };
}

function filterPatients(records: Patient[], filters: PatientFilters): Patient[] {
  return records.filter((record) => {
    if (filters.gender && !includesFilter(filters.gender, record.gender)) return false;
    if (filters.status && !includesFilter(filters.status, record.account_status)) return false;
    if (filters.search && !matchesPatientSearch(record, filters.search)) return false;

    return true;
  });
}

function sortPatients(records: Patient[], sort?: string): Patient[] {
  if (!sort) return [...records];

  try {
    const sortItems = JSON.parse(sort) as { id: string; desc: boolean }[];
    const firstSort = sortItems[0];

    if (!firstSort) return [...records];

    return [...records].sort((left, right) => {
      const leftValue = getPatientSortValue(left, firstSort.id);
      const rightValue = getPatientSortValue(right, firstSort.id);

      return firstSort.desc
        ? rightValue.localeCompare(leftValue)
        : leftValue.localeCompare(rightValue);
    });
  } catch {
    return [...records];
  }
}

function getPatientSortValue(patient: Patient, id: string): string {
  if (id === 'patient' || id === 'name') return patient.name;
  if (id === 'created_at' || id === 'dibuat_pada') return patient.created_at;

  return String((patient as unknown as Record<string, unknown>)[id] ?? '');
}

function matchesPatientSearch(patient: Patient, search: string): boolean {
  const query = search.trim().toLowerCase();

  if (!query) return true;

  const searchableFields = [
    patient.name,
    patient.patient_id,
    patient.nik,
    patient.nik_ktp,
    patient.phone,
    patient.nomor_telepon_wa,
    patient.email,
    patient.email_pasien,
    patient.pekerjaan,
    patient.domisili,
    patient.address,
    patient.nama_ibu_kandung,
    patient.tempat_lahir,
    patient.gender,
    patient.blood_type,
    patient.medical_history,
    patient.emergency_contact
  ];

  return searchableFields.filter(Boolean).join(' ').toLowerCase().includes(query);
}

function includesFilter(filter: string | string[], value: string): boolean {
  const filters = Array.isArray(filter) ? filter : [filter];
  return filters.some((item) => item.toLowerCase() === value.toLowerCase());
}

function isActivePatient(status: string): boolean {
  return status.toUpperCase() === 'AKTIF' || status.toUpperCase() === 'ACTIVE';
}

function getNextPatientId(): number {
  if (patientRecords.length === 0) return 1;

  return Math.max(...patientRecords.map((record) => record.id)) + 1;
}
