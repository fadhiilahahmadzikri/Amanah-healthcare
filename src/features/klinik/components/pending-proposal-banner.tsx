'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  type MyPendingProposal,
  useMyPendingProposals,
} from '../hooks/use-my-pending-proposals';

interface PendingProposalBannerProps {
  onOpenInbox?: () => void;
  onDeclineToReschedule?: (proposal: MyPendingProposal) => void;
}

function calculateTimeLeft(targetIso: string | undefined | null): {
  formatted: string;
  isExpired: boolean;
} {
  if (!targetIso) {
    return { formatted: '', isExpired: false };
  }

  const diffMs = new Date(targetIso).getTime() - Date.now();
  if (diffMs <= 0) {
    return { formatted: 'Kedaluwarsa', isExpired: true };
  }

  const totalSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return {
      formatted: `${days}h ${remHours}j`,
      isExpired: false,
    };
  }

  return {
    formatted: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
    isExpired: false,
  };
}

function ProposalCountdownBadge({ expiresAt }: { expiresAt?: string }) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(expiresAt));

  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const res = calculateTimeLeft(expiresAt);
      setTimeLeft(res);
      if (res.isExpired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt || !timeLeft.formatted) return null;

  return (
    <span
      className={`text-[11px] font-mono tabular-nums ${
        timeLeft.isExpired
          ? 'text-destructive font-medium'
          : 'text-muted-foreground'
      }`}
    >
      {timeLeft.formatted}
    </span>
  );
}

export function PendingProposalBanner({
  onOpenInbox,
  onDeclineToReschedule,
}: PendingProposalBannerProps) {
  const { proposals, respond, respondingId } = useMyPendingProposals();

  if (!proposals || proposals.length === 0) {
    return null;
  }

  // Render only the top/most pressing proposal on banner
  const proposal = proposals[0];
  const isReschedule = proposal.proposalType === 'reschedule';
  const isCurrentLoading = respondingId === proposal.id;
  const hasMore = proposals.length > 1;

  const diffMs = proposal.expiresAt
    ? new Date(proposal.expiresAt).getTime() - Date.now()
    : 1;
  const isExpired = diffMs <= 0;

  return (
    <div className='flex flex-col gap-2 shrink-0'>
      <div className='relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-4 sm:py-3.5 rounded-xl border border-border/60 bg-transparent text-foreground transition-colors'>
        {/* Top-Right Countdown Timer */}
        <div className='absolute top-3 right-3 sm:static sm:order-last shrink-0'>
          <ProposalCountdownBadge expiresAt={proposal.expiresAt} />
        </div>

        <div className='flex flex-col gap-1 min-w-0 pr-16 sm:pr-0'>
          <div className='flex items-center gap-2 flex-wrap'>
            {proposal.serviceName && (
              <span className='text-xs font-semibold text-foreground tracking-tight'>
                {proposal.serviceName}
              </span>
            )}
            {proposal.patientName && (
              <span className='text-xs text-muted-foreground truncate'>
                ({proposal.patientName})
              </span>
            )}
          </div>

          <div className='text-xs text-muted-foreground'>
            {isReschedule ? (
              <span>
                Klinik mengusulkan pemindahan jadwal dari{' '}
                <span className='text-foreground font-medium'>
                  {proposal.originalDate}
                </span>{' '}
                ke{' '}
                <span className='text-foreground font-medium'>
                  {proposal.proposedDate}
                </span>
                {proposal.estimatedQueueNumber
                  ? ` (estimasi antrean #${proposal.estimatedQueueNumber})`
                  : ''}
                .
              </span>
            ) : (
              <span>
                Klinik mengusulkan pembatalan janji temu tanggal{' '}
                <span className='text-foreground font-medium'>
                  {proposal.originalDate}
                </span>
                .
              </span>
            )}
            {proposal.reason && (
              <span className='block text-muted-foreground/80 mt-0.5 text-[11px]'>
                Alasan: {proposal.reason}
              </span>
            )}
          </div>

          {hasMore && onOpenInbox && (
            <button
              type='button'
              onClick={onOpenInbox}
              className='inline-flex items-center gap-1.5 text-[11px] text-primary hover:underline font-medium mt-0.5 self-start'
            >
              <Icons.inbox className='size-3' />
              <span>+{proposals.length - 1} usulan lainnya di Kotak Masuk</span>
            </button>
          )}
        </div>

        <div className='flex items-center gap-2 shrink-0 self-end sm:self-center'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={isCurrentLoading || isExpired}
            onClick={async () => {
              await respond({ proposalId: proposal.id, decision: 'declined' });
              onDeclineToReschedule?.(proposal);
            }}
            className='h-7 text-xs px-2.5 font-normal hover:bg-muted'
          >
            Tolak
          </Button>
          <Button
            type='button'
            size='sm'
            disabled={isCurrentLoading || isExpired}
            onClick={() =>
              respond({ proposalId: proposal.id, decision: 'accepted' })
            }
            className='h-7 text-xs px-2.5 font-medium'
          >
            Setuju
          </Button>
        </div>
      </div>
    </div>
  );
}
