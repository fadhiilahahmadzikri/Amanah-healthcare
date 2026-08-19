import { fakePatients } from '@/constants/mock-api-patients';
import type {
  PatientFilters,
  PatientsResponse,
  PatientSummary,
  PatientMutationPayload,
  PatientDetailResponse
} from './types';

export async function getPatients(filters: PatientFilters): Promise<PatientsResponse> {
  return fakePatients.getPatients(filters);
}

export async function getPatientSummary(): Promise<PatientSummary> {
  return fakePatients.getSummary();
}

export async function getPatientById(id: number): Promise<PatientDetailResponse> {
  return fakePatients.getPatientById(id);
}

export async function createPatient(data: PatientMutationPayload) {
  return fakePatients.createPatient(data);
}

export async function updatePatient(id: number, data: Partial<PatientMutationPayload>) {
  return fakePatients.updatePatient(id, data);
}

export async function deletePatient(id: number) {
  return fakePatients.deletePatient(id);
}
