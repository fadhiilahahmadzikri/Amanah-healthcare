'use client';

import React from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import { getSessionTitle } from '../constants/replacement.constants';
import type { ReplacementOpportunityItem } from '../api/types';

export interface ReplacementRouteBlockProps {
  opportunity: ReplacementOpportunityItem;
  className?: string;
}

export function ReplacementRouteBlock({ opportunity, className }: ReplacementRouteBlockProps) {
  const isClaimed = opportunity.status === 'claimed';
  const isCompleted = opportunity.status === 'completed';
  const isOpen = opportunity.status === 'open';

  const sessionName = getSessionTitle(opportunity.sessionCode);

  const timeRange =
    opportunity.startTime && opportunity.endTime
      ? `${opportunity.startTime.slice(0, 5)} - ${opportunity.endTime.slice(0, 5)} WIB`
      : 'Sesuai Roster';

  return (
    <div className={`flex flex-col w-full select-none my-2 sm:my-2.5 py-0.5 ${className || ''}`}>
      <div className='flex items-center justify-between gap-2.5'>
        {/* Left: Staf Cuti / Berhalangan */}
        <div className='flex items-center gap-2 min-w-0 flex-1 text-left'>
          <Avatar className='size-8 rounded-lg border border-border/50 shrink-0 shadow-2xs'>
            <AvatarImage
              src={opportunity.originalStaffAvatarUrl || DEFAULT_AVATAR_PATH}
              alt={opportunity.originalStaffName || 'Staf Cuti'}
              className='rounded-lg object-cover'
            />
            <AvatarFallback className='rounded-lg p-0 bg-transparent overflow-hidden'>
              <Image
                src={DEFAULT_AVATAR_PATH}
                alt={opportunity.originalStaffName || 'Staf Cuti'}
                width={32}
                height={32}
                unoptimized
                className='size-full rounded-lg object-cover'
              />
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0 flex-1 space-y-0.5'>
            <span className='text-[9px] font-bold text-muted-foreground/80 tracking-wider uppercase leading-none block'>
              YANG CUTI
            </span>
            <div className='text-xs font-bold text-foreground truncate leading-tight'>
              {opportunity.originalStaffName}
            </div>
            {opportunity.originalStaffRole && (
              <div className='text-[10.5px] text-muted-foreground truncate leading-tight'>
                {opportunity.originalStaffRole}
              </div>
            )}
          </div>
        </div>

        {/* Center Path Connector with Session & Hours Badge */}
        <div className='flex flex-col items-center justify-center shrink-0 px-1'>
          <span className='text-[10px] font-extrabold text-primary tracking-wide leading-tight uppercase'>
            {sessionName}
          </span>
          <div className='flex items-center w-full min-w-[70px] max-w-[100px] justify-center gap-1 text-muted-foreground/60 my-1'>
            <div className='flex-1 h-[1.5px] border-t border-dashed border-border' />
            <Icons.chevronRight className='size-3 text-muted-foreground/70 shrink-0' />
          </div>
          <span className='text-[9.5px] font-medium text-muted-foreground/90 leading-tight'>
            {timeRange}
          </span>
        </div>

        {/* Right: Staf Pengganti */}
        <div className='flex items-center justify-end gap-2 min-w-0 flex-1 text-right'>
          <div className='min-w-0 flex-1 space-y-0.5'>
            <span className='text-[9px] font-bold text-muted-foreground/80 tracking-wider uppercase leading-none block'>
              PENGGANTI
            </span>
            {isClaimed || isCompleted ? (
              <>
                <div className='text-xs font-bold text-primary truncate leading-tight'>
                  {opportunity.claimedByName}
                </div>
                {opportunity.claimedByRole && (
                  <div className='text-[10.5px] text-muted-foreground truncate leading-tight'>
                    {opportunity.claimedByRole}
                  </div>
                )}
              </>
            ) : isOpen ? (
              <div className='flex items-center justify-end gap-1 text-amber-600 dark:text-amber-400'>
                <span className='size-1.5 rounded-full bg-amber-500 animate-pulse' />
                <span className='text-[11px] font-bold'>Terbuka</span>
              </div>
            ) : (
              <span className='text-[11px] font-semibold text-rose-500'>Dibatalkan</span>
            )}
          </div>

          {(isClaimed || isCompleted) && (
            <Avatar className='size-8 rounded-lg border border-border/50 shrink-0 shadow-2xs'>
              <AvatarImage
                src={opportunity.claimedByAvatarUrl || DEFAULT_AVATAR_PATH}
                alt={opportunity.claimedByName || 'Pengganti'}
                className='rounded-lg object-cover'
              />
              <AvatarFallback className='rounded-lg p-0 bg-transparent overflow-hidden'>
                <Image
                  src={DEFAULT_AVATAR_PATH}
                  alt={opportunity.claimedByName || 'Pengganti'}
                  width={32}
                  height={32}
                  unoptimized
                  className='size-full rounded-lg object-cover'
                />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
}
