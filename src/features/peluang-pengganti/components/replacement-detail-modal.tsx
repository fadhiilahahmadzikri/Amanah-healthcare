'use client';

import React from 'react';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useReplacementDetailModal } from '../model';
import { ReplacementDetailTimeSection } from './detail/replacement-detail-time-section';
import { ReplacementDetailLeaveStaffSection } from './detail/replacement-detail-leave-staff-section';
import { ReplacementDetailStatusSection } from './detail/replacement-detail-status-section';
import type { ReplacementOpportunityItem } from '../api/types';

export interface ReplacementDetailModalProps {
  replacement: ReplacementOpportunityItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAssign?: (item: ReplacementOpportunityItem) => void;
  onCancelOpportunity?: (id: string) => void;
  isCancelling?: boolean;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Presentational Shell untuk modal detail peluang dinas pengganti.
 * Mengonsumsi hook useReplacementDetailModal dan meniru tata letak modal PatientModal.
 */
export function ReplacementDetailModal({
  replacement,
  isOpen,
  onClose,
  onOpenAssign,
  onCancelOpportunity,
  isCancelling = false,
  portalContainerRef
}: ReplacementDetailModalProps) {
  const {
    sessionName,
    title,
    timeDisplay,
    statusMeta,
    isClaimed,
    isCompleted,
    isOpenStatus,
    claimedAtFormatted,
    handleCancel,
    handleOpenAssign
  } = useReplacementDetailModal({
    replacement,
    onOpenAssign,
    onCancelOpportunity
  });

  if (!replacement) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='w-full sm:max-w-[560px]'
      portalContainerRef={portalContainerRef}
      showCloseButton={false}
    >
      <div className='relative font-sans flex flex-col min-h-0 flex-1 space-y-4 p-1'>
        {/* 1. Modal Header (Pinned) - To the point, no trailing icon, no close 'X' */}
        <div className='shrink-0 pb-3 border-b border-border/40 flex items-start justify-between gap-3 min-w-0'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight truncate'>
              {title}
            </h3>
            <p className='text-xs text-muted-foreground font-medium'>
              Detail peluang dinas pengganti
            </p>
          </div>

          <div className='shrink-0 pt-0.5'>
            <span
              className={cn(
                'px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center',
                statusMeta.badgeBg,
                statusMeta.badgeText
              )}
            >
              {statusMeta.label}
            </span>
          </div>
        </div>

        {/* 2. Modal Body / Content */}
        <div className='space-y-3.5'>
          {/* Waktu & Sesi Pelayanan */}
          <ReplacementDetailTimeSection sessionName={sessionName} timeDisplay={timeDisplay} />

          {/* Staf yang Berhalangan Cuti */}
          <ReplacementDetailLeaveStaffSection
            staffName={replacement.originalStaffName}
            staffRole={replacement.originalStaffRole}
            staffAvatarUrl={replacement.originalStaffAvatarUrl}
            leaveReason={replacement.leaveReason}
          />

          {/* Status Penugasan Pengganti */}
          <ReplacementDetailStatusSection
            isClaimed={isClaimed}
            isCompleted={isCompleted}
            isOpenStatus={isOpenStatus}
            claimedByName={replacement.claimedByName}
            claimedByRole={replacement.claimedByRole}
            claimedByAvatarUrl={replacement.claimedByAvatarUrl}
            claimedAtFormatted={claimedAtFormatted}
            notes={replacement.notes}
          />
        </div>

        {/* 3. Modal Footer (Pinned at Bottom) - All buttons aligned to the right */}
        <div className='shrink-0 pt-3 border-t border-border/40 flex items-center justify-end gap-2.5'>
          {(isOpenStatus || isClaimed) && onCancelOpportunity && (
            <Button
              type='button'
              variant='outline'
              size='md'
              shape='pill'
              onClick={handleCancel}
              disabled={isCancelling}
              className='px-5 text-xs font-semibold text-destructive hover:bg-destructive/10 border-destructive/30 cursor-pointer'
            >
              {isCancelling ? 'Membatalkan...' : 'Batalkan Peluang'}
            </Button>
          )}

          <Button
            type='button'
            variant='outline'
            size='md'
            shape='pill'
            onClick={onClose}
            className='px-6 text-xs font-semibold cursor-pointer'
          >
            Tutup
          </Button>

          {isOpenStatus && onOpenAssign && (
            <Button
              type='button'
              variant='default'
              size='md'
              shape='pill'
              onClick={handleOpenAssign}
              className='px-6 text-xs font-semibold cursor-pointer'
            >
              Tugaskan Pengganti
            </Button>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
