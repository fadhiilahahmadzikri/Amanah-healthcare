'use client';

import { useState, useEffect, useCallback } from 'react';
import { notificationApiService } from '../api/notification-api-service';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Autonomous helper to request and register Web Push notification implicitly in the background.
 * Triggers browser permission natively and saves subscription without requiring UI banners.
 */
export async function requestImplicitWebPushRegistration(): Promise<boolean> {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window) ||
    !('Notification' in window)
  ) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return false;
    }

    const { publicKey } = await notificationApiService.getVapidPublicKey();
    if (!publicKey) {
      return false;
    }

    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const convertedKey = urlBase64ToUint8Array(publicKey);
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey
      });
    }

    const jsonSub = sub.toJSON();
    if (!jsonSub.endpoint || !jsonSub.keys?.p256dh || !jsonSub.keys?.auth) {
      return false;
    }

    await notificationApiService.subscribePush({
      endpoint: jsonSub.endpoint,
      keys: {
        p256dh: jsonSub.keys.p256dh,
        auth: jsonSub.keys.auth
      },
      platform: 'web',
      userAgent: navigator.userAgent
    });

    return true;
  } catch {
    return false;
  }
}

export function useWebPushRegistration() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    ) {
      setIsSupported(true);

      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => {
          setIsSubscribed(Boolean(sub));
        })
        .catch(() => {
          setIsSubscribed(false);
        });
    }
  }, []);

  const subscribePush = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    setIsLoading(true);
    const ok = await requestImplicitWebPushRegistration();
    setIsSubscribed(ok);
    setIsLoading(false);
    return ok;
  }, [isSupported]);

  const unsubscribePush = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    setIsLoading(true);

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await notificationApiService.unsubscribePush(endpoint);
      }
      setIsSubscribed(false);
      setIsLoading(false);
      return true;
    } catch {
      setIsLoading(false);
      return false;
    }
  }, [isSupported]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribePush,
    unsubscribePush
  };
}
