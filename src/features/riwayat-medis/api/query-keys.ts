import type { MedicalRecordFilterOptions } from './types';

export const medicalRecordKeys = {
  all: ['medical-records'] as const,
  lists: () => [...medicalRecordKeys.all, 'list'] as const,
  list: (filters: MedicalRecordFilterOptions) => [...medicalRecordKeys.lists(), filters] as const,
  infinite: (filters: MedicalRecordFilterOptions) =>
    [...medicalRecordKeys.all, 'infinite', filters] as const,
  details: () => [...medicalRecordKeys.all, 'detail'] as const,
  detail: (id: string) => [...medicalRecordKeys.details(), id] as const,
  byPatient: (patientId: string) => [...medicalRecordKeys.all, 'patient', patientId] as const,
  patientAppointments: (patientId: string) => ['patient-appointments-history', patientId] as const
};
