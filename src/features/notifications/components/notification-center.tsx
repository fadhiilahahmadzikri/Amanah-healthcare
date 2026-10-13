'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { useNotificationPresenter } from '../model/useNotificationPresenter';
import { NotificationCenterHeader } from './notification-center-header';
import { NotificationCenterList } from './notification-center-list';
import { NotificationCenterFooter } from './notification-center-footer';
import { useIsMobile } from '@/hooks/use-mobile';

export function NotificationCenter() {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = React.useState(false);
  const presenter = useNotificationPresenter();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const triggerButton = (
    <Button
      variant='ghost'
      size='icon'
      className='relative cursor-pointer'
      aria-label='Notifikasi Klinik'
    >
      <Icons.notification className='size-5' />
      {presenter.unreadBadgeText && (
        <Badge
          variant='destructive'
          className='absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full p-0 text-[10px] font-mono font-bold'
        >
          {presenter.unreadBadgeText}
        </Badge>
      )}
    </Button>
  );

  // Responsive Paradigm: Swipeable bottom Drawer on Mobile, Popover on Desktop
  if (mounted && isMobile) {
    return (
      <Drawer open={presenter.open} onOpenChange={presenter.setOpen}>
        <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
        <DrawerContent className='h-[85vh] max-h-[85vh] flex flex-col font-sans p-0 overflow-hidden'>
          {/* 1. Header Component */}
          <NotificationCenterHeader
            onMarkAllAsRead={presenter.markAllAsRead}
            hasNotifications={presenter.hasNotifications}
            isMobile
          />

          {/* 2. Scrollable Content List Component (Scrollable on Mobile) */}
          <NotificationCenterList
            notifications={presenter.notifications}
            hasNotifications={presenter.hasNotifications}
            loadingActionId={presenter.loadingActionId}
            onMarkAsRead={presenter.markAsRead}
            onAction={presenter.handleCardAction}
          />

          {/* 3. Footer Component */}
          <NotificationCenterFooter onClose={presenter.close} isMobile />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={presenter.open} onOpenChange={presenter.setOpen}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent
        align='end'
        className='w-full sm:w-[500px] h-[540px] p-0 rounded-2xl shadow-xl flex flex-col font-sans overflow-hidden'
      >
        {/* 1. Header Component */}
        <NotificationCenterHeader
          onMarkAllAsRead={presenter.markAllAsRead}
          hasNotifications={presenter.hasNotifications}
        />

        {/* 2. Scrollable Content List Component */}
        <NotificationCenterList
          notifications={presenter.notifications}
          hasNotifications={presenter.hasNotifications}
          loadingActionId={presenter.loadingActionId}
          onMarkAsRead={presenter.markAsRead}
          onAction={presenter.handleCardAction}
        />

        {/* 3. Footer Component */}
        <NotificationCenterFooter onClose={presenter.close} />
      </PopoverContent>
    </Popover>
  );
}
