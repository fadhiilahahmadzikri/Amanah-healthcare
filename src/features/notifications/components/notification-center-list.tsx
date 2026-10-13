'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { EmptyState } from '@/components/ui/empty-state';
import { NotificationCard, type ActionType } from '@/components/ui/notification-card';
import type { FormattedClinicNotification } from '../model/useNotificationPresenter';
import type { ClinicNotification } from '../types';
import { cn } from '@/lib/utils';

export interface NotificationCenterListProps {
  notifications: FormattedClinicNotification[];
  hasNotifications: boolean;
  loadingActionId?: string;
  onMarkAsRead: (id: string) => void;
  onAction: (
    notificationId: string,
    actionId: string,
    actionType: ActionType,
    notification: ClinicNotification
  ) => void;
  className?: string;
}

export function NotificationCenterList({
  notifications,
  hasNotifications,
  loadingActionId,
  onMarkAsRead,
  onAction,
  className
}: NotificationCenterListProps) {
  return (
    <div
      data-vaul-no-drag
      className={cn(
        'flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y select-none',
        className
      )}
    >
      {hasNotifications ? (
        <div className='flex flex-col divide-y divide-border/20'>
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              id={notification.id}
              title={notification.title}
              body={notification.body}
              user={{
                name: notification.sender,
                avatar: notification.avatar
              }}
              category={notification.category}
              status={notification.status}
              createdAt={notification.createdAt}
              actions={notification.cardActions}
              loadingActionId={loadingActionId}
              onAction={(_id, actionId, actionType) => {
                onAction(notification.id, actionId, actionType, notification);
              }}
              onMarkAsRead={onMarkAsRead}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Icons.notification}
          title='Tidak ada notifikasi'
          description='Belum ada notifikasi baru saat ini.'
          className='min-h-[260px] sm:min-h-[340px] border-0 bg-transparent'
        />
      )}
    </div>
  );
}
