'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { appointmentKeys } from '@/features/appointment-pasien/api/query-keys';
import { klinikKeys } from '@/features/klinik/api/query-keys';
import { doctorScheduleKeys } from '@/features/jadwal-dokter/api/query-keys';
import { SCHEDULE_QUERY_KEYS } from '@/features/jadwal-dokter/constants/schedule-shift.constants';
import { leaveManagementKeys } from '@/features/manajemen-perizinan/api/query-keys';
import { attendanceKeys } from '@/features/kehadiran-pegawai/api/queries';
import type { AttendanceAction, StaffAttendance } from '@/features/kehadiran-pegawai/api/types';
import { presentAttendanceModal } from '@/components/feedback/choreographed-modal';
import { getClientSocketUrl } from '@/core/config/env.client';
import { clientFetch } from '@/lib/client-fetch';
import { useViewer } from './use-viewer';
import type { BackendNotification } from '../api/notification-api-service';
import type { NotificationEnvelopeV2 } from '../types';
import { executeNotificationAction } from '../utils/notification-action-dispatcher';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import {
  mapNotificationToToastModel,
  type NotificationToastModel
} from '../presentation/notification-toast-mapper';
import { UnifiedNotificationToast } from '../components/unified-notification-toast';

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

/**
 * Preload image into browser memory to eliminate visual avatar flicker / glitch upon toast mount.
 */
function preloadImage(url?: string | null, timeoutMs = 500): Promise<boolean> {
  if (typeof window === 'undefined' || !url) return Promise.resolve(false);
  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(false);
      }
    }, timeoutMs);

    img.onload = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(true);
      }
    };
    img.onerror = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(false);
      }
    };
    img.src = url;
  });
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
    queryClient.invalidateQueries({ queryKey: leaveManagementKeys.all });
    queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
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

    const baseUrl = getClientSocketUrl();

    if (!baseUrl) {
      console.error(
        '[RealtimeTransport] Configuration error: NEXT_PUBLIC_SOCKET_URL is missing in environment'
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

    socket.on(
      'notification:new',
      async (envelope: NotificationEnvelopeV2 | BackendNotification) => {
        // 1. Data Store Synchronization (always process for inbox & counters)
        reconcile();
        void queryClient.refetchQueries({ queryKey: doctorScheduleKeys.all, type: 'active' });
        void queryClient.refetchQueries({
          queryKey: [SCHEDULE_QUERY_KEYS.SCHEDULES],
          type: 'active'
        });
        void queryClient.refetchQueries({ queryKey: appointmentKeys.all, type: 'active' });

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('clinic:notification_received', { detail: envelope })
          );
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

        // Rule E: Present Unified Friendly Notification Toast
        if (envelope?.title || ('type' in envelope && envelope.type)) {
          const toastModel = mapNotificationToToastModel(envelope, router, userRole);

          // Preload avatar if available so frame-0 render is instant and never leaks to fallback
          if (toastModel.avatarUrl) {
            const imageReady = await preloadImage(toastModel.avatarUrl, 500);
            if (!imageReady) {
              toastModel.avatarUrl = DEFAULT_AVATAR_PATH;
            }
          }

          toast.custom(
            (t) =>
              React.createElement(UnifiedNotificationToast, {
                toastId: t,
                model: toastModel
              }),
            {
              duration: toastModel.duration || 6000
            }
          );
        }
      }
    );

    socket.on('notification:read', (_data?: { id?: string; all?: boolean }) => {
      reconcile();
    });

    socket.on('notification:unread_count', (data: { unreadCount: number }) => {
      const count = data?.unreadCount ?? 0;
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

    const handleLeaveUpdated = async (payload: unknown) => {
      reconcile();
      void queryClient.refetchQueries({ queryKey: leaveManagementKeys.all, type: 'active' });
      void queryClient.refetchQueries({
        queryKey: leaveManagementKeys.replacements(),
        type: 'active'
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('clinic:leave_updated', { detail: payload }));
      }
      if (payload && typeof payload === 'object') {
        const lv = payload as {
          staffName?: string;
          status?: string;
          leaveRequestId?: string;
          avatar?: string;
        };
        if (lv.staffName && lv.status === 'pending') {
          const targetId = lv.leaveRequestId ?? '';
          const toastModel: NotificationToastModel = {
            id: `leave-${targetId}-${Date.now()}`,
            headline: 'Pengajuan izin baru',
            emoji: '📋',
            entityName: lv.staffName,
            avatarUrl: lv.avatar || null,
            isPerson: true,
            action: {
              label: 'Lihat',
              onClick: () => {
                router.push(
                  targetId
                    ? `/admin/manajemen-perizinan?leaveId=${targetId}`
                    : '/admin/manajemen-perizinan'
                );
              }
            },
            duration: 7000
          };

          if (toastModel.avatarUrl) {
            const imageReady = await preloadImage(toastModel.avatarUrl, 500);
            if (!imageReady) {
              toastModel.avatarUrl = DEFAULT_AVATAR_PATH;
            }
          }

          toast.custom(
            (t) =>
              React.createElement(UnifiedNotificationToast, {
                toastId: t,
                model: toastModel
              }),
            {
              duration: 7000
            }
          );
        }
      }
    };

    const handleAttendanceUpdated = (payload: unknown) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'me'] });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all, refetchType: 'none' });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('clinic:attendance_updated', { detail: payload }));
      }

      // Audience isolation: Only internal clinic staff may receive or display staff attendance modals
      if (viewerAudience !== 'clinic') {
        return;
      }

      const item = payload as
        | (StaffAttendance & {
            action: AttendanceAction;
            isEarlyDeparture?: boolean;
            notes?: string;
          })
        | undefined;
      if (!item?.nama_staf) return;

      presentAttendanceModal({
        id: item.id,
        nama_staf: item.nama_staf,
        avatar: item.avatar,
        kategori: item.kategori,
        waktu_presensi: item.waktu_presensi,
        checkInAt: item.checkInAt,
        checkOutAt: item.checkOutAt,
        status: item.status,
        shift: item.shift,
        action: item.action,
        isEarlyDeparture: item.isEarlyDeparture,
        notes: item.notes,
        onNavigateDetail: (id) => {
          router.push(id ? `/admin/kehadiran-pegawai?highlight=${id}` : '/admin/kehadiran-pegawai');
        }
      });
    };

    socket.on('appointment:called', handleAppointmentCalled);
    socket.on('appointment.patient_called', handleAppointmentCalled);
    socket.on('appointment:status_changed', handleAppointmentStatusChanged);
    socket.on('appointment.status_changed', handleAppointmentStatusChanged);
    socket.on('queue:estimates:updated', handleQueueEstimatesUpdated);
    socket.on('leave:updated', handleLeaveUpdated);
    socket.on('attendance:recorded', handleAttendanceUpdated);
    socket.on('attendance:check_in', handleAttendanceUpdated);
    socket.on('attendance:manual_check_in', handleAttendanceUpdated);
    socket.on('attendance:check_out', handleAttendanceUpdated);
    socket.on('attendance:checkout', handleAttendanceUpdated);
    socket.on('attendance:early_departure', handleAttendanceUpdated);
    socket.on('attendance:refresh', handleAttendanceUpdated);
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
