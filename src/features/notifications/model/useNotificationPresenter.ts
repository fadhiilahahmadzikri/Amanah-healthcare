'use client';

import { useMemo, useCallback } from 'react';
import { useNotificationCenter } from './useNotificationCenter';
import { useNotificationAction } from '../hooks/use-notification-action';
import type { ClinicNotification } from '../types';
import type { ActionType, NotificationAction } from '@/components/ui/notification-card';

export interface FormattedClinicNotification extends ClinicNotification {
  cardActions?: NotificationAction[];
}

export interface UseNotificationPresenterResult {
  open: boolean;
  setOpen: (open: boolean) => void;
  close: () => void;
  notifications: FormattedClinicNotification[];
  hasNotifications: boolean;
  unreadTotal: number;
  unreadBadgeText: string | null;
  loadingActionId?: string;
  markAllAsRead: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  handleCardAction: (
    notificationId: string,
    actionId: string,
    actionType: ActionType,
    notification: ClinicNotification
  ) => Promise<void>;
}

export function useNotificationPresenter(): UseNotificationPresenterResult {
  const { open, notifications, unreadTotal, actions } = useNotificationCenter();
  const { handleAction, loadingActionId } = useNotificationAction();

  const formattedNotifications = useMemo<FormattedClinicNotification[]>(() => {
    return notifications.map((notification) => {
      const cardActions: NotificationAction[] | undefined = notification.actions?.map((act) => ({
        id: act.id,
        label: act.label,
        type: 'redirect' as const,
        style: act.type === 'primary' ? 'primary' : 'default'
      }));

      return {
        ...notification,
        cardActions
      };
    });
  }, [notifications]);

  const handleCardAction = useCallback(
    async (
      notificationId: string,
      actionId: string,
      actionType: ActionType,
      notification: ClinicNotification
    ) => {
      await handleAction(
        notificationId,
        actionId,
        actionType,
        () => actions.close(),
        notification
      );
    },
    [handleAction, actions]
  );

  const unreadBadgeText = useMemo(() => {
    if (unreadTotal <= 0) return null;
    return unreadTotal > 99 ? '99+' : String(unreadTotal);
  }, [unreadTotal]);

  return {
    open,
    setOpen: actions.setOpen,
    close: actions.close,
    notifications: formattedNotifications,
    hasNotifications: formattedNotifications.length > 0,
    unreadTotal,
    unreadBadgeText,
    loadingActionId,
    markAllAsRead: actions.markAllAsRead,
    markAsRead: actions.markAsRead,
    handleCardAction
  };
}
