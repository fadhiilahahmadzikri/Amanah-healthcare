import { clientFetch } from '@/lib/client-fetch';

export interface BackendNotification {
  id: string;
  userId?: string;
  title?: string | null;
  body: string;
  category: string;
  priority?: string;
  sourceType?: string | null;
  senderName?: string | null;
  senderRole?: string | null;
  badgeIcon?: string | null;
  metaIcon?: string | null;
  visualKey?: string | null;
  isUrgent?: boolean;
  metadata?: Record<string, unknown> | null;
  isRead?: boolean;
  readAt?: string | null;
  createdAt: string;
  actionUrl?: string | null;
  actions?: Array<{
    id?: string;
    label: string;
    actionKey: string;
    actionType?: string;
    url?: string;
  }>;
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

  async markAsRead(id: string): Promise<{ success: boolean }> {
    return await clientFetch<{ success: boolean }>(`/api/v1/notifications/${id}/read`, {
      method: 'PATCH'
    });
  },

  async markAllAsRead(): Promise<{ success: boolean; updatedCount: number }> {
    return await clientFetch<{ success: boolean; updatedCount: number }>(
      '/api/v1/notifications/read-all',
      { method: 'PATCH' }
    );
  },

  async getVapidPublicKey(): Promise<{ publicKey: string | null }> {
    try {
      return await clientFetch<{ publicKey: string | null }>(
        '/api/v1/notifications/push/public-key'
      );
    } catch {
      return { publicKey: null };
    }
  },

  async subscribePush(payload: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
    platform?: string;
    userAgent?: string;
  }): Promise<{ success: boolean; id: string }> {
    return await clientFetch<{ success: boolean; id: string }>(
      '/api/v1/notifications/push/subscribe',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
  },

  async unsubscribePush(endpoint: string): Promise<{ success: boolean }> {
    return await clientFetch<{ success: boolean }>('/api/v1/notifications/push/unsubscribe', {
      method: 'DELETE',
      body: JSON.stringify({ endpoint })
    });
  }
};
