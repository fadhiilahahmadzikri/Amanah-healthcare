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
        'space-y-1 text-xs border border-border/70 rounded-2xl p-3 bg-surface-subtle/80 dark:bg-muted/20 shadow-xs',
        className
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          role='button'
          tabIndex={0}
          aria-label={`Ubah data ${item.label}`}
          onClick={() => onJumpToStep(item.step)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onJumpToStep(item.step);
            }
          }}
          className={cn(
            'group/item relative flex flex-col sm:flex-row sm:items-start sm:justify-between py-2.5 px-3 rounded-xl transition-all cursor-pointer select-none border border-border/50 bg-card shadow-2xs gap-1 sm:gap-2',
            'hover:border-primary/40 hover:shadow-xs active:scale-[0.995]'
          )}
        >
          <div className='flex items-center justify-between w-full sm:w-auto gap-2'>
            <span className='text-muted-foreground text-[11px] sm:text-xs shrink-0 group-hover/item:text-foreground transition-colors'>
              {item.label}
            </span>
            <div className='flex items-center gap-1 text-[10.5px] font-medium text-primary sm:hidden'>
              <span>Ubah</span>
              <Icons.arrowRight className='size-2.5 stroke-[2.5]' />
            </div>
          </div>

          <div className='flex items-start gap-2 sm:ml-auto w-full sm:w-auto justify-start sm:justify-end'>
            <div className='hidden sm:flex items-center gap-1 text-[11px] font-semibold text-primary shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 pointer-events-none pt-0.5'>
              <Icons.arrowRight className='size-3 stroke-[2.5]' />
              <span className='text-[10.5px] whitespace-nowrap'>Edit data ini</span>
            </div>

            <span
              className={cn(
                'text-xs text-left sm:text-right w-full sm:w-auto sm:max-w-[260px] break-words leading-snug',
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
