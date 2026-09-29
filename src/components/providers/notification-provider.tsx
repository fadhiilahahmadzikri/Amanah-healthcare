'use client';

import React from 'react';
import { useNotificationSocket } from '@/features/notifications';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  useNotificationSocket();
  return <>{children}</>;
}
