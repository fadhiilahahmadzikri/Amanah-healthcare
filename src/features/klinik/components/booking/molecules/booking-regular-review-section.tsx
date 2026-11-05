'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export interface BookingReviewItem {
  step: number;
  label: string;
  value: string;
  valueClass?: string;
}

export interface BookingRegularReviewSectionProps {
  items: BookingReviewItem[];
  onJumpToStep: (step: number) => void;
  className?: string;
}

export function BookingRegularReviewSection({
  items,
  onJumpToStep,
  className
}: BookingRegularReviewSectionProps) {
  return (
    <div
      className={cn(
        'space-y-0.5 text-xs border border-border/80 rounded-2xl p-2 bg-muted/20',
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={item.label}
          role='button'
          tabIndex={0}
          onClick={() => onJumpToStep(item.step)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onJumpToStep(item.step);
            }
          }}
          className={cn(
            'group/item relative flex items-start justify-between py-2 px-2.5 rounded-xl transition-colors cursor-pointer select-none border border-transparent',
            'hover:bg-card hover:border-border/60 hover:shadow-xs active:scale-[0.995]',
            idx < items.length - 1 && 'border-b-border/40'
          )}
        >
          <span className='text-muted-foreground text-[11px] sm:text-xs shrink-0 group-hover/item:text-foreground transition-colors pt-0.5'>
            {item.label}
          </span>

          <div className='flex items-start gap-2 shrink-0 ml-auto pl-2'>
            <div className='flex items-center gap-1 text-[11px] font-semibold text-primary shrink-0 opacity-0 sm:group-hover/item:opacity-100 transition-opacity duration-150 pointer-events-none pt-0.5'>
              <Icons.arrowRight className='size-3 stroke-[2.5]' />
              <span className='text-[10.5px] whitespace-nowrap'>Edit data ini</span>
            </div>

            <span
              className={cn(
                'text-xs text-right max-w-[160px] sm:max-w-[210px] break-words leading-snug',
                item.valueClass
              )}
            >
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
