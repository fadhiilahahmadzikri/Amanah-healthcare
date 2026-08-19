import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createPatient, updatePatient, deletePatient } from './service';
import { patientKeys } from './queries';
import type { PatientMutationPayload } from './types';

export const createPatientMutation = mutationOptions({
  mutationFn: (data: PatientMutationPayload) => createPatient(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: patientKeys.all });
  }
});

export const updatePatientMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: Partial<PatientMutationPayload> }) =>
    updatePatient(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: patientKeys.all });
  }
});

export const deletePatientMutation = mutationOptions({
  mutationFn: (id: number) => deletePatient(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: patientKeys.all });
  }
});
