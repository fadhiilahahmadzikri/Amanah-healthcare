'use client';

import React from 'react';
import { useNotificationSocket } from '@/features/notifications';
import { ChoreographedNotificationModal } from '@/components/feedback/choreographed-modal';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  useNotificationSocket();
  return (
    <>
      {children}
      <ChoreographedNotificationModal />
    </>
  );
}

