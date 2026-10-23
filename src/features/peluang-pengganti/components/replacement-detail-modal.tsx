'use client';

import React from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import { formatClinicDate, formatClinicDateTime } from '@/lib/date-format';
import { REPLACEMENT_STATUS_CONFIG, getSessionTitle } from '../constants/replacement.constants';
import type { ReplacementOpportunityItem } from '../api/types';

export interface ReplacementDetailModalProps {
  replacement: ReplacementOpportunityItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAssign?: (item: ReplacementOpportunityItem) => void;
  onCancelOpportunity?: (id: string) => void;
  isCancelling?: boolean;
}

export function ReplacementDetailModal({
  replacement,
  isOpen,
  onClose,
  onOpenAssign,
  onCancelOpportunity,
  isCancelling = false
}: ReplacementDetailModalProps) {
  if (!replacement) return null;

  const isClaimed = replacement.status === 'claimed';
  const isCompleted = replacement.status === 'completed';
  const isOpenStatus = replacement.status === 'open';

  const sessionName = getSessionTitle(replacement.sessionCode);

  const timeDisplay =
    replacement.startTime && replacement.endTime
      ? `${replacement.startTime.slice(0, 5)} - ${replacement.endTime.slice(0, 5)} WIB`
      : 'Waktu dinas mengikuti roster';

  const formattedDate = formatClinicDate(replacement.workDate, {
    style: 'human_full'
  });

  const statusMeta = REPLACEMENT_STATUS_CONFIG[replacement.status] || {
    label: replacement.status,
    badgeBg: 'bg-muted',
    badgeText: 'text-muted-foreground'
  };

  const handleCancel = () => {
    if (window.confirm('Apakah Anda yakin ingin membatalkan peluang dinas pengganti ini?')) {
      onCancelOpportunity?.(replacement.id);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='w-full sm:max-w-[560px]'
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
            <h3 className='text-base font-bold text-foreground leading-snug'>{sessionName}</h3>
            <p className='text-xs text-muted-foreground'>{formattedDate}</p>
          </div>

          <div className='flex items-center gap-2'>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusMeta.badgeBg} ${statusMeta.badgeText}`}
            >
              {statusMeta.label}
            </span>
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
              <span className='font-medium text-foreground'>{sessionName}</span>
            </div>
            <div>
              <span className='text-muted-foreground block text-[11px]'>Jam Operasional</span>
              <span className='font-medium text-foreground'>{timeDisplay}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Staf yang Digantikan (Yang Cuti) */}
        <div className='bg-muted/30 p-3 rounded-xl space-y-2 text-xs'>
          <div className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'>
            Staf yang Berhalangan (Cuti)
          </div>
          <div className='flex items-center gap-2.5 text-foreground font-medium'>
            <Avatar className='size-8 rounded-lg border border-border/50 shrink-0'>
              <AvatarImage
                src={replacement.originalStaffAvatarUrl || DEFAULT_AVATAR_PATH}
                alt={replacement.originalStaffName || 'Staf'}
                className='rounded-lg object-cover'
              />
              <AvatarFallback className='rounded-lg p-0 bg-transparent overflow-hidden'>
                <Image
                  src={DEFAULT_AVATAR_PATH}
                  alt={replacement.originalStaffName || 'Staf'}
                  width={32}
                  height={32}
                  unoptimized
                  className='size-full rounded-lg object-cover'
                />
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0 flex-1'>
              <div className='font-semibold text-foreground text-xs leading-tight'>
                {replacement.originalStaffName}
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
          {isClaimed || isCompleted ? (
            <div className='space-y-1.5'>
              <div className='flex items-center gap-2.5 text-foreground font-medium'>
                <Avatar className='size-8 rounded-lg border border-border/50 shrink-0'>
                  <AvatarImage
                    src={replacement.claimedByAvatarUrl || DEFAULT_AVATAR_PATH}
                    alt={replacement.claimedByName || ''}
                    className='rounded-lg object-cover'
                  />
                  <AvatarFallback className='rounded-lg p-0 bg-transparent overflow-hidden'>
                    <Image
                      src={DEFAULT_AVATAR_PATH}
                      alt={replacement.claimedByName || ''}
                      width={32}
                      height={32}
                      unoptimized
                      className='size-full rounded-lg object-cover'
                    />
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
              {isClaimed && (
                <p className='text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium'>
                  ✓ Staf pengganti sah untuk scan QR presensi masuk pada tanggal dinas.
                </p>
              )}
              {isCompleted && (
                <p className='text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium'>
                  ✓ Dinas pengganti telah selesai dijalankan dan diperhitungkan ke payroll.
                </p>
              )}
            </div>
          ) : isOpenStatus ? (
            <div className='space-y-1 text-muted-foreground text-xs'>
              <p className='text-emerald-600 dark:text-emerald-400 font-medium'>
                ● Terbuka untuk diklaim rekan sejawat melalui aplikasi mobile atau ditugaskan
                langsung oleh admin.
              </p>
              <p className='text-[11px]'>
                Saat staf mengklaim peluang ini di mobile, jadwal langsung terdaftar dan eligible
                untuk check-in presensi.
              </p>
            </div>
          ) : (
            <div className='text-muted-foreground text-xs'>
              <p className='text-rose-600 font-medium'>Peluang dinas pengganti dibatalkan.</p>
              {replacement.notes && (
                <p className='text-[11px] mt-0.5 text-muted-foreground'>
                  Catatan: {replacement.notes}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className='flex items-center justify-between pt-2 border-t border-border/60'>
          <div className='flex items-center gap-2'>
            {(isOpenStatus || isClaimed) && onCancelOpportunity && (
              <Button
                variant='outline'
                size='sm'
                onClick={handleCancel}
                disabled={isCancelling}
                className='text-xs text-destructive hover:bg-destructive/10 border-destructive/30 h-8 px-2.5'
              >
                {isCancelling ? 'Membatalkan...' : 'Batalkan Peluang'}
              </Button>
            )}
          </div>

          <div className='flex items-center gap-2'>
            {isOpenStatus && onOpenAssign && (
              <Button
                variant='primary'
                size='sm'
                onClick={() => onOpenAssign(replacement)}
                className='text-xs h-8 px-3 font-semibold gap-1'
              >
                <Icons.userCheck className='size-3.5' />
                <span>Tugaskan Pengganti</span>
              </Button>
            )}
            <Button variant='outline' size='sm' onClick={onClose} className='text-xs h-8 px-3'>
              Tutup
            </Button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
