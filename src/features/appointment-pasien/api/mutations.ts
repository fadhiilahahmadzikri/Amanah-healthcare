import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { updateAdminLiveStatus, deleteAdminAppointment } from './service';
import { appointmentKeys } from './queries';
import type { LiveStatus } from './types';

export const updateLiveStatusMutation = mutationOptions({
  mutationFn: async ({ id, status }: { id: number; status: LiveStatus }) => {
    return updateAdminLiveStatus(id, status);
  },
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: appointmentKeys.all });
  }
});

export const deleteAppointmentMutation = mutationOptions({
  mutationFn: async (id: number) => {
    return deleteAdminAppointment(id);
  },
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: appointmentKeys.all });
  }
});
