import { create } from 'zustand';
import type { ChatMessage, Conversation, ConversationStatus } from './types';

interface ChatState {
  conversations: Conversation[];
  selectedConversationId: string;
  activeMessages: Record<string, ChatMessage[]>;
  adminOnline: boolean;
  isLoading: boolean;
  error: string | null;

  setConversations: (conversations: Conversation[]) => void;
  selectConversation: (id: string) => void;
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  appendMessage: (conversationId: string, message: ChatMessage) => void;
  setAdminOnline: (online: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateConversationStatus: (id: string, status: ConversationStatus) => void;
  getActiveConversation: () => Conversation | undefined;
  getActiveMessages: () => ChatMessage[];
}

export const useChatStore = create<ChatState>()((set, get) => ({
  conversations: [],
  selectedConversationId: '',
  activeMessages: {},
  adminOnline: false,
  isLoading: false,
  error: null,

  setConversations: (conversations) => {
    const currentSelected = get().selectedConversationId;
    const exists = conversations.some((c) => c.id === currentSelected);
    set({
      conversations,
      selectedConversationId: exists
        ? currentSelected
        : conversations.length > 0
          ? conversations[0].id
          : ''
    });
  },

  selectConversation: (id) =>
    set((state) => ({
      selectedConversationId: id,
      conversations: state.conversations.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    })),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      activeMessages: {
        ...state.activeMessages,
        [conversationId]: messages
      }
    })),

  appendMessage: (conversationId, message) =>
    set((state) => {
      const existing = state.activeMessages[conversationId] || [];
      const alreadyHas = existing.some((m) => m.id === message.id);
      const updatedMessages = alreadyHas ? existing : [...existing, message];

      const updatedConversations = state.conversations.map((c) => {
        if (c.id !== conversationId) return c;
        const isActive = state.selectedConversationId === conversationId;
        return {
          ...c,
          lastMessageAt: message.createdAt,
          lastMessagePreview: message.body,
          awaitingReply: message.senderRole === 'customer',
          unreadCount: isActive ? 0 : (c.unreadCount || 0) + 1
        };
      });

      return {
        activeMessages: {
          ...state.activeMessages,
          [conversationId]: updatedMessages
        },
        conversations: updatedConversations
      };
    }),

  setAdminOnline: (adminOnline) => set({ adminOnline }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  updateConversationStatus: (id, status) =>
    set((state) => ({
      conversations: state.conversations.map((c) => (c.id === id ? { ...c, status } : c))
    })),

  getActiveConversation: () => {
    const state = get();
    return state.conversations.find((c) => c.id === state.selectedConversationId);
  },

  getActiveMessages: () => {
    const state = get();
    return state.activeMessages[state.selectedConversationId] || [];
  }
}));
