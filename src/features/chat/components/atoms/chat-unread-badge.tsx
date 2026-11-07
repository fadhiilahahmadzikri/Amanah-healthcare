'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useChatBadge, type UseChatBadgeOptions } from '../../hooks/use-chat-badge';

export interface ChatUnreadBadgeProps extends UseChatBadgeOptions {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  max?: number;
  /**
   * If true, renders a dot without text counting (e.g. for collapsed rail nav)
   */
  dotOnly?: boolean;
}

const sizeClasses: Record<NonNullable<ChatUnreadBadgeProps['size']>, string> = {
  sm: 'h-4 min-w-[16px] px-1 text-[10px]',
  default: 'h-5 min-w-[20px] px-1.5 text-xs',
  lg: 'h-6 min-w-[24px] px-2 text-sm'
};

/**
 * Atomic Chat Unread Badge
 * Manifests the single source of truth for chat unread pill bubbles across the monorepo.
 * Automatically resolves count (per-conversation, per-user, explicit, or global aggregate).
 * Completely disappears (returns null) when count is 0.
 */
export function ChatUnreadBadge({
  conversationId,
  userId,
  count: explicitCount,
  className,
  size = 'default',
  max = 99,
  dotOnly = false
}: ChatUnreadBadgeProps) {
  const { count, hasUnread } = useChatBadge({
    conversationId,
    userId,
    count: explicitCount
  });

  if (!hasUnread) {
    return null;
  }

  if (dotOnly) {
    return (
      <span
        aria-label="Pesan belum dibaca"
        className={cn(
          'inline-block h-2.5 w-2.5 rounded-full bg-emerald-600 dark:bg-emerald-500 ring-2 ring-background animate-in zoom-in-50',
          className
        )}
      />
    );
  }

  const displayCount = count > max ? `${max}+` : String(count);

  return (
    <span
      aria-label={`${displayCount} pesan belum dibaca`}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold tabular-nums leading-none text-white',
        'bg-emerald-600 dark:bg-emerald-500 shadow-xs transition-all duration-200 animate-in zoom-in-50',
        sizeClasses[size],
        className
      )}
    >
      {displayCount}
    </span>
  );
}
