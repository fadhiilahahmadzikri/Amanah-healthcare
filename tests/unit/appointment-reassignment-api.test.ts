import { describe, expect, it } from 'bun:test';
import { appointmentKeys } from '@/features/appointment-pasien/api/query-keys';
import {
  doctorCandidatesQueryOptions,
  roomCandidatesQueryOptions
} from '@/features/appointment-pasien/api/queries';
import {
  changeDoctorMutation,
  changeRoomMutation
} from '@/features/appointment-pasien/api/mutations';

describe('AppointmentReassignmentQueryKeys', () => {
  it('should generate consistent query keys for candidate resolution', () => {
    expect(appointmentKeys.doctorCandidates('apt-1')).toEqual([
      'admin-appointments',
      'candidates',
      'doctors',
      'apt-1'
    ]);
    expect(appointmentKeys.roomCandidates('apt-1')).toEqual([
      'admin-appointments',
      'candidates',
      'rooms',
      'apt-1'
    ]);
  });

  it('should generate valid TanStack Query queryOptions', () => {
    const doctorOpts = doctorCandidatesQueryOptions('apt-1');
    expect(doctorOpts.queryKey).toEqual([
      'admin-appointments',
      'candidates',
      'doctors',
      'apt-1'
    ]);
    expect(doctorOpts.enabled).toBe(true);

    const roomOpts = roomCandidatesQueryOptions('apt-1');
    expect(roomOpts.queryKey).toEqual([
      'admin-appointments',
      'candidates',
      'rooms',
      'apt-1'
    ]);
    expect(roomOpts.enabled).toBe(true);
  });

  it('should define valid mutation options for doctor and room change', () => {
    expect(typeof changeDoctorMutation.mutationFn).toBe('function');
    expect(typeof changeRoomMutation.mutationFn).toBe('function');
  });
});
