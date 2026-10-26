import type { AppointmentAction } from './types';

export interface AppointmentCapabilities {
  canCall: boolean;
  canCheckIn: boolean;
  canStartService: boolean;
  canComplete: boolean;
  canUpdateStatus: boolean;
  canReschedule: boolean;
  canCancel: boolean;
  canAssignDoctor: boolean;
  canAssignRoom: boolean;
  canMarkNoShow: boolean;
}

export function resolveAppointmentCapabilities(
  actions?: AppointmentAction[] | readonly AppointmentAction[] | null
): AppointmentCapabilities {
  const set = new Set(actions ?? []);
  const canStartService = set.has('START_SERVICE');
  const canComplete = set.has('COMPLETE');

  return {
    canCall: set.has('CALL'),
    canCheckIn: set.has('CHECK_IN'),
    canStartService,
    canComplete,
    canUpdateStatus: canStartService || canComplete,
    canReschedule: set.has('RESCHEDULE'),
    canCancel: set.has('CANCEL'),
    canAssignDoctor: set.has('ASSIGN_DOCTOR'),
    canAssignRoom: set.has('ASSIGN_ROOM'),
    canMarkNoShow: set.has('NO_SHOW')
  };
}
