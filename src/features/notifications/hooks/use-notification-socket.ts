'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { getAccessToken } from '@/lib/api-client';
import type { BackendNotification } from '../api/notification-api-service';

export interface AppointmentCalledPayload {
  appointmentId: string;
  queueNumber: string;
  patientName: string;
  callCount: number;
  poliName: string;
  doctorName: string;
  room: string;
}

export function useNotificationSocket(callbacks?: {
  onNewNotification?: (notification: BackendNotification) => void;
  onAppointmentCalled?: (payload: AppointmentCalledPayload) => void;
}) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = getAccessToken() || localStorage.getItem('amanah_token');
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
      'http://localhost:3001';

    const socket: Socket = io(baseUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: { token: token ? `Bearer ${token}` : undefined },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    socketRef.current = socket;

    socket.on('notification:new', (notification: BackendNotification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'me'] });
      callbacks?.onNewNotification?.(notification);
    });

    socket.on('notification:read', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'me'] });
    });

    socket.on('notification:unread_count', ({ count }: { count: number }) => {
      queryClient.setQueryData(['notifications', 'unread-count'], { unreadCount: count });
    });

    socket.on('appointment:called', (payload: AppointmentCalledPayload) => {
      queryClient.invalidateQueries({ queryKey: ['queue', 'daily'] });
      callbacks?.onAppointmentCalled?.(payload);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [queryClient, callbacks]);

  return {
    socket: socketRef.current
  };
}
