'use client';

import React, { useEffect, useState } from 'react';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import {
  type MyPendingProposal,
  useMyPendingProposals,
} from '../hooks/use-my-pending-proposals';

interface ProposalInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export function ProposalInboxModal({
  isOpen,
  onClose,
  onDeclineToReschedule,
}: ProposalInboxModalProps) {
  const { proposals, respond, respondingId } = useMyPendingProposals();

  if (!isOpen) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-xl'
      showCloseButton
      className='flex flex-col max-h-[85vh] overflow-hidden p-0'
    >
      <div className='flex items-center justify-between border-b border-border/60 px-5 py-4'>
        <div>
          <h2 className='text-sm font-semibold tracking-tight text-foreground'>
            Kotak Masuk Usulan Janji Temu
          </h2>
          <p className='text-xs text-muted-foreground'>
            {proposals.length > 0
              ? `${proposals.length} usulan membutuhkan tanggapan Anda`
              : 'Tidak ada usulan janji temu yang menunggu persetujuan'}
          </p>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto p-5 space-y-3.5'>
        {proposals.length === 0 ? (
          <EmptyState
            title='Belum Ada Usulan Janji Temu'
            description='Semua usulan perubahan jadwal dan pembatalan telah terselesaikan.'
            className='border-none bg-transparent p-4 min-h-[220px]'
          />
        ) : (
          proposals.map((proposal) => {
            const isReschedule = proposal.proposalType === 'reschedule';
            const isCurrentLoading = respondingId === proposal.id;
            const diffMs = proposal.expiresAt
              ? new Date(proposal.expiresAt).getTime() - Date.now()
              : 1;
            const isExpired = diffMs <= 0;

            return (
              <div
                key={proposal.id}
                className='flex flex-col gap-3 p-4 rounded-lg border border-border/70 bg-card text-card-foreground transition-colors'
              >
                <div className='flex items-start justify-between gap-2 flex-wrap'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <Badge
                      variant='outline'
                      className='text-[10px] font-medium tracking-tight uppercase px-1.5 py-0 border-border/50'
                    >
                      {isReschedule
                        ? 'Usulan Jadwal Baru'
                        : 'Usulan Pembatalan'}
                    </Badge>
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

                  <ProposalCountdownBadge expiresAt={proposal.expiresAt} />
                </div>

                <div className='text-xs text-muted-foreground leading-relaxed'>
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
                    <span className='block text-muted-foreground/90 mt-1 text-[11px]'>
                      Alasan: {proposal.reason}
                    </span>
                  )}
                </div>

                <div className='flex items-center justify-end gap-2 pt-1 border-t border-border/40'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    disabled={isCurrentLoading || isExpired}
                    onClick={async () => {
                      await respond({
                        proposalId: proposal.id,
                        decision: 'declined',
                      });
                      onClose();
                      onDeclineToReschedule?.(proposal);
                    }}
                    className='h-7 text-xs px-3 font-normal'
                  >
                    Tolak
                  </Button>
                  <Button
                    type='button'
                    size='sm'
                    disabled={isCurrentLoading || isExpired}
                    onClick={() =>
                      respond({
                        proposalId: proposal.id,
                        decision: 'accepted',
                      })
                    }
                    className='h-7 text-xs px-3 font-medium'
                  >
                    Setuju
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </ModalWrapper>
  );
}
