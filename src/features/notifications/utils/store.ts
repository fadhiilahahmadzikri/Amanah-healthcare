import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ClinicNotification } from '../types';
import initialData from '../data/clinic-notifications.json';

interface NotificationState {
  notifications: ClinicNotification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  bulkMarkAsRead: (ids: string[]) => void;
  bulkDelete: (ids: string[]) => void;
  removeNotification: (id: string) => void;
  addNotification: (notification: ClinicNotification) => void;
  resetToDefault: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: initialData as ClinicNotification[],
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, status: 'read' as const } : n
          )
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            status: 'read' as const
          }))
        })),
      bulkMarkAsRead: (ids) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            ids.includes(n.id) ? { ...n, status: 'read' as const } : n
          )
        })),
      bulkDelete: (ids) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => !ids.includes(n.id))
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id)
        })),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications]
        })),
      resetToDefault: () =>
        set({
          notifications: initialData as ClinicNotification[]
        }),
      unreadCount: () => get().notifications.filter((n) => n.status === 'unread').length
    }),
    {
      name: 'amanah_notifications_v1',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
