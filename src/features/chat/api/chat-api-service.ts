import { clientFetch } from '@/lib/client-fetch';
import type {
  ChatCandidateResponse,
  ChatMessage,
  ChatUnreadSummary,
  Conversation,
  ConversationListResponse,
  MessageListResponse
} from '../utils/types';

export const chatApiService = {
  // --- Admin Endpoints ---
  async getCandidates(search?: string): Promise<ChatCandidateResponse> {
    return clientFetch<ChatCandidateResponse>('/api/v1/admin/chat/candidates', {
      method: 'GET',
      query: search ? { search } : undefined
    });
  },

  async createAdminConversation(userId: string): Promise<Conversation> {
    return clientFetch<Conversation>('/api/v1/admin/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  },

  async getAdminConversations(params?: {
    status?: string;
    awaitingReply?: boolean;
    search?: string;
    cursor?: string;
    limit?: number;
  }): Promise<ConversationListResponse> {
    return clientFetch<ConversationListResponse>('/api/v1/admin/chat/conversations', {
      method: 'GET',
      query: params as Record<string, unknown>
    });
  },

  async getAdminConversationMessages(
    conversationId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<MessageListResponse> {
    return clientFetch<MessageListResponse>(
      `/api/v1/admin/chat/conversations/${conversationId}/messages`,
      {
        method: 'GET',
        query: params as Record<string, unknown>
      }
    );
  },

  async sendAdminMessage(
    conversationId: string,
    body: string,
    clientMessageId?: string
  ): Promise<ChatMessage> {
    const id = clientMessageId || (typeof crypto !== 'undefined' ? crypto.randomUUID() : undefined);
    return clientFetch<ChatMessage>(`/api/v1/admin/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body, clientMessageId: id })
    });
  },

  async getAdminUnreadSummary(): Promise<ChatUnreadSummary> {
    return clientFetch<ChatUnreadSummary>('/api/v1/admin/chat/unread-count', {
      method: 'GET'
    });
  },

  async markAdminConversationAsRead(conversationId: string): Promise<{ success: boolean }> {
    return clientFetch<{ success: boolean }>(
      `/api/v1/admin/chat/conversations/${conversationId}/read`,
      {
        method: 'PATCH'
      }
    );
  },

  // --- Patient & Guest Endpoints ---
  async getCustomerConversations(guestId?: string): Promise<Conversation[]> {
    return clientFetch<Conversation[]>('/api/v1/chat/conversations', {
      method: 'GET',
      query: guestId ? { guestId } : undefined
    });
  },

  async getOrCreateConversation(data?: {
    guestId?: string;
    name?: string;
    email?: string;
  }): Promise<Conversation> {
    return clientFetch<Conversation>('/api/v1/chat/conversations', {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  },

  async getPatientMessages(
    conversationId: string,
    params?: { guestId?: string; cursor?: string; limit?: number }
  ): Promise<MessageListResponse> {
    return clientFetch<MessageListResponse>(
      `/api/v1/chat/conversations/${conversationId}/messages`,
      {
        method: 'GET',
        query: params as Record<string, unknown>
      }
    );
  },

  async sendPatientMessage(
    conversationId: string,
    body: string,
    guestId?: string,
    clientMessageId?: string
  ): Promise<ChatMessage> {
    const id = clientMessageId || (typeof crypto !== 'undefined' ? crypto.randomUUID() : undefined);
    return clientFetch<ChatMessage>(`/api/v1/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body, guestId, clientMessageId: id })
    });
  },

  async getPresence(): Promise<{ adminOnline: boolean }> {
    return clientFetch<{ adminOnline: boolean }>('/api/v1/chat/presence', {
      method: 'GET'
    });
  },

  async getRealtimeTicket(guestId?: string): Promise<{ ticket: string; expiresInSec: number }> {
    return clientFetch<{ ticket: string; expiresInSec: number }>('/api/v1/chat/realtime-ticket', {
      method: 'POST',
      body: JSON.stringify({ guestId })
    });
  }
};
