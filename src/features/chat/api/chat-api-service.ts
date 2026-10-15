import { clientFetch } from '@/lib/client-fetch';
import type {
  ChatMessage,
  Conversation,
  ConversationListResponse,
  MessageListResponse
} from '../utils/types';

export const chatApiService = {
  // --- Admin Endpoints ---
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

  async closeConversation(conversationId: string): Promise<Conversation> {
    return clientFetch<Conversation>(`/api/v1/admin/chat/conversations/${conversationId}/close`, {
      method: 'PATCH'
    });
  },

  // --- Patient & Guest Endpoints ---
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
