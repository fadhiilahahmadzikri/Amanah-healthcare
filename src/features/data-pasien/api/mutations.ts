import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  bulkDeletePatients,
  createPatient,
  deletePatient,
  updatePatient,
} from './service';
import { patientKeys } from './queries';
import type { PatientMutationPayload } from './types';

export const createPatientMutation = mutationOptions({
  mutationFn: (values: PatientMutationPayload) => createPatient(values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: patientKeys.all });
  },
});

export const updatePatientMutation = mutationOptions({
  mutationFn: ({
    id,
    values,
  }: {
    id: string;
    values: Partial<PatientMutationPayload>;
  }) => updatePatient(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: patientKeys.all });
  },
});

export const deletePatientMutation = mutationOptions({
  mutationFn: (id: string) => deletePatient(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: patientKeys.all });
  },
});

export const bulkDeletePatientsMutation = mutationOptions({
  mutationFn: (ids: string[]) => bulkDeletePatients(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: patientKeys.all });
  },
});
