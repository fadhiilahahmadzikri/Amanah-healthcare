import { mutationOptions, useMutation } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  updateAdminLiveStatus,
  deleteAdminAppointment,
  changeAppointmentDoctor,
  changeAppointmentRoom
} from './service';
import { appointmentKeys } from './queries';
import type { LiveStatus, ChangeDoctorPayload, ChangeRoomPayload } from './types';

export const updateLiveStatusMutation = mutationOptions({
  mutationFn: async ({ id, status }: { id: number | string; status: LiveStatus }) => {
    return updateAdminLiveStatus(id, status);
  },
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: appointmentKeys.all });
  }
});

export const deleteAppointmentMutation = mutationOptions({
  mutationFn: async (id: number | string) => {
    return deleteAdminAppointment(id);
  },
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: appointmentKeys.all });
  }
});

export const changeDoctorMutation = mutationOptions({
  mutationFn: async ({ appointmentId, doctorId, closeOldSchedule, reason }: ChangeDoctorPayload) => {
    return changeAppointmentDoctor(appointmentId, doctorId, { closeOldSchedule, reason });
  },

  onSuccess: () => {
    const qc = getQueryClient();
    void qc.invalidateQueries({ queryKey: appointmentKeys.all });
    void qc.invalidateQueries({ queryKey: ['doctor-schedules'] });
  }
});

export const changeRoomMutation = mutationOptions({
  mutationFn: async ({ appointmentId, roomId }: ChangeRoomPayload) => {
    return changeAppointmentRoom(appointmentId, roomId);
  },
  onSuccess: () => {
    const qc = getQueryClient();
    void qc.invalidateQueries({ queryKey: appointmentKeys.all });
    void qc.invalidateQueries({ queryKey: ['doctor-schedules'] });
  }
});

export function useChangeDoctorMutation() {
  return useMutation(changeDoctorMutation);
}

export function useChangeRoomMutation() {
  return useMutation(changeRoomMutation);
}
