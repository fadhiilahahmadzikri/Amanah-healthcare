'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { StepperIconType, StepperTimelineItem } from '@/features/chat/utils/types';

export function StepperNodeIcon({ iconType }: { iconType: StepperIconType }) {
  switch (iconType) {
    case 'lead':
      return (
        <div className='size-[22px] rounded-[6px] bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-xs z-10'>
          <Icons.user className='size-3 text-white' />
        </div>
      );
    case 'contact':
      return (
        <div className='size-[22px] rounded-[6px] bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs z-10'>
          <Icons.chat className='size-3 text-white' />
        </div>
      );
    case 'qualified':
      return (
        <div className='size-[22px] rounded-[6px] bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs z-10'>
          <Icons.badgeCheck className='size-3 text-white' />
        </div>
      );
    case 'booked':
      return (
        <div className='size-[22px] rounded-[6px] bg-zinc-700 dark:bg-zinc-600 text-white flex items-center justify-center shrink-0 shadow-xs z-10'>
          <Icons.calendar className='size-3 text-white' />
        </div>
      );
    case 'completed':
      return (
        <div className='size-[22px] rounded-[6px] bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs z-10'>
          <Icons.check className='size-3 text-white' />
        </div>
      );
    case 'payment':
      return (
        <div className='size-[22px] rounded-[6px] bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs z-10'>
          <Icons.billing className='size-3 text-white' />
        </div>
      );
    case 'prescription':
      return (
        <div className='size-[22px] rounded-[6px] bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs z-10'>
          <Icons.post className='size-3 text-white' />
        </div>
      );
    case 'doctor':
    default:
      return (
        <div className='size-[22px] rounded-[6px] bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs z-10'>
          <Icons.stethoscope className='size-3 text-white' />
        </div>
      );
  }
}

interface StepperTimelineProps {
  items: StepperTimelineItem[];
  onActionClick?: (item: StepperTimelineItem) => void;
  className?: string;
}

export function StepperTimeline({ items, onActionClick, className }: StepperTimelineProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className={cn('flex flex-col space-y-0 pt-1', className)}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={item.id} className='relative flex items-stretch gap-3'>
            {/* Stepper Node Icon & Vertical Connector Line */}
            <div className='relative flex flex-col items-center shrink-0 w-[22px]'>
              <StepperNodeIcon iconType={item.iconType} />
              {!isLast && (
                <div className='absolute top-[22px] bottom-0 w-[1px] bg-border left-1/2 -translate-x-1/2 z-0' />
              )}
            </div>

            {/* Stepper Content */}
            <div
              className={cn('flex-1 min-w-0 flex flex-col justify-start', isLast ? 'pb-1' : 'pb-4')}
            >
              <div className='flex items-baseline justify-between gap-1'>
                <span className='text-[11px] font-semibold text-foreground leading-tight truncate'>
                  {item.title}
                </span>
                <span className='text-[10px] text-muted-foreground font-normal shrink-0 ml-1'>
                  {item.date}
                </span>
              </div>

              <div className='flex items-center gap-1.5 mt-0.5'>
                {item.hasUserAvatar && item.userAvatar && (
                  <Avatar className='size-3.5 rounded-full shrink-0'>
                    <AvatarImage src={item.userAvatar} alt='' />
                    <AvatarFallback className='text-[7px]'>
                      {item.subtitle.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <span className='text-[10px] text-muted-foreground leading-tight truncate'>
                  {item.subtitle}
                </span>
              </div>

              {item.hasAction && (
                <div className='mt-1.5'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => onActionClick?.(item)}
                    className='h-5 px-2 text-[9.5px] font-medium gap-1 rounded-[5px] bg-background hover:bg-muted shadow-2xs'
                  >
                    <Icons.view className='size-3 text-muted-foreground' />
                    <span>{item.actionLabel || 'Lihat Detail'}</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
