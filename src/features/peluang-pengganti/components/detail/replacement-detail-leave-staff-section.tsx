'use client';

import React from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';

export interface ReplacementDetailLeaveStaffSectionProps {
  staffName?: string;
  staffRole?: string | null;
  staffAvatarUrl?: string | null;
  leaveReason?: string | null;
}

export function ReplacementDetailLeaveStaffSection({
  staffName,
  staffRole,
  staffAvatarUrl,
  leaveReason
}: ReplacementDetailLeaveStaffSectionProps) {
  return (
    <div className='bg-muted/30 p-3 rounded-xl space-y-2 text-xs'>
      <div className='text-xs font-semibold text-foreground'>Staf yang berhalangan cuti</div>
      <div className='flex items-center gap-2.5 text-foreground font-medium'>
        <Avatar className='size-8 rounded-lg border border-border/50 shrink-0'>
          <AvatarImage
            src={staffAvatarUrl || DEFAULT_AVATAR_PATH}
            alt={staffName || 'Staf'}
            className='rounded-lg object-cover'
          />
          <AvatarFallback className='rounded-lg p-0 bg-transparent overflow-hidden'>
            <Image
              src={DEFAULT_AVATAR_PATH}
              alt={staffName || 'Staf'}
              width={32}
              height={32}
              unoptimized
              className='size-full rounded-lg object-cover'
            />
          </AvatarFallback>
        </Avatar>
        <div className='min-w-0 flex-1'>
          <div className='font-semibold text-foreground text-xs leading-tight'>
            {staffName || 'Staf Medis'}
          </div>
          {staffRole && (
            <div className='text-muted-foreground text-[11px] font-normal leading-tight mt-0.5'>
              {staffRole}
            </div>
          )}
        </div>
      </div>
      {leaveReason && (
        <div className='mt-1 pt-1.5 border-t border-border/40 text-muted-foreground text-[11px]'>
          <span className='font-medium text-foreground'>Alasan izin: </span>
          {leaveReason}
        </div>
      )}
    </div>
  );
}
