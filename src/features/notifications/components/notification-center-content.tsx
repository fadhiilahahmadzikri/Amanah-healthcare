'use client';

import React from 'react';
import { NotificationCenterHeader } from './notification-center-header';
import { NotificationCenterList } from './notification-center-list';
import { NotificationCenterFooter } from './notification-center-footer';
import type { FormattedClinicNotification } from '../model/useNotificationPresenter';
import type { ClinicNotification } from '../types';
import type { ActionType } from '@/components/ui/notification-card';
import { cn } from '@/lib/utils';

export interface NotificationCenterContentProps {
  notifications: FormattedClinicNotification[];
  hasNotifications: boolean;
  loadingActionId?: string;
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  onAction: (
    notificationId: string,
    actionId: string,
    actionType: ActionType,
    notification: ClinicNotification
  ) => void;
  onClose: () => void;
  isMobile?: boolean;
  className?: string;
}

export function NotificationCenterContent({
  notifications,
  hasNotifications,
  loadingActionId,
  onMarkAllAsRead,
  onMarkAsRead,
  onAction,
  onClose,
  isMobile = false,
  className
}: NotificationCenterContentProps) {
  return (
    <div className={cn('flex flex-col h-full min-h-0 font-sans select-none', className)}>
      <NotificationCenterHeader
        onMarkAllAsRead={onMarkAllAsRead}
        hasNotifications={hasNotifications}
        isMobile={isMobile}
      />
      <NotificationCenterList
        notifications={notifications}
        hasNotifications={hasNotifications}
        loadingActionId={loadingActionId}
        onMarkAsRead={onMarkAsRead}
        onAction={onAction}
      />
      <NotificationCenterFooter onClose={onClose} isMobile={isMobile} />
    </div>
  );
}
