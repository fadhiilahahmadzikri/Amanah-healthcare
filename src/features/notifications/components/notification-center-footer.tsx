'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DrawerFooter } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

export interface NotificationCenterFooterProps {
  onClose: () => void;
  isMobile?: boolean;
  className?: string;
}

export function NotificationCenterFooter({
  onClose,
  isMobile = false,
  className
}: NotificationCenterFooterProps) {
  const content = (
    <div className='flex items-center justify-between w-full'>
      <Link
        href='/dashboard/notifications'
        className='text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-1'
        onClick={onClose}
      >
        Kelola notifikasi
      </Link>
      <Button
        type='button'
        size='card-action'
        shape='pill'
        className='bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs text-xs'
        asChild
      >
        <Link href='/dashboard/notifications' onClick={onClose}>
          Lihat semua notifikasi
        </Link>
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <DrawerFooter className={cn('pt-2.5 pb-4 px-4 border-t border-border/50 shrink-0 bg-background', className)}>
        {content}
      </DrawerFooter>
    );
  }

  return (
    <div
      className={cn(
        'border-t border-border/50 p-4 shrink-0 bg-background select-none',
        className
      )}
    >
      {content}
    </div>
  );
}
