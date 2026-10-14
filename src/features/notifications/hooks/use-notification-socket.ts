'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { appointmentKeys } from '@/features/appointment-pasien/api/query-keys';
import { klinikKeys } from '@/features/klinik/api/query-keys';
import { doctorScheduleKeys } from '@/features/jadwal-dokter/api/query-keys';
import { SCHEDULE_QUERY_KEYS } from '@/features/jadwal-dokter/constants/schedule-shift.constants';
import { clientFetch } from '@/lib/client-fetch';
import { useViewer } from './use-viewer';
import type { BackendNotification } from '../api/notification-api-service';
import type { NotificationEnvelopeV2 } from '../types';
import { executeNotificationAction } from '../utils/notification-action-dispatcher';

export interface AppointmentCalledPayload {
  appointmentId: string;
  queueNumber: string;
  patientName: string;
  callCount: number;
  poliName: string;
  doctorName: string;
  room: string;
}

export type RealtimeConnectionStatus =
  | 'idle'
  | 'fetching_ticket'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'failed_auth';

/**
 * Returns icon element for backend badgeIcon string.
 * Strictly no fallback: returns undefined if backend did not supply badgeIcon.
 */
function renderBackendIcon(badgeIcon?: string | null): React.ReactNode {
  if (!badgeIcon) return undefined;
  switch (badgeIcon) {
    case 'calendar':
    case 'calendar-check':
      return React.createElement(Icons.calendar, { className: 'size-4 text-primary' });
    case 'user-plus':
    case 'user':
      return React.createElement(Icons.user, { className: 'size-4 text-primary' });
    case 'stethoscope':
      return React.createElement(Icons.stethoscope, { className: 'size-4 text-primary' });
    case 'bell':
      return React.createElement(Icons.notification, { className: 'size-4 text-primary' });
    case 'clock':
      return React.createElement(Icons.clock, { className: 'size-4 text-primary' });
    case 'check-circle':
    case 'check':
      return React.createElement(Icons.check, { className: 'size-4 text-primary' });
    case 'alert-circle':
      return React.createElement(Icons.alertCircle, { className: 'size-4 text-destructive' });
    case 'gift':
      return React.createElement(Icons.gift, { className: 'size-4 text-primary' });
    case 'flask':
      return React.createElement(Icons.flask, { className: 'size-4 text-primary' });
    case 'activity':
      return React.createElement(Icons.activity, { className: 'size-4 text-primary' });
    case 'pill':
      return React.createElement(Icons.pill, { className: 'size-4 text-primary' });
    case 'video':
      return React.createElement(Icons.video, { className: 'size-4 text-primary' });
    default:
      return undefined;
  }
}

/**
 * Request a short-lived single-use ticket via BFF for WebSocket handshake.
 * Eliminates cross-origin cookie dependence and avoids raw credential exposure.
 */
async function fetchRealtimeTicket(): Promise<string | null> {
  try {
    const res = await clientFetch<{ ticket: string; expiresInSec: number }>(
      '/api/v1/realtime/ticket',
      { method: 'POST' }
    );
    return res?.ticket ?? null;
  } catch (err) {
    console.warn('[RealtimeTransport] Ticket issuance via BFF failed:', err);
    return null;
  }
}

