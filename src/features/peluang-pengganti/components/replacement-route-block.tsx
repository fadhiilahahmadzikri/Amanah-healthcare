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
      className={`flex flex-col w-full min-w-0 select-none my-2 sm:my-2.5 py-0.5 ${className || ''}`}
    >
      <div className='flex items-center justify-between gap-1.5 sm:gap-2.5 min-w-0 w-full'>
        {/* Left: Staf Cuti / Berhalangan */}
        <div className='flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 text-left'>
          <Avatar className='size-7 sm:size-8 rounded-lg border border-border/50 shrink-0 shadow-2xs'>
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
            <span className='text-[9.5px] sm:text-[10px] font-semibold text-muted-foreground/80 leading-none block whitespace-nowrap'>
              Staf cuti
            </span>
            <div
              className='text-[11.5px] sm:text-xs font-bold text-foreground truncate leading-tight'
              title={opportunity.originalStaffName || undefined}
            >
              {opportunity.originalStaffName}
            </div>
            {opportunity.originalStaffRole && (
              <div
                className='text-[10px] sm:text-[10.5px] text-muted-foreground truncate leading-tight'
                title={opportunity.originalStaffRole || undefined}
              >
                {opportunity.originalStaffRole}
              </div>
            )}
          </div>
        </div>

        {/* Center Path Connector with Session & Hours Badge */}
        <div className='flex flex-col items-center justify-center shrink-0 px-0.5 sm:px-1 max-w-[85px] sm:max-w-none'>
          <span className='text-[10px] sm:text-[10.5px] font-bold text-primary tracking-wide leading-tight whitespace-nowrap'>
            {sessionName}
          </span>
          <div className='flex items-center w-full min-w-[36px] sm:min-w-[48px] max-w-[56px] sm:max-w-[76px] justify-center gap-1 text-muted-foreground/60 my-0.5 sm:my-1'>
            <div className='flex-1 h-[1.5px] border-t border-dashed border-border' />
            <Icons.chevronRight className='size-2.5 sm:size-3 text-muted-foreground/70 shrink-0' />
          </div>
          <span className='text-[9px] sm:text-[9.5px] font-medium text-muted-foreground/90 leading-tight whitespace-nowrap'>
            {timeRange}
          </span>
        </div>

        {/* Right: Staf Pengganti */}
        <div className='flex items-center justify-end gap-1.5 sm:gap-2 min-w-0 flex-1 text-right'>
          <div className='min-w-0 flex-1 space-y-0.5'>
            <span className='text-[9.5px] sm:text-[10px] font-semibold text-muted-foreground/80 leading-none block whitespace-nowrap'>
              Pengganti
            </span>
            {isClaimed || isCompleted ? (
              <>
                <div
                  className='text-[11.5px] sm:text-xs font-bold text-primary truncate leading-tight'
                  title={opportunity.claimedByName || undefined}
                >
                  {opportunity.claimedByName}
                </div>
                {opportunity.claimedByRole && (
                  <div
                    className='text-[10px] sm:text-[10.5px] text-muted-foreground truncate leading-tight'
                    title={opportunity.claimedByRole || undefined}
                  >
                    {opportunity.claimedByRole}
                  </div>
                )}
              </>
            ) : isOpen ? (
              <div className='flex items-center justify-end gap-1 text-amber-600 dark:text-amber-400 whitespace-nowrap'>
                <span className='size-1.5 rounded-full bg-amber-500 animate-pulse shrink-0' />
                <span className='text-[10.5px] sm:text-[11px] font-bold'>Terbuka</span>
              </div>
            ) : (
              <span className='text-[10.5px] sm:text-[11px] font-semibold text-rose-500 whitespace-nowrap'>
                Dibatalkan
              </span>
            )}
          </div>

          {(isClaimed || isCompleted) && (
            <Avatar className='size-7 sm:size-8 rounded-lg border border-border/50 shrink-0 shadow-2xs'>
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
