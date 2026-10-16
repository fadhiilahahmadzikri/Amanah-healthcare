'use client';

import { useState, useCallback } from 'react';
import { useStaffManagementView } from './useStaffManagementView';
import { useRevokeStaffInvitation } from './useRevokeStaffInvitation';
import type { StaffMember } from '../api/staff-management.api';

export interface UseStaffManagementPresenterResult {
  view: ReturnType<typeof useStaffManagementView>;
  revoke: ReturnType<typeof useRevokeStaffInvitation>;
  rosterModal: {
    isOpen: boolean;
    staff: StaffMember | null;
    open: (staff: StaffMember) => void;
    close: () => void;
  };
  detailModal: {
    isOpen: boolean;
    staff: StaffMember | null;
    open: (staff: StaffMember) => void;
    close: () => void;
  };
  inviteModal: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
  };
}

export function useStaffManagementPresenter(): UseStaffManagementPresenterResult {
  const view = useStaffManagementView();
  const revoke = useRevokeStaffInvitation();

  const [selectedStaffForRoster, setSelectedStaffForRoster] = useState<StaffMember | null>(null);
  const [selectedStaffForDetail, setSelectedStaffForDetail] = useState<StaffMember | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const openRoster = useCallback((staff: StaffMember) => {
    setSelectedStaffForRoster(staff);
  }, []);

  const closeRoster = useCallback(() => {
    setSelectedStaffForRoster(null);
  }, []);

  const openDetail = useCallback((staff: StaffMember) => {
    setSelectedStaffForDetail(staff);
  }, []);

  const closeDetail = useCallback(() => {
    setSelectedStaffForDetail(null);
  }, []);

  const openInvite = useCallback(() => {
    setIsInviteOpen(true);
  }, []);

  const closeInvite = useCallback(() => {
    setIsInviteOpen(false);
  }, []);

  return {
    view,
    revoke,
    rosterModal: {
      isOpen: Boolean(selectedStaffForRoster),
      staff: selectedStaffForRoster,
      open: openRoster,
      close: closeRoster
    },
    detailModal: {
      isOpen: Boolean(selectedStaffForDetail),
      staff: selectedStaffForDetail,
      open: openDetail,
      close: closeDetail
    },
    inviteModal: {
      isOpen: isInviteOpen,
      open: openInvite,
      close: closeInvite
    }
  };
}
