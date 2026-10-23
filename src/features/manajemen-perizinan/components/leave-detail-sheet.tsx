'use client';

/**
 * Re-export LeaveDetailModal under LeaveDetailSheet for seamless backward compatibility.
 * Sesuai arahan, tampilan detail perizinan mengadopsi modal style Staff Management.
 */
export {
  LeaveDetailModal as LeaveDetailSheet,
  LeaveDetailModal,
  type LeaveDetailModalProps as LeaveDetailSheetProps,
  type LeaveDetailModalProps
} from './leave-detail-modal';
