'use client';

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
 */
export function useChatBadge(options?: UseChatBadgeOptions): UseChatBadgeResult {
  const conversations = useChatStore((state) => state.conversations);

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
  const aggregateCount = conversations.reduce(
    (sum, c) => sum + Math.max(0, c.unreadCount ?? 0),
    0
  );

  return {
    count: aggregateCount,
    hasUnread: aggregateCount > 0
  };
}
