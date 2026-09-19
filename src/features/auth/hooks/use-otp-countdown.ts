'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseOtpCountdownOptions {
  storageKey?: string;
  defaultSeconds?: number;
  autoStart?: boolean;
}

export function useOtpCountdown({
  storageKey = 'amanah_otp_cooldown',
  defaultSeconds = 60,
  autoStart = false
}: UseOtpCountdownOptions = {}) {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  // Inisialisasi sisa detik dari sessionStorage agar refresh browser tidak menghapus timer
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const expiry = sessionStorage.getItem(storageKey);
    if (expiry) {
      const remaining = Math.ceil((parseInt(expiry, 10) - Date.now()) / 1000);
      if (remaining > 0) {
        setSecondsLeft(remaining);
      } else {
        sessionStorage.removeItem(storageKey);
        setSecondsLeft(0);
      }
    } else if (autoStart) {
      const expiryTimestamp = Date.now() + defaultSeconds * 1000;
      sessionStorage.setItem(storageKey, expiryTimestamp.toString());
      setSecondsLeft(defaultSeconds);
    }
  }, [storageKey, autoStart, defaultSeconds]);

  // Interval timer tick per detik
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem(storageKey);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, storageKey]);

  // Mulai hitung mundur (misal 60 detik atau nilai dari API retryAfter)
  const startCooldown = useCallback(
    (seconds: number = defaultSeconds) => {
      setSecondsLeft(seconds);
      if (typeof window !== 'undefined') {
        const expiryTimestamp = Date.now() + seconds * 1000;
        sessionStorage.setItem(storageKey, expiryTimestamp.toString());
      }
    },
    [defaultSeconds, storageKey]
  );

  const resetCooldown = useCallback(() => {
    setSecondsLeft(0);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  return {
    secondsLeft,
    isCooldownActive: secondsLeft > 0,
    startCooldown,
    resetCooldown
  };
}
