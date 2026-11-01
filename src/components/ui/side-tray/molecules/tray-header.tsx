'use client';

import * as React from 'react';
import { Pin, PinOff, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface TrayHeaderProps {
  title?: string;
  totalCount?: number;
  isPinned: boolean;
  onTogglePin?: () => void;
  onClose: () => void;
  showPinButton?: boolean;
  className?: string;
}

export function TrayHeader({
  title = 'Kategori',
  totalCount,
  isPinned,
  onTogglePin,
  onClose,
  showPinButton = true,
  className
}: TrayHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 px-3.5 py-3 border-b border-border/60 shrink-0 select-none bg-card/50',
        className
      )}
    >
      <div className='flex items-center gap-2 min-w-0'>
        <h3 className='text-xs font-semibold text-foreground tracking-tight truncate'>{title}</h3>
        {typeof totalCount === 'number' && (
          <Badge variant='outline' className='text-[10px] font-mono h-4 px-1.5 rounded-full'>
            {totalCount}
          </Badge>
        )}
      </div>

      <div className='flex items-center gap-1 shrink-0'>
        {showPinButton && onTogglePin && (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={onTogglePin}
            className={cn(
              'size-7 rounded-md transition-colors',
              isPinned
                ? 'text-primary bg-primary/10 hover:bg-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
            title={isPinned ? 'Lepas kunci panel' : 'Kunci panel tetap terbuka'}
            aria-label={isPinned ? 'Lepas kunci panel' : 'Kunci panel tetap terbuka'}
          >
            {isPinned ? <PinOff className='size-3.5' /> : <Pin className='size-3.5' />}
          </Button>
        )}

        <Button
          type='button'
          variant='ghost'
          size='icon'
          onClick={onClose}
          className='size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
          title='Tutup panel'
          aria-label='Tutup panel'
        >
          <X className='size-3.5' />
        </Button>
      </div>
    </div>
  );
}
