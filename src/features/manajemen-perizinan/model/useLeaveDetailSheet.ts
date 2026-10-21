'use client';

import { useState } from 'react';
import { useReviewLeaveMutation } from '../api/mutations';
import type { LeaveRequestItem } from '../api/types';

export interface UseLeaveDetailSheetProps {
  leave: LeaveRequestItem | null;
  onClose: () => void;
}

export function useLeaveDetailSheet({ leave, onClose }: UseLeaveDetailSheetProps) {
  const [approvalNotes, setApprovalNotes] = useState('');
  const reviewMutation = useReviewLeaveMutation();

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!leave) return;
    try {
      await reviewMutation.mutateAsync({
        id: leave.id,
        status,
        approvalNotes: approvalNotes.trim() || undefined
      });
      setApprovalNotes('');
      onClose();
    } catch {
      // Error is handled in mutation toast
    }
  };

  const handleClose = () => {
    setApprovalNotes('');
    onClose();
  };

  const initials = (() => {
    if (!leave?.staff?.fullName) return 'S';
    const raw = leave.staff.fullName.replace(/^(dr|drg|prof)\.\s*/i, '').trim();
    const parts = raw.split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (parts[0]?.[0] || 'S').toUpperCase();
  })();

  const isPending = leave?.status === 'pending';
  const isSubmitting = reviewMutation.isPending;

  return {
    approvalNotes,
    setApprovalNotes,
    handleReview,
    handleClose,
    initials,
    isPending,
    isSubmitting
  };
}

export type UseLeaveDetailSheetReturn = ReturnType<typeof useLeaveDetailSheet>;
