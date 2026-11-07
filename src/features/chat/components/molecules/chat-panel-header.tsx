'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export interface ChatPanelHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Slide-in Panel Header Molecule
 * Clean WhatsApp-style header with back navigation for sub-panels.
 */
export function ChatPanelHeader({
  title,
  subtitle,
  onBack,
  actions,
  className
}: ChatPanelHeaderProps) {
  return (
    <div
      className={cn(
        'h-14 px-3 flex items-center justify-between border-b border-border/60 bg-muted/30 shrink-0 gap-2',
        className
      )}
    >
      <div className='flex items-center gap-2 min-w-0'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          onClick={onBack}
          className='size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 cursor-pointer shrink-0'
          aria-label='Kembali'
          title='Kembali'
        >
          <Icons.arrowLeft className='size-4' />
        </Button>

        <div className='min-w-0 flex flex-col justify-center'>
          <h2 className='text-sm font-semibold text-foreground truncate leading-tight'>
            {title}
          </h2>
          {subtitle && (
            <p className='text-[11px] text-muted-foreground truncate leading-tight mt-0.5'>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && <div className='flex items-center gap-1 shrink-0'>{actions}</div>}
    </div>
  );
}
