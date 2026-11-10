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
    <div
      className={`flex flex-col w-full min-w-0 select-none my-2.5 sm:my-3 py-1 min-h-[58px] justify-center ${className || ''}`}
    >
      <div className='flex items-center justify-between gap-1.5 sm:gap-2 min-w-0 w-full'>
        {/* Left: Staf Cuti / Berhalangan */}
        <div className='flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 text-left'>
          <Avatar className='size-7 sm:size-[30px] rounded-lg border border-border/50 shrink-0 shadow-2xs'>
            <AvatarImage
              src={opportunity.originalStaffAvatarUrl || DEFAULT_AVATAR_PATH}
              alt={opportunity.originalStaffName || 'Staf Cuti'}
              className='rounded-lg object-cover'
            />
            <AvatarFallback className='rounded-lg p-0 bg-transparent overflow-hidden'>
              <Image
                src={DEFAULT_AVATAR_PATH}
                alt={opportunity.originalStaffName || 'Staf Cuti'}
                width={30}
                height={30}
                unoptimized
                className='size-full rounded-lg object-cover'
              />
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0 flex-1 space-y-0.5'>
            <span className='text-[9px] sm:text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground/75 leading-none block whitespace-nowrap'>
              Staf cuti
            </span>
            <div
              className='text-[11px] sm:text-[11.5px] font-bold text-foreground truncate leading-snug'
              title={opportunity.originalStaffName || undefined}
            >
              {opportunity.originalStaffName}
            </div>
            {opportunity.originalStaffRole && (
              <div
                className='text-[9.5px] sm:text-[10px] text-muted-foreground/80 truncate leading-tight'
                title={opportunity.originalStaffRole || undefined}
              >
                {opportunity.originalStaffRole}
              </div>
            )}
          </div>
        </div>

        {/* Center Path Connector with Session & Hours Badge */}
        <div className='flex flex-col items-center justify-center shrink-0 px-1 sm:px-1.5 max-w-[85px] sm:max-w-[95px]'>
          <span className='text-[9.5px] sm:text-[10px] font-bold text-primary tracking-wide leading-tight whitespace-nowrap'>
            {sessionName}
          </span>
          <div className='flex items-center w-full min-w-[28px] sm:min-w-[36px] max-w-[48px] sm:max-w-[60px] justify-center gap-0.5 text-muted-foreground/60 my-0.5'>
            <div className='flex-1 h-[1.5px] border-t border-dashed border-border' />
            <Icons.chevronRight className='size-2.5 sm:size-3 text-muted-foreground/70 shrink-0' />
          </div>
          <span className='text-[8.5px] sm:text-[9px] font-medium text-muted-foreground/80 leading-tight whitespace-nowrap'>
            {timeRange}
          </span>
        </div>

        {/* Right: Staf Pengganti */}
        <div className='flex items-center justify-end gap-1.5 sm:gap-2 min-w-0 flex-1 text-right'>
          <div className='min-w-0 flex-1 space-y-0.5'>
            <span className='text-[9px] sm:text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground/75 leading-none block whitespace-nowrap'>
              Pengganti
            </span>
            {isClaimed || isCompleted ? (
              <>
                <div
                  className='text-[11px] sm:text-[11.5px] font-bold text-primary truncate leading-snug'
                  title={opportunity.claimedByName || undefined}
                >
                  {opportunity.claimedByName}
                </div>
                {opportunity.claimedByRole && (
                  <div
                    className='text-[9.5px] sm:text-[10px] text-muted-foreground/80 truncate leading-tight'
                    title={opportunity.claimedByRole || undefined}
                  >
                    {opportunity.claimedByRole}
                  </div>
                )}
              </>
            ) : isOpen ? (
              <div className='flex items-center justify-end gap-1 text-amber-600 dark:text-amber-400 whitespace-nowrap pt-0.5'>
                <span className='size-1.5 rounded-full bg-amber-500 animate-pulse shrink-0' />
                <span className='text-[10px] sm:text-[10.5px] font-bold'>Terbuka</span>
              </div>
            ) : (
              <span className='text-[10px] sm:text-[10.5px] font-semibold text-rose-500 whitespace-nowrap pt-0.5'>
                Dibatalkan
              </span>
            )}
          </div>

          {(isClaimed || isCompleted) && (
            <Avatar className='size-7 sm:size-[30px] rounded-lg border border-border/50 shrink-0 shadow-2xs'>
              <AvatarImage
                src={opportunity.claimedByAvatarUrl || DEFAULT_AVATAR_PATH}
                alt={opportunity.claimedByName || 'Pengganti'}
                className='rounded-lg object-cover'
              />
              <AvatarFallback className='rounded-lg p-0 bg-transparent overflow-hidden'>
                <Image
                  src={DEFAULT_AVATAR_PATH}
                  alt={opportunity.claimedByName || 'Pengganti'}
                  width={30}
                  height={30}
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
