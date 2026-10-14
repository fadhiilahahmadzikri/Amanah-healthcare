'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patientKeys } from '../api/queries';
import {
  bulkDeletePatients,
  createPatient,
  deletePatient,
  updatePatient,
} from '../api/service';
import type { PatientMutationPayload } from '../api/types';

/**
 * Hook mutasi pembaruan data pasien dengan invalidasi dan sinkronisasi cache otomatis.
 * Memastikan data di tabel dan seluruh modal terbarukan secara real-time tanpa reload halaman.
 */
export function useUpdatePatientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: Partial<PatientMutationPayload>;
    }) => updatePatient(id, values),
    onSuccess: async (data, variables) => {
      // 1. Langsung sinkronkan detail query pasien tertentu jika data dikembalikan backend
      if (data?.patient) {
        queryClient.setQueryData(patientKeys.detail(variables.id), {
          success: true,
          patient: data.patient,
        });
      }

      // 2. Invalidasi menyeluruh semua query pasien (list tabel, summary, detail, history)
      await queryClient.invalidateQueries({
        queryKey: patientKeys.all,
        refetchType: 'active',
      });
    },
  });
}

/**
 * Hook mutasi penambahan pasien baru dengan invalidasi cache otomatis.
 */
export function useCreatePatientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: PatientMutationPayload) => createPatient(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: patientKeys.all,
        refetchType: 'active',
      });
    },
  });
}

/**
 * Hook mutasi penonaktifan / penghapusan pasien tunggal dengan invalidasi cache otomatis.
 */
export function useDeletePatientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePatient(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: patientKeys.all,
        refetchType: 'active',
      });
    },
  });
}

/**
 * Hook mutasi penonaktifan / penghapusan massal pasien dengan invalidasi cache otomatis.
 */
export function useBulkDeletePatientsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeletePatients(ids),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: patientKeys.all,
        refetchType: 'active',
      });
    },
  });
}
