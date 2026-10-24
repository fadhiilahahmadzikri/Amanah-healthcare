'use client';

import { useMemo, useCallback } from 'react';
import { formatClinicDate, formatClinicDateTime } from '@/lib/date-format';
import { REPLACEMENT_STATUS_CONFIG, getSessionTitle } from '../constants/replacement.constants';
import type { ReplacementOpportunityItem } from '../api/types';

export interface UseReplacementDetailModalOptions {
  replacement: ReplacementOpportunityItem | null;
  onOpenAssign?: (item: ReplacementOpportunityItem) => void;
  onCancelOpportunity?: (id: string) => void;
}

/**
 * Custom hook sentral (Presentation Use Case) untuk mengelola data tampilan,
 * status turunan, serta aksi pada modal detail peluang pengganti.
 */
export function useReplacementDetailModal({
  replacement,
  onOpenAssign,
  onCancelOpportunity
}: UseReplacementDetailModalOptions) {
  const sessionName = useMemo(() => {
    return replacement ? getSessionTitle(replacement.sessionCode) : '';
  }, [replacement]);

  const formattedDate = useMemo(() => {
    return replacement ? formatClinicDate(replacement.workDate, { style: 'human_full' }) : '';
  }, [replacement]);

  const title = useMemo(() => {
    if (!sessionName && !formattedDate) return 'Detail Peluang Dinas Pengganti';
    if (!sessionName) return formattedDate;
    if (!formattedDate) return sessionName;
    return `${sessionName}, ${formattedDate}`;
  }, [sessionName, formattedDate]);

  const timeDisplay = useMemo(() => {
    if (!replacement) return '';
    return replacement.startTime && replacement.endTime
      ? `${replacement.startTime.slice(0, 5)} - ${replacement.endTime.slice(0, 5)} WIB`
      : 'Waktu dinas mengikuti roster';
  }, [replacement]);

  const statusMeta = useMemo(() => {
    if (!replacement) {
      return {
        label: '',
        badgeBg: 'bg-muted',
        badgeText: 'text-muted-foreground'
      };
    }
    return (
      REPLACEMENT_STATUS_CONFIG[replacement.status] || {
        label: replacement.status,
        badgeBg: 'bg-muted',
        badgeText: 'text-muted-foreground'
      }
    );
  }, [replacement]);

  const isClaimed = replacement?.status === 'claimed';
  const isCompleted = replacement?.status === 'completed';
  const isOpenStatus = replacement?.status === 'open';
  const isCancelled = replacement?.status === 'cancelled';

  const claimedAtFormatted = useMemo(() => {
    return replacement?.claimedAt ? formatClinicDateTime(replacement.claimedAt) : null;
  }, [replacement?.claimedAt]);

  const handleCancel = useCallback(() => {
    if (!replacement) return;
    if (window.confirm('Apakah Anda yakin ingin membatalkan peluang dinas pengganti ini?')) {
      onCancelOpportunity?.(replacement.id);
    }
  }, [replacement, onCancelOpportunity]);

  const handleOpenAssign = useCallback(() => {
    if (!replacement) return;
    onOpenAssign?.(replacement);
  }, [replacement, onOpenAssign]);

  return {
    sessionName,
    formattedDate,
    title,
    timeDisplay,
    statusMeta,
    isClaimed,
    isCompleted,
    isOpenStatus,
    isCancelled,
    claimedAtFormatted,
    handleCancel,
    handleOpenAssign
  };
}

export type UseReplacementDetailModalReturn = ReturnType<typeof useReplacementDetailModal>;
