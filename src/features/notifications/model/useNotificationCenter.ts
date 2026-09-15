'use client';

import { useMemo, useState } from 'react';
import { useNotificationStore } from '../utils/store';
import type { ClinicNotification } from '../types';

type NotificationCenterTab = 'all' | 'Janji Temu' | 'Promo' | 'Hasil Lab';

interface NotificationCategoryCount {
  all: number;
  janjiTemu: number;
  promo: number;
  lab: number;
}

export interface UseNotificationCenterResult {
  open: boolean;
  activeTab: NotificationCenterTab;
  notifications: ClinicNotification[];
  filteredNotifications: ClinicNotification[];
  unreadTotal: number;
  categoriesCount: NotificationCategoryCount;
  actions: {
    setOpen: (open: boolean) => void;
    changeTab: (tab: string) => void;
    close: () => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
  };
}

export function useNotificationCenter(): UseNotificationCenterResult {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationCenterTab>('all');
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((notification) => {
        if (activeTab === 'all') {
          return true;
        }

        return notification.category?.toLowerCase() === activeTab.toLowerCase();
      }),
    [activeTab, notifications]
  );

  const categoriesCount = useMemo(
    () => ({
      all: notifications.length,
      janjiTemu: notifications.filter((notification) => notification.category === 'Janji Temu')
        .length,
      promo: notifications.filter((notification) => notification.category === 'Promo').length,
      lab: notifications.filter((notification) => notification.category === 'Hasil Lab').length
    }),
    [notifications]
  );

  return {
    open,
    activeTab,
    notifications,
    filteredNotifications,
    unreadTotal: unreadCount(),
    categoriesCount,
    actions: {
      setOpen,
      changeTab: (tab) => setActiveTab(toNotificationCenterTab(tab)),
      close: () => setOpen(false),
      markAsRead,
      markAllAsRead
    }
  };
}

function toNotificationCenterTab(tab: string): NotificationCenterTab {
  if (tab === 'Janji Temu' || tab === 'Promo' || tab === 'Hasil Lab') {
    return tab;
  }

  return 'all';
}
