'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useViewer } from '@/features/notifications/hooks/use-viewer';
import { AUDIENCE } from '@/core/auth/permissions.constants';
import { chatApiService } from '../api/chat-api-service';
import { useChatStore } from '../utils/store';

export interface UseChatBadgeOptions {
  conversationId?: string;
  userId?: string;
  count?: number;
}

export interface UseChatBadgeResult {
  count: number;
  hasUnread: boolean;
}

/**
 * Unified Chat Unread Counting Hook
 * Manifests agnostic counting logic across any layer:
 * - Specific conversation (via conversationId)
 * - Specific user (via userId)
 * - Explicit count override (via count)
 * - Global aggregate across all conversations (when no options provided)
 *   Integrates server-backed unread query with real-time websocket invalidation so
 *   the sidebar badge reflects accurate counts immediately on application load.
 */
export function useChatBadge(options?: UseChatBadgeOptions): UseChatBadgeResult {
  const queryClient = useQueryClient();
  const viewer = useViewer();
  const conversations = useChatStore((state) => state.conversations);

  const isGlobal = !options?.conversationId && !options?.userId && typeof options?.count !== 'number';
  const isInternal = viewer.audience === AUDIENCE.INTERNAL;

  const { data: summary } = useQuery({
    queryKey: ['admin', 'chat', 'unread-count'],
    queryFn: () => chatApiService.getAdminUnreadSummary(),
    enabled: isGlobal && isInternal,
    staleTime: 30_000
  });

  // Real-time invalidation on incoming clinic chat messages
  useEffect(() => {
    if (!isGlobal || !isInternal || typeof window === 'undefined') return;

    const handleMessage = () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'chat', 'unread-count'] });
    };

    window.addEventListener('clinic:chat_message', handleMessage);
    return () => {
      window.removeEventListener('clinic:chat_message', handleMessage);
    };
  }, [isGlobal, isInternal, queryClient]);

  if (typeof options?.count === 'number') {
    const safeCount = Math.max(0, options.count);
    return { count: safeCount, hasUnread: safeCount > 0 };
  }

  if (options?.conversationId) {
    const conv = conversations.find((c) => c.id === options.conversationId);
    const count = Math.max(0, conv?.unreadCount ?? 0);
    return { count, hasUnread: count > 0 };
  }

  if (options?.userId) {
    const conv = conversations.find(
      (c) => c.userId === options.userId || c.patientId === options.userId
    );
    const count = Math.max(0, conv?.unreadCount ?? 0);
    return { count, hasUnread: count > 0 };
  }

  // Global aggregate count across all conversations
  // When in-memory active conversations are loaded, prioritize real-time local sum
  const storeCount = conversations.reduce(
    (sum, c) => sum + Math.max(0, c.unreadCount ?? 0),
    0
  );

  const aggregateCount = conversations.length > 0 ? storeCount : (summary?.totalUnread ?? 0);

  return {
    count: aggregateCount,
    hasUnread: aggregateCount > 0
  };
}
