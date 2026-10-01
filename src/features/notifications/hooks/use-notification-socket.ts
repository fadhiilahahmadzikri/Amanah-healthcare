'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { appointmentKeys } from '@/features/appointment-pasien/api/query-keys';
import { klinikKeys } from '@/features/klinik/api/query-keys';
import { doctorScheduleKeys } from '@/features/jadwal-dokter/api/query-keys';
import { SCHEDULE_QUERY_KEYS } from '@/features/jadwal-dokter/constants/schedule-shift.constants';
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
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
      'http://localhost:3001';

    const socket: Socket = io(baseUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    const reconcile = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'me'] });
    };

    socket.on('connect', reconcile);
    socket.io.on('reconnect', reconcile);

    socket.on('notification:new', (notification: BackendNotification) => {
      reconcile();
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: klinikKeys.all });
      queryClient.invalidateQueries({ queryKey: doctorScheduleKeys.all });
      queryClient.invalidateQueries({ queryKey: [SCHEDULE_QUERY_KEYS.SCHEDULES] });
      queryClient.invalidateQueries({ queryKey: [SCHEDULE_QUERY_KEYS.APPOINTMENTS] });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('clinic:notification_received', { detail: notification })
        );
      }
      if (notification?.title) {
        toast.info(notification.title, {
          description: notification.body || undefined
        });
      }
      callbacksRef.current?.onNewNotification?.(notification);
    });

    socket.on('notification:read', (data?: { id?: string; all?: boolean }) => {
      reconcile();
    });

    socket.on('notification:unread_count', (data: { count?: number; unreadCount?: number }) => {
      const count = data.unreadCount ?? data.count ?? 0;
      queryClient.setQueryData(['notifications', 'unread-count'], { unreadCount: count });
    });

    socket.on('appointment:called', (payload: AppointmentCalledPayload) => {
      queryClient.invalidateQueries({ queryKey: ['queue', 'daily'] });
      callbacksRef.current?.onAppointmentCalled?.(payload);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [queryClient]);

  return {
    socket: socketRef.current
  };
}
