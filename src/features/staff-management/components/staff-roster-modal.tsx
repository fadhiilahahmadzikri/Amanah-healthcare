'use client';

import { DoctorAssignmentModal } from '@/features/jadwal-dokter/components/doctor-assignment-modal';
import type { StaffMember } from '../api/staff-management.api';

export interface StaffRosterModalProps {
  staff: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Unified schedule assignment modal wrapper for staff management.
 * Literally delegates to DoctorAssignmentModal (ScheduleAssignmentModal)
 * from '@/features/jadwal-dokter' as the single source of truth.
 */
export function StaffRosterModal({ staff, isOpen, onClose }: StaffRosterModalProps) {
  return <DoctorAssignmentModal doctor={staff} isOpen={isOpen} onClose={onClose} />;
}
