import { beforeEach, describe, expect, it } from 'bun:test';
import {
  dismissBanner,
  markModalSeen,
  SESSION_MODAL_DISMISSED_KEY,
  shouldShowBanner,
  shouldShowModal,
} from '../modalMemory';

describe('modalMemory & bannerMemory (deterministic & persistent)', () => {
  let mockLocal: Record<string, string> = {};
  let mockSession: Record<string, string> = {};

  beforeEach(() => {
    mockLocal = {};
    mockSession = {};

    // Mock isolated window storage instances
    (globalThis as unknown as { window: unknown }).window = {
      localStorage: {
        getItem: (k: string) => mockLocal[k] || null,
        setItem: (k: string, v: string) => {
          mockLocal[k] = v;
        },
        removeItem: (k: string) => {
          delete mockLocal[k];
        },
      },
      sessionStorage: {
        getItem: (k: string) => mockSession[k] || null,
        setItem: (k: string, v: string) => {
          mockSession[k] = v;
        },
        removeItem: (k: string) => {
          delete mockSession[k];
        },
      },
    };
  });

  it('shows modal when never seen before', () => {
    expect(shouldShowModal('promo-1', 'v1')).toBe(true);
  });

  it('does not show modal when seen in current active session', () => {
    markModalSeen('promo-1', 'v1');
    expect(shouldShowModal('promo-1', 'v1')).toBe(false);
  });

  it('locks modal across route changes and refreshes in the active session once dismissed', () => {
    markModalSeen('promo-1', 'v1');
    // Session latch is locked
    expect(mockSession[SESSION_MODAL_DISMISSED_KEY]).toBe('true');
    // Even if checking another promo or updated version during this active session, user is not spammed
    expect(shouldShowModal('promo-2', 'v1')).toBe(false);
    expect(shouldShowModal('promo-1', 'v2')).toBe(false);
  });

  it('reappears on a subsequent session when tab/browser is closed and reopened', () => {
    // Session 1: user saw and dismissed promo-1 v1
    markModalSeen('promo-1', 'v1');
    expect(shouldShowModal('promo-1', 'v1')).toBe(false);

    // Simulate new session (browser restart / tab closed and reopened -> sessionStorage dropped)
    mockSession = {};

    // In the new session, modal reappears immediately (e-commerce re-engagement)
    expect(shouldShowModal('promo-1', 'v1')).toBe(true);
  });

  it('manages banner dismissal per session and reappears on new session', () => {
    expect(shouldShowBanner('banner-1', 'v1')).toBe(true);
    dismissBanner('banner-1', 'v1');
    expect(shouldShowBanner('banner-1', 'v1')).toBe(false);

    // Persists in sessionStorage across route changes and refreshes
    expect(mockSession['promo:banner:banner-1:v1']).toBe('dismissed');

    // New session (browser reopened -> sessionStorage cleared) restores banner display
    mockSession = {};
    expect(shouldShowBanner('banner-1', 'v1')).toBe(true);
  });
});
