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

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setIsLoading(false);
        return false;
      }

      const { publicKey } = await notificationApiService.getVapidPublicKey();
      if (!publicKey) {
        setIsLoading(false);
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
        setIsLoading(false);
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

      setIsSubscribed(true);
      setIsLoading(false);
      return true;
    } catch {
      setIsLoading(false);
      return false;
    }
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
