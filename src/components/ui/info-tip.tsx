'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface InfoTipProps {
  children: React.ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function InfoTip({ children, className, side = 'top' }: InfoTipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          className={cn(
            'inline-flex items-center justify-center text-muted-foreground/70 hover:text-foreground transition-colors cursor-help p-0.5 rounded-full hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            className
          )}
          aria-label='Informasi bantuan'
        >
          <Icons.info className='size-3.5' />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className='max-w-[260px] text-[11px] leading-relaxed p-2 font-normal'
      >
        {children}
      </TooltipContent>
    </Tooltip>
  );
}
