'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

const STORAGE_KEY = 'amanah_dev_toolboxes_visible';
const STYLE_TAG_ID = 'amanah-hide-dev-toolboxes-style';

/**
 * Global CSS injected to cleanly hide Next.js Dev Indicators, Dev Overlays,
 * and TanStack Query Devtools floating buttons / panels without disrupting layout.
 */
const HIDE_DEV_TOOLS_CSS = `
  /* 1. Hide Next.js Dev Indicator / Dev Overlays / Toast */
  nextjs-portal,
  [data-nextjs-toast],
  [data-nextjs-dev-overlay],
  #__next-build-watcher,
  div[data-nextjs-data-runtime-error],
  div[data-nextjs-toast-wrapper],
  
  /* 2. Hide TanStack React Query Devtools button & panels */
  .tsqd-parent-container,
  button[aria-label*="React Query Devtools"],
  button[aria-label*="TanStack Query Devtools"],
  [class*="ReactQueryDevtools"],
  [data-tanstack-query-devtools] {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }
`;

function applyVisibilityStyles(visible: boolean) {
  if (typeof document === 'undefined') return;

  let styleTag = document.getElementById(STYLE_TAG_ID) as HTMLStyleElement | null;

  if (!visible) {
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = STYLE_TAG_ID;
      styleTag.innerHTML = HIDE_DEV_TOOLS_CSS;
      document.head.appendChild(styleTag);
    }
  } else {
    if (styleTag) {
      styleTag.remove();
    }
  }
}

export interface UseDevtoolsShortcutOptions {
  /**
   * Whether to show toast notification when toggled
   * @default true
   */
  notifyOnToggle?: boolean;
}

/**
 * Custom Hook: Toggle Next.js & TanStack Dev Toolboxes with Ctrl + Q (or Cmd + Q)
 * State is persisted in localStorage.
 */
export function useDevtoolsShortcut(options: UseDevtoolsShortcutOptions = {}) {
  const { notifyOnToggle = true } = options;
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // 1. Initialize from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const val = stored === 'true';
        setIsVisible(val);
        applyVisibilityStyles(val);
      } else {
        setIsVisible(true);
        applyVisibilityStyles(true);
      }
    } catch {
      setIsVisible(true);
      applyVisibilityStyles(true);
    }
  }, []);

  // 2. Toggle handler
  const toggle = useCallback(() => {
    setIsVisible((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      applyVisibilityStyles(next);

      if (notifyOnToggle) {
        if (next) {
          toast.success('🛠️ Dev Toolboxes Ditampilkan', {
            description: 'Tekan Ctrl + Q untuk menyembunyikan',
            duration: 2000
          });
        } else {
          toast.info('🙈 Dev Toolboxes Disembunyikan', {
            description: 'Tekan Ctrl + Q untuk menampilkan kembali',
            duration: 2000
          });
        }
      }

      return next;
    });
  }, [notifyOnToggle]);

  // 3. Global Keyboard Listener for Ctrl + Q / Cmd + Q
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Trigger on Ctrl + Q or Cmd + Q
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [toggle]);

  return {
    isVisible,
    isMounted,
    toggle,
    setIsVisible: (val: boolean) => {
      setIsVisible(val);
      try {
        localStorage.setItem(STORAGE_KEY, String(val));
      } catch {}
      applyVisibilityStyles(val);
    }
  };
}
