'use client';

import { InviteDoctorModal, type InviteDoctorModalProps } from './invite-doctor-modal';

export type InviteStaffModalProps = InviteDoctorModalProps;

/**
 * InviteStaffModal
 * Master invitation wizard for operational staff. Reuses the identical
 * ReservationModal-styled wizard component as InviteDoctorModal.
 */
export function InviteStaffModal(props: InviteStaffModalProps) {
  return <InviteDoctorModal {...props} mode='staff' />;
}
