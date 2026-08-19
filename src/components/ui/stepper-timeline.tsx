'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { StepperIconType, StepperTimelineItem } from '@/features/chat/utils/types';

export function StepperNodeIcon({ iconType }: { iconType: StepperIconType }) {
  const baseClasses =
    'size-[26px] rounded-[8px] flex items-center justify-center shrink-0 z-10 border border-black/10 dark:border-white/20 shadow-[inset_0_1px_0.5px_0_rgba(255,255,255,0.45),0_2px_4px_-1px_rgba(0,0,0,0.18),0_1px_2px_0_rgba(0,0,0,0.1)]';

  switch (iconType) {
    case 'lead':
      return (
        <div
          className={cn(
            baseClasses,
            'bg-gradient-to-b from-purple-300 via-purple-500 to-purple-700'
          )}
        >
          <Icons.user className='size-3.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] stroke-[2.2]' />
        </div>
      );
    case 'contact':
      return (
        <div className={cn(baseClasses, 'bg-gradient-to-b from-sky-300 via-blue-500 to-blue-600')}>
          <Icons.chat className='size-3.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] stroke-[2.2]' />
        </div>
      );
    case 'qualified':
      return (
        <div
          className={cn(baseClasses, 'bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600')}
        >
          <Icons.badgeCheck className='size-3.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] stroke-[2.2]' />
        </div>
      );
    case 'booked':
      return (
        <div
          className={cn(baseClasses, 'bg-gradient-to-b from-slate-400 via-slate-600 to-slate-700')}
        >
          <Icons.calendar className='size-3.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] stroke-[2.2]' />
        </div>
      );
    case 'completed':
      return (
        <div
          className={cn(baseClasses, 'bg-gradient-to-b from-blue-400 via-blue-600 to-indigo-700')}
        >
          <Icons.check className='size-3.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] stroke-[2.2]' />
        </div>
      );
    case 'payment':
      return (
        <div
          className={cn(
            baseClasses,
            'bg-gradient-to-b from-emerald-300 via-emerald-500 to-emerald-600'
          )}
        >
          <Icons.billing className='size-3.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] stroke-[2.2]' />
        </div>
      );
    case 'prescription':
      return (
        <div
          className={cn(
            baseClasses,
            'bg-gradient-to-b from-indigo-300 via-indigo-500 to-purple-700'
          )}
        >
          <Icons.post className='size-3.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] stroke-[2.2]' />
        </div>
      );
    case 'doctor':
    default:
      return (
        <div className={cn(baseClasses, 'bg-gradient-to-b from-sky-300 via-blue-500 to-blue-600')}>
          <Icons.stethoscope className='size-3.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] stroke-[2.2]' />
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
            <div className='relative flex flex-col items-center shrink-0 w-[26px]'>
              <StepperNodeIcon iconType={item.iconType} />
              {!isLast && (
                <div className='absolute top-[26px] bottom-0 w-[1.5px] bg-border/80 left-1/2 -translate-x-1/2 z-0' />
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
