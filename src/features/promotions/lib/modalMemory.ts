import { ModalFrequency } from '../types/promotions.types';

export const SESSION_MODAL_DISMISSED_KEY = 'promo:modal:session_dismissed';

export function shouldShowModal(
  id: string,
  version: string,
  _frequency: ModalFrequency = 'once_per_session',
): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // 1. Session latch: once visitor closes any promo modal, suppress popups for the active session
    if (window.sessionStorage?.getItem(SESSION_MODAL_DISMISSED_KEY) === 'true') {
      return false;
    }

    // 2. Specific promo item dismissal check in session storage
    const key = `promo:seen:${id}:${version}`;
    const seen = window.sessionStorage?.getItem(key);
    return !seen;
  } catch {
    // If storage is disabled or blocked, degrade gracefully to showing modal
    return true;
  }
}

export function markModalSeen(
  id: string,
  version: string,
  _frequency: ModalFrequency = 'once_per_session',
): void {
  if (typeof window === 'undefined') return;

  try {
    // Lock the session so modals do not pop up again on route changes or refreshes in this session
    window.sessionStorage?.setItem(SESSION_MODAL_DISMISSED_KEY, 'true');

    const key = `promo:seen:${id}:${version}`;
    window.sessionStorage?.setItem(key, Date.now().toString());
  } catch {
    // safe catch for quota exceeded or private mode
  }
}

export function hasSeenModal(
  id: string,
  version: string,
  frequency: ModalFrequency = 'once_per_session',
): boolean {
  return !shouldShowModal(id, version, frequency);
}

export function shouldShowBanner(id: string, version: string): boolean {
  if (typeof window === 'undefined') return true;

  const key = `promo:banner:${id}:${version}`;
  try {
    const dismissed = window.sessionStorage?.getItem(key);
    return !dismissed;
  } catch {
    return true;
  }
}

export function dismissBanner(id: string, version: string): void {
  if (typeof window === 'undefined') return;

  const key = `promo:banner:${id}:${version}`;
  try {
    window.sessionStorage?.setItem(key, 'dismissed');
  } catch {
    // safe catch
  }
}
