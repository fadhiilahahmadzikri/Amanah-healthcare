'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { chatApiService } from '../api/chat-api-service';
import { useChatStore } from '../utils/store';
import type { ChatMessage } from '../utils/types';
import { emitAdminSocketEvent } from '@/features/notifications/hooks/use-notification-socket';

export function useAdminChat() {
  const queryClient = useQueryClient();
  const {
    conversations,
    selectedConversationId,
    setConversations,
    setMessages,
    appendMessage,
    updateConversationStatus,
    setLoading,
    setError
  } = useChatStore();

  const [isClientTyping, setIsClientTyping] = useState(false);
  const clientTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const adminTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch conversations list
  const {
    data: conversationData,
    isLoading: isLoadingConversations,
    refetch: refetchConversations
  } = useQuery({
    queryKey: ['admin', 'chat', 'conversations'],
    queryFn: async () => {
      const res = await chatApiService.getAdminConversations();
      return res.data || res.items || [];
    }
  });

  useEffect(() => {
    if (conversationData) {
      setConversations(conversationData);
    }
  }, [conversationData, setConversations]);

  useEffect(() => {
    setLoading(isLoadingConversations);
  }, [isLoadingConversations, setLoading]);

  // 2. Join conversation room on selection, leave on deselect/unmount
  useEffect(() => {
    if (!selectedConversationId) return;

    emitAdminSocketEvent('chat:join', { conversationId: selectedConversationId });

    return () => {
      emitAdminSocketEvent('chat:leave', { conversationId: selectedConversationId });
      setIsClientTyping(false);
      if (clientTypingTimeoutRef.current) {
        clearTimeout(clientTypingTimeoutRef.current);
      }
    };
  }, [selectedConversationId]);

  // 3. Listen for real-time incoming chat messages via Event-Driven Architecture (zero polling)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleRealtimeChatMessage = (event: CustomEvent<ChatMessage>) => {
      const message = event.detail;
      if (!message || !message.conversationId) return;

      appendMessage(message.conversationId, message);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'chat', 'conversations'] });

      if (message.conversationId === selectedConversationId) {
        setIsClientTyping(false);
        if (clientTypingTimeoutRef.current) {
          clearTimeout(clientTypingTimeoutRef.current);
        }
      }
    };

    window.addEventListener('clinic:chat_message', handleRealtimeChatMessage as EventListener);

    return () => {
      window.removeEventListener('clinic:chat_message', handleRealtimeChatMessage as EventListener);
    };
  }, [appendMessage, queryClient, selectedConversationId]);

  // 4. Listen for real-time typing events from patient / guest
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleRealtimeTyping = (
      event: CustomEvent<{
        conversationId: string;
        senderRole: string;
        isTyping: boolean;
      }>
    ) => {
      const detail = event.detail;
      if (!detail || detail.conversationId !== selectedConversationId) return;
      if (detail.senderRole === 'admin') return;

      if (detail.isTyping) {
        setIsClientTyping(true);
        if (clientTypingTimeoutRef.current) {
          clearTimeout(clientTypingTimeoutRef.current);
        }
        clientTypingTimeoutRef.current = setTimeout(() => {
          setIsClientTyping(false);
        }, 3500);
      } else {
        setIsClientTyping(false);
        if (clientTypingTimeoutRef.current) {
          clearTimeout(clientTypingTimeoutRef.current);
        }
      }
    };

    window.addEventListener('clinic:chat_typing', handleRealtimeTyping as EventListener);

    return () => {
      window.removeEventListener('clinic:chat_typing', handleRealtimeTyping as EventListener);
      if (clientTypingTimeoutRef.current) {
        clearTimeout(clientTypingTimeoutRef.current);
      }
    };
  }, [selectedConversationId]);

  // 5. Send debounced typing event from admin
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!selectedConversationId) return;

      emitAdminSocketEvent('chat:typing', {
        conversationId: selectedConversationId,
        isTyping
      });

      if (isTyping) {
        if (adminTypingTimeoutRef.current) {
          clearTimeout(adminTypingTimeoutRef.current);
        }
        adminTypingTimeoutRef.current = setTimeout(() => {
          emitAdminSocketEvent('chat:typing', {
            conversationId: selectedConversationId,
            isTyping: false
          });
        }, 1500);
      }
    },
    [selectedConversationId]
  );

  // 6. Fetch messages for active conversation
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['admin', 'chat', 'messages', selectedConversationId],
    queryFn: async () => {
      if (!selectedConversationId) return [];
      const res = await chatApiService.getAdminConversationMessages(selectedConversationId);
      return res.data || res.items || [];
    },
    enabled: Boolean(selectedConversationId)
  });

  useEffect(() => {
    if (selectedConversationId && messagesData) {
      setMessages(selectedConversationId, messagesData);
    }
  }, [selectedConversationId, messagesData, setMessages]);

  // 7. Send message mutation
  const sendMutation = useMutation({
    mutationFn: async ({ conversationId, body }: { conversationId: string; body: string }) => {
      return chatApiService.sendAdminMessage(conversationId, body);
    },
    onSuccess: (savedMessage: ChatMessage) => {
      appendMessage(savedMessage.conversationId, savedMessage);
      queryClient.invalidateQueries({ queryKey: ['admin', 'chat', 'conversations'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      toast.error(`Gagal mengirim pesan: ${msg}`);
      setError(msg);
    }
  });

  const handleSendMessage = useCallback(
    (text: string) => {
      if (!selectedConversationId || !text.trim()) return;
      sendTyping(false);
      sendMutation.mutate({ conversationId: selectedConversationId, body: text.trim() });
    },
    [selectedConversationId, sendMutation, sendTyping]
  );

  // 8. Close conversation mutation
  const closeMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return chatApiService.closeConversation(conversationId);
    },
    onSuccess: (_, conversationId) => {
      updateConversationStatus(conversationId, 'closed');
      toast.success('Percakapan berhasil ditutup.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'chat', 'conversations'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      toast.error(`Gagal menutup percakapan: ${msg}`);
    }
  });

  const handleCloseConversation = useCallback(
    (conversationId: string) => {
      closeMutation.mutate(conversationId);
    },
    [closeMutation]
  );

  return {
    conversations,
    selectedConversationId,
    isLoading: isLoadingConversations || isLoadingMessages,
    isClientTyping,
    sendMessage: handleSendMessage,
    sendTyping,
    closeConversation: handleCloseConversation,
    refetchConversations
  };
}
