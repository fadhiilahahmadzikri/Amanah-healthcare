'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

export interface NotificationCenterHeaderProps {
  onMarkAllAsRead: () => void;
  hasNotifications: boolean;
  isMobile?: boolean;
  className?: string;
}

export function NotificationCenterHeader({
  onMarkAllAsRead,
  hasNotifications,
  isMobile = false,
  className
}: NotificationCenterHeaderProps) {
  const content = (
    <div className='flex items-center justify-between gap-3 w-full'>
      <div className='flex flex-col space-y-0.5 text-left'>
        <h4 className='text-base sm:text-xl font-bold tracking-tight text-foreground'>
          Notifikasi Klinik
        </h4>
        {isMobile && (
          <p className='text-xs text-muted-foreground'>
            Pembaruan status operasional dan antrean pasien
          </p>
        )}
      </div>

      <Button
        type='button'
        variant='ghost'
        size='sm'
        disabled={!hasNotifications}
        className='h-auto p-0 text-xs sm:text-sm font-semibold text-primary hover:text-primary/90 hover:bg-transparent cursor-pointer shrink-0'
        onClick={onMarkAllAsRead}
      >
        <Icons.checks className='mr-1 size-3.5 sm:size-4' />
        Tandai semua dibaca
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <DrawerHeader className={cn('pb-3 pt-2 px-4 border-b border-border/50 shrink-0 text-left', className)}>
        <DrawerTitle className='sr-only'>Notifikasi Klinik</DrawerTitle>
        <DrawerDescription className='sr-only'>
          Pusat pemberitahuan dan notifikasi operasional klinik
        </DrawerDescription>
        {content}
      </DrawerHeader>
    );
  }

  return (
    <div
      className={cn(
        'px-5 pt-5 pb-4 border-b border-border/50 shrink-0 select-none',
        className
      )}
    >
      {content}
    </div>
  );
}
