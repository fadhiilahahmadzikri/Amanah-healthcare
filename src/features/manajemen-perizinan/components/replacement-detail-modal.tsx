'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatClinicDate, formatClinicDateTime } from '@/lib/date-format';
import type { ReplacementOpportunityItem } from '../api/types';

export interface ReplacementDetailModalProps {
  replacement: ReplacementOpportunityItem | null;
  isOpen: boolean;
  onClose: () => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
}

export function ReplacementDetailModal({
  replacement,
  isOpen,
  onClose,
  portalContainerRef
}: ReplacementDetailModalProps) {
  if (!replacement) return null;

  const isClaimed = replacement.status === 'claimed';
  const isCompleted = replacement.status === 'completed';
  const isCancelled = replacement.status === 'cancelled';
  const isOpenStatus = replacement.status === 'open';

  const timeDisplay =
    replacement.startTime && replacement.endTime
      ? `${replacement.startTime.slice(0, 5)} - ${replacement.endTime.slice(0, 5)} WIB`
      : 'Waktu dinas mengikuti roster';

  const formattedDate = formatClinicDate(replacement.workDate, { style: 'human_full' });

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='w-full sm:max-w-[560px]'
      portalContainerRef={portalContainerRef}
      showCloseButton={false}
    >
      <div className='relative font-sans space-y-4 text-left p-1'>
        {/* Header */}
        <div className='flex items-start justify-between gap-4 border-b border-border/60 pb-3'>
          <div className='space-y-1 min-w-0 flex-1'>
            <div className='flex items-center gap-1.5 text-primary'>
              <Icons.calendar className='size-4 shrink-0' />
              <span className='text-xs font-bold tracking-tight'>Peluang Dinas Pengganti</span>
            </div>
            <h3 className='text-base font-bold text-foreground leading-snug'>
              {replacement.sessionLabel || replacement.sessionCode || 'Sesi Dinas'}
            </h3>
            <p className='text-xs text-muted-foreground'>{formattedDate}</p>
          </div>

          <div className='flex items-center gap-2'>
            {isOpenStatus && (
              <span className='bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-semibold'>
                Terbuka
              </span>
            )}
            {isClaimed && (
              <span className='bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-1 rounded-full text-[11px] font-semibold'>
                Diklaim
              </span>
            )}
            {isCompleted && (
              <span className='bg-muted text-muted-foreground px-2.5 py-1 rounded-full text-[11px] font-semibold'>
                Selesai
              </span>
            )}
            {isCancelled && (
              <span className='bg-destructive/10 text-destructive px-2.5 py-1 rounded-full text-[11px] font-semibold'>
                Dibatalkan
              </span>
            )}
            <button
              type='button'
              onClick={onClose}
              className='text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors'
            >
              <Icons.close className='size-4' />
            </button>
          </div>
        </div>

        {/* Section 1: Sesi & Jam Kerja */}
        <div className='bg-muted/30 p-3 rounded-xl space-y-2 text-xs'>
          <div className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'>
            Waktu & Sesi Pelayanan
          </div>
          <div className='grid grid-cols-2 gap-2'>
            <div>
              <span className='text-muted-foreground block text-[11px]'>Sesi Dinas</span>
              <span className='font-medium text-foreground'>
                {replacement.sessionLabel || replacement.sessionCode || 'Sesi Dinas'}
              </span>
            </div>
            <div>
              <span className='text-muted-foreground block text-[11px]'>Jam Operasional</span>
              <span className='font-medium text-foreground'>{timeDisplay}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Staf yang Digantikan */}
        <div className='bg-muted/30 p-3 rounded-xl space-y-2 text-xs'>
          <div className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'>
            Staf yang Berhalangan
          </div>
          <div className='flex items-center gap-2.5 text-foreground font-medium'>
            <Avatar className='size-8 rounded-lg border border-border/50 shrink-0'>
              <AvatarImage
                src={replacement.originalStaffAvatarUrl || ''}
                alt={replacement.originalStaffName || 'Staf'}
              />
              <AvatarFallback className='rounded-lg text-xs font-semibold bg-primary/10 text-primary'>
                {(replacement.originalStaffName || 'S').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0 flex-1'>
              <div className='font-semibold text-foreground text-xs leading-tight'>
                {replacement.originalStaffName || 'Staf Klinik'}
              </div>
              {replacement.originalStaffRole && (
                <div className='text-muted-foreground text-[11px] font-normal leading-tight mt-0.5'>
                  {replacement.originalStaffRole}
                </div>
              )}
            </div>
          </div>
          {replacement.leaveReason && (
            <div className='mt-1 pt-1.5 border-t border-border/40 text-muted-foreground text-[11px]'>
              <span className='font-medium text-foreground'>Alasan Izin: </span>
              {replacement.leaveReason}
            </div>
          )}
        </div>

        {/* Section 3: Status Pengganti */}
        <div className='bg-muted/30 p-3 rounded-xl space-y-2 text-xs'>
          <div className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'>
            Status Penugasan Pengganti
          </div>
          {isClaimed && replacement.claimedByName ? (
            <div className='space-y-1.5'>
              <div className='flex items-center gap-2.5 text-foreground font-medium'>
                <Avatar className='size-8 rounded-lg border border-border/50 shrink-0'>
                  <AvatarImage
                    src={replacement.claimedByAvatarUrl || ''}
                    alt={replacement.claimedByName || 'Pengganti'}
                  />
                  <AvatarFallback className='rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
                    {(replacement.claimedByName || 'P').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='min-w-0 flex-1'>
                  <div className='font-semibold text-foreground text-xs leading-tight'>
                    Diambil oleh:{' '}
                    <strong className='text-primary'>{replacement.claimedByName}</strong>
                  </div>
                  {replacement.claimedByRole && (
                    <div className='text-muted-foreground text-[11px] font-normal leading-tight mt-0.5'>
                      {replacement.claimedByRole}
                    </div>
                  )}
                </div>
              </div>
              {replacement.claimedAt && (
                <div className='text-[11px] text-muted-foreground'>
                  Waktu Klaim: {formatClinicDateTime(replacement.claimedAt)}
                </div>
              )}
              <p className='text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium'>
                ✓ Staf pengganti sah untuk scan QR presensi masuk pada tanggal dinas.
              </p>
            </div>
          ) : isOpenStatus ? (
            <div className='space-y-1 text-muted-foreground text-xs'>
              <p className='text-emerald-600 dark:text-emerald-400 font-medium'>
                ● Terbuka untuk diklaim rekan sejawat melalui aplikasi mobile.
              </p>
              <p className='text-[11px]'>
                Saat staf mengklaim peluang ini di mobile, jadwal langsung terdaftar dan eligible
                untuk check-in presensi.
              </p>
            </div>
          ) : (
            <div className='text-muted-foreground text-xs'>Status: {replacement.status}</div>
          )}
        </div>

        {/* Footer */}
        <div className='flex justify-end pt-2 border-t border-border/60'>
          <Button variant='outline' size='sm' onClick={onClose} className='text-xs'>
            Tutup
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