export function useNotificationSocket(callbacks?: {
  onNewNotification?: (notification: BackendNotification | NotificationEnvelopeV2) => void;
  onAppointmentCalled?: (payload: AppointmentCalledPayload) => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { userId: currentUserId, role: userRole, audience: viewerAudience } = useViewer();
  const socketRef = useRef<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<RealtimeConnectionStatus>('idle');
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // LRU dedupe cache for recently presented toast IDs (prevents double toasts from re-renders or StrictMode)
  const presentedToastIdsRef = useRef<Set<string>>(new Set());

  const reconcile = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    queryClient.invalidateQueries({ queryKey: ['notifications', 'me'] });
    queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    queryClient.invalidateQueries({ queryKey: klinikKeys.all });
    queryClient.invalidateQueries({ queryKey: ['queue', 'daily'] });
    queryClient.invalidateQueries({ queryKey: doctorScheduleKeys.all });
    queryClient.invalidateQueries({ queryKey: [SCHEDULE_QUERY_KEYS.SCHEDULES] });
    queryClient.invalidateQueries({ queryKey: [SCHEDULE_QUERY_KEYS.APPOINTMENTS] });
  }, [queryClient]);

  // Main WebSocket Connection Lifecycle
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!currentUserId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConnectionStatus('idle');
      return;
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3001'
        : '');

    if (!baseUrl) {
      console.error(
        '[RealtimeTransport] Configuration error: NEXT_PUBLIC_SOCKET_URL is missing in production'
      );
      setConnectionStatus('failed_auth');
      return;
    }

    setConnectionStatus('fetching_ticket');

    const socket: Socket = io(baseUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 2000,
      auth: async (cb) => {
        setConnectionStatus('fetching_ticket');
        const ticket = await fetchRealtimeTicket();
        if (ticket) {
          setConnectionStatus('connecting');
          cb({ ticket });
        } else {
          // If ticket fetch failed, attempt fallback handshake
          cb({});
        }
      }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionStatus('connected');
      console.log(
        `[RealtimeTransport] Connected as user ${currentUserId} (${viewerAudience}) [socket=${socket.id}]`
      );
      // Catch-up on initial connect and reconnects
      reconcile();
    });

    socket.io.on('reconnect', () => {
      setConnectionStatus('connected');
      console.log(`[RealtimeTransport] Reconnected [socket=${socket.id}]`);
      reconcile();
    });

    socket.on('connect_error', (err: Error) => {
      console.warn(`[RealtimeTransport] Connect error (${err.message})`);
      if (err.message.includes('AUTH_TICKET') || err.message.includes('TICKET_')) {
        setConnectionStatus('failed_auth');
      } else {
        setConnectionStatus('disconnected');
      }
    });

    socket.on('disconnect', (reason: string) => {
      setConnectionStatus('disconnected');
      console.log(`[RealtimeTransport] Disconnected: ${reason}`);
    });

    socket.on('notification:new', (envelope: NotificationEnvelopeV2 | BackendNotification) => {
      // 1. Data Store Synchronization (always process for inbox & counters)
      reconcile();
      void queryClient.refetchQueries({ queryKey: doctorScheduleKeys.all, type: 'active' });
      void queryClient.refetchQueries({
        queryKey: [SCHEDULE_QUERY_KEYS.SCHEDULES],
        type: 'active'
      });
      void queryClient.refetchQueries({ queryKey: appointmentKeys.all, type: 'active' });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('clinic:notification_received', { detail: envelope }));
      }

      // Notify subscribers
      callbacksRef.current?.onNewNotification?.(envelope);

      // 2. Fail-Closed Presenter Rules for Toaster
      const envelopeRecipient =
        'recipientUserId' in envelope ? envelope.recipientUserId : envelope.userId;
      const envelopeAudience = 'audience' in envelope ? envelope.audience : undefined;
      const presentationToast = 'presentation' in envelope ? envelope.presentation?.toast : true;

      // Rule A: Recipient mismatch tripwire
      if (envelopeRecipient && envelopeRecipient !== currentUserId) {
        console.warn(
          `[NotificationPresenter] Tripwire: recipientUserId mismatch. Dropped toast. (envelope=${envelopeRecipient}, session=${currentUserId})`
        );
        return;
      }

      // Rule B: Audience mismatch tripwire
      if (envelopeAudience && envelopeAudience !== viewerAudience) {
        console.warn(
          `[NotificationPresenter] Tripwire: audience mismatch. Dropped toast. (envelopeAudience=${envelopeAudience}, viewerAudience=${viewerAudience})`
        );
        return;
      }

      // Rule C: Toast suppressed (e.g. actor performed the action, local mutation toast already shown)
      if (presentationToast === false) {
        return;
      }

      // Rule D: Deduplication check (prevents double toasts from socket replay or duplicate events)
      if (envelope.id) {
        if (presentedToastIdsRef.current.has(envelope.id)) {
          return;
        }
        presentedToastIdsRef.current.add(envelope.id);
        // Keep LRU size bounded to 100 entries
        if (presentedToastIdsRef.current.size > 100) {
          const firstItem = presentedToastIdsRef.current.values().next().value;
          if (firstItem) presentedToastIdsRef.current.delete(firstItem);
        }
      }

      // Rule E: Present Toast with Semantic Action
      if (envelope?.title) {
        const primaryAction =
          ('action' in envelope && envelope.action) ||
          ('actions' in envelope && envelope.actions?.[0]) ||
          undefined;

        const toastAction = primaryAction
          ? {
              label: primaryAction.label || 'Lihat',
              onClick: () => {
                executeNotificationAction(router, primaryAction, envelope as any, userRole);
              }
            }
          : undefined;

        toast(envelope.title, {
          description: envelope.body || undefined,
          icon: renderBackendIcon(envelope.badgeIcon),
          action: toastAction,
          duration: 6000
        });
      }
    });

    socket.on('notification:read', (_data?: { id?: string; all?: boolean }) => {
      reconcile();
    });

    socket.on('notification:unread_count', (data: { count?: number; unreadCount?: number }) => {
      const count = data.unreadCount ?? data.count ?? 0;
      queryClient.setQueryData(['notifications', 'unread-count'], { unreadCount: count });
    });

    const handleAppointmentCalled = (payload: AppointmentCalledPayload) => {
      reconcile();
      void queryClient.refetchQueries({ queryKey: appointmentKeys.all, type: 'active' });
      void queryClient.refetchQueries({
        queryKey: [SCHEDULE_QUERY_KEYS.SCHEDULES],
        type: 'active'
      });
      callbacksRef.current?.onAppointmentCalled?.(payload);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('clinic:appointment_updated', { detail: payload }));
      }
    };

    const handleAppointmentStatusChanged = (payload: unknown) => {
      reconcile();
      void queryClient.refetchQueries({ queryKey: appointmentKeys.all, type: 'active' });
      void queryClient.refetchQueries({
        queryKey: [SCHEDULE_QUERY_KEYS.SCHEDULES],
        type: 'active'
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('clinic:appointment_updated', { detail: payload }));
      }
    };

    const handleQueueEstimatesUpdated = (payload?: unknown) => {
      reconcile();
      void queryClient.refetchQueries({ queryKey: appointmentKeys.all, type: 'active' });
      void queryClient.refetchQueries({
        queryKey: [SCHEDULE_QUERY_KEYS.SCHEDULES],
        type: 'active'
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('clinic:appointment_updated', { detail: payload }));
      }
    };

    const handleChatMessage = (payload: unknown) => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('clinic:chat_message', { detail: payload }));
      }
    };

    const handleChatTyping = (payload: unknown) => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('clinic:chat_typing', { detail: payload }));
      }
    };

    const handleOutgoingSocketEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ event: string; data: unknown }>;
      if (socket && customEvent.detail?.event) {
        socket.emit(customEvent.detail.event, customEvent.detail.data);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('clinic:emit_socket', handleOutgoingSocketEvent);
    }

    socket.on('appointment:called', handleAppointmentCalled);
    socket.on('appointment.patient_called', handleAppointmentCalled);
    socket.on('appointment:status_changed', handleAppointmentStatusChanged);
    socket.on('appointment.status_changed', handleAppointmentStatusChanged);
    socket.on('queue:estimates:updated', handleQueueEstimatesUpdated);
    socket.on('chat:message', handleChatMessage);
    socket.on('chat:typing', handleChatTyping);

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('clinic:emit_socket', handleOutgoingSocketEvent);
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUserId, userRole, viewerAudience, queryClient, router, reconcile]);

  // Fallback Polling: When socket is not connected, poll lightly every 25s
  useEffect(() => {
    if (!currentUserId) return;
    if (connectionStatus === 'connected') return;

    const interval = setInterval(() => {
      reconcile();
    }, 25_000);

    return () => clearInterval(interval);
  }, [currentUserId, connectionStatus, reconcile]);

  // Window Focus Catch-Up: Refresh on window refocus
  useEffect(() => {
    if (!currentUserId) return;
    const handleFocus = () => {
      reconcile();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [currentUserId, reconcile]);

  return {
    socket: socketRef.current,
    connectionStatus,
    reconcile
  };
}

export function emitAdminSocketEvent(event: string, data: unknown) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('clinic:emit_socket', { detail: { event, data } }));
  }
}
