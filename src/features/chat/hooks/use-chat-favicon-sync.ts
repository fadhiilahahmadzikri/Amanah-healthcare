'use client';

import { useEffect, useRef } from 'react';
import { useChatBadge } from './use-chat-badge';

/**
 * Hook to synchronize browser document.title and tab favicon with chat unread count.
 * Displays (N) in document title and badge on favicon when unread messages exist.
 * Automatically restores original title and favicon when count drops to 0 or on unmount.
 */
export function useChatFaviconSync(baseTitle = 'Chat - Amanah Clinic') {
  const { count, hasUnread } = useChatBadge();
  const originalTitleRef = useRef<string | null>(null);
  const originalFaviconHrefRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    if (!originalTitleRef.current) {
      originalTitleRef.current = document.title || baseTitle;
    }

    const faviconLink = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (faviconLink && !originalFaviconHrefRef.current) {
      originalFaviconHrefRef.current = faviconLink.href;
    }

    const base = originalTitleRef.current.replace(/^\(\d+\+?\)\s*/, '');

    if (hasUnread && count > 0) {
      const displayCount = count > 99 ? '99+' : String(count);
      document.title = `(${displayCount}) ${base}`;

      if (faviconLink) {
        // Generate SVG badge favicon data URI
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="15" fill="#059669" />
            <text x="16" y="21" font-size="13" font-weight="bold" fill="white" text-anchor="middle" font-family="system-ui, sans-serif">${displayCount}</text>
          </svg>
        `.trim();
        faviconLink.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
      }
    } else {
      document.title = base;
      if (faviconLink && originalFaviconHrefRef.current) {
        faviconLink.href = originalFaviconHrefRef.current;
      }
    }

    return () => {
      if (originalTitleRef.current) {
        document.title = originalTitleRef.current.replace(/^\(\d+\+?\)\s*/, '');
      }
      if (faviconLink && originalFaviconHrefRef.current) {
        faviconLink.href = originalFaviconHrefRef.current;
      }
    };
  }, [count, hasUnread, baseTitle]);
}
