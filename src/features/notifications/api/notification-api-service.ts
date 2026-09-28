import { clientFetch } from '@/lib/client-fetch';

export interface BackendNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  category: 'appointment' | 'schedule' | 'presence' | 'system' | string;
  priority: 'low' | 'normal' | 'high' | 'urgent' | string;
  metadata?: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  actionUrl?: string | null;
}

export interface NotificationListResponse {
  data: BackendNotification[];
  total: number;
  unreadCount: number;
  limit: number;
  offset: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export const notificationApiService = {
  async getUnreadCount(): Promise<UnreadCountResponse> {
    try {
      return await clientFetch<UnreadCountResponse>('/api/v1/notifications/unread-count');
    } catch {
      return { unreadCount: 0 };
    }
  },

  async getMyNotifications(params?: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  }): Promise<NotificationListResponse> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.unreadOnly !== undefined) query.set('unreadOnly', String(params.unreadOnly));

    const qs = query.toString();
    const endpoint = `/api/v1/notifications/me${qs ? `?${qs}` : ''}`;
    return await clientFetch<NotificationListResponse>(endpoint);
  },

  async markAsRead(id: string): Promise<{ success: boolean; unreadCount: number }> {
    return await clientFetch<{ success: boolean; unreadCount: number }>(
      `/api/v1/notifications/${id}/read`,
      { method: 'PATCH' }
    );
  }
};
