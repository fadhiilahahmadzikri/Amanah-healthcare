import { describe, expect, it } from 'bun:test';
import { useNotificationStore } from '../utils/store';

describe('NotificationStore - Live State', () => {
  it('deduplicates notifications by id and computes unread count accurately', () => {
    const store = useNotificationStore.getState();
    store.resetToDefault();

    store.addNotification({
      id: 'notif-1',
      title: 'Pendaftaran Selesai',
      sender: 'Sistem Pendaftaran',
      roleSubtitle: 'Sistem',
      avatar: '/avatar.png',
      badgeIcon: 'bell',
      timeAgo: 'Baru saja',
      dateFull: '29 Sep 2026',
      body: 'Pendaftaran selesai',
      category: 'Janji Temu',
      status: 'unread',
      metaIcon: 'calendar',
      createdAt: '2026-09-29T12:00:00Z'
    });

    expect(store.unreadCount()).toBe(1);

    store.addNotification({
      id: 'notif-1',
      title: 'Pendaftaran Selesai Updated',
      sender: 'Sistem Pendaftaran',
      roleSubtitle: 'Sistem',
      avatar: '/avatar.png',
      badgeIcon: 'bell',
      timeAgo: 'Baru saja',
      dateFull: '29 Sep 2026',
      body: 'Pendaftaran selesai updated',
      category: 'Janji Temu',
      status: 'unread',
      metaIcon: 'calendar',
      createdAt: '2026-09-29T12:00:00Z'
    });

    expect(useNotificationStore.getState().notifications.length).toBe(1);
    expect(useNotificationStore.getState().notifications[0].title).toBe(
      'Pendaftaran Selesai Updated'
    );

    store.markAsRead('notif-1');
    expect(useNotificationStore.getState().unreadCount()).toBe(0);
    expect(useNotificationStore.getState().notifications[0].status).toBe('read');
  });
});
