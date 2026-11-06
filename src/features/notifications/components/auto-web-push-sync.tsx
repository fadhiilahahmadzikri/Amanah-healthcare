'use client';

import { useEffect } from 'react';
import { requestImplicitWebPushRegistration } from '../hooks/use-web-push-registration';

function triggerPushOnInteraction() {
  window.removeEventListener('pointerdown', triggerPushOnInteraction);
  window.removeEventListener('keydown', triggerPushOnInteraction);
  void requestImplicitWebPushRegistration();
}

export function AutoWebPushSync() {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window)
    ) {
      return;
    }

    // 1. Jika izin browser sudah 'granted', sinkronkan subscription secara diam-diam di latar belakang
    if (Notification.permission === 'granted') {
      void requestImplicitWebPushRegistration();
      return;
    }

    // 2. Jika izin masih 'default', dengarkan interaksi pengguna pertama kali untuk memicu perizinan native
    if (Notification.permission === 'default') {
      window.addEventListener('pointerdown', triggerPushOnInteraction, {
        once: true,
      });
      window.addEventListener('keydown', triggerPushOnInteraction, {
        once: true,
      });

      return () => {
        window.removeEventListener('pointerdown', triggerPushOnInteraction);
        window.removeEventListener('keydown', triggerPushOnInteraction);
      };
    }
  }, []);

  return null;
}
