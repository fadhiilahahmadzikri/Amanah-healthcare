'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationApiService } from '../api/notification-api-service';
import { mapBackendToClinicNotification } from '../utils/notification-mapper';
import { useNotificationStore } from '../utils/store';
import type { ClinicNotification } from '../types';

export interface UseNotificationCenterResult {
  open: boolean;
  notifications: ClinicNotification[];
  unreadTotal: number;
  isLoading: boolean;
  actions: {
    setOpen: (open: boolean) => void;
    close: () => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
  };
}

export function useNotificationCenter(): UseNotificationCenterResult {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const {
    notifications,
    unreadCount,
    setNotifications,
    setUnreadServerCount,
    markAsRead: markAsReadStore,
    markAllAsRead: markAllAsReadStore
  } = useNotificationStore();

  const unreadQuery = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationApiService.getUnreadCount(),
    staleTime: 10_000
  });

  const listQuery = useQuery({
    queryKey: ['notifications', 'me'],
    queryFn: () => notificationApiService.getMyNotifications({ limit: 50 }),
    staleTime: 10_000
  });

  useEffect(() => {
    if (unreadQuery.data?.unreadCount !== undefined) {
      setUnreadServerCount(unreadQuery.data.unreadCount);
    }
  }, [unreadQuery.data?.unreadCount, setUnreadServerCount]);

  useEffect(() => {
    if (listQuery.data?.data) {
      const mapped = listQuery.data.data.map(mapBackendToClinicNotification);
      setNotifications(mapped);
    }
  }, [listQuery.data?.data, setNotifications]);

  const handleMarkAsRead = async (id: string) => {
    markAsReadStore(id);
    try {
      await notificationApiService.markAsRead(id);
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    } catch {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  };

  const handleMarkAllAsRead = async () => {
    markAllAsReadStore();
    try {
      await notificationApiService.markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    } catch {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  };

  return {
    open,
    notifications,
    unreadTotal: unreadCount(),
    isLoading: listQuery.isLoading,
    actions: {
      setOpen,
      close: () => setOpen(false),
      markAsRead: handleMarkAsRead,
      markAllAsRead: handleMarkAllAsRead
    }
  };
}
