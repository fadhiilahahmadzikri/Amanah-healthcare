export {
  STAFF_TYPES,
  type StaffType,
  STAFF_TYPE_LABELS,
} from '@/constants/staff-types.constant';
import { STAFF_TYPES } from '@/constants/staff-types.constant';

export const STAFF_ROLE_CODES = {
  DOCTOR: 'staff_doctor',
  MIDWIFE: 'staff_midwife',
  WORKER: 'staff_worker'
} as const;

export type StaffRoleCode = (typeof STAFF_ROLE_CODES)[keyof typeof STAFF_ROLE_CODES];

export const STAFF_INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  EXPIRED: 'expired',
  REVOKED: 'revoked'
} as const;

export type StaffInvitationStatus =
  (typeof STAFF_INVITATION_STATUS)[keyof typeof STAFF_INVITATION_STATUS];

export const STAFF_ROLE_LABELS: Record<string, string> = {
  [STAFF_ROLE_CODES.DOCTOR]: 'Dokter',
  [STAFF_TYPES.DOCTOR]: 'Dokter',
  [STAFF_ROLE_CODES.MIDWIFE]: 'Bidan',
  [STAFF_TYPES.MIDWIFE]: 'Bidan',
  [STAFF_ROLE_CODES.WORKER]: 'Staf Operasional',
  [STAFF_TYPES.WORKER]: 'Staf Operasional'
};

export const STAFF_INVITATION_STATUS_LABELS: Record<StaffInvitationStatus, string> = {
  [STAFF_INVITATION_STATUS.ACCEPTED]: 'Diterima',
  [STAFF_INVITATION_STATUS.PENDING]: 'Menunggu',
  [STAFF_INVITATION_STATUS.REVOKED]: 'Dibatalkan',
  [STAFF_INVITATION_STATUS.EXPIRED]: 'Kedaluwarsa'
};
