'use client';

import React from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';

export interface ReplacementDetailStatusSectionProps {
  isClaimed: boolean;
  isCompleted: boolean;
  isOpenStatus: boolean;
  claimedByName?: string | null;
  claimedByRole?: string | null;
  claimedByAvatarUrl?: string | null;
  claimedAtFormatted?: string | null;
  notes?: string | null;
}

export function ReplacementDetailStatusSection({
  isClaimed,
  isCompleted,
  isOpenStatus,
  claimedByName,
  claimedByRole,
  claimedByAvatarUrl,
  claimedAtFormatted,
  notes
}: ReplacementDetailStatusSectionProps) {
  return (
    <div className='bg-muted/30 p-3 rounded-xl space-y-2 text-xs'>
      <div className='text-xs font-semibold text-foreground'>Status penugasan pengganti</div>
      {isClaimed || isCompleted ? (
        <div className='space-y-1.5'>
          <div className='flex items-center gap-2.5 text-foreground font-medium'>
            <Avatar className='size-8 rounded-lg border border-border/50 shrink-0'>
              <AvatarImage
                src={claimedByAvatarUrl || DEFAULT_AVATAR_PATH}
                alt={claimedByName || ''}
                className='rounded-lg object-cover'
              />
              <AvatarFallback className='rounded-lg p-0 bg-transparent overflow-hidden'>
                <Image
                  src={DEFAULT_AVATAR_PATH}
                  alt={claimedByName || ''}
                  width={32}
                  height={32}
                  unoptimized
                  className='size-full rounded-lg object-cover'
                />
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0 flex-1'>
              <div className='font-semibold text-foreground text-xs leading-tight'>
                Diambil oleh: <strong className='text-primary'>{claimedByName}</strong>
              </div>
              {claimedByRole && (
                <div className='text-muted-foreground text-[11px] font-normal leading-tight mt-0.5'>
                  {claimedByRole}
                </div>
              )}
            </div>
          </div>
          {claimedAtFormatted && (
            <div className='text-[11px] text-muted-foreground'>
              Waktu klaim: {claimedAtFormatted}
            </div>
          )}
          {isClaimed && (
            <p className='text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium'>
              Staf pengganti sah untuk scan QR presensi masuk pada tanggal dinas.
            </p>
          )}
          {isCompleted && (
            <p className='text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium'>
              Dinas pengganti telah selesai dijalankan dan diperhitungkan ke payroll.
            </p>
          )}
        </div>
      ) : isOpenStatus ? (
        <div className='space-y-1 text-muted-foreground text-xs'>
          <p className='text-emerald-600 dark:text-emerald-400 font-medium'>
            Terbuka untuk diklaim rekan sejawat melalui aplikasi mobile atau ditugaskan langsung
            oleh admin.
          </p>
          <p className='text-[11px]'>
            Saat staf mengklaim peluang ini di mobile, jadwal langsung terdaftar dan eligible untuk
            check-in presensi.
          </p>
        </div>
      ) : (
        <div className='text-muted-foreground text-xs'>
          <p className='text-destructive font-medium'>Peluang dinas pengganti dibatalkan.</p>
          {notes && <p className='text-[11px] mt-0.5 text-muted-foreground'>Catatan: {notes}</p>}
        </div>
      )}
    </div>
  );
}
