'use client';

import { create } from 'zustand';
import type { NotificationModalPayload } from '../types';

interface NotificationModalState {
  isOpen: boolean;
  payload: NotificationModalPayload | null;
  animationKey: number;
  openModal: (payload: NotificationModalPayload) => void;
  closeModal: () => void;
}

let autoCloseTimer: NodeJS.Timeout | null = null;
let lastPayloadFingerprint = '';
let lastPayloadTime = 0;

export const useNotificationModalStore = create<NotificationModalState>((set) => ({
  isOpen: false,
  payload: null,
  animationKey: 0,

  openModal: (payload) => {
    const now = Date.now();
    const fingerprint = `${payload.title}::${payload.identity?.name || ''}::${payload.statusText || ''}`;
    if (fingerprint === lastPayloadFingerprint && now - lastPayloadTime < 3000) {
      return;
    }
    lastPayloadFingerprint = fingerprint;
    lastPayloadTime = now;

    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }

    set((state) => ({
      isOpen: true,
      payload,
      animationKey: state.animationKey + 1
    }));

    const duration = payload.autoCloseDurationMs !== undefined ? payload.autoCloseDurationMs : 8000;
    if (duration !== null && duration > 0) {
      autoCloseTimer = setTimeout(() => {
        set({ isOpen: false });
        autoCloseTimer = null;
      }, duration);
    }
  },

  closeModal: () => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }
    set({ isOpen: false });
  }
}));

export const openNotificationModal = (payload: NotificationModalPayload) => {
  useNotificationModalStore.getState().openModal(payload);
};

export const closeNotificationModal = () => {
  useNotificationModalStore.getState().closeModal();
};
