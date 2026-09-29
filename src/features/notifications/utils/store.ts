import { create } from 'zustand';
import { ClinicNotification } from '../types';

interface NotificationState {
  notifications: ClinicNotification[];
  unreadServerCount: number;
  setNotifications: (notifications: ClinicNotification[]) => void;
  setUnreadServerCount: (count: number) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  bulkMarkAsRead: (ids: string[]) => void;
  bulkDelete: (ids: string[]) => void;
  removeNotification: (id: string) => void;
  addNotification: (notification: ClinicNotification) => void;
  resetToDefault: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadServerCount: 0,
  setNotifications: (incoming) =>
    set((state) => {
      const existingMap = new Map(state.notifications.map((n) => [n.id, n]));
      for (const item of incoming) {
        existingMap.set(item.id, item);
      }
      const merged = Array.from(existingMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return { notifications: merged };
    }),
  setUnreadServerCount: (count) => set({ unreadServerCount: Math.max(0, count) }),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, status: 'read' as const } : n
      ),
      unreadServerCount: Math.max(0, state.unreadServerCount - 1)
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        status: 'read' as const
      })),
      unreadServerCount: 0
    })),
  bulkMarkAsRead: (ids) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        ids.includes(n.id) ? { ...n, status: 'read' as const } : n
      ),
      unreadServerCount: Math.max(0, state.unreadServerCount - ids.length)
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
    set((state) => {
      const existing = state.notifications.some((n) => n.id === notification.id);
      if (existing) {
        return {
          notifications: state.notifications.map((n) =>
            n.id === notification.id ? notification : n
          )
        };
      }
      return {
        notifications: [notification, ...state.notifications],
        unreadServerCount:
          notification.status === 'unread' ? state.unreadServerCount + 1 : state.unreadServerCount
      };
    }),
  resetToDefault: () =>
    set({
      notifications: [],
      unreadServerCount: 0
    }),
  unreadCount: () => {
    const s = get();
    if (s.unreadServerCount > 0) return s.unreadServerCount;
    return s.notifications.filter((n) => n.status === 'unread').length;
  }
}));
